// Program: types.ts
// Purpose: Typescript types for Sapiom's requests and responses (shipping, transaction, merchant check, limits).
//          The transaction status type comes from the DB enum so the two lists stay in sync.

import type { transactionStatus } from "@/db/schema";

// Derived from the DB enum in `db/schema.ts` so the two transaction lists can't drift apart (DRY).
export type TransactionStatus = (typeof transactionStatus.enumValues)[number];

export type ShippingAddress = {
    first_name?: string;
    last_name?: string;
    street_address: string;    // required by Sapiom
    extended_address?: string;
    address_locality: string;  // required (this is the "city")
    address_region?: string;
    postal_code?: string;
    address_country: string;   // required
};

export type Shipping = {
    address: ShippingAddress;
    contact: { email: string, phone_number?: string };
};

export type MerchantInfo = { origin: string; name: string; countryCode: string };

// Only the fields we use.
export type SapiomTransaction = {
    id: string,
    version: string;
    status: TransactionStatus;
    nextAction?: { type: string; actor?: string; url?: string; continueUrl?: string };
    order?: { outcome?: string } | null;  // UCP: only "confirmed" means order was placed
};

export type MerchantCheck = {
    status: "supported" | "unsupported" | "unknown";
    reason: string;
    retryAfterSeconds: number | null;
}

export type SpendingLimits = { version: number; purchaseLimit: { amount: string; currency: "USD" } | null };