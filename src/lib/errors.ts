// Program: errors.ts
// Purpose:

// Carries the HTTP status and Sapiom's error `code` so callers can branch on them
// (e.g. 409 on limits, 409 "card_relayed" on cancel).
export class SapiomError extends Error {
    readonly status: number;
    readonly code: string | undefined;
    readonly body: unknown;

    constructor(status: number, code: string | undefined, message: string, body: unknown) {
        super(message);
        this.name = "SapiomError",
        this.status = status,
        this.code = code,
        this.body = body
    }
}