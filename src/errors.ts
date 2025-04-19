export class StrictStoreKeyCheckFailError extends Error {
    public variant: string;
    public method: 'on' | 'notify';
    public event: string;

    constructor(event: string, method: 'on' | 'notify', prefix: string = '[STRICT STORE]') {
        super(`${prefix} "${method}" encountered unknown event: ${event}`);
        this.event = event;
        this.method = method;
        this.variant = 'StrictStoreKeyCheckFailError';
    }
}
