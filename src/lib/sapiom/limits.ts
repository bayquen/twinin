// Program: limits.ts
// Purpose:  Sets a spending cap on a card by fetching the current version first, 
//           then a PUT, and retries if it gets a 409 conflict.

import { getPlatformKey } from "./config";
import { sapiomFetch } from "./http";
import { SapiomError } from "./errors";
import { centsToAmount } from "./money";
import type { SpendingLimits } from "./types";

const MAX_ATTEMPTS = 3;

// Optimistic concurrency: PUT must carry the `version` from the latest GET.
// A 409 usually means someone changed it in between, so re-GET and retry a few times.
// NOTE: PUT replaces all three limits, so unused ones are sent as null.
export async function setPurchaseLimit(tenantId: string, cardId: string, limitCents: number) {
    const apiKey = getPlatformKey();
    const path = `/payment-cards/${encodeURIComponent(cardId)}/spending-limits`;

    for (let attempt = 1; ; attempt++) {
        const current = await sapiomFetch<SpendingLimits>(path, { apiKey, tenantId });
        try {
            return await sapiomFetch<SpendingLimits>(path, {
                method: "PUT", apiKey, tenantId,
                body: {
                    version: current.version,
                    purchaseLimit: { amount: centsToAmount(limitCents), currency: "USD" },
                    recurringLimit: null,
                    customLimit: null,
                },
            });
        } catch (err) {
            const isConflict = err instanceof SapiomError && err.status === 409;
            if (!isConflict || attempt >= MAX_ATTEMPTS) throw err; 
        }
    }
}