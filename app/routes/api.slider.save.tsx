import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Authenticate the request
    await authenticate.admin(request);
    
    const { enabled, slides, settings } = await request.json();
    
    console.log("💾 Saving slider configuration:", { 
      enabled, 
      slidesCount: slides?.length || 0, 
      settings 
    });

    // Validate input
    if (typeof enabled !== 'boolean') {
      return json({ error: "enabled must be a boolean" }, { status: 400 });
    }
    
    if (!Array.isArray(slides)) {
      return json({ error: "slides must be an array" }, { status: 400 });
    }

    // Update or create slider config in database
    const updatedConfig = await db.sliderConfig.upsert({
      where: { id: 1 },
      update: {
        enabled: Boolean(enabled),
        slides: slides,
        settings: settings || {}
      },
      create: {
        id: 1,
        enabled: Boolean(enabled),
        slides: slides,
        settings: settings || {}
      }
    });

    console.log("✅ Slider configuration saved successfully:", {
      id: updatedConfig.id,
      enabled: updatedConfig.enabled,
      slidesCount: Array.isArray(updatedConfig.slides) ? (updatedConfig.slides as any[]).length : 0,
      updatedAt: updatedConfig.updatedAt
    });

    return json({ 
      success: true, 
      message: "✅ Slider saved! To update mobile app: Run './build-apk.sh' → Install new APK",
      data: {
        enabled: updatedConfig.enabled,
        slides: updatedConfig.slides,
        settings: updatedConfig.settings,
        lastUpdate: updatedConfig.updatedAt.getTime()
      }
    });

  } catch (error) {
    console.error("❌ Error saving slider configuration:", error);
    return json({ 
      error: "Failed to save slider configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}; 