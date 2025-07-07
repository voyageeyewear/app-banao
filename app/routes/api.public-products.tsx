import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

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
    console.log("Fetching products for mobile app...");

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
      message: "Using enhanced mock data for Voyage Eyewear store. Connect your Shopify Storefront API for real products."
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