export const failedToValidateEventMessage = (
    event: string,
    method: 'on' | 'notify',
    prefix: string = '[STRICT STORE]'
) => {
    return `${prefix} "${method}" encountered unknown event: ${event}`;
};

export class StrictStoreKeyCheckFailError extends Error {
    public variant: string;
    public method: 'on' | 'notify';
    public event: string;

    constructor(event: string, method: 'on' | 'notify', prefix: string = '[STRICT STORE]') {
        super(failedToValidateEventMessage(event, method, prefix));
        this.event = event;
        this.method = method;
        this.variant = 'StrictStoreKeyCheckFailError';
    }
}
