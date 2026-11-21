export type CatalogProduct = {
    merchantId: string;
    variantId: string;   // merchant's own checkout id: what createUcpTransaction expects (gid://shopify/ProductVariant/<n>)
    title: string;
    priceCents: number;
    url: string;
    imageUrl: string | null;
    productType: string;
    tags: string[];
};