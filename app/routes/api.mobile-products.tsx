import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Shopify Storefront API credentials (using environment variables for security)
const STOREFRONT_API_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const SHOP_DOMAIN = "tryongoeye.myshopify.com";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("🚀 Fetching products via Storefront API for mobile app...");
    
    // Check if token is available
    if (!STOREFRONT_API_TOKEN) {
      throw new Error("Storefront API token not configured");
    }
    
    // Fetch products using Storefront API
    const productsQuery = `
      query GetProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              handle
              images(first: 5) {
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
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
        collections(first: 20) {
          edges {
            node {
              id
              title
              description
              handle
              image {
                url
                altText
              }
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    description
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
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
                          availableForSale
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({
        query: productsQuery,
      }),
    });

    if (!response.ok) {
      throw new Error(`Storefront API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("Storefront API errors:", data.errors);
      throw new Error("GraphQL errors in Storefront API");
    }

    // Transform products to match expected format
    const products = data.data.products.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title,
        description: node.description || "No description available",
        handle: node.handle,
        image: node.images.edges[0]?.node.url || null,
        images: node.images.edges.map((img: any) => img.node.url),
        price: node.variants.edges[0]?.node.price?.amount || "0.00",
        currency: node.variants.edges[0]?.node.price?.currencyCode || "USD",
        available: node.variants.edges[0]?.node.availableForSale || false,
        variants: node.variants.edges.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price?.amount || "0.00",
          available: v.node.availableForSale
        })),
      };
    });

    // Transform collections to match expected format
    const collections = data.data.collections.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title,
        description: node.description || "Browse our collection",
        handle: node.handle,
        image: node.image?.url || null,
        products: node.products.edges.map((pEdge: any) => {
          const p = pEdge.node;
          return {
            id: p.id,
            title: p.title,
            description: p.description || "No description available",
            handle: p.handle,
            image: p.images.edges[0]?.node.url || null,
            images: p.images.edges.map((img: any) => img.node.url),
            price: p.variants.edges[0]?.node.price?.amount || "0.00",
            currency: p.variants.edges[0]?.node.price?.currencyCode || "USD",
            available: p.variants.edges[0]?.node.availableForSale || false,
            variants: p.variants.edges.map((v: any) => ({
              id: v.node.id,
              title: v.node.title,
              price: v.node.price?.amount || "0.00",
              available: v.node.availableForSale
            })),
          };
        })
      };
    });

    console.log(`✅ Successfully fetched ${products.length} products and ${collections.length} collections via Storefront API`);

    const apiResponse = json({ 
      products,
      collections,
      success: true,
      source: "shopify-storefront-api",
      message: `Successfully loaded ${products.length} real products and ${collections.length} collections from your store`
    });
    
    return addCorsHeaders(apiResponse);

  } catch (error) {
    console.error("❌ Error fetching products via Storefront API:", error);
    
    const errorResponse = json({ 
      error: error instanceof Error ? error.message : "Failed to fetch products",
      products: [],
      collections: [],
      success: false,
      source: "error",
      message: "Unable to load products from Storefront API"
    }, { status: 500 });
    
    return addCorsHeaders(errorResponse);
  }
};

// Handle OPTIONS request for CORS
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}; 