/**
 * BaseComponent.js
 * Componente base simples para o módulo de interações.
 */

class BaseComponent {
    constructor(container, options = {}) {
        if (!container) {
            throw new Error('Container element is required for BaseComponent');
        }
        this.container = container;
        this.options = options;
        this.eventBus = null;
        this.storageManager = null;
        this.services = null;
    }

    async init() {
        // Componente dos filhos devem implementar
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }
}

export default BaseComponent;
