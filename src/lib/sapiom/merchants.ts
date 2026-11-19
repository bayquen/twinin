import { sapiomFetch } from './http';
import type { MerchantCheck } from './types';

export function checkMerchant(userKey: string, domain: string) {
    return sapiomFetch<MerchantCheck>("/transaction-compatibility", {
        apiKey: userKey, query: { domain },
    });
}

// "unknown" = the CHECK failed, but not "unsupported". Retry a few times; if it stays
// unknown, then return it and let the caller show "try again", but never "not supported".
export async function checkMerchantWithRetry(userKey: string, domain: string, maxAttempts: 3) {
    let result = await checkMerchant(userKey, domain);
    for (let attempt = 1; result.status === "unknown" && attempt < maxAttempts; attempt++) {
        const waitSeconds = Math.min(result.retryAfterSeconds ?? 2, 10);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        result = await checkMerchant(userKey, domain);
    }
    return result;
}