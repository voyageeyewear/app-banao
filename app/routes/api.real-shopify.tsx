import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Helper function to add CORS headers
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
    const type = url.searchParams.get("type");
    
    // Your Shopify configuration
    const SHOP_DOMAIN = "tryongoeye.myshopify.com";
    const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
    
    console.log("🚀 Fetching real data from:", SHOP_DOMAIN);
    console.log("📋 Type requested:", type);
    console.log("🔑 Token available:", !!STOREFRONT_ACCESS_TOKEN);

    if (!STOREFRONT_ACCESS_TOKEN) {
      throw new Error("Storefront access token not configured");
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    };

    if (type === "collections") {
      // Use the exact working query
      const query = `{
        collections(first: 10) {
          edges {
            node {
              id
              title
              handle
              description
              image {
                url
              }
            }
          }
        }
      }`;

      console.log("🛍️ Fetching collections...");
      const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Collections API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Collections data:", data);

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const collections = data.data.collections.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description || "Browse our collection",
        image: edge.node.image?.url || "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop"
      }));

      console.log(`✅ Returning ${collections.length} real collections`);
      return addCorsHeaders(json({ collections, success: true }));
    }

    if (type === "products") {
      // Use the exact working query  
      const query = `{
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }`;

      console.log("🛍️ Fetching products...");
      const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Products API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Products data:", data);

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const products = data.data.products.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description || "No description available",
        image: edge.node.images.edges[0]?.node.url || "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop",
        price: edge.node.variants.edges[0]?.node.price ? 
          `${edge.node.variants.edges[0].node.price.currencyCode} ${edge.node.variants.edges[0].node.price.amount}` : 
          "Price not available"
      }));

      console.log(`✅ Returning ${products.length} real products`);
      return addCorsHeaders(json({ products, success: true }));
    }

    return addCorsHeaders(json({ 
      error: "Please specify type=collections or type=products" 
    }, { status: 400 }));

  } catch (error) {
    console.error("❌ Real Shopify API Error:", error);
    return addCorsHeaders(json({ 
      error: error instanceof Error ? error.message : "Failed to fetch data",
      success: false 
    }, { status: 500 }));
  }
}; 