/**
 * APIClient.js
 * Cliente HTTP com suporte a retry, cache, timeout e error handling
 * Reutilizável para múltiplas APIs
 * 
 * @author Raysonn Backend
 * @version 1.0.0
 * @date May 13, 2026
 */

class APIClient {
    constructor(options = {}) {
        this.baseURL = options.baseURL || '';
        this.timeout = options.timeout || 5000;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.cacheTTL = options.cacheTTL || 3600000; // 1 hora
        this.requestQueue = [];
        this.isProcessing = false;
        this.errorHandler = options.errorHandler || this.defaultErrorHandler;
    }

    /**
     * Requisição com retry, cache e timeout
     * @param {string} endpoint
     * @param {Object} options
     * @returns {Promise<any>}
     */
    async request(endpoint, options = {}) {
        const method = options.method || 'GET';
        const cacheKey = `${method}:${endpoint}`;
        const skipCache = options.noCache === true;
        
        // Verificar cache
        if (method === 'GET' && !skipCache && this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        let lastError;
        
        // Retry logic
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const data = await this.executeRequest(endpoint, options);
                
                // Cachear sucesso
                if (method === 'GET' && !skipCache) {
                    this.setCache(cacheKey, data);
                }
                
                return data;
            } catch (error) {
                lastError = error;
                
                if (attempt < this.maxRetries) {
                    // Exponential backoff
                    const delay = this.retryDelay * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw lastError;
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Executar requisição com timeout
     * @private
     */
    async executeRequest(endpoint, options) {
        const url = endpoint.startsWith('http')
            ? endpoint
            : this.baseURL + endpoint;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.status = response.status;
                error.response = response;
                throw error;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            throw this.handleError(error, endpoint);
        }
    }

    /**
     * Gerenciar cache
     * @private
     */
    isCacheValid(key) {
        if (!this.cache.has(key)) return false;
        
        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return false;
        }
        
        return true;
    }

    setCache(key, data) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + this.cacheTTL);
    }

    clearCache(pattern = null) {
        if (!pattern) {
            this.cache.clear();
            this.cacheExpiry.clear();
            return;
        }

        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
            }
        }
    }

    /**
     * Tratamento de erros
     * @private
     */
    handleError(error, endpoint) {
        let errorData = {
            message: error.message,
            type: 'UNKNOWN_ERROR',
            endpoint,
            timestamp: new Date()
        };

        if (error.name === 'AbortError') {
            errorData.type = 'TIMEOUT';
            errorData.message = `Request timeout after ${this.timeout}ms`;
        } else if (error.status === 404) {
            errorData.type = 'NOT_FOUND';
            errorData.message = `Resource not found: ${endpoint}`;
        } else if (error.status === 401 || error.status === 403) {
            errorData.type = 'UNAUTHORIZED';
            errorData.message = 'API key missing or invalid';
        } else if (error.status >= 500) {
            errorData.type = 'SERVER_ERROR';
            errorData.message = `Server error: ${error.status}`;
        } else if (!navigator.onLine) {
            errorData.type = 'NETWORK_ERROR';
            errorData.message = 'No internet connection';
        }

        // Chamar handler customizado
        this.errorHandler(errorData);

        const customError = new Error(errorData.message);
        customError.type = errorData.type;
        customError.data = errorData;
        
        return customError;
    }

    defaultErrorHandler(error) {
        console.error('API Error:', error);
    }

    /**
     * Requisição com dados em paralelo
     */
    async requestMultiple(requests) {
        return Promise.allSettled(
            requests.map(req => this.request(req.endpoint, req.options))
        );
    }

    /**
     * Limpar cache e estado
     */
    destroy() {
        this.clearCache();
        this.requestQueue = [];
    }
}

export default APIClient;
