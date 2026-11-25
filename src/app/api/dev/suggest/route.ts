import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestGifts } from "@/lib/gifts/suggestGifts";
import { CatalogError, UnknownMerchantError } from "@/lib/catalog";
import { LlmError } from "@/lib/llm/deepseek";

const Body = z.object({
    merchantId: z.string(),
    budgetCents: z.number().int().positive().max(20_000),
});

export async function POST(req: Request) {
    // Dev-only door. It must NOT exist in production (same guard as /api/dev/pen).
    if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    try {
        return NextResponse.json(await suggestGifts(parsed.data));
    } catch (err) {
        if (err instanceof UnknownMerchantError) return NextResponse.json({ error: "unknown_merchant" }, { status: 400 });
        if (err instanceof CatalogError) return NextResponse.json({ error: "catalog_unavailable" }, { status: 502 });
        if (err instanceof LlmError || err instanceof z.ZodError || err instanceof SyntaxError) {
            return NextResponse.json({ error: "ai_unavailable" }, { status: 502 });
        }
        throw err;
    }
}

