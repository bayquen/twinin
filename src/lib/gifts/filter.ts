import type { CatalogProduct } from "@/lib/catalog/types";
import type { AiPick } from "@/lib/llm/picks";

export type GiftSuggestion = { product: CatalogProduct; reason: string; estimatedTotalCents: number };

// THE budget rule, used before AND after the AI call (DRY). Phase 5 estimate only; Phase 6 re-checks against Sapiom's real purchase.total.
export function fitsBudget(priceCents: number, budgetCents: number, overheadCents: number): boolean {
    return priceCents + overheadCents <= budgetCents;
}

// Keep a gift pick only if its id is real, unique, from an allowlisted shop, and within budget.
export function resolvePicks(
    picks: AiPick[],
    byId: Map<string, CatalogProduct>,
    allowedMerchantIds: Set<string>,
    budgetCents: number,
    overheadCents: number,
): GiftSuggestion[] {
    const seen = new Set<string>();
    return picks.flatMap((pick) => {
        const product = byId.get(pick.id);                          // invented id -> dropped
        if (!product || seen.has(pick.id)) return [];               // duplicate -> dropped
        if (!allowedMerchantIds.has(product.merchantId)) return []; // off-allowlist -> dropped
        if (!fitsBudget(product.priceCents, budgetCents, overheadCents)) return [];
        seen.add(pick.id);
        return [{ product, reason: pick.reason, estimatedTotalCents: product.priceCents + overheadCents }];
    });
}