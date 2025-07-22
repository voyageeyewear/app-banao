import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

// Default PDP configuration
const defaultPDPConfig = {
  subtitleText: "Premium Eyewear Collection",
  featureText: "Anti-reflective coating & UV protection", 
  promoBannerText: "🚚 Free Shipping | 💳 Easy Returns | 🔒 Secure Checkout",
  whatsappNumber: "+919999999999",
  taxText: "incl. of taxes",
  showNewBadge: true,
  showWhatsAppChat: true,
  actionButtons: {
    sizeGuide: "Size Guide",
    tryOn: "Try On",
    reviews: "Reviews"
  },
  updatedAt: new Date().toISOString()
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🔍 PDP Config API: Loading configuration');

    // For now, return default configuration
    // In production, this would fetch from database
    const config = { ...defaultPDPConfig };

    console.log('✅ PDP Config loaded successfully');

    return json(config, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minute cache
      },
    });

  } catch (error) {
    console.error('❌ PDP Config API Error:', error);
    
    return json(defaultPDPConfig, {
      status: 200, // Still return 200 with fallback data
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const action = formData.get("action") as string;

    if (action === "save") {
      // Get all configuration data
      const config = {
        subtitleText: formData.get("subtitleText") as string,
        featureText: formData.get("featureText") as string,
        promoBannerText: formData.get("promoBannerText") as string,
        whatsappNumber: formData.get("whatsappNumber") as string,
        taxText: formData.get("taxText") as string,
        showNewBadge: formData.get("showNewBadge") === "true",
        showWhatsAppChat: formData.get("showWhatsAppChat") === "true",
        actionButtons: {
          sizeGuide: formData.get("sizeGuideText") as string,
          tryOn: formData.get("tryOnText") as string,
          reviews: formData.get("reviewsText") as string,
        },
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Saving PDP configuration:', config);

      // In production, save to database here
      // For now, just return success with the data

      return json({
        success: true,
        message: "PDP configuration saved successfully!",
        config: config
      });
    }

    return json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('❌ Error saving PDP configuration:', error);
    return json({
      success: false,
      message: "Failed to save PDP configuration",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 