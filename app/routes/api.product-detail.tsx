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

// Fetch product from Shopify Admin API
async function fetchProductFromAdmin(handle: string) {
  try {
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2023-07/products.json?handle=${handle}`, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Admin API error: ${response.status}`);
    }

    const data = await response.json();
    return data.products?.[0] || null;
  } catch (error) {
    console.error('❌ Admin API error:', error);
    return null;
  }
}

// Fetch product from Storefront API
async function fetchProductFromStorefront(handle: string) {
  try {
    const query = `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          images(first: 10) {
            nodes {
              url
              altText
            }
          }
          variants(first: 10) {
            nodes {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_STORE}/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: { handle }
      })
    });

    if (!response.ok) {
      throw new Error(`Storefront API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.product || null;
  } catch (error) {
    console.error('❌ Storefront API error:', error);
    return null;
  }
}

// Convert Shopify product to mobile app format
function formatProductForMobile(shopifyProduct: any, adminProduct: any = null) {
  if (!shopifyProduct) return null;

  // Extract variant ID (remove GraphQL prefix)
  const firstVariant = shopifyProduct.variants?.nodes?.[0];
  let variantId = firstVariant?.id;
  if (variantId && variantId.startsWith('gid://shopify/ProductVariant/')) {
    variantId = variantId.replace('gid://shopify/ProductVariant/', '');
  }

  // Format price
  const price = firstVariant?.price?.amount || shopifyProduct.priceRange?.minVariantPrice?.amount || '0';
  const formattedPrice = `₹${parseFloat(price).toFixed(0)}`;

  return {
    id: shopifyProduct.id.replace('gid://shopify/Product/', ''),
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    subtitle: "Premium Quality Eyewear",
    price: formattedPrice,
    originalPrice: formattedPrice,
    discount: 0,
    image: shopifyProduct.images?.nodes?.[0]?.url || "",
    images: shopifyProduct.images?.nodes?.map((img: any) => img.url) || [],
    rating: 4.5,
    ratingCount: 123,
    description: shopifyProduct.description || "High-quality eyewear with premium materials and design.",
    features: [
      "UV Protection",
      "Premium Materials", 
      "Lightweight Design",
      "Scratch Resistant",
      "1 Year Warranty"
    ],
    isNew: true,
    inStock: firstVariant?.availableForSale || true,
    variants: shopifyProduct.variants?.nodes?.map((variant: any) => ({
      id: variant.id.replace('gid://shopify/ProductVariant/', ''),
      title: variant.title || "Default",
      price: `₹${parseFloat(variant.price?.amount || '0').toFixed(0)}`,
      available: variant.availableForSale
    })) || [],
    deliveryTime: "2-3 business days",
    freeShipping: true,
    returnPolicy: "30-day free returns",
    warranty: "1-year manufacturer warranty",
    // Include admin product data for additional details
    adminData: adminProduct
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get("handle");
    const id = url.searchParams.get("id");
    
    console.log('🔍 Product detail request:', { handle, id });
    
    if (!handle && !id) {
      const errorResponse = json({ 
        success: false, 
        error: "Product handle or ID is required" 
      }, { status: 400 });
      return addCorsHeaders(errorResponse);
    }

    // Fetch from both APIs for complete data
    const [storefrontProduct, adminProduct] = await Promise.all([
      handle ? fetchProductFromStorefront(handle) : null,
      handle ? fetchProductFromAdmin(handle) : null
    ]);

    if (!storefrontProduct) {
      // Get available products for error message
      const availableResponse = await fetch(`https://${SHOPIFY_STORE}/api/2023-07/graphql.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            query {
              products(first: 10) {
                nodes {
                  id
                  handle
                  title
                }
              }
            }
          `
        })
      });

      const availableData = await availableResponse.json();
      const availableProducts = availableData.data?.products?.nodes?.map((p: any) => ({
        id: p.id.replace('gid://shopify/Product/', ''),
        handle: p.handle,
        title: p.title
      })) || [];

      const errorResponse = json({
        success: false,
        error: "Product not found",
        availableProducts
      }, { status: 404 });
      return addCorsHeaders(errorResponse);
    }

         // Format product for mobile app
     const product = formatProductForMobile(storefrontProduct, adminProduct);

     if (!product) {
       const errorResponse = json({
         success: false,
         error: "Failed to format product data"
       }, { status: 500 });
       return addCorsHeaders(errorResponse);
     }

     console.log('✅ Product found:', product.title);

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