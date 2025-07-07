import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

// Helper function to add CORS headers
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (id) {
      const template = await db.template.findUnique({ where: { id } });
      if (!template) {
        const response = json({ error: "Template not found" }, { status: 404 });
        return addCorsHeaders(response);
      }
      const response = json(template);
      return addCorsHeaders(response);
    } else {
      // Only return templates that have components
      const templates = await db.template.findMany({ 
        where: {
          data: {
            not: null
          }
        },
        orderBy: { updatedAt: "desc" } 
      });
      const response = json(templates);
      return addCorsHeaders(response);
    }
  } catch (err) {
    console.error("Error loading template(s):", err);
    const response = json({ error: "Failed to load template(s)" }, { status: 500 });
    return addCorsHeaders(response);
  }
}; 