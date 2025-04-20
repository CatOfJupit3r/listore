/**
 * Describes the shape of the event registry
 */
export type EventRegistry<K extends string = string> = Record<K, Record<string, unknown>>;
type SyncListenerFn<T> = (props: T) => void;
type AsyncListenerFn<T> = (props: T) => Promise<void>;
/**
 * Listener function type. Can be either synchronous or asynchronous.
 */
export type ListenerFn<T> = SyncListenerFn<T> | AsyncListenerFn<T>;
/**
 * Listeners map type. Maps event names to an array of listener functions.
 */
export type ListenersMap<Store extends EventRegistry> = {
    [E in keyof Store]?: Array<ListenerFn<Store[E]>>;
};
/**
 * Method with key validation support
 */
export type MethodWithKeyValidationSupport = 'on' | 'notify';

/**
 * Rules for the store, allowing you to customize the behavior of the store
 * @property throws - if true, throws StrictStoreKeyCheckFailError on key validation error, if false, does nothing. If a function is provided, it will call it and throw the result.
 * @property logger - used to log the event and method on key validation error
 */
export interface StrictRule {
    throws?: boolean | ((event: string, method: MethodWithKeyValidationSupport) => Error);
    logger?: boolean | ((event: string, method: MethodWithKeyValidationSupport) => void);
}

/**
 * Strict store rules
 */
export interface StrictStoreRuleSet {
    attachment?: {
        key?: StrictRule;
    };
    notification?: {
        key?: StrictRule;
    };
}

export type ListenerFnOrNever<StoreT> = ListenerFn<StoreT> extends Record<string, unknown> ? never : ListenerFn<StoreT>;
