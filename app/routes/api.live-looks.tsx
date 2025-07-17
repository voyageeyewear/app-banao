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
    // Get Looks configuration
    let config = await prisma.looksConfig.findFirst();
    if (!config) {
      config = await prisma.looksConfig.create({
        data: {
          title_cursive: "Style",
          title_bold: "FINDER",
          subtitle: "Discover every look, for every you",
          men_tab_text: "Men",
          women_tab_text: "Women",
          men_explore_title: "Men",
          men_explore_subtitle: "Explore All",
          men_explore_link: "",
          women_explore_title: "Women",
          women_explore_subtitle: "Explore All", 
          women_explore_link: "",
          enabled: true,
        }
      });
    }

    // Get enabled Looks cards ordered by type and order
    const cards = await prisma.looksCard.findMany({
      where: { enabled: true },
      orderBy: [{ type: 'asc' }, { order: 'asc' }]
    });

    // Format response for mobile app with flat cards array
    const responseData = {
      success: true,
      enabled: config.enabled,
      config: {
        title_cursive: config.title_cursive,
        title_bold: config.title_bold,
        subtitle: config.subtitle,
        men_tab_text: config.men_tab_text,
        women_tab_text: config.women_tab_text,
        men_explore_title: config.men_explore_title,
        men_explore_subtitle: config.men_explore_subtitle,
        men_explore_link: config.men_explore_link,
        women_explore_title: config.women_explore_title,
        women_explore_subtitle: config.women_explore_subtitle,
        women_explore_link: config.women_explore_link
      },
      cards: cards.map((card: any) => ({
        id: card.id,
        type: card.type,
        title: card.title,
        image: card.image,
        link: card.link,
        productId: card.productId,
        collectionId: card.collectionId,
        order: card.order,
        enabled: card.enabled
      }))
    };

    const response = json(responseData);
    return addCorsHeaders(response);

  } catch (error) {
    console.error("Looks API Error:", error);
    
    // Return error with fallback data
    const errorResponse = json({
      success: false,
      enabled: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      config: {
        title_cursive: "Style",
        title_bold: "FINDER", 
        subtitle: "Discover every look, for every you",
        men_tab_text: "Men",
        women_tab_text: "Women",
        men_explore: {
          title: "Men",
          subtitle: "Explore All",
          link: ""
        },
        women_explore: {
          title: "Women", 
          subtitle: "Explore All",
          link: ""
        }
      },
      cards: {
        men: [],
        women: []
      }
    });

    return addCorsHeaders(errorResponse);
  }
} 