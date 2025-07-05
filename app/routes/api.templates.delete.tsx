import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export const action = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return json({ error: "Template ID is required" }, { status: 400 });
    }
    
    // Check if template exists
    const template = await db.template.findUnique({ where: { id } });
    if (!template) {
      return json({ error: "Template not found" }, { status: 404 });
    }
    
    // Delete the template
    await db.template.delete({ where: { id } });
    
    return json({ 
      message: `Template "${template.name}" deleted successfully` 
    });
  } catch (err) {
    console.error("Error deleting template:", err);
    return json({ error: "Failed to delete template" }, { status: 500 });
  }
}; 