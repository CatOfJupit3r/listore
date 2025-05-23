/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ListenerStore } from '../src';

describe('listener store', () => {
    const store = new ListenerStore<{
        'user:login': { userId: string; timestamp: number };
        'user:logout': { userId: string; reason: string };
    }>();

    // FIXTURES
    const createEmptyFn = () =>
        vi.fn(
            () =>
                (..._: any[]) => {} // so that reference is different
        );

    const createExpectListenerCall = (props: { userId: string; timestamp: number }) => {
        return (listener: ReturnType<typeof createEmptyFn>, times: number) => {
            expect(listener).toHaveBeenCalledTimes(times);
            expect(listener).toHaveBeenCalledWith(props);
        };
    };

    const expectListenersToBe = (event: string, length: number) => {
        if (length === 0) {
            expect(
                // @ts-expect-error boo-hoo, _listeners is private, so sca-a-ary
                store._listeners[event] === undefined ||
                    // @ts-expect-error boo-hoo, _listeners is private, so sca-a-ary
                    (Array.isArray(store._listeners[event]) && store._listeners[event].length === 0)
            ).toBeTruthy();
            return;
        }
        // @ts-expect-error boo-hoo, _listeners is private, so sca-a-ary
        expect(store._listeners[event]).toHaveLength(length);
    };

    const expectListenerCall = (listener: ReturnType<typeof createEmptyFn>, times: number) => {
        expect(listener).toHaveBeenCalledTimes(times);
    };

    // CLEANUP BEFORE EACH TEST TO AVOID COLLISIONS
    afterEach(() => {
        store.clearAllListeners();
    });

    it('should attach listeners', () => {
        store.on('user:login', createEmptyFn());

        expectListenersToBe('user:login', 1);
        expectListenersToBe('user:logout', 0);

        store.on('user:logout', createEmptyFn());

        expectListenersToBe('user:login', 1);
        expectListenersToBe('user:logout', 1);

        store.on('user:login', createEmptyFn());
        store.on('user:login', createEmptyFn());

        expectListenersToBe('user:login', 3);
        expectListenersToBe('user:logout', 1);
    });

    it('should trigger events', async () => {
        const currentTime = Date.now();
        const loginListener = vi.fn((props: { userId: string; timestamp: number }) => {
            expect(props).toEqual({ userId: '123', timestamp: currentTime });
        });
        const logoutListener = vi.fn((props: { userId: string; reason: string }) => {
            expect(props).toEqual({ userId: '123', reason: 'timeout' });
        });

        store.on('user:login', loginListener);
        store.on('user:logout', logoutListener);
        await store.notify('user:login', { userId: '123', timestamp: currentTime });
        await store.notify('user:logout', { userId: '123', reason: 'timeout' });

        expect(loginListener).toHaveBeenCalledTimes(1);
        expect(loginListener).toHaveBeenCalledWith({ userId: '123', timestamp: currentTime });

        expect(logoutListener).toHaveBeenCalledTimes(1);
        expect(logoutListener).toHaveBeenCalledWith({ userId: '123', reason: 'timeout' });
    });

    it('should trigger all listeners on single event', async () => {
        const listener1 = createEmptyFn();
        const listener2 = createEmptyFn();
        const listener3 = createEmptyFn();

        store.on('user:login', listener1);
        store.on('user:login', listener2);
        store.on('user:login', listener3);

        const time = Date.now();
        await store.notify('user:login', { userId: '123', timestamp: time });

        const expectListenerCall = createExpectListenerCall({ userId: '123', timestamp: time });

        expectListenerCall(listener1, 1);
        expectListenerCall(listener2, 1);
        expectListenerCall(listener3, 1);
    });

    it('should remove listeners', async () => {
        const listener1 = createEmptyFn();
        const listener2 = createEmptyFn();
        const listener3 = createEmptyFn();

        store.on('user:login', listener1);
        store.on('user:login', listener2);
        store.on('user:login', listener3);

        const time = Date.now();

        await store.notify('user:login', { userId: '123', timestamp: time });
        expectListenerCall(listener1, 1); // on
        expectListenerCall(listener2, 1); // on
        expectListenerCall(listener3, 1); // on

        store.off('user:login', listener1);
        await store.notify('user:login', { userId: '123', timestamp: time });

        expectListenerCall(listener1, 1); // off
        expectListenerCall(listener2, 2); // on
        expectListenerCall(listener3, 2); // on

        store.off('user:login', listener2);
        await store.notify('user:login', { userId: '123', timestamp: time });

        expectListenerCall(listener1, 1); // off
        expectListenerCall(listener2, 2); // off
        expectListenerCall(listener3, 3); // on

        store.off('user:login', listener3);
        for (let i = 0; i < 10; i++) {
            await store.notify('user:login', { userId: '123', timestamp: time });
            expectListenerCall(listener1, 1); // off
            expectListenerCall(listener2, 2); // off
            expectListenerCall(listener3, 3); // off
        }
    });

    it('should not throw exception when no listener/events is in store on remove fn', async () => {
        const listener = createEmptyFn();
        const listener2 = createEmptyFn();

        store.off('user:login', listener);

        store.on('user:login', listener2);
        store.off('user:login', listener);

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('same listener should be called multiple times when listened to multiple events', async () => {
        const listener = createEmptyFn();

        store.on('user:login', listener);
        store.on('user:logout', listener);

        const time = Date.now();
        await store.notify('user:login', { userId: '123', timestamp: time });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith({ userId: '123', timestamp: time });

        await store.notify('user:logout', { userId: '123', reason: 'timeout' });
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledWith({ userId: '123', timestamp: time });
    });

    it('should not remove listener with same reference from different events', async () => {
        const listener = createEmptyFn();

        store.on('user:login', listener);
        store.on('user:logout', listener);

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expect(listener).toHaveBeenCalledTimes(1);

        store.off('user:login', listener);
        await store.notify('user:logout', { userId: '123', reason: 'timeout' });
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should clear all listeners', async () => {
        const listener1 = createEmptyFn();
        const listener2 = createEmptyFn();
        const listener3 = createEmptyFn();

        store.on('user:login', listener1);
        store.on('user:login', listener2);
        store.on('user:login', listener3);

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expectListenerCall(listener1, 1);
        expectListenerCall(listener2, 1);
        expectListenerCall(listener3, 1);
        expectListenersToBe('user:login', 3);

        store.clearAllListeners();

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expectListenerCall(listener1, 1);
        expectListenerCall(listener2, 1);
        expectListenerCall(listener3, 1);
        expectListenersToBe('user:login', 0);
    });

    it('should clear listeners for a specific event', async () => {
        const listener1 = createEmptyFn();
        const listener2 = createEmptyFn();
        const listener3 = createEmptyFn();

        store.on('user:login', listener1);
        store.on('user:logout', listener2);
        store.on('user:login', listener3);

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expectListenerCall(listener1, 1);
        expectListenerCall(listener2, 0);
        expectListenerCall(listener3, 1);
        expectListenersToBe('user:login', 2);
        expectListenersToBe('user:logout', 1);

        store.clearListeners('user:login');

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expectListenerCall(listener1, 1);
        expectListenerCall(listener2, 0);
        expectListenerCall(listener3, 1);
        expectListenersToBe('user:login', 0);
        expectListenersToBe('user:logout', 1); // still hanging in there!
    });

    it('should handle async listeners', async () => {
        let hasBeenCalled = false;
        const asyncListener = vi.fn(async () => {
            hasBeenCalled = true;
        });

        store.on('user:login', asyncListener);
        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expect(asyncListener).toHaveBeenCalledTimes(1);
        expect(hasBeenCalled).toBeTruthy();
    });

    it('should properly handle async and sync listeners on same event', async () => {
        const asyncListener = vi.fn(async () => {});
        const syncListener = vi.fn(() => {});

        store.on('user:login', asyncListener);
        store.on('user:login', syncListener);

        await store.notify('user:login', { userId: '123', timestamp: Date.now() });
        expect(asyncListener).toHaveBeenCalledTimes(1);
        expect(syncListener).toHaveBeenCalledTimes(1);
    });
});
