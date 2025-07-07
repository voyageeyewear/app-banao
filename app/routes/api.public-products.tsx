import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Fetching real Shopify products for mobile app...");
    
    // Try to get authenticated session (same as builder)
    const { admin } = await authenticate.admin(request);
    
    // Fetch products using admin API (same as builder)
    const productsResponse = await admin.graphql(`
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              handle
              totalInventory
              images(first: 5) { edges { node { url } } }
              variants(first: 5) { 
                edges { 
                  node { 
                    id
                    title
                    price 
                  } 
                } 
              }
            }
          }
        }
      }
    `);
    
    const productsData = await productsResponse.json() as any;
    
    // Transform products to match builder format
    const products = productsData.data.products.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title,
        description: node.description || "No description available",
        handle: node.handle,
        inventory: node.totalInventory,
        image: node.images.edges[0]?.node.url || null,
        images: node.images.edges.map((img: any) => img.node.url),
        price: node.variants.edges[0]?.node.price || "0.00",
        variants: node.variants.edges.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price
        })),
      };
    });
    
    // Fetch collections (same as builder)
    const collectionsResponse = await admin.graphql(`
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              description
              handle
              image { url }
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    description
                    handle
                    totalInventory
                    images(first: 5) { edges { node { url } } }
                    variants(first: 5) { 
                      edges { 
                        node { 
                          id
                          title
                          price 
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
    `);
    
    const collectionsData = await collectionsResponse.json() as any;
    
    const collections = collectionsData.data.collections.edges.map((edge: any) => {
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
            inventory: p.totalInventory,
            image: p.images.edges[0]?.node.url || null,
            images: p.images.edges.map((img: any) => img.node.url),
            price: p.variants.edges[0]?.node.price || "0.00",
            variants: p.variants.edges.map((v: any) => ({
              id: v.node.id,
              title: v.node.title,
              price: v.node.price
            })),
          };
        })
      };
    });
    
    console.log(`✅ Fetched ${products.length} real products and ${collections.length} collections from Shopify`);
    
    const response = json({ 
      products,
      collections,
      success: true,
      source: "shopify-authenticated",
      message: `Showing ${products.length} real products from your Shopify store - same as in builder`
    });
    
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Error fetching real Shopify products:", error);
    
    const response = json({ 
      error: error instanceof Error ? error.message : "Authentication required",
      products: [],
      collections: [],
      success: false,
      source: "error",
      message: "Unable to load real Shopify products. Please ensure you're logged into your Shopify admin."
    });
    
    return addCorsHeaders(response);
  }
}; 