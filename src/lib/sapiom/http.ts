// Program: http.ts
// Purpose: The one place that calls `fetch` for Sapiom. It sets the auth, tenant and idempotency headers,
//          applies a timeout, and turns failed responses into SapiomErrors.

import "server-only";
import { SAPIOM_BASE_URL } from "./config";
import { SapiomError } from "./errors";

type SapiomRequest = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    apiKey: string;           // platform OR user key; caller decides
    tenantId?: string;        // sent as `sapiom-tenant`, which is needed for limits
    idempotencyKey?: string;  // sent as `Idempotency-Key`
    query?: Record<string, string | number | undefined>;
    body?: unknown;
};

function parseJson(text: string): unknown {
    try { return JSON.parse(text); } catch { return null; }
}

export async function sapiomFetch<T>(path: string, req: SapiomRequest): Promise<T> {
    const url = new URL(SAPIOM_BASE_URL + path);
    for (const [key, value] of Object.entries(req.query ?? {})) {
        if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = { "x-api-key": req.apiKey };
    if (req.body !== undefined) headers["Content-Type"] = "application/json";
    if (req.tenantId) headers["sapiom-tenant"] = req.tenantId;
    if (req.idempotencyKey) headers["Idempotency-Key"] = req.idempotencyKey;

    const res = await fetch(url, {
        method: req.method ?? "GET",
        headers,
        body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
        cache: "no-store",  // money state must never be cached!
        signal: AbortSignal.timeout(30_000),
    });

    const text = await res.text();
    const data = text ? parseJson(text) : null;

    if (!res.ok) {
        const err = data as { code?: string; message?: string } | null;
        // Never log `data` blindly: bodies can contain links or user details (i.e. sensitive info)
        throw new SapiomError(res.status, err?.code, err?.message ?? res.statusText, data);
    }
    
    return data as T;
}