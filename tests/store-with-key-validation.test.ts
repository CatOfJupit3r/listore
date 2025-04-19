/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */
import { describe, expect, it, Mock, vi } from 'vitest';
import { StrictStore } from '../src';
import { StrictStoreRules } from '../src/types';

describe('Strict Store', () => {
    const keys = ['user:login', 'user:logout'] as const;
    const createStore = (rules?: StrictStoreRules) =>
        new StrictStore<
            {
                'user:login': { userId: string; timestamp: number };
                'user:logout': { userId: string; reason: string };
            },
            (typeof keys)[number]
        >(
            keys,
            rules ?? {
                attachment: {
                    throws: false,
                },
                notification: {
                    throws: false,
                },
            }
        );

    const createListener = (inputs: any) => {
        return vi.fn(() => (..._: any[]) => {
            expect(inputs).toEqual(inputs);
        });
    };

    it('should trigger events with valid keys', () => {
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);
        const store = createStore();
        store.on('user:login', listener);
        store.notify('user:login', inputs);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(inputs);
    });

    it('should trigger on error handler when key is invalid', () => {
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);
        const store = createStore();
        store.on('user:login', listener);
        const onKeyErrorFn: (method: string) => Mock<(typeof store)['onKeyErrorValidationError']> = (
            methodToCall: string
        ) => {
            return vi.fn((event, method) => {
                expect(event).toEqual('user:register');
                expect(method).toEqual(methodToCall);
            });
        };
        const onKeyErrorFnAttachment = onKeyErrorFn('on');
        const onKeyErrorFnNotification = onKeyErrorFn('notify');

        // @ts-expect-error boo-hoo
        store.onKeyErrorValidationError = vi.fn(onKeyErrorFnAttachment);
        // @ts-expect-error boo-hoo
        store.on('user:register', inputs);
        expect(listener).toHaveBeenCalledTimes(0);
        expect(onKeyErrorFnAttachment).toHaveBeenCalledTimes(1);
        expect(onKeyErrorFnNotification).toHaveBeenCalledTimes(0);

        // @ts-expect-error boo-hoo
        store.onKeyErrorValidationError = vi.fn(onKeyErrorFnNotification);
        // @ts-expect-error boo-hoo
        store.notify('user:register', inputs);
        expect(listener).toHaveBeenCalledTimes(0);
        expect(onKeyErrorFnAttachment).toHaveBeenCalledTimes(1);
        expect(onKeyErrorFnNotification).toHaveBeenCalledTimes(1);
    });

    it('should throw error on notify with invalid key', {
        todo: true,
    });

    it('should not throw error on notify with valid key', {
        todo: true,
    });

    it('should log error on notify with invalid key if specified', {
        todo: true,
    });

    it('should throw on attachment with invalid key', {
        todo: true,
    });

    it('should not throw on attachment with valid key', {
        todo: true,
    });

    it('should log error when attachment with invalid key if specified', {
        todo: true,
    });
});
