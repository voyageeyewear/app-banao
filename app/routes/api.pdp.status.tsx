import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  try {
    // Get PDP config from database
    const pdpConfig = await db.pdpConfig.findFirst({
      where: { id: 1 }
    });
    
    console.log("Loading PDP status from database:", pdpConfig);
    
    return json({
      active: pdpConfig?.active || false,
      designData: pdpConfig?.designData || []
    });
  } catch (error) {
    console.error("Error loading PDP status:", error);
    return json({ 
      active: false, 
      designData: [],
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  
  try {
    const { active, designData } = await request.json();
    console.log("Updating PDP status:", { active, designDataLength: designData?.length });
    
    // Update or create PDP config in database
    const updatedConfig = await db.pdpConfig.upsert({
      where: { id: 1 },
      update: {
        active: Boolean(active),
        designData: designData || []
      },
      create: {
        id: 1,
        active: Boolean(active),
        designData: designData || []
      }
    });
    
    console.log("PDP status updated successfully:", updatedConfig);
    
    return json({ 
      success: true, 
      active: updatedConfig.active,
      message: `PDP design ${updatedConfig.active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error updating PDP status:", error);
    return json({ 
      error: "Failed to update PDP status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}; 