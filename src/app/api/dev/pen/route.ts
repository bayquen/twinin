import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
    assertKeyMatchesMode, checkMerchantWithRetry, setPurchaseLimit,
    createUcpTransaction, getConfirmUrl, SapiomError,
} from "@/lib/sapiom";
import { TEST_STORE, TEST_SHIPPING } from "@/lib/sapiom/dev-fixtures";
import { waitForNextAction } from "@/lib/sapiom/transactions";

const PEN_LIMIT_CENTS = 5000;  // generous sandbox cap; the user's budget can be used and tested separately as desired

export async function POST() {
    // Dev-only door into the payment flow: it MUST NOT exist in production.
    if (process.env.NODE_ENV === "production") {
        return new NextResponse("Not found", { status: 404 });
    }

    try {
        const userKey = process.env.TEST_USER_1_KEY!;
        const tenantId = process.env.TEST_USER_1_USER_ID!;
        const cardId = process.env.TEST_USER_1_CARD_ID!;
        // From our `lib/sapiom/config.ts` file: Makes sure the Sapiom user key is correlated to the correct mode 
        // (i.e. Sandbox vs production mode)
        assertKeyMatchesMode(userKey);

        const check = await checkMerchantWithRetry(userKey, TEST_STORE.domain, 3);
        if (check.status !== "supported") {
            return NextResponse.json({ error: "merchant_not_supported", check }, { status: 422 });
        }

        // BLOCKED: spending-limits returns 403 (org.read). Uncomment this
        // function call once Sapiom confirms access(?).
        // await setPurchaseLimit(tenantId, cardId, PEN_LIMIT_CENTS);

        const created = await createUcpTransaction({
            userKey,
            idempotencyKey: randomUUID(),
            merchant: TEST_STORE.merchant,
            items: [{ id: TEST_STORE.penVariantId, quantity: 1 }],
            shipping: TEST_SHIPPING,
            paymentCardId: cardId,
        });
        const tx = await waitForNextAction(userKey, created);

        const confirmUrl = getConfirmUrl(tx);
        if (!confirmUrl) {
             // note: This is not an error. This shows state so that 
             // the action Sapiom wants next can be inspected.
            return NextResponse.json({ id: tx.id, status: tx.status, 
                nextAction: { 
                    type: tx.nextAction?.type, actor: tx.nextAction.actor 
                } 
            });
        }
        return NextResponse.redirect(confirmUrl, 303);  // 303 turns the form 'POST' into a 'GET'
    } catch (err) {
        if (err instanceof SapiomError) {
            return NextResponse.json({ error: err.code, status: err.status, message: err.message }, { status: 502 });
        }
        throw err;
    }
}