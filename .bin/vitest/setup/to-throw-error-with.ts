import { expect } from 'vitest';

expect.extend({
    toThrowErrorWithErrorMessage(
        received: () => unknown,
        expected: {
            error: ErrorConstructor;
            message: string | RegExp;
        }
    ) {
        try {
            received();
        } catch (error) {
            if (error instanceof expected.error) {
                const { message } = expected;
                if (message instanceof RegExp) {
                    if (message.test(error.message)) {
                        return {
                            pass: true,
                            message: () => `expected ${error.message} to not match ${message}. Received ${received}`,
                        };
                    }
                } else {
                    if (!error.message.includes(message)) {
                        return {
                            pass: true,
                            message: () => `expected ${error.message} to not include ${message}. Received ${received}`,
                        };
                    }
                }
            }
        }

        return {
            pass: false,
            message: () => `expected function to throw ${expected.error} with message ${expected.message}.}`,
        };
    },
});
