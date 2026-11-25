import "server-only";
import { getCandidates, getMerchant, MERCHANTS } from "@/lib/catalog";
import { askForPicks } from "@/lib/llm/picks";
import { fitsBudget, resolvePicks } from "./filter";

const MAX_CANDIDATES = 40;
const ALLOWED = new Set(MERCHANTS.map((m) => m.id));

// Flat shipping+tax estimate in cents. Fails loudly on a bad value instead of silently filtering out everything.
function getOverheadCents(): number {
    const n = Number(process.env.GIFT_OVERHEAD_CENTS ?? 1000);
    if (!Number.isInteger(n) || n < 0) throw new Error("Invalid env var: GIFT_OVERHEAD_CENTS");
    return n;
}

export async function suggestGifts(input: {
    merchantId: string;
    budgetCents: number;
    excludeVariantIds?: string[];
}) {
    const merchant = getMerchant(input.merchantId);   // allowlist gate #1
    const overhead = getOverheadCents();
    const exclude = new Set(input.excludeVariantIds ?? []); // keeps track of any items user already saw, so same gifts aren't suggested twice

    const all = await getCandidates(merchant);
    const affordable = all
        .filter((p) => !exclude.has(p.variantId) && fitsBudget(p.priceCents, input.budgetCents, overhead))
        .slice(0, MAX_CANDIDATES);

    const stats = { fetched: all.length, affordable: affordable.length, picked: 0, kept: 0 };
    if (affordable.length === 0) return { suggestions: [], stats };   // skip the AI call, which saves money

    // Short ids ("c1".."c40"): fewer tokens, and nothing for the model to mistype.
    const byId = new Map(affordable.map((p, i) => [`c${i + 1}`, p] as const));
    const picks = await askForPicks(merchant.interestLabel, input.budgetCents, byId);
    const suggestions = resolvePicks(picks, byId, ALLOWED, input.budgetCents, overhead);   // allowlist gate #2
    return { suggestions, stats: { ...stats, picked: picks.length, kept: suggestions.length } };
}