import type { EventRegistry, ListenerFn, ListenersMap } from './types';

/**
 * Type-safe event emitter using a provided event registry
 * Provide with a template type to ensure that the store registry is correct
 */
export class ListenerStore<Store extends EventRegistry = {}> {
    /**
     * Private property to store the listeners
     * @private
     */
    private _listeners: ListenersMap<Store> = {};

    /**
     * Register an event listener for a specific event
     * @param event Event name
     * @param listener listener function, that will be called when the event is triggered
     */
    public on<E extends keyof Store>(event: E, listener: ListenerFn<Store[E]>): void {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event]!.push(listener);
    }

    /**
     * Trigger an event with specific payload
     * @param event Event name
     * @param props Event payload
     */
    public notify<E extends keyof Store>(event: E, props: Store[E]): void {
        const listeners = this._listeners[event];
        if (listeners) {
            listeners.forEach((listener) => listener(props));
        }
    }

    /**
     * Remove a specific listener from an event
     * @param event Event name
     * @param listener listener function, that will be removed from the event
     */
    public off<E extends keyof Store>(event: E, listener: ListenerFn<Store[E]>): void {
        const listeners = this._listeners[event];
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Clear all listeners for a specific event
     * @param event event to be cleared
     */
    public clearListeners<E extends keyof Store>(event: E): void {
        this._listeners[event] = [];
    }

    /**
     * Clear all listeners for all events
     */
    public clearAllListeners(): void {
        this._listeners = {};
    }
}
