import 'vitest';

type StringOrRegExp = string | RegExp;

interface CustomMatchers<R = unknown> {
    toThrowErrorWithErrorMessage({ error: ErrorConstructor, message: StringOrRegExp }): R;
}

export declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}

    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
