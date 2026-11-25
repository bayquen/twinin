import "server-only";
import { z } from "zod";
import { amountToCents } from "@/lib/sapiom/money";
import type { MerchantConfig } from "./merchants.config";
import type { CatalogProduct } from "./types";

// Our one error type for "the catalog is unavailable". The route maps it to a clean 502.
export class CatalogError extends Error {
    constructor(readonly merchantId: string, readonly status?: number) {
        super(`Catalog fetch failed for ${merchantId}${status ? ` (HTTP ${status})` : ""}`);
        this.name = "CatalogError";
    }
}

// Only the fields we use. zod strips everything else, so unknown Shopify fields never reach the code.
const ShopifyProducts = z.object({
    products: z.array(z.object({
        handle: z.string(),
        title: z.string(),
        product_type: z.string().default(""),
        tags: z.array(z.string()).default([]),
        images: z.array(z.object({ src: z.string() })).default([]),
        variants: z.array(z.object({
            id: z.number(),
            price: z.string(),
            available: z.boolean().optional(),
        })),
    })),
});

// Everything that can go wrong on the network becomes a CatalogError. Nothing else leaks out.
async function getJson(m: MerchantConfig): Promise<unknown> {
    let res: Response;
    try {
        res = await fetch(`https://${m.domain}/products.json?limit=250`, {
            headers: { Accept: "application/json", "User-Agent": "Twinin/0.1" },
            next: { revalidate: 600 },  // ask Next to cache for 10 min
            signal: AbortSignal.timeout(10_000),
        });
    } catch {
        // Timeout or network failure. The raw error is dropped on purpose: it's noise to the caller.
        throw new CatalogError(m.id); 
    }
    if (!res.ok) throw new CatalogError(m.id, res.status);

    try {
        return await res.json();
    } catch {
        // HTTP 200 but not JSON, e.g. a bot-protection HTML page. Not a shape change, so no status.
        throw new CatalogError(m.id);
    }
}

export async function fetchShopifyCandidates(m: MerchantConfig): Promise<CatalogProduct[]> {
    const parsed = ShopifyProducts.safeParse(await getJson(m));
    if (!parsed.success) {
        // Log the field PATHS only (e.g. "products.3.variants"), never the values. Enough to see what changed.
        console.error(`Catalog shape changed for ${m.id}:`, parsed.error.issues.map((i) => i.path.join(".")));
        throw new CatalogError(m.id);   // fail loud: the route answers 502
    }

    return parsed.data.products.flatMap((p) => {
        const variant = p.variants
            .filter((v) => v.available !== false)
            .sort((a, b) => amountToCents(a.price) - amountToCents(b.price))[0];
        if (!variant) return [];  // sold out: drop the product

        return [{
            merchantId: m.id,
            variantId: `gid://shopify/ProductVariant/${variant.id}`,
            title: p.title,
            priceCents: amountToCents(variant.price),
            url: `https://${m.domain}/products/${p.handle}`,
            imageUrl: p.images[0]?.src ?? null,
            productType: p.product_type,
            tags: p.tags,
        }];
    });
}