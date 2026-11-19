// TEMPORARY TEST: replaced by the real catalog later.
export const TEST_STORE = {
    domain: "sapiom-test-store.myshopify.com",
    merchant: { origin: "https://sapiom-test-store.myshopify.com", name: "Sapiom Test Store", countryCode: "US" },
    penVariantId: "gid://shopify/ProductVariant/68317504897245",
  };
  
  // Fake sandbox address/contact. Replace with the real form data in Phase 6.
  export const TEST_SHIPPING = {
    address: {
      first_name: "Test", last_name: "Buyer", street_address: "1 Test St",
      address_locality: "San Francisco", address_region: "CA", postal_code: "94105", address_country: "US",
    },
    contact: { email: "test@example.com" },
  };