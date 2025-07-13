import { json } from "@remix-run/node";
import db from "../db.server";

// This is a PUBLIC endpoint - no authentication required
// Specifically designed for mobile app access

export const loader = async () => {
  try {
    console.log("📱 Public Slider API - Loading data for mobile app...");
    
    // Get slider config from database
    const sliderConfig = await db.sliderConfig.findFirst({
      where: { id: 1 }
    });

    let sliderData;
    
    if (sliderConfig) {
      console.log("✅ Found slider config:", {
        enabled: sliderConfig.enabled,
        slidesCount: Array.isArray(sliderConfig.slides) ? (sliderConfig.slides as any[]).length : 0,
        updatedAt: sliderConfig.updatedAt
      });
      
      sliderData = {
        enabled: sliderConfig.enabled,
        slides: sliderConfig.slides as any[],
        settings: sliderConfig.settings as any,
        lastUpdate: sliderConfig.updatedAt.getTime()
      };
    } else {
      console.log("⚠️ No slider config found, using defaults");
      
      // Default slider data for mobile app
      sliderData = {
        enabled: true,
        slides: [
          {
            id: '1',
            title: 'Welcome to GoEye Store',
            description: 'Premium Eyewear Collection - Discover the perfect frames for your style',
            image: 'https://cdn.shopify.com/s/files/1/0756/1350/3718/files/goeye-hero-slide-1.jpg?v=1735729200',
            buttonText: 'Shop Now',
            buttonUrl: '/products'
          },
          {
            id: '2',
            title: 'Featured Products',
            description: 'Explore our latest collection of designer eyewear and sunglasses',
            image: 'https://cdn.shopify.com/s/files/1/0756/1350/3718/files/goeye-hero-slide-2.jpg?v=1735729200',
            buttonText: 'View Collection',
            buttonUrl: '/collections/featured'
          }
        ],
        settings: {
          autoPlay: true,
          autoPlaySpeed: 5000,
          showArrows: true,
          showDots: true
        },
        lastUpdate: Date.now()
      };
    }

    // Create response with CORS headers
    const response = json({
      success: true,
      data: sliderData,
      message: `Public slider data loaded - ${Array.isArray(sliderData.slides) ? sliderData.slides.length : 0} slides`,
      timestamp: new Date().toISOString()
    });

    // Add comprehensive CORS headers for mobile app access
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    
    return response;

  } catch (error) {
    console.error("❌ Public Slider API Error:", error);
    
    // Return error response with CORS headers
    const errorResponse = json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load slider data",
      data: null,
      message: "Unable to load slider data",
      timestamp: new Date().toISOString()
    }, { status: 500 });

    // Add CORS headers even for errors
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
    
    return errorResponse;
  }
};

// Handle OPTIONS request for CORS preflight
export const options = async () => {
  const response = new Response(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}; 