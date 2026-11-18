// Program: money.ts
// Purpose: Helper to convert numeric budget and/or price amounts to valid format for Sapiom!! (e.g. "12.34")

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