# Services folder

Contains service classes, which should be used for main tasks in your app. This includes, but is not limited to, database operations, API calls, and other external services.

Services (as I see them) should behave similar to singleton. Here is an example of such declaration:

```typescript
class MyNiceService {
    private readonly wowAttribute: int = 0;

    private wonderfulMethod = () => {
        // does something
        return;
    };
}

// this part is very important.
// We do not expose class, but rather one instance of it which will be used on this module import
export default new MyNiceService();
```
