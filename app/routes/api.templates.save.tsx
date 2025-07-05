import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export const action = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { name, data, designType } = await request.json();
    
    // Validate input
    if (!name || !name.trim()) {
      return json({ error: "Template name cannot be empty" }, { status: 400 });
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return json({ error: "Template must contain at least one component" }, { status: 400 });
    }
    
    const trimmedName = name.trim();
    
    // Check for existing template with same name
    const existingTemplate = await db.template.findFirst({
      where: { name: trimmedName }
    });
    
    if (existingTemplate) {
      return json({ error: `Template with name "${trimmedName}" already exists. Please use a different name.` }, { status: 409 });
    }
    
    const template = await db.template.create({
      data: { 
        name: trimmedName, 
        data,
        designType: designType || 'homepage' // Default to homepage if not specified
      },
    });
    
    return json({ 
      id: template.id, 
      message: `Template "${trimmedName}" saved successfully!` 
    });
  } catch (err) {
    console.error("Error saving template:", err);
    return json({ error: "Failed to save template" }, { status: 500 });
  }
}; 