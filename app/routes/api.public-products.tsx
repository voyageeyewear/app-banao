import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Storefront API credentials - these are safe to use publicly
const STOREFRONT_API_TOKEN = "f585ae7a492af9600ab4edbc99c56b00-1751707255";
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
    console.log("Fetching public Shopify products...");

    // Fetch products using Storefront API (no authentication required)
    const productsQuery = `
      query {
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
      }
    `;

    const productsResponse = await fetch(`https://${SHOP_DOMAIN}/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({
        query: productsQuery,
      }),
    });

    if (!productsResponse.ok) {
      throw new Error(`Products API failed: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();
    
    if (productsData.errors) {
      console.error("Storefront API errors:", productsData.errors);
      throw new Error("GraphQL errors in products query");
    }

    // Transform products to match expected format
    const products = productsData.data.products.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title,
        description: node.description || "No description available",
        handle: node.handle,
        image: node.images.edges[0]?.node.url || null,
        images: node.images.edges.map((img: any) => img.node.url),
        price: node.variants.edges[0]?.node.price.amount || "0.00",
        variants: node.variants.edges.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price.amount,
          available: v.node.availableForSale
        })),
      };
    });

    // Fetch collections using Storefront API
    const collectionsQuery = `
      query {
        collections(first: 10) {
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

    const collectionsResponse = await fetch(`https://${SHOP_DOMAIN}/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({
        query: collectionsQuery,
      }),
    });

    let collections = [];
    if (collectionsResponse.ok) {
      const collectionsData = await collectionsResponse.json();
      
      if (!collectionsData.errors) {
        collections = collectionsData.data.collections.edges.map((edge: any) => {
          const node = edge.node;
          return {
            id: node.id,
            title: node.title,
            description: node.description,
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
                price: p.variants.edges[0]?.node.price.amount || "0.00",
                variants: p.variants.edges.map((v: any) => ({
                  id: v.node.id,
                  title: v.node.title,
                  price: v.node.price.amount,
                  available: v.node.availableForSale
                })),
              };
            })
          };
        });
      }
    }

    console.log(`Fetched ${products.length} products and ${collections.length} collections`);

    const response = json({ 
      products, 
      collections,
      success: true,
      source: "shopify-storefront" 
    });
    
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Error fetching public Shopify data:", error);
    
    const response = json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      products: [],
      collections: [],
      success: false,
      source: "error"
    }, { status: 500 });
    
    return addCorsHeaders(response);
  }
}; 