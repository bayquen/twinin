// Program: config.ts
// Purpose: env + key/app-mode (i.e. Sapiom's Sandbox vs. production) guard

import "server-only"

export const SAPIOM_BASE_URL = "https://api.sapiom.ai/v1";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing env var: ${name}`);
    return value;
}

// Fail fast: a sandbox app must never hold a live key (and vice versa).
// Full version lives in lib/mode.ts (Phase 3, step 19); this is the minimum.
export function assertKeyMatchesMode(key: string): void {
    const mode = requireEnv("APP_MODE");
    const expected = mode === "sandbox" ? "sk_test_" : mode === "live-dryrun" ? "sk_live_" : null;
    if (!expected) throw new Error(`Unknown APP_MODE: ${mode}`);
    if (!key.startsWith(expected)) {
        throw new Error(`APP_MODE=${mode} requires a key starting with ${expected}`);
    }
}

export function getPlatformKey(): string {
    const key = requireEnv("SAPIOM_PLATFORM_KEY");
    assertKeyMatchesMode(key);
    return key;
}