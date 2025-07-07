import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // This requires authentication - can only be called from admin
    const { admin } = await authenticate.admin(request);
    
    console.log("Caching Shopify products for mobile app...");

    // Fetch products using admin API
    const productsResponse = await admin.graphql(`
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
                    price
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `);

    const productsData = await productsResponse.json() as any;

    if (productsData.errors) {
      console.error("Admin API errors:", productsData.errors);
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
        price: node.variants.edges[0]?.node.price || "0.00",
        variants: node.variants.edges.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price,
          available: v.node.availableForSale
        })),
      };
    });

    // Store in a simple cache table - create template with special name for products
    const productCacheId = 'mobile-app-products';
    
    try {
      // Store the products cache in the database
      await db.template.upsert({
        where: { id: productCacheId },
        update: {
          name: 'Mobile App Products Cache',
          data: JSON.stringify({ products, timestamp: new Date().toISOString() }),
          designType: 'CACHE'
        },
        create: {
          id: productCacheId,
          name: 'Mobile App Products Cache',
          data: JSON.stringify({ products, timestamp: new Date().toISOString() }),
          designType: 'CACHE'
        }
      });

      console.log(`✅ Cached ${products.length} products for mobile app`);
      
      return json({ 
        success: true, 
        message: `Successfully cached ${products.length} products for mobile app`,
        products: products.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (dbError) {
      console.error("Database error while caching products:", dbError);
      throw new Error("Failed to cache products in database");
    }

  } catch (error) {
    console.error("Error caching products:", error);
    
    return json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false
    }, { status: 500 });
  }
}; 