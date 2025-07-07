import { json, type LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    // Check if essential tables exist
    const sessionCount = await db.session.count();
    const templateCount = await db.template.count();
    
    return json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      tables: {
        sessions: sessionCount,
        templates: templateCount
      },
      version: process.env.npm_package_version || "unknown"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      version: process.env.npm_package_version || "unknown"
    }, { status: 503 });
  }
}; 