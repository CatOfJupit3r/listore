# Lystore - listeners, which actually listen!

Lystore is a TypeScript-first library built for creating modular event emitters/listener pattern stores. Lystore provides you with an easy way to create fully type-safe stores with a very slick

# Usage

There are 2 ways to use Lystore, both provide the same results

## Same File Stores

Using this approach, you declare your listener store and types for it in the same file. This is the easiest approach (and one that you could write yourself, but we listen and don't judge).

<h6 style="text-align: right;">
user.store.ts
</h6>

```typescript
import { type EventRegistry, ListenerStore } from 'lystore';

export interface UserRegistry extends EventRegistry {
    'user:login': { userId: string, date: Date };
    'user:registration': { username: string, email: string, password: string };
}

const store = new ListenerStore<UserRegistry>();

export default store;
```

Now, you can import this store wherever and your `on()` and `notify()` will all have provided type-hints with respect to your registry

<h6 style="text-align: right;">
some-other-place.ts
</h6>

```typescript
import store from 'user.store';

store.on('user:login', ({ userId, date }) => {
    console.log(`userId AND date are fully typed!`)
})
store.on('user:logout', (props) => {
    // props is unknown, as this type is not registered!
})
```

## Multi-files of Madness

But let's be honest, we like to separate our types from our store declarations, right? But don't worry, Lystore got you covered! 

<h6 style="text-align: right;">
/user-store/store.ts
</h6>

```typescript
import { ListenerStore, type EventRegistry } from 'lystore';

export interface UserRegistry extends EventRegistry {}

const store = new ListenerStore<UserRegistry>();

export default store;
```

<h6 style="text-align: right;">
/user-store/register.d.ts
</h6>

```typescript
import './store';

declare module './store' {
    export interface UserRegistry {
        'user:login': { userId: string, date: Date };
        'user:registration': { username: string, email: string, password: string };
    }
}
```

<h6 style="text-align: right;">
/user-store/index.ts
</h6>

```typescript
export { default as default } from './store';
```


<h6 style="text-align: right;">
some-other-place.ts
</h6>

```typescript
import store from './user-store';

store.on('user:login', ({ userId, date }) => {
    console.log(`Typed and safe!`)
})
store.on('user:logout', () => {
    // and this still unknown
})
```
