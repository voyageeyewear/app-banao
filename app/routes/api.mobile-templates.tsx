import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("📱 Mobile Templates API - Loading templates...");
    
    // Default template structure for mobile apps
    const defaultTemplate = {
      id: "default-homepage",
      name: "Default Homepage Template",
      components: [
        {
          type: "Header",
          props: {
            title: "GoEye Store",
            subtitle: "Premium Eyewear Collection"
          }
        },
        {
          type: "AnnouncementBar",
          props: {
            text: "Free shipping on orders over ₹1000!"
          }
        },
        {
          type: "CollectionCarousel",
          props: {
            title: "Shop by Collection"
          }
        },
        {
          type: "FeaturedProducts",
          props: {
            title: "Featured Products",
            limit: 6
          }
        },
        {
          type: "Footer",
          props: {
            text: "© 2024 GoEye Store. All rights reserved."
          }
        }
      ]
    };

    // For now, return the default template
    // In a real implementation, you would load saved templates from a database
    const templates = [defaultTemplate];

    const response = json({
      success: true,
      templates,
      defaultTemplate,
      message: `Successfully loaded ${templates.length} template(s)`
    });

    return addCorsHeaders(response);

  } catch (error) {
    console.error("❌ Mobile Templates API Error:", error);
    
    const errorResponse = json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load templates",
      templates: [],
      message: "Unable to load templates"
    }, { status: 500 });

    return addCorsHeaders(errorResponse);
  }
};

// Handle OPTIONS request for CORS
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}; 