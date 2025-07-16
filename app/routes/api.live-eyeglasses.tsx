import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

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
    
    console.log("🔍 Loading live eyeglasses data, type:", type);
    
    // Get eyeglasses configuration from database
    const config = await db.categoriesConfig.findFirst({
      where: { id: 1 }
    });

    if (!config || !config.enabled) {
      return addCorsHeaders(json({
        success: false,
        error: "Eyeglasses section is disabled or not configured"
      }, { status: 404 }));
    }

    if (type === "categories") {
      const categories = (config.categories as any[]) || [];
      console.log(`✅ Loaded ${categories.length} eyeglasses categories`);
      
      return addCorsHeaders(json({
        success: true,
        categories: categories.map(cat => ({
          id: cat.id,
          title: cat.title || cat.id,
          handle: cat.handle || cat.id,
          image: cat.image,
          description: cat.description || ""
        }))
      }));
    }
    
    if (type === "products") {
      const products = (config.products as any[]) || [];
      console.log(`✅ Loaded ${products.length} eyeglasses products`);
      
      return addCorsHeaders(json({
        success: true,
        products: products.map(product => ({
          id: product.id,
          title: product.title || product.brand || product.id,
          handle: product.handle || product.id,
          image: product.image,
          price: product.price,
          description: product.description || product.offer || "",
          category: product.category,
          brand: product.brand,
          offer: product.offer
        }))
      }));
    }

    if (!type) {
      // Return both categories and products
      const categories = (config.categories as any[]) || [];
      const products = (config.products as any[]) || [];
      const saleBanner = {
        enabled: false,
        line1: "END OF",
        line2: "SEASON Sale",
        backgroundColor: "#d32f2f"
      };
      
      console.log(`✅ Loaded ${categories.length} categories, ${products.length} products, and sale banner for eyeglasses`);
      
      return addCorsHeaders(json({
        success: true,
        title: config.title === "EyeglassesS" ? "Eyeglasses" : config.title,
        saleBanner: saleBanner,
        categories: categories.map(cat => ({
          id: cat.id,
          title: cat.title || cat.id,
          handle: cat.handle || cat.id,
          image: cat.image,
          description: cat.description || ""
        })),
        products: products.map(product => ({
          id: product.id,
          title: product.title || product.brand || product.id,
          handle: product.handle || product.id,
          image: product.image,
          price: product.price,
          description: product.description || product.offer || "",
          category: product.category,
          brand: product.brand,
          offer: product.offer
        }))
      }));
    }

    return addCorsHeaders(json({
      success: false,
      error: "Please specify type=categories, type=products, or no type for both"
    }, { status: 400 }));

  } catch (error) {
    console.error("❌ Error loading live eyeglasses data:", error);
    return addCorsHeaders(json({
      success: false,
      error: "Failed to load eyeglasses data"
    }, { status: 500 }));
  }
}; 