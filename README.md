<p align="center">
    <img width="75" height="75" alt="Lystore Logo" src="docs/lystore.png" />
</p>
<h1 align="center">Lystore - listeners, which actually listen!</h1>

***

<div align="center">

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

[![Build Status][build-img]][build-url]
[![Issues][issues-img]][issues-url]

</div>

***

Lystore is a TypeScript-first library built for creating modular event emitters/listener pattern stores. Lystore
provides you with an easy way to create fully type-safe stores with a very versatile API

# Usage

There are 2 ways to use Lystore, both provide the same results. If you need a more in-depth explanation, please read
the [API wiki][api-examples-wiki-url] (although Lystore provides a very in-depth JSDoc documentation) or if you want to see examples, please check out the [examples wiki][api-examples-wiki-url]

## Same File Stores

Using this approach, you declare your listener store and types for it in the same file. This is the easiest approach (
and one that you could write yourself, but we listen and don't judge).

<h6 align="right">
/user.store.ts
</h6>

```typescript
import { type StrictRegistry, StrictStore } from 'lystore';

const ALLOWED_EVENTS = {
    'user:login': 'user:login',
    'user:registration': 'user:registration',
} as const;

type UserEvents = typeof ALLOWED_EVENTS[keyof typeof ALLOWED_EVENTS];

export interface UserRegistry extends StrictRegistry<UserEvents> {
    'user:login': { userId: string, date: Date };
    'user:registration': { username: string, email: string, password: string };
}

const store = new StrictStore<
    UserEvents,
    UserRegistry
>(ALLOWED_EVENTS);

export default store;
```

Now, you can import this store wherever and your `.on()` and `.notify()` will all have provided type-hints with respect to
your registry

<h6 align="right">
/some-other-place.ts
</h6>

```typescript
import store from 'user.store';

store.on('user:login', ({ userId, date }) => {
    console.log(`userId AND date are fully typed!`);
});

store.on('user:logout', (props) => {
    // TS2345: Argument of type 'some-unknown-event' is not assignable to parameter of type keyof UserRegistry
    // StrictStoreKeyCheckFailError: [STRICT STORE] "on" encountered unknown event: user:logout
});
```

## Multi-files of Madness

But let's be honest, we like to separate our types from our store declarations, right? But don't worry, Lystore got you
covered!

<h6 align="right">
/user-store/store.ts
</h6>

```typescript
import { type StrictRegistry, StrictStore } from 'lystore';

export const ALLOWED_EVENTS = {
    'USER_CREATED': 'USER_CREATED',
    'USER_LOGGED_IN': 'USER_LOGGED_IN',
    'USER_LOGGED_OUT': 'USER_LOGGED_OUT',
} as const;

export type UserEvents = typeof ALLOWED_EVENTS[keyof typeof ALLOWED_EVENTS];

export interface UserRegistry extends StrictRegistry<UserEvents> {}

const store = new StrictStore<UserEvents, UserRegistry>(ALLOWED_EVENTS);

export default store;
```

<h6 align="right">
/user-store/register.ts
</h6>

```typescript
import { StrictRegistry } from 'lystore';
import './store';

declare module './store' {
    export interface UserRegistry extends StrictRegistry<UserEvents> {
        USER_CREATED: {
            userId: string;
            timestamp: number;
        };
        USER_LOGGED_IN: {
            userId: string;
            timestamp: number;
        };
        USER_LOGGED_OUT: {
            userId: string;
            reason: string;
        };
    }
}
```

<h6 align="right">
/user-store/index.ts
</h6>

```typescript
export { default as default, ALLOWED_EVENTS } from './store';
```

<h6 align="right">
/some-other-place.ts
</h6>

```typescript
import userStore, { ALLOWED_EVENTS } from './user-store';

userStore.on(ALLOWED_EVENTS.USER_CREATED, ({ userId, timestamp }) => {
    console.log('Account created:', userId, timestamp);
});

userStore
    .notify(ALLOWED_EVENTS.USER_CREATED, {
        userId: '123',
        timestamp: Date.now(),
    })
    .then(() => console.log('Notification sent!'));
userStore.on('some-unknown-event', () => {
    // TS2345: Argument of type 'some-unknown-event' is not assignable to parameter of type keyof UserRegistry
    // StrictStoreKeyCheckFailError: [STRICT STORE] "on" encountered unknown event: some-unknown-event
});
```

[build-img]:https://github.com/CatOfJupit3r/lystore/actions/workflows/release.yml/badge.svg

[build-url]:https://github.com/CatOfJupit3r/lystore/actions/workflows/release.yml

[downloads-img]:https://img.shields.io/npm/d18m/lystore

[downloads-url]:https://npmtrends.com/lystore

[npm-img]:https://img.shields.io/npm/v/lystore

[npm-url]:https://www.npmjs.com/package/lystore

[issues-img]:https://img.shields.io/github/issues/CatOfJupit3r/lystore

[issues-url]:https://github.com/CatOfJupit3r/lystore/issues

[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[semantic-release-url]:https://github.com/semantic-release/semantic-release

[api-wiki-url]:https://github.com/CatOfJupit3r/lystore/wiki

[api-usage-wiki-url]:https://github.com/CatOfJupit3r/lystore/wiki/3.-Usage

[api-examples-wiki-url]:https://github.com/CatOfJupit3r/lystore/wiki/Examples-%7C-index
