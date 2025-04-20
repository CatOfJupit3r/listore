import { failedToValidateEventMessage, StrictStoreKeyCheckFailError } from './errors';
import { ListenerStore } from './listener-store';
import {
    EventRegistry,
    ListenerFn,
    ListenerFnOrNever,
    MethodWithKeyValidationSupport,
    StrictStoreRuleSet,
} from './types';

/**
 * Generator function for creating default validation rules
 * @constructor
 */
export const DEFAULT_VALIDATION_RULES: () => StrictStoreRuleSet = () => ({
    attachment: {
        key: {
            throws: true,
            logger: false,
        },
    },
    notification: {
        key: {
            throws: true,
            logger: false,
        },
    },
});

/**
 * Customizable type-safe and strict event emitter with key validation for all your needs!
 * Preferably, you should use this class instead of any other store, as it provides 90% of the functionality you need.
 *
 * Provide with registry template type and a typeof array of keys (preferably `as const`) to ensure that the store registry is correct
 */
export class StrictStore<Store extends EventRegistry, T extends string> extends ListenerStore<Store> {
    /**
     * List of keys for the store
     */
    protected _keys: readonly T[];
    /**
     * Rules for the store, allowing you to customize the behavior of the store
     */
    protected _rules: StrictStoreRuleSet;

    constructor(keys: readonly T[] | Record<string | T, T>, rules?: StrictStoreRuleSet) {
        super();
        if (Array.isArray(keys)) {
            this._keys = keys;
        } else {
            this._keys = Object.values(keys) as T[];
        }
        const defaults = DEFAULT_VALIDATION_RULES();
        this._rules = {
            attachment: {
                ...(defaults.attachment ?? {}),
                key: {
                    ...(defaults.attachment?.key ?? {}),
                    ...(rules?.attachment?.key ?? {}),
                },
            },
            notification: {
                ...defaults.notification,
                key: {
                    ...(defaults.notification?.key ?? {}),
                    ...(rules?.notification?.key ?? {}),
                },
            },
        };
    }

    public on<K extends keyof Store>(event: K, listener: ListenerFnOrNever<Store[K]>): void {
        const check = this.checkEvent(event, 'on');
        if (!check) return;
        super.on(event, listener as ListenerFn<Store[K]>); // as this point, event is guaranteed to be T
    }

    public async notify<K extends keyof Store>(
        event: K,
        props: K extends keyof Store ? Store[K] : never
    ): Promise<void> {
        const check = this.checkEvent(event, 'notify');
        if (!check) return;
        return super.notify(event, props as Store[K]);
    }

    /**
     * Handler for key validation. Customize the behavior using rules, including:
     * - Throwing an error
     * - Logging a message
     * @param event Event name
     * @param method Method, which is failed to validate the key
     * @throws StrictStoreKeyCheckFailError - Throws an error if the event is not valid
     * @throws Error - Throws custom error if `rules.throws` is a function
     * @returns True if the event is valid, false otherwise
     * @protected
     */
    protected onKeyErrorValidationError(event: string, method: MethodWithKeyValidationSupport): boolean {
        const rules = method === 'on' ? this._rules.attachment?.key : this._rules.notification?.key;
        if (rules?.logger) {
            if (typeof rules?.logger === 'function') {
                rules?.logger(event, method);
            } else {
                console.warn(failedToValidateEventMessage(event, method));
            }
        }
        if (rules?.throws) {
            if (typeof rules?.throws === 'function') {
                throw rules?.throws(event, method);
            }
            throw new StrictStoreKeyCheckFailError(event, method);
        }
        return false;
    }

    /**
     * Check if the event is a valid key. If not, call the onKeyErrorValidationError method.
     * @param event Event name
     * @param method Method name
     * @returns True if the event is a valid key, false otherwise
     * @protected
     */
    protected checkEvent(event: keyof Store, method: MethodWithKeyValidationSupport): event is T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (this._keys.includes(event as any)) {
            return true;
        }
        return this.onKeyErrorValidationError(event as string, method);
    }
}
