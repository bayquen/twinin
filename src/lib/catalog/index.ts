import "server-only";
import { MERCHANTS, type MerchantConfig } from "./merchants.config";
import { fetchShopifyCandidates } from "./shopify";

export { MERCHANTS, type MerchantConfig };
export { CatalogError } from "./shopify";

// First allowlist gate: an id that isn't in MERCHANTS can never reach the network.
export function getMerchant(id: string): MerchantConfig {
    const m = MERCHANTS.find((x) => x.id === id);
    if (!m) throw new Error(`Unknown merchant: ${id}`);
    return m;
}

// All 4 shops are Shopify today, so there is one adapter. A non-Shopify shop later means one more branch here.
export function getCandidates(m: MerchantConfig) {
    return fetchShopifyCandidates(m);
}