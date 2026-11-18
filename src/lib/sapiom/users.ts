// Program: users.ts
// Purpose: Creating Sapiom users and their keys.

import { getPlatformKey } from "./config";
import { sapiomFetch } from "./http";

// In the API a "user" is called a "tenant". So pass the session id as externalId
// so that a duplicate create is detectable (the API answers 409).
export function createUser(input: { name: string; externalId?: string }) {
  return sapiomFetch<{ id: string }>("/tenants", {
    method: "POST", apiKey: getPlatformKey(), body: input,
  });
}

// `plainKey` is returned ONCE. Store it encrypted immediately
export function createUserKey(tenantId: string, name: string) {
  return sapiomFetch<{ plainKey: string }>(`/tenants/${encodeURIComponent(tenantId)}/api-keys`, {
    method: "POST", apiKey: getPlatformKey(), body: { name },
  });
}