import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function options() {
  return addCorsHeaders(new Response(null, { status: 200 }));
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    
    // Your Shopify configuration
    const SHOP_DOMAIN = "tryongoeye.myshopify.com";
    const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
    
    console.log("🛒 Fetching products for collection:", collection);
    console.log("🚀 Shop domain:", SHOP_DOMAIN);
    console.log("🔑 Token available:", !!STOREFRONT_ACCESS_TOKEN);

    if (!STOREFRONT_ACCESS_TOKEN) {
      throw new Error("Storefront access token not configured");
    }

    if (!collection) {
      return addCorsHeaders(json({ 
        error: "Collection handle is required. Use ?collection=handle",
        success: false 
      }, { status: 400 }));
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    };

    // GraphQL query to fetch products from a specific collection
    const query = `{
      collection(handle: "${collection}") {
        id
        title
        handle
        description
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              vendor
              availableForSale
              images(first: 3) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

    console.log("📋 GraphQL Query:", query);

    const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 Raw Shopify response:", JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error("🚨 GraphQL errors:", data.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (!data.data || !data.data.collection) {
      console.warn("⚠️ Collection not found:", collection);
      return addCorsHeaders(json({ 
        products: [],
        collection: null,
        success: true,
        message: `Collection '${collection}' not found`
      }));
    }

    const collectionData = data.data.collection;
    
    // Transform products to our expected format
    const products = collectionData.products.edges.map((edge: any) => {
      const product = edge.node;
      const firstVariant = product.variants.edges[0]?.node;
      const firstImage = product.images.edges[0]?.node;
      
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description || "",
        vendor: product.vendor || "GoEye",
        available: product.availableForSale,
        images: product.images.edges.map((img: any) => ({
          src: img.node.url,
          alt: img.node.altText || product.title
        })),
        featured_image: firstImage?.url || "",
        variants: product.variants.edges.map((variant: any) => ({
          id: variant.node.id,
          title: variant.node.title,
          available: variant.node.availableForSale,
          price: variant.node.price?.amount || "0",
          compare_at_price: variant.node.compareAtPrice?.amount || null,
          currency: variant.node.price?.currencyCode || "USD"
        }))
      };
    });

    console.log(`✅ Returning ${products.length} products from collection '${collection}'`);
    
    return addCorsHeaders(json({ 
      products,
      collection: {
        id: collectionData.id,
        title: collectionData.title,
        handle: collectionData.handle,
        description: collectionData.description
      },
      success: true 
    }));

  } catch (error) {
    console.error("❌ Public Products API Error:", error);
    return addCorsHeaders(json({ 
      error: error instanceof Error ? error.message : "Failed to fetch products",
      products: [],
      success: false 
    }, { status: 500 }));
  }
}; 