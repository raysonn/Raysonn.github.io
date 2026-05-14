/**
 * EventBus.js
 * Implementação simples de Pub/Sub para comunicação entre componentes.
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    subscribe(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
        return () => this.unsubscribe(eventName, callback);
    }

    publish(eventName, payload) {
        const listeners = this.listeners.get(eventName);
        if (!listeners) return;
        listeners.forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error(`[EventBus] Error during event '${eventName}' callback:`, error);
            }
        });
    }

    unsubscribe(eventName, callback) {
        const listeners = this.listeners.get(eventName);
        if (!listeners) return;
        listeners.delete(callback);
        if (listeners.size === 0) {
            this.listeners.delete(eventName);
        }
    }

    unsubscribeAll() {
        this.listeners.clear();
    }
}

export default EventBus;
