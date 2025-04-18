import type { EventRegistry } from './types';

type ListenerFn<T> = (props: T) => void;
type ListenersMap<Store extends EventRegistry> = {
    [E in keyof Store]?: Array<ListenerFn<Store[E]>>;
};

/**
 * Type-safe event emitter using a provided event registry
 */
export class ListenerStore<Store extends EventRegistry = {}> {
    private readonly _listeners: ListenersMap<Store>;

    constructor() {
        this._listeners = {} as ListenersMap<Store>;
    }

    /**
     * Register an event listener for a specific event
     */
    public on<E extends keyof Store>(event: E, listener: ListenerFn<Store[E]>): void {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event]!.push(listener);
    }

    /**
     * Trigger an event with specific payload
     */
    public notify<E extends keyof Store>(event: E, props: Store[E]): void {
        const listeners = this._listeners[event];
        if (listeners) {
            listeners.forEach((listener) => listener(props));
        }
    }

    /**
     * Remove a specific listener from an event
     */
    public off<E extends keyof EventRegistry>(event: E, listener: ListenerFn<Store[E]>): void {
        const listeners = this._listeners[event as string];
        if (listeners) {
            const index = listeners.indexOf(listener as any);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
}
