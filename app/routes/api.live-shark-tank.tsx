import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control, Accept");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

// Handle OPTIONS requests for CORS preflight  
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
};

// This is a PUBLIC endpoint - no authentication required
// Specifically designed for mobile app access
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("🦈 Live Shark Tank API - Loading data for mobile app...");
    
    // Get shark tank config from database
    const sharkTankConfig = await db.sharkTankConfig.findFirst({
      where: { id: 1 }
    });

    let responseData;
    
    if (sharkTankConfig && sharkTankConfig.enabled) {
      console.log("✅ Found active shark tank config:", {
        title: sharkTankConfig.title,
        subtitle: sharkTankConfig.subtitle,
        enabled: sharkTankConfig.enabled,
        productsCount: Array.isArray(sharkTankConfig.products) ? (sharkTankConfig.products as any[]).length : 0,
        updatedAt: sharkTankConfig.updatedAt
      });
      
      responseData = {
        success: true,
        enabled: true,
        section: {
          title: sharkTankConfig.title || 'As Seen on Shark Tank India',
          subtitle: sharkTankConfig.subtitle || 'Style it like the Sharks!',
          enabled: sharkTankConfig.enabled
        },
        products: sharkTankConfig.products as any[] || [],
        lastUpdate: sharkTankConfig.updatedAt.getTime(),
        source: 'database'
      };
    } else {
      console.log("⚠️ No active shark tank config found, using defaults");
      
      // Default shark tank data for mobile app with video support
      responseData = {
        success: true,
        enabled: true,
        section: {
          title: 'As Seen on Shark Tank India',
          subtitle: 'Style it like the Sharks!',
          enabled: true
        },
        products: [
          {
            id: 'st1',
            brand: 'PHONIC',
            title: 'Smart Audio Glasses',
            image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=330&h=400&fit=crop&crop=center&q=80',
            video: '',
            tag: 'NEW LAUNCH',
            showTag: true
          },
          {
            id: 'st2',
            brand: 'BLUECUT',
            title: 'Blue Light Blockers',
            image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=330&h=400&fit=crop&crop=center&q=80',
            video: '',
            tag: 'FEATURED',
            showTag: true
          },
          {
            id: 'st3',
            brand: 'LUXE',
            title: 'Designer Collection',
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=330&h=400&fit=crop&crop=center&q=80',
            video: '',
            tag: 'PREMIUM',
            showTag: true
          },
          {
            id: 'st4',
            brand: 'ACTIVE',
            title: 'Performance Sunglasses',
            image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=330&h=400&fit=crop&crop=center&q=80',
            video: '',
            tag: 'SPORT',
            showTag: true
          },
          {
            id: 'st5',
            brand: 'JUNIOR',
            title: 'Kids Safety Glasses',
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=330&h=400&fit=crop&crop=center&q=80',
            video: '',
            tag: 'KIDS',
            showTag: true
          }
        ],
        lastUpdate: Date.now(),
        source: 'default'
      };
    }

    const response = json(responseData);
    return addCorsHeaders(response);

  } catch (error) {
    console.error("❌ Live Shark Tank API Error:", error);
    
    const errorResponse = json({
      success: false,
      enabled: false,
      error: error instanceof Error ? error.message : "Failed to load shark tank data",
      section: {
        title: 'As Seen on Shark Tank India',
        subtitle: 'Style it like the Sharks!',
        enabled: false
      },
      products: [],
      lastUpdate: Date.now(),
      source: 'error'
    }, { status: 500 });

    return addCorsHeaders(errorResponse);
  }
};

 