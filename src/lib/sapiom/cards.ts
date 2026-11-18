// Program: cards.ts
// Purpose: Creates a card setup link and fetches it afterward. The link's URL is a 
// one-time secret that gets redirected to and is never logged.

import { sapiomFetch } from "./http";

// The returned `url` contains a one-time code: redirect the user & never log or store it.
export function createSetupLink(
    userKey: string,
    input: { returnUrl?: string; cardholderEmail?: string; expiresinMinutes?: number },
) {
    return sapiomFetch<{ id: string; url: string }>("/payment-cards/setup-links", {
        method: "POST", apiKey: userKey, body: input,
    });
}

// After the user saves a card, this shows it:
export function getSetupLink(userKey: string, linkId: string) {
    return sapiomFetch<{ id: string; status?: string; card?: { id: string } }>(
        `payment-cards/setup-links/${encodeURIComponent(linkId)}`, { apiKey: userKey },
    );
}