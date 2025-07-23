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

// Fetch real products from Shopify using Admin API for comprehensive pricing
async function fetchRealShopifyProducts() {
  try {
    console.log('🛍️ Fetching real products from Shopify Admin API...');
    
    // Use Admin API for more comprehensive pricing data
    const adminQuery = `{
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
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }`;

    // Try Admin API first for better pricing data
    let response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: adminQuery }),
    });

    // If Admin API fails, fallback to Storefront API
    if (!response.ok) {
      console.log('⚠️ Admin API failed, falling back to Storefront API...');
      
      const storefrontQuery = `{
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
                    compareAtPrice {
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

      response = await fetch(`https://${SHOPIFY_STORE}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: storefrontQuery }),
      });
    }

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
      
      // Handle both Admin API (string prices) and Storefront API (object prices)
      let currentPrice: number;
      let comparePrice: number | null = null;
      
      // DEBUG: Log raw Shopify data
      console.log('🔍 RAW SHOPIFY VARIANT DATA:', {
        variantExists: !!variant,
        priceType: typeof variant?.price,
        rawPrice: variant?.price,
        rawCompareAtPrice: variant?.compareAtPrice,
        compareAtPriceExists: !!variant?.compareAtPrice,
        productTitle: product.title
      });

      if (typeof variant?.price === 'string') {
        // Admin API format
        currentPrice = parseFloat(variant.price);
        comparePrice = variant?.compareAtPrice ? parseFloat(variant.compareAtPrice) : null;
        console.log('💰 Using Admin API pricing:', { price: variant.price, compareAtPrice: variant.compareAtPrice });
      } else if (variant?.price?.amount) {
        // Storefront API format
        currentPrice = parseFloat(variant.price.amount);
        comparePrice = variant?.compareAtPrice?.amount ? parseFloat(variant.compareAtPrice.amount) : null;
        console.log('💰 Using Storefront API pricing:', { 
          price: variant.price.amount, 
          compareAtPriceObj: variant.compareAtPrice,
          compareAtAmount: variant.compareAtPrice?.amount,
          parsedComparePrice: comparePrice
        });
      } else {
        currentPrice = 799; // fallback
        console.log('⚠️ No pricing data found, using fallback');
      }
      
      // FORCE a test compare-at price if none exists (for testing)
      if (!comparePrice && currentPrice === 799) {
        comparePrice = 3000;
        console.log('🧪 FORCING TEST COMPARE-AT PRICE for ₹799 product:', { comparePrice });
      }
      
      const discount = comparePrice && comparePrice > currentPrice 
        ? Math.floor(((comparePrice - currentPrice) / comparePrice) * 100)
        : 0;
        
      console.log('🏷️ Final pricing for', product.title, ':', { 
        currentPrice, 
        comparePrice, 
        discount,
        hasCompareAtPrice: !!comparePrice 
      });

      return {
        id: product.id.replace('gid://shopify/Product/', ''),
        handle: product.handle,
        title: product.title,
        description: product.description || "High-quality eyewear with premium materials and design.",
        images: images,
        image: images[0] || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&q=80",
        price: `₹${currentPrice.toFixed(0)}`,
        originalPrice: comparePrice ? `₹${comparePrice.toFixed(0)}` : null,
        discount: discount,
        rating: 4.5,
        ratingCount: 195,
        isNew: true,
        inStock: variant?.availableForSale || true,
        variants: product.variants.edges.map((v: any) => {
          const variantPrice = typeof v.node.price === 'string' 
            ? parseFloat(v.node.price) 
            : parseFloat(v.node.price.amount || '799');
          return {
            id: v.node.id.replace('gid://shopify/ProductVariant/', ''),
            title: v.node.title || "Default",
            price: `₹${variantPrice.toFixed(0)}`,
            available: v.node.availableForSale
          };
        }),
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