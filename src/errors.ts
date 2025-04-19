export class StrictKeyCheckFailError extends Error {
    public variant: string;

    constructor(message: string) {
        super(message);
        this.variant = 'StrictKeyCheckFailError';
    }
}
