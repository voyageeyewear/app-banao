import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control, Accept");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}

// Handle GET requests
export async function loader({ request }: LoaderFunctionArgs) {

  try {
    // Get Shark Tank configuration
    let config = await prisma.sharkTankConfig.findFirst();
    if (!config) {
      config = await prisma.sharkTankConfig.create({
        data: {
          title: "As Seen on Shark Tank India",
          subtitle: "Style it like the Sharks!",
          enabled: true,
        }
      });
    }

    // Get enabled Shark Tank products ordered by display order
    const products = await (prisma as any).sharkTankProduct.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });

    // Format response for mobile app
    const responseData = {
      success: true,
      enabled: config.enabled,
      section: {
        title: config.title,
        subtitle: config.subtitle,
        products: products.map((product: any) => ({
          id: product.id,
          brand: product.brand,
          title: product.title,
          image: product.image,
          video: product.video || "", // Video URL for MP4 playback
          tag: product.tag,
          showTag: product.showTag,
          order: product.order
        }))
      }
    };

    const response = json(responseData);
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Shark Tank API Error:", error);
    
    // Return error with fallback data
    const errorResponse = json({
      success: false,
      enabled: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      section: {
        title: "As Seen on Shark Tank India",
        subtitle: "Style it like the Sharks!",
        products: []
      }
    });

    return addCorsHeaders(errorResponse);
  }
}

 