/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any, @typescript-eslint/triple-slash-reference */
/// <reference path="../.bin/vitest/setup/index.d.ts" />
import { describe, expect, it, Mock, vi } from 'vitest';
import { StrictStore } from '../src';
import { failedToValidateEventMessage, StrictStoreKeyCheckFailError } from '../src/errors';
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
                    key: {
                        throws: false,
                    },
                },
                notification: {
                    key: {
                        throws: false,
                    },
                },
            }
        );

    const createListener = (inputs?: any) => {
        return vi.fn(() => (..._: any[]) => {
            if (inputs) {
                expect(inputs).toEqual(inputs);
            }
        });
    };

    const expectStoreToBeEmpty = (store: StrictStore<any, any>) => {
        // @ts-expect-error we don't care about if it is private or not
        expect(store._listeners).toEqual({});
    };

    const attachToStoreInHardWay = (store: StrictStore<any, any>, event: string, listener: any) => {
        // @ts-expect-error we don't care about if it is private or not
        store._listeners[event] = [listener];
    };

    const buildRegExpForErrorValidation = (event: string, method: string) => {
        return new RegExp(`^(?=.*${event})(?=.*${method})(?=.*unknown).*$`, 'i');
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

    it('should trigger on error handler when key is invalid', async () => {
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
        await store.notify('user:register', inputs);
        expect(listener).toHaveBeenCalledTimes(0);
        expect(onKeyErrorFnAttachment).toHaveBeenCalledTimes(1);
        expect(onKeyErrorFnNotification).toHaveBeenCalledTimes(1);
    });

    it('should throw error on notify with invalid key', async () => {
        const store = createStore({
            notification: {
                key: {
                    throws: true,
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);
        attachToStoreInHardWay(store, 'account:login', listener);

        // @ts-expect-error boo-hoo
        await expect(() => store.notify('account:login', inputs)).rejects.toThrowError(StrictStoreKeyCheckFailError);
        expect(listener).toHaveBeenCalledTimes(0);
    });

    it('should throw custom error on notify with invalid key if specified', async () => {
        const error = new Error('Custom error');
        const store = createStore({
            notification: {
                key: {
                    throws: (event, method) => {
                        expect(event).toEqual('account:login');
                        expect(method).toEqual('notify');
                        return error;
                    },
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);
        attachToStoreInHardWay(store, 'account:login', listener);

        // @ts-expect-error boo-hoo
        await expect(() => store.notify('account:login', inputs)).rejects.toThrow(error);
        expect(listener).toHaveBeenCalledTimes(0);
    });

    it('should not throw error on notify with valid key', async () => {
        const store = createStore({
            notification: {
                key: {
                    throws: true,
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);

        expect(() => store.on('user:login', listener)).not.toThrowError();
        expect(() => store.notify('user:login', inputs)).not.toThrowError();
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should log error on notify with invalid key if specified', async () => {
        console.warn = vi.fn();
        const store = createStore({
            notification: {
                key: {
                    throws: false,
                    logger: true,
                },
            },
        });
        const listener = createListener({});
        attachToStoreInHardWay(store, 'account:login', listener);
        // @ts-expect-error boo-hoo
        await store.notify('account:login', {});
        expect(listener).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(failedToValidateEventMessage('account:login', 'notify'));
    });

    it('should call custom logger on notify with invalid key if specified', async () => {
        const logger = vi.fn();
        const store = createStore({
            notification: {
                key: {
                    logger: (event, method) => {
                        expect(event).toEqual('account:login');
                        expect(method).toEqual('notify');
                        logger();
                    },
                    throws: false,
                },
            },
        });
        const listener = createListener();
        attachToStoreInHardWay(store, 'account:login', listener);

        // @ts-expect-error boo-hoo
        await store.notify('account:login', {});
        expect(listener).toHaveBeenCalledTimes(0);
        expect(logger).toHaveBeenCalledTimes(1);
    });

    it('should throw on attachment with invalid key', () => {
        const store = createStore({
            attachment: {
                key: {
                    throws: true,
                },
            },
        });
        const listener = createListener();

        // @ts-expect-error boo-hoo
        expect(() => store.on('account:login', {})).toThrowError(StrictStoreKeyCheckFailError);
        expect(listener).toHaveBeenCalledTimes(0);
        expectStoreToBeEmpty(store);
    });

    it('should throw custom error on attachment with invalid key if specified', () => {
        const error = new Error('Custom error');
        const store = createStore({
            attachment: {
                key: {
                    throws: (event, method) => {
                        expect(event).toEqual('account:login');
                        expect(method).toEqual('on');
                        return error;
                    },
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);

        // @ts-expect-error boo-hoo
        expect(() => store.on('account:login', listener)).toThrow(error);
        expectStoreToBeEmpty(store);
    });

    it('should not throw on attachment with valid key', () => {
        const store = createStore({
            attachment: {
                key: {
                    throws: false,
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);

        expect(() => store.on('user:login', listener)).not.toThrowError();
    });

    it('should log error when attachment with invalid key if specified', () => {
        console.warn = vi.fn();
        const store = createStore({
            attachment: {
                key: {
                    throws: false,
                    logger: true,
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);

        // @ts-expect-error boo-hoo
        expect(() => store.on('account:login', listener)).not.toThrowError();
        expectStoreToBeEmpty(store);
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(failedToValidateEventMessage('account:login', 'on'));
    });

    it('should call custom logger on attachment with invalid key if specified', () => {
        const logger = vi.fn();
        const store = createStore({
            attachment: {
                key: {
                    throws: false,
                    logger: (event, method) => {
                        expect(event).toEqual('account:login');
                        expect(method).toEqual('on');
                        logger();
                    },
                },
            },
        });
        const inputs = { userId: '123', timestamp: Date.now() };
        const listener = createListener(inputs);

        // @ts-expect-error boo-hoo
        expect(() => store.on('account:login', listener)).not.toThrowError();
        expectStoreToBeEmpty(store);
        expect(logger).toHaveBeenCalledTimes(1);
    });

    it('should not call console.warn if logging is turn off on attachment with invalid key if specified', async () => {
        console.warn = vi.fn();
        const store = createStore({
            attachment: {
                key: {
                    logger: false,
                },
            },
        });
        const listener = createListener();

        // @ts-expect-error boo-hoo
        expect(() => store.on('account:login', listener)).toThrowErrorWithErrorMessage({
            error: StrictStoreKeyCheckFailError,
            message: buildRegExpForErrorValidation('account:login', 'on'),
        });
        // @ts-expect-error boo-hoo
        expect(() => store.notify('account:login', {})).rejects.toThrow(
            buildRegExpForErrorValidation('account:login', 'notify')
        );
        expect(listener).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(0);
    });

    it('should both log and throw error if attachment or notification receives invalid keys', async () => {
        console.warn = vi.fn();
        const store = createStore({
            attachment: {
                key: {
                    throws: true,
                    logger: true,
                },
            },
            notification: {
                key: {
                    throws: true,
                    logger: true,
                },
            },
        });
        const listener = createListener();
        attachToStoreInHardWay(store, 'account:login', listener);

        // @ts-expect-error boo-hoo
        expect(() => store.on('account:login', listener)).toThrowError(StrictStoreKeyCheckFailError);
        expect(console.warn).toHaveBeenCalledTimes(1);

        // @ts-expect-error boo-hoo
        expect(() => store.notify('account:login', {})).rejects.toThrowError(StrictStoreKeyCheckFailError);
        expect(listener).toHaveBeenCalledTimes(0);
        expect(console.warn).toHaveBeenCalledTimes(2);
    });
});
