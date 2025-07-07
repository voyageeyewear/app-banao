import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Enhanced mock data for your eyewear store
const mockProducts = [
  {
    id: 'mock-1',
    title: 'Classic Aviator Sunglasses',
    description: 'Timeless aviator design with UV protection. Perfect for any occasion with premium metal frame and polarized lenses.',
    price: '149.99',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&h=400&fit=crop',
    handle: 'classic-aviator-sunglasses',
    variants: [{
      id: 'variant-1',
      title: 'Black/Gold',
      price: '149.99',
      available: true
    }]
  },
  {
    id: 'mock-2',
    title: 'Designer Cat Eye Glasses',
    description: 'Elegant cat eye frame perfect for professionals. High-quality acetate construction with premium lenses.',
    price: '199.99',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop',
    handle: 'designer-cat-eye-glasses',
    variants: [{
      id: 'variant-2',
      title: 'Tortoise',
      price: '199.99',
      available: true
    }]
  },
  {
    id: 'mock-3',
    title: 'Sports Performance Sunglasses',
    description: 'High-performance sports sunglasses with wraparound design and impact-resistant lenses.',
    price: '89.99',
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400&h=400&fit=crop',
    handle: 'sports-performance-sunglasses',
    variants: [{
      id: 'variant-3',
      title: 'Matte Black',
      price: '89.99',
      available: true
    }]
  },
  {
    id: 'mock-4',
    title: 'Vintage Round Frames',
    description: 'Classic round frame design inspired by vintage styles. Perfect for creative professionals and students.',
    price: '129.99',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    handle: 'vintage-round-frames',
    variants: [{
      id: 'variant-4',
      title: 'Gold Wire',
      price: '129.99',
      available: true
    }]
  },
  {
    id: 'mock-5',
    title: 'Blue Light Blocking Glasses',
    description: 'Protect your eyes from digital strain with these stylish blue light blocking glasses.',
    price: '79.99',
    image: 'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=400&h=400&fit=crop',
    handle: 'blue-light-blocking-glasses',
    variants: [{
      id: 'variant-5',
      title: 'Clear Frame',
      price: '79.99',
      available: true
    }]
  },
  {
    id: 'mock-6',
    title: 'Polarized Driving Sunglasses',
    description: 'Reduce glare and enhance vision while driving with these polarized sunglasses.',
    price: '119.99',
    image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=400&fit=crop',
    handle: 'polarized-driving-sunglasses',
    variants: [{
      id: 'variant-6',
      title: 'Gunmetal',
      price: '119.99',
      available: true
    }]
  }
];

const mockCollections = [
  {
    id: 'collection-1',
    title: 'Sunglasses Collection',
    description: 'Premium sunglasses for every style and occasion',
    image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=300&fit=crop',
    handle: 'sunglasses',
    products: mockProducts.filter(p => p.title.includes('Sunglasses'))
  },
  {
    id: 'collection-2',
    title: 'Prescription Glasses',
    description: 'Stylish frames for everyday wear',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=300&fit=crop',
    handle: 'prescription-glasses',
    products: mockProducts.filter(p => p.title.includes('Glasses') || p.title.includes('Frames'))
  }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const refresh = url.searchParams.get('refresh');
    
    console.log("Fetching products for mobile app...");

    // If refresh=true, try to cache real products first
    if (refresh === 'true') {
      try {
        console.log("Refresh requested, trying to cache real Shopify products...");
        const { admin } = await authenticate.admin(request);
        
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
        
        if (productsData.data && productsData.data.products) {
          const realProducts = productsData.data.products.edges.map((edge: any) => {
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
                available: true
              })),
            };
          });
          
          // Cache the real products
          await db.template.upsert({
            where: { id: 'mobile-app-products' },
            update: {
              name: 'Mobile App Products Cache',
              data: JSON.stringify({ products: realProducts, timestamp: new Date().toISOString() }),
              designType: 'CACHE'
            },
            create: {
              id: 'mobile-app-products',
              name: 'Mobile App Products Cache',
              data: JSON.stringify({ products: realProducts, timestamp: new Date().toISOString() }),
              designType: 'CACHE'
            }
          });
          
          console.log(`✅ Cached ${realProducts.length} real Shopify products`);
          
          const response = json({ 
            products: realProducts, 
            collections: mockCollections,
            success: true,
            source: "shopify-real-cached",
            message: `Successfully cached ${realProducts.length} real Shopify products!`
          });
          
          return addCorsHeaders(response);
        }
      } catch (authError) {
        console.log("Authentication failed, falling back to cached/mock data");
      }
    }

    // Try to get cached products from database first
    let products = mockProducts;
    let collections = mockCollections;
    let source = "mock-eyewear";

    try {
      // Check if we have cached products from the admin
      const productCache = await db.template.findUnique({
        where: { id: 'mobile-app-products' }
      });
      
      if (productCache && productCache.data && typeof productCache.data === 'string') {
        const cacheData = JSON.parse(productCache.data);
        if (cacheData.products && cacheData.products.length > 0) {
          products = cacheData.products;
          source = "shopify-cached";
          console.log(`✅ Using cached Shopify products: ${products.length} products`);
        } else {
          console.log("Cache exists but no products found, using mock data");
        }
      } else {
        // Check if we have any templates as an indicator that the store is active
        const templateCount = await db.template.count();
        
        if (templateCount > 0) {
          console.log(`Found ${templateCount} templates, using enhanced mock data for eyewear store`);
          source = "mock-eyewear-enhanced";
        }
      }
    } catch (dbError) {
      console.log("Database not available, using basic mock data");
    }

    console.log(`Returning ${products.length} products from source: ${source}`);

    const response = json({ 
      products, 
      collections,
      success: true,
      source,
      message: source === "shopify-cached" ? 
        `Showing ${products.length} real Shopify products` : 
        "Using enhanced mock data for Voyage Eyewear store. Visit your admin and add '?refresh=true' to cache real products."
    });
    
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Error in public products API:", error);
    
    const response = json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      products: mockProducts,
      collections: mockCollections,
      success: false,
      source: "error-fallback"
    }, { status: 200 }); // Return 200 to ensure mobile app gets the mock data
    
    return addCorsHeaders(response);
  }
}; 