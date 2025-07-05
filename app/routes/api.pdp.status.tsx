import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Shared in-memory storage for testing (accessible by other routes)
export let pdpStatus = {
  active: false,
  designData: []
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  try {
    console.log("Loading PDP status:", pdpStatus);
    
    return json({
      active: pdpStatus.active,
      designData: pdpStatus.designData
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
    
    // Update the shared in-memory status
    pdpStatus = {
      active: Boolean(active),
      designData: designData || []
    };
    
    console.log("PDP status updated successfully:", pdpStatus);
    
    return json({ 
      success: true, 
      active: pdpStatus.active,
      message: `PDP design ${pdpStatus.active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error updating PDP status:", error);
    return json({ 
      error: "Failed to update PDP status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}; 