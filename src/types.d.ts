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
