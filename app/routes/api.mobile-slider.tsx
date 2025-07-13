import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// This API endpoint is public and doesn't require authentication
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("📱 Mobile Slider API - Loading slider data from database...");
    
    // Get slider config from database
    const sliderConfig = await db.sliderConfig.findFirst({
      where: { id: 1 }
    });

    let sliderData;
    
    if (sliderConfig) {
      console.log("✅ Found slider config in database:", {
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
      console.log("⚠️ No slider config found in database, using default data");
      
      // Default slider data
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

    const response = json({
      success: true,
      data: sliderData,
      message: `Slider data loaded successfully - ${Array.isArray(sliderData.slides) ? sliderData.slides.length : 0} slides`
    });

    return addCorsHeaders(response);

  } catch (error) {
    console.error("❌ Mobile Slider API Error:", error);
    
    const errorResponse = json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load slider data",
      data: null,
      message: "Unable to load slider data"
    }, { status: 500 });

    return addCorsHeaders(errorResponse);
  }
};

// Handle OPTIONS request for CORS
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}; 