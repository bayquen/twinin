// Program: money.ts
// Purpose: Helper program to:
//          - Convert numeric money amounts to valid string format that can be displayed for user budgets 
//          and product prices (e.g. "12.34").
//          - Convert the string money format to decimal numbers for the app to do real price comparisons, budget checks, etc.

// Integer cents → Sapiom API's decimal string, e.g. 2500 -> "25.00".
// Integer math only: floats would give 0.1 + 0.2 = 0.30000000000000004.
export function centsToAmount(cents: number): string {
    if (!Number.isInteger(cents) || cents < 0) {
        throw new Error(`Invalid cents value: ${cents}`);
    }
    const dollars = Math.floor(cents / 100);  // Cents -> dollars
    const remainder = String(cents % 100).padStart(2, "0")  //  The right side of the decimal in, e.g., "12.34".
    return `${dollars}.${remainder}`;
}

// Decimal string -> integer cents, e.g. "12.5" -> 1250. Integer math only (mirror of centsToAmount).
// Shopify and Sapiom both send money as strings.
export function amountToCents(amount: string): number {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(amount.trim());
    if (!match) throw new Error(`Invalid amount: ${amount}`);
    return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}