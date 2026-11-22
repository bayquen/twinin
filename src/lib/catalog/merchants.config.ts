import type { MerchantInfo } from "@/lib/sapiom";

export type MerchantConfig = {
    id: string;              // stable key used in the form and the DB
    domain: string;
    info: MerchantInfo;      // sent to Sapiom's create-transaction
    interestLabel: string;   // dropdown text (one gift 'interest' per shop for this app MVP)
    sandboxOnly?: boolean;   // test store: offered when APP_MODE = sandbox
};

export const MERCHANTS: MerchantConfig[] = [
    {
        id: "vivisports", domain: "vivisports.com", interestLabel: "Sports & fitness",
        info: { origin: "https://vivisports.com", name: "Vivi Sports", countryCode: "US" } },
    {
        id: "exoticsnacks", domain: "exoticsnacks.com", interestLabel: "Food and snacks",
        info: { origin: "https://exoticsnacks.com", name: "Exotic Snacks", countryCode: "US" } },
    {
        id: "wildone", domain: "wildone.com", interestLabel: "Pets",
        info: { origin: "https://wildone.com", name: "Wild One", countryCode: "US" } },
    {
        id: "sapiom-test", domain: "sapiom-test-store.myshopify.com", interestLabel: "Sandbox test store", sandboxOnly: true,
        info: { origin: "https://sapiom-test-store.myshopify.com", name: "Sapiom Test Store", countryCode: "US" } },
    ];
