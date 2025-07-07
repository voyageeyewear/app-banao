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

export const action = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "DELETE") {
    const response = json({ error: "Method not allowed" }, { status: 405 });
    return addCorsHeaders(response);
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      const response = json({ error: "Template ID is required" }, { status: 400 });
      return addCorsHeaders(response);
    }
    
    // Check if template exists
    const template = await db.template.findUnique({ where: { id } });
    if (!template) {
      const response = json({ error: "Template not found" }, { status: 404 });
      return addCorsHeaders(response);
    }
    
    // Delete the template
    await db.template.delete({ where: { id } });
    
    const response = json({ 
      message: `Template "${template.name}" deleted successfully` 
    });
    return addCorsHeaders(response);
  } catch (err) {
    console.error("Error deleting template:", err);
    const response = json({ error: "Failed to delete template" }, { status: 500 });
    return addCorsHeaders(response);
  }
}; 