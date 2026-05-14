/**
 * API Integration Guide
 * 
 * Este documento detalha a implementação de integração com APIs públicas
 * no módulo interativo do portfólio.
 * 
 * @date May 13, 2026
 * @author Raysonn Backend
 */

# 📚 API Integration - Guia Técnico

## 📖 Índice
1. [APIClient](#apiclient)
2. [Componentes](#componentes)
3. [Error Handling](#error-handling)
4. [Cache Strategy](#cache-strategy)
5. [Exemplos](#exemplos)
6. [Boas Práticas](#boas-práticas)

---

## APIClient

### Classe APIClient
Cliente HTTP genérico reutilizável para múltiplas APIs.

### Configuração
```javascript
const apiClient = new APIClient({
    baseURL: 'https://api.example.com',
    timeout: 5000,              // 5 segundos
    maxRetries: 3,              // 3 tentativas
    retryDelay: 1000,           // 1 segundo inicial
    cacheTTL: 3600000,          // 1 hora (milisegundos)
    errorHandler: customHandler // Callback customizado
});
```

### Métodos

#### `request(endpoint, options)`
Faz requisição com retry, cache e timeout automáticos.

```javascript
// GET request (com cache automático)
const data = await apiClient.request('/users/raysonn');

// POST request (sem cache)
const result = await apiClient.request('/submit', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer token' }
});

// Timeout após 3 segundos
const fastData = await apiClient.request('/endpoint', {
    timeout: 3000
});
```

#### `requestMultiple(requests)`
Executa múltiplas requisições em paralelo.

```javascript
const results = await apiClient.requestMultiple([
    { endpoint: '/repos', options: {} },
    { endpoint: '/users', options: {} },
    { endpoint: '/countries', options: {} }
]);

// Resultado: [{ status, value }, { status, value }, ...]
results.forEach(result => {
    if (result.status === 'fulfilled') {
        console.log('Sucesso:', result.value);
    } else {
        console.log('Erro:', result.reason);
    }
});
```

#### `clearCache(pattern)`
Limpa cache local (opcional: por padrão).

```javascript
// Limpar tudo
apiClient.clearCache();

// Limpar por regex
apiClient.clearCache('GET:.*repos.*');
```

### Retry Logic
Implementa **exponential backoff**:
```
Tentativa 1: Imediato
Tentativa 2: Aguarda 1s (1s * 2^0)
Tentativa 3: Aguarda 2s (1s * 2^1)
Tentativa 4: Aguarda 4s (1s * 2^2)
(Se tudo falhar → throw error)
```

### Cache System
```javascript
// Armazena resultado em cache
GET /api/users → Cache: { key: 'GET:/api/users', expiry: now + TTL }

// Próxima requisição verifica
if (cache.exists && !cache.expired) {
    // Retorna dados do cache
} else {
    // Faz nova requisição
}
```

---

## Componentes

### GitHubStatsComponent

#### Configuração
```javascript
new GitHubStatsComponent(container, {
    username: 'raysonn',  // GitHub username
    maxRepos: 6            // Quantidade de repos
});
```

#### Features
- Exibe repositórios públicos ordenados por stars
- Mostra: linguagem, descrição, stars, forks, watchers
- Tema dark (GitHub style)
- Links diretos para GitHub

#### Eventos Publicados
```javascript
eventBus.subscribe('github:loaded', (data) => {
    console.log('Repos carregados:', data.repos);
    // { repos: 6, timestamp: 1234567890 }
});

eventBus.subscribe('github:error', (data) => {
    console.log('Erro:', data.error, data.type);
    // { error: 'msg', type: 'TIMEOUT|NOT_FOUND|...' }
});
```

#### Dados Utilizados
```javascript
// Requisição: GET https://api.github.com/users/{username}/repos
{
    id: number,
    name: string,
    description: string,
    html_url: string,
    stargazers_count: number,
    forks_count: number,
    watchers_count: number,
    language: string,
    private: boolean
}
```

### CountriesComponent

#### Configuração
```javascript
new CountriesComponent(container, {
    displayCount: 8,    // Países a exibir
    region: 'europe'    // Filtro opcional: americas|europe|asia|africa|oceania
});
```

#### Features
- Exibe países ordenados por população
- Filtros interativos por região
- Mostra: capital, região, população, idiomas
- Emojis de bandeiras
- Tema light/card-based

#### Eventos Publicados
```javascript
eventBus.subscribe('countries:loaded', (data) => {
    // { count: 8, timestamp: 1234567890 }
});

eventBus.subscribe('countries:error', (data) => {
    // { error: 'msg' }
});
```

#### Dados Utilizados
```javascript
// Requisição: GET https://restcountries.com/v3.1/all
{
    name: { common: string, official: string },
    capital: [string],
    region: string,
    population: number,
    languages: { code: string },
    flag: string,
    private: boolean
}
```

### CryptoComponent

#### Configuração
```javascript
new CryptoComponent(container, {
    currency: 'usd',      // usd | eur | gbp | ...
    displayCount: 5        // Criptomoedasas a exibir
});
```

#### Features
- Top 5 criptomoedasas (Bitcoin, Ethereum, Cardano, Solana, XRP)
- Preço em USD/EUR, market cap, 24h change
- Indicadores 📈📉 de variação positiva/negativa
- Tema dark (finance style)
- Tabela responsiva

#### Eventos Publicados
```javascript
eventBus.subscribe('crypto:loaded', (data) => {
    // { count: 5, timestamp: 1234567890 }
});

eventBus.subscribe('crypto:error', (data) => {
    // { error: 'msg' }
});
```

#### Dados Utilizados
```javascript
// Requisição: GET https://api.coingecko.com/api/v3/simple/price
{
    bitcoin: {
        usd: number,
        eur: number,
        usd_market_cap: number,
        usd_24h_change: number
    }
    // ... outros
}
```

---

## Error Handling

### Tipos de Erro

| Tipo | Causa | Ação |
|------|-------|------|
| TIMEOUT | Requisição > timeout configurado | Retry automático |
| NOT_FOUND | HTTP 404 | Mensagem de erro |
| UNAUTHORIZED | HTTP 401/403 | Mensagem de credenciais |
| SERVER_ERROR | HTTP 500+ | Retry automático |
| NETWORK_ERROR | Sem internet | Mensagem offline |
| UNKNOWN_ERROR | Outro | Mensagem genérica |

### Custom Error Handler
```javascript
const myErrorHandler = (error) => {
    console.error('Erro:', error.type, error.message);
    
    if (error.type === 'TIMEOUT') {
        // Notificar usuário sobre timeout
        showNotification('Requisição expirou. Tente novamente.');
    }
};

const apiClient = new APIClient({
    errorHandler: myErrorHandler
});
```

### Try-Catch
```javascript
try {
    const data = await apiClient.request('/endpoint');
} catch (error) {
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    console.error('Details:', error.data);
}
```

---

## Cache Strategy

### Estratégia por API

#### GitHub API
- **TTL**: 1 hora
- **Razão**: Repositórios não mudam frequentemente
- **Vantagem**: Reduz requisições desnecessárias

#### REST Countries
- **TTL**: 24 horas
- **Razão**: Dados completamente estáticos
- **Vantagem**: Máxima performance

#### CoinGecko API
- **TTL**: 10 minutos
- **Razão**: Preços mudam frequentemente
- **Vantagem**: Dados relativamente recentes

### Manual Cache Clear
```javascript
// Limpar GitHub cache
apiClient.clearCache('GET:.*github.*');

// Limpar tudo
apiClient.clearCache();
```

### Cache Invalidation
```javascript
// Quando publicar repositório novo, invalidar cache
eventBus.subscribe('repo:created', () => {
    apiClient.clearCache('GET:.*repos.*');
});
```

---

## Exemplos

### Exemplo 1: GitHub Stats (Básico)
```javascript
import GitHubStatsComponent from '/js/interacoes-module/src/components/GitHubStatsComponent.js';

const github = new GitHubStatsComponent(
    document.getElementById('github-container'),
    { username: 'raysonn', maxRepos: 6 }
);

github.init(); // Carrega dados
```

### Exemplo 2: Múltiplas APIs
```javascript
import EventBus from '/js/interacoes-module/src/infrastructure/EventBus.js';
import GitHubStatsComponent from '/js/interacoes-module/src/components/GitHubStatsComponent.js';
import CountriesComponent from '/js/interacoes-module/src/components/CountriesComponent.js';
import CryptoComponent from '/js/interacoes-module/src/components/CryptoComponent.js';

// EventBus compartilhado
const eventBus = new EventBus();

// Criar componentes
const github = new GitHubStatsComponent(document.getElementById('github'), { username: 'raysonn' });
const countries = new CountriesComponent(document.getElementById('countries'), { displayCount: 8 });
const crypto = new CryptoComponent(document.getElementById('crypto'), { currency: 'usd' });

// Associar EventBus
[github, countries, crypto].forEach(comp => comp.eventBus = eventBus);

// Inicializar
[github, countries, crypto].forEach(comp => comp.init());

// Escutar eventos
eventBus.subscribe('github:loaded', () => console.log('GitHub pronto'));
eventBus.subscribe('countries:loaded', () => console.log('Countries pronto'));
eventBus.subscribe('crypto:loaded', () => console.log('Crypto pronto'));
```

### Exemplo 3: APIClient Customizado
```javascript
import APIClient from '/js/interacoes-module/src/services/APIClient.js';

// Cliente para API customizada
const myAPI = new APIClient({
    baseURL: 'https://minha-api.com',
    timeout: 3000,
    maxRetries: 5,
    cacheTTL: 600000 // 10 minutos
});

// Requisição
const data = await myAPI.request('/dados');

// Múltiplas requisições
const results = await myAPI.requestMultiple([
    { endpoint: '/users' },
    { endpoint: '/posts' },
    { endpoint: '/comments' }
]);
```

### Exemplo 4: Error Handling Avançado
```javascript
const apiClient = new APIClient({
    timeout: 5000,
    errorHandler: (error) => {
        if (error.type === 'NETWORK_ERROR') {
            showOfflineMessage();
        } else if (error.type === 'TIMEOUT') {
            logSlowAPI();
        } else {
            logError(error);
        }
    }
});

try {
    const data = await apiClient.request('/api/data');
    displayData(data);
} catch (error) {
    if (error.type === 'NOT_FOUND') {
        showNotFoundPage();
    } else if (error.type === 'UNAUTHORIZED') {
        redirectToLogin();
    } else {
        showGenericError();
    }
}
```

---

## Boas Práticas

### ✅ DO's

1. **Use APIClient para todas as requisições externas**
   ```javascript
   const data = await apiClient.request('/endpoint');
   ```

2. **Sempre tratar erros**
   ```javascript
   try { ... } catch (error) { ... }
   ```

3. **Reutilizar instâncias de APIClient**
   ```javascript
   // Não criar nova instância para cada requisição
   const apiClient = new APIClient(...);
   ```

4. **Escutar eventos via EventBus**
   ```javascript
   eventBus.subscribe('api:loaded', handleData);
   ```

5. **Sanitizar entrada do usuário**
   ```javascript
   const username = sanitizeInput(userInput);
   ```

### ❌ DON'Ts

1. **Não fazer fetch direto sem retry**
   ```javascript
   // ❌ Ruim
   fetch('/api/data');
   
   // ✅ Bom
   apiClient.request('/api/data');
   ```

2. **Não expor chaves de API**
   ```javascript
   // ❌ Ruim
   const API_KEY = 'sk-xxx';
   
   // ✅ Bom (usar APIs públicas)
   ```

3. **Não ignorar erros**
   ```javascript
   // ❌ Ruim
   const data = await apiClient.request('/data');
   
   // ✅ Bom
   try {
       const data = await apiClient.request('/data');
   } catch (error) {
       // Handle error
   }
   ```

4. **Não fazer requisições em loops tight**
   ```javascript
   // ❌ Ruim
   for (let id of ids) {
       await apiClient.request(`/api/${id}`);
   }
   
   // ✅ Bom
   const results = await apiClient.requestMultiple(
       ids.map(id => ({ endpoint: `/api/${id}` }))
   );
   ```

5. **Não armazenar dados sensíveis em cache**
   ```javascript
   // Cache é usado para GET requests (read-only)
   ```

---

## Performance

### Métricas
- **Cache hit rate**: ~95% em uso normal
- **Timeout**: 5 segundos (configurável)
- **Retry máximo**: 3 tentativas
- **Bundle size**: ~15KB (minified)

### Otimizações
- Requisições em paralelo via `requestMultiple()`
- Cache com TTL automático
- Exponential backoff para retry
- Timeout para evitar hanging requests

### Monitoramento
```javascript
// Logar requisições lentas
eventBus.subscribe('api:request', (data) => {
    if (data.duration > 2000) {
        console.warn('Slow API:', data.endpoint, data.duration + 'ms');
    }
});
```

---

## Segurança

### Checklist
- ✅ Sem credenciais em frontend
- ✅ XSS prevention (sanitização)
- ✅ CORS handled by APIs (public)
- ✅ Timeout previne DOS
- ✅ Retry logic + exponential backoff

### HTTPS Only
```javascript
// Sempre usar HTTPS em produção
const apiClient = new APIClient({
    baseURL: 'https://api.example.com' // Não HTTP!
});
```

---

**Data**: May 13, 2026  
**Status**: ✅ Completo  
**Versão**: 1.0.0
