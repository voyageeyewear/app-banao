import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Shopify Configuration
const SHOPIFY_STORE = 'tryongoeye.myshopify.com';
const ADMIN_ACCESS_TOKEN = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '')
  .replace(/\s/g, '') // Remove all whitespace
  .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
  .trim();
const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Handle OPTIONS request for CORS preflight
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
};

// Fetch real products from Shopify using the SAME method as real-shopify API
async function fetchRealShopifyProducts() {
  try {
    console.log('🛍️ Fetching real products from Shopify...');
    
    const query = `{
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 5) {
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
                  availableForSale
                }
              }
            }
          }
        }
      }
    }`;

    const response = await fetch(`https://${SHOPIFY_STORE}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Real Shopify data received');
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return [];
    }

    const products = data.data.products.edges.map((edge: any) => {
      const product = edge.node;
      const variant = product.variants.edges[0]?.node;
      const images = product.images.edges.map((img: any) => img.node.url);
      
      return {
        id: product.id.replace('gid://shopify/Product/', ''),
        handle: product.handle,
        title: product.title,
        description: product.description || "High-quality eyewear with premium materials and design.",
        images: images,
        image: images[0] || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&q=80",
        price: variant ? `₹${parseFloat(variant.price.amount).toFixed(0)}` : "₹799",
        originalPrice: variant ? `₹${(parseFloat(variant.price.amount) * 1.3).toFixed(0)}` : "₹1039",
        discount: 23,
        rating: 4.5,
        ratingCount: 195,
        isNew: true,
        inStock: variant?.availableForSale || true,
        variants: product.variants.edges.map((v: any) => ({
          id: v.node.id.replace('gid://shopify/ProductVariant/', ''),
          title: v.node.title || "Default",
          price: `₹${parseFloat(v.node.price.amount).toFixed(0)}`,
          available: v.node.availableForSale
        })),
        features: [
          "UV Protection",
          "Premium Materials", 
          "Lightweight Design",
          "Scratch Resistant",
          "1 Year Warranty"
        ],
        deliveryTime: "2-3 business days",
        freeShipping: true,
        returnPolicy: "30-day free returns",
        warranty: "1-year manufacturer warranty"
      };
    });

    console.log(`✅ Processed ${products.length} real products`);
    return products;

  } catch (error) {
    console.error('❌ Error fetching real Shopify products:', error);
    return [];
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get("handle");
    const id = url.searchParams.get("id");
    
    console.log('🔍 Product detail request:', { handle, id });
    
    // Get real products from Shopify
    const realProducts = await fetchRealShopifyProducts();
    
    if (!handle && !id) {
      // Return any available product
      if (realProducts.length > 0) {
        console.log('✅ Returning first real product:', realProducts[0].title);
        const successResponse = json({
          success: true,
          product: realProducts[0]
        });
        return addCorsHeaders(successResponse);
      } else {
        const errorResponse = json({ 
          success: false, 
          error: "No products available",
          availableProducts: []
        }, { status: 404 });
        return addCorsHeaders(errorResponse);
      }
    }

    // Find specific product by handle
    const product = realProducts.find((p: any) => p.handle === handle);
    
    if (!product) {
      // Return available products for error message
      const availableProducts = realProducts.map((p: any) => ({
        id: p.id,
        handle: p.handle,
        title: p.title
      }));

      const errorResponse = json({
        success: false,
        error: "Product not found",
        availableProducts
      }, { status: 404 });
      return addCorsHeaders(errorResponse);
    }

    console.log('✅ Real product found:', product.title);
    console.log('🖼️ Real product images:', product.images);

    const successResponse = json({
      success: true,
      product
    });
    return addCorsHeaders(successResponse);

  } catch (error) {
    console.error('❌ Product detail error:', error);
    const errorResponse = json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}; 