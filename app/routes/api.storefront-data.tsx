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
    
    // Shopify Storefront API configuration
    const SHOP_DOMAIN = "tryongoeye.myshopify.com";
    const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
    
    // Check if token is available
    if (!STOREFRONT_ACCESS_TOKEN) {
      console.error("❌ SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured, using fallback data");
      
      // Return realistic fallback data for GoEye Store
      const fallbackCollections = [
        {
          id: "gid://shopify/Collection/1",
          title: "Men's Eyeglasses",
          handle: "mens-eyeglasses",
          description: "Premium eyeglasses for men",
          image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop",
          productCount: 25
        },
        {
          id: "gid://shopify/Collection/2", 
          title: "Women's Eyeglasses",
          handle: "womens-eyeglasses",
          description: "Stylish eyeglasses for women",
          image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
          productCount: 30
        },
        {
          id: "gid://shopify/Collection/3",
          title: "Designer Sunglasses",
          handle: "designer-sunglasses", 
          description: "Premium designer sunglasses",
          image: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=400&fit=crop",
          productCount: 20
        },
        {
          id: "gid://shopify/Collection/4",
          title: "Blue Light Blockers",
          handle: "blue-light-blockers",
          description: "Protect your eyes from digital screens",
          image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&h=400&fit=crop",
          productCount: 15
        }
      ];

      const fallbackProducts = [
        {
          id: "gid://shopify/Product/1",
          title: "Classic Black Frame Glasses",
          handle: "classic-black-frame",
          description: "Timeless black frame design perfect for any occasion",
          image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop",
          price: "INR 1999.00"
        },
        {
          id: "gid://shopify/Product/2",
          title: "Blue Light Blocking Glasses",
          handle: "blue-light-blocking",
          description: "Reduce eye strain from computer screens",
          image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&h=400&fit=crop", 
          price: "INR 2499.00"
        },
        {
          id: "gid://shopify/Product/3",
          title: "Designer Cat Eye Frames",
          handle: "designer-cat-eye",
          description: "Elegant cat eye design for women",
          image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
          price: "INR 2999.00"
        },
        {
          id: "gid://shopify/Product/4",
          title: "Premium Aviator Sunglasses",
          handle: "premium-aviator",
          description: "Classic aviator style sunglasses",
          image: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=400&fit=crop",
          price: "INR 3499.00"
        },
        {
          id: "gid://shopify/Product/5",
          title: "Vintage Round Glasses",
          handle: "vintage-round",
          description: "Retro round frame design",
          image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
          price: "INR 1799.00"
        },
        {
          id: "gid://shopify/Product/6",
          title: "Sports Safety Glasses",
          handle: "sports-safety",
          description: "Durable glasses for active lifestyle",
          image: "https://images.unsplash.com/photo-1576628187557-6de0c3ae55b0?w=400&h=400&fit=crop",
          price: "INR 2299.00"
        }
      ];

      if (type === "collections") {
        return addCorsHeaders(json({ collections: fallbackCollections, success: true }));
      } else if (type === "products") {
        return addCorsHeaders(json({ products: fallbackProducts, success: true }));
      }
      
      return addCorsHeaders(json({
        collections: fallbackCollections,
        products: fallbackProducts,
        success: true
      }));
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    };

    if (type === "collections") {
      // Fetch collections using Storefront API
      const query = `
        query {
          collections(first: 20) {
            edges {
              node {
                id
                title
                handle
                description
                image {
                  url
                }
                products(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        const collections = data.data.collections.edges.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          description: edge.node.description,
          image: edge.node.image?.url || "https://via.placeholder.com/400x400",
          productCount: edge.node.products.edges.length
        }));

        return addCorsHeaders(json({ collections, success: true }));
      }
    }

    if (type === "products") {
      // Fetch products using Storefront API
      const query = `
        query {
          products(first: 20) {
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
        }
      `;

      const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        const products = data.data.products.edges.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          description: edge.node.description,
          image: edge.node.images.edges[0]?.node.url || "https://via.placeholder.com/400x400",
          price: edge.node.variants.edges[0]?.node.price ? 
            `${edge.node.variants.edges[0].node.price.currencyCode} ${edge.node.variants.edges[0].node.price.amount}` : 
            "Price not available"
        }));

        return addCorsHeaders(json({ products, success: true }));
      }
    }

    // Return both if no specific type requested
    return addCorsHeaders(json({ 
      collections: [], 
      products: [], 
      success: false,
      error: "Invalid request or missing data" 
    }));

  } catch (error) {
    console.error("Storefront API Error:", error);
    return addCorsHeaders(json({ 
      collections: [], 
      products: [], 
      success: false,
      error: "Failed to fetch data" 
    }, { status: 500 }));
  }
}; 