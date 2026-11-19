import { sapiomFetch } from "./http";
import type { MerchantInfo, SapiomTransaction, Shipping } from "./types";

export type CreateUcpTransactionInput = {
    userKey: string;
    idempotencyKey: string;  // generate ONCE per purchase intent, persist, reuse on retry
    merchant: MerchantInfo;
    items: { id: string; quantity: number }[];   // id in the merchant's format (e.g. Shopify: gid://shopify/ProductVariant/...)
    shipping: Shipping;
    paymentCardId?: string;
};

export function createUcpTransaction(input: CreateUcpTransactionInput) {
    return sapiomFetch<SapiomTransaction>("/transactions", {
        method: "POST",
        apiKey: input.userKey,
        idempotencyKey: input.idempotencyKey,
        body: {
            purchase: {
                type: "ucp_checkout",
                merchant: input.merchant,
                checkout: {
                    currency: "USD",
                    line_items: input.items.map((i) => ({ item: { id: i.id }, quantity: i.quantity })),
                },
            },
            funding: { source: "external_card", paymentCardId: input.paymentCardId },
            shipping: input.shipping,
        },
    });
}

// maxWaitSeconds (0-25) holds the call open until something changes: cheaper than tight polling.
export function getTransaction(
    userKey: string, id: string, opts: { maxWaitSeconds?: number, since?: string } = {},
) {
    return sapiomFetch<SapiomTransaction>(`/transactions/${encodeURIComponent(id)}`, {
        apiKey: userKey, query: opts,
    });
}

// UCP purchases cancel via the CHECKOUT route. The generic /cancel is browser-only
// (409 not_a_browser_purchase). Cancelling twice is a no-op. Cancelling never refunds.
export function cancelTransaction(userKey: string, id: string) {
    return sapiomFetch<unknown>(`/transactions/${encodeURIComponent(id)}/ucp/checkout/cancel`, {
        method: "POST", apiKey: userKey,
    });
}

// The confirm link is a secret for the named `actor` only. Return it to the
// browser, never to logs or LLM prompts. Phase 1 saw `url`; the docs say `continueUrl`.
export function getConfirmUrl(tx: SapiomTransaction): string | null {
    return tx.nextAction?.url ?? tx.nextAction?.continueUrl ?? null;
}