import { ListenerStore } from './listener-store';
import type { EventRegistry, ListenerFn } from './types';

/**
 * Type-safe event emitter with key validation
 * Provide with registry template type and a typeof array of keys (preferably `as const`) to ensure that the store registry is correct
 */
export class StoreWithKeyValidation<Store extends EventRegistry<T>, T extends string> extends ListenerStore<Store> {
    private _keys: readonly T[];

    constructor(keys: readonly T[]) {
        super();
        this._keys = keys;
    }

    public on<K extends keyof Store>(event: K, listener: K extends T ? ListenerFn<Store[K]> : never): void {
        const check = this.checkEvent(event, 'on');
        if (!check) return;
        super.on(event, listener as ListenerFn<Store[K]>); // as this point, event is guaranteed to be T
    }

    public notify<K extends keyof Store>(event: K, props: K extends T ? Store[K] : never): void {
        const check = this.checkEvent(event, 'notify');
        if (!check) return;
        super.notify(event, props);
    }

    /**
     * Handler for key validation. You can throw an error or log a message, the choice is yours.
     * @param event Event name
     * @param method Method, which is failed to validate the key
     * @returns True if the event is valid, false otherwise
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onKeyErrorValidationError(event: string, method: 'on' | 'notify'): boolean {
        return false;
    }

    /**
     * Check if the event is a valid key. If not, call the onKeyErrorValidationError method.
     * @param event Event name
     * @param method Method name
     * @returns True if the event is a valid key, false otherwise
     * @private
     */
    private checkEvent(event: keyof Store, method: 'on' | 'notify'): event is T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this._keys.includes(event as any)) {
            return true;
        }
        return this.onKeyErrorValidationError(event as string, method);
    }
}
