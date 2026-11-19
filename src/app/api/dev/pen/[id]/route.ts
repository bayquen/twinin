import { NextResponse } from "next/server";
import { getTransaction } from "@/lib/sapiom";

// Next 15+: `params` is a Promise.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const { id } = await params;
  const tx = await getTransaction(process.env.TEST_USER_1_KEY!, id);
  return NextResponse.json({
    id: tx.id, status: tx.status, version: tx.version,
    nextAction: { type: tx.nextAction?.type, actor: tx.nextAction?.actor },
    orderOutcome: tx.order?.outcome ?? null,
  });
}