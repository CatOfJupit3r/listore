/**
 * Generates a failed to validate event message
 * @param event Event name
 * @param method Method name
 * @param prefix Prefix for the message
 * @returns Failed to validate event message
 */
export const failedToValidateEventMessage = (
    event: string,
    method: 'on' | 'notify',
    prefix: string = '[STRICT STORE]'
) => {
    return `${prefix} "${method}" encountered unknown event: ${event}`;
};

/**
 * Error thrown when key validation fails
 */
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
