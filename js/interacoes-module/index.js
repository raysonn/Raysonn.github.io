/**
 * Interacoes Module - Index
 * 
 * Ponto de entrada do módulo com registro de componentes
 * e configuração central
 * 
 * @author Raysonn Backend
 * @version 1.0.0
 * @date May 13, 2026
 */

// Infrastructure
import EventBus from './infrastructure/EventBus.js';
import StorageManager from './infrastructure/StorageManager.js';
import ErrorHandler from './infrastructure/ErrorHandler.js';
import AnalyticsTracker from './infrastructure/AnalyticsTracker.js';

// Services
import APIClient from './services/APIClient.js';
import QuizService from './services/QuizService.js';
import ScoreService from './services/ScoreService.js';

// Components
import BaseComponent from './BaseComponent.js';
import TechCardComponent from './components/TechCardComponent.js';
import QuizComponent from './components/QuizComponent.js';
import ArchitectureComponent from './components/ArchitectureComponent.js';
import LeaderboardComponent from './components/LeaderboardComponent.js';
import GitHubStatsComponent from './components/GitHubStatsComponent.js';
import CountriesComponent from './components/CountriesComponent.js';
import CryptoComponent from './components/CryptoComponent.js';

// Utilities
import validators from './validators.js';
import * as constants from './constants.js';

/**
 * InteracoesModule - Classe principal do módulo
 */
class InteracoesModule {
    constructor(options = {}) {
        this.options = {
            enableAnalytics: true,
            errorTracking: true,
            storageNamespace: 'raysonn_interacoes',
            ...options
        };

        // Inicializar infraestrutura
        this.eventBus = new EventBus();
        this.storageManager = new StorageManager(this.options.storageNamespace);
        this.errorHandler = new ErrorHandler({
            onError: (error) => this.handleError(error)
        });
        
        if (this.options.enableAnalytics) {
            this.analyticsTracker = new AnalyticsTracker({
                eventBus: this.eventBus
            });
        }

        // Registry de componentes
        this.components = new Map();
        this.services = new Map();

        // Setup default services
        this.setupDefaultServices();
    }

    /**
     * Configurar serviços padrão
     * @private
     */
    setupDefaultServices() {
        // Quiz Service
        const quizService = new QuizService();
        this.services.set('quizService', quizService);

        // Score Service
        const scoreService = new ScoreService();
        this.services.set('scoreService', scoreService);

        // Listen to quiz events
        this.eventBus.subscribe('quiz:completed', (data) => {
            if (data.score !== undefined) {
                scoreService.addScore({
                    score: data.score,
                    time: data.totalTime,
                    date: new Date(),
                    quizId: data.quizId
                });
            }
        });
    }

    /**
     * Registrar componente
     */
    registerComponent(name, component) {
        if (!name || !component) {
            throw new Error('Component name and instance required');
        }

        // Associar dependências
        component.eventBus = this.eventBus;
        component.storageManager = this.storageManager;
        component.services = this.services;

        this.components.set(name, component);
        return this;
    }

    /**
     * Obter componente registrado
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Inicializar módulo e todos os componentes
     */
    async initialize() {
        try {
            console.log('[InteracoesModule] Initializing...');

            // Restaurar dados persistidos
            await this.storageManager.loadAllData();

            // Inicializar Analytics
            if (this.analyticsTracker) {
                this.analyticsTracker.trackEvent('module:initialized', {
                    componentsCount: this.components.size,
                    timestamp: Date.now()
                });
            }

            console.log('[InteracoesModule] Initialized successfully');
            this.eventBus.publish('module:ready', {
                timestamp: Date.now()
            });

            return true;
        } catch (error) {
            this.errorHandler.captureError(error);
            return false;
        }
    }

    /**
     * Destruir módulo e limpar recursos
     */
    destroy() {
        // Destruir todos os componentes
        for (const component of this.components.values()) {
            if (component.destroy) {
                component.destroy();
            }
        }

        // Limpar storage
        this.storageManager.clear();

        // Limpar event listeners
        this.eventBus.unsubscribeAll();

        console.log('[InteracoesModule] Destroyed');
    }

    /**
     * Gerenciar erros do módulo
     * @private
     */
    handleError(error) {
        console.error('[InteracoesModule Error]', error);
        
        if (this.options.errorTracking) {
            this.eventBus.publish('error:captured', {
                error: error.message,
                type: error.type,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Exportar dados de análise
     */
    exportAnalytics() {
        return {
            components: Array.from(this.components.keys()),
            services: Array.from(this.services.keys()),
            timestamp: Date.now()
        };
    }
}

/**
 * Registry de componentes e serviços
 * Facilita criação de componentes com dependências injetadas
 */
class ComponentRegistry {
    constructor(module) {
        this.module = module;
    }

    createTechCard(container, options) {
        const component = new TechCardComponent(container, options);
        this.module.registerComponent('techcard', component);
        return component;
    }

    createQuiz(container, options) {
        const quizService = this.module.services.get('quizService');
        const component = new QuizComponent(container, {
            ...options,
            quizService
        });
        this.module.registerComponent('quiz', component);
        return component;
    }

    createArchitecture(container, options) {
        const component = new ArchitectureComponent(container, options);
        this.module.registerComponent('architecture', component);
        return component;
    }

    createLeaderboard(container, options) {
        const scoreService = this.module.services.get('scoreService');
        const component = new LeaderboardComponent(container, {
            ...options,
            scoreService
        });
        this.module.registerComponent('leaderboard', component);
        return component;
    }

    createGitHubStats(container, options) {
        const component = new GitHubStatsComponent(container, options);
        this.module.registerComponent('github-stats', component);
        return component;
    }

    createCountries(container, options) {
        const component = new CountriesComponent(container, options);
        this.module.registerComponent('countries', component);
        return component;
    }

    createCrypto(container, options) {
        const component = new CryptoComponent(container, options);
        this.module.registerComponent('crypto', component);
        return component;
    }
}

/**
 * Criar instância única do módulo (Singleton)
 */
let moduleInstance = null;

export function createInteracoesModule(options) {
    if (moduleInstance) {
        console.warn('InteracoesModule already instantiated');
        return moduleInstance;
    }

    moduleInstance = new InteracoesModule(options);
    return moduleInstance;
}

export function getInteracoesModule() {
    if (!moduleInstance) {
        moduleInstance = new InteracoesModule();
    }
    return moduleInstance;
}

// Exports
export {
    InteracoesModule,
    ComponentRegistry,
    // Infrastructure
    EventBus,
    StorageManager,
    ErrorHandler,
    AnalyticsTracker,
    // Services
    APIClient,
    QuizService,
    ScoreService,
    // Components
    BaseComponent,
    TechCardComponent,
    QuizComponent,
    ArchitectureComponent,
    LeaderboardComponent,
    GitHubStatsComponent,
    CountriesComponent,
    CryptoComponent,
    // Utilities
    validators,
    constants
};

export default InteracoesModule;
