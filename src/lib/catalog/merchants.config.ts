import type { MerchantInfo } from "@/lib/sapiom";

export type MerchantConfig = {
    id: string;              // stable key used in the form and the DB
    domain: string;
    info: MerchantInfo;      // sent to Sapiom's create-transaction
    interestLabel: string;   // dropdown text (one gift 'interest' per shop for this app MVP)
    sandboxOnly?: boolean;   // test store: offered when APP_MODE = sandbox
};