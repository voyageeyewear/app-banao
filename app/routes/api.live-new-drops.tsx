import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader() {
  try {
    // Get config
    const config = await db.newDropsConfig.findFirst();
    
    // Get enabled slides
    const slides = await db.newDropsSlide.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' }
    });

    return json({
      enabled: config?.enabled || false,
      title: config?.title || "New Drops",
      subtitle: config?.subtitle || "Fresh collections every 15 days",
      slide_interval: config?.slide_interval || 3,
      slides: slides || []
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error('Error loading new drops data:', error);
    return json({
      enabled: false,
      title: "New Drops",
      subtitle: "Fresh collections every 15 days",
      slide_interval: 3,
      slides: []
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
} 