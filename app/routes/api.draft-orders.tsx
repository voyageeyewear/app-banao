import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";

// Shopify Admin API Configuration (using environment variables for security)
const SHOPIFY_STORE = 'tryongoeye.myshopify.com';
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const ADMIN_API_URL = `https://${SHOPIFY_STORE}/admin/api/2023-07`;

// Helper function to add CORS headers
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Handle OPTIONS request for CORS preflight
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
};

// Handle POST requests (Create Draft Order)
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const body = await request.json();
    const { action: actionType, draftOrderId, draftOrderData } = body;

    console.log(`🚀 Draft Order API - Action: ${actionType}`);

    // Check if admin token is available
    if (!ADMIN_ACCESS_TOKEN) {
      throw new Error("Admin access token not configured");
    }

    switch (actionType) {
      case 'create':
        return await createDraftOrder(draftOrderData);
      
      case 'update':
        return await updateDraftOrder(draftOrderId, draftOrderData);
      
      case 'delete':
        return await deleteDraftOrder(draftOrderId);
      
      case 'complete':
        return await completeDraftOrder(draftOrderId);
      
      default:
        const errorResponse = json({ 
          success: false, 
          error: 'Invalid action type' 
        }, { status: 400 });
        return addCorsHeaders(errorResponse);
    }
  } catch (error) {
    console.error('❌ Draft Order API Error:', error);
    const errorResponse = json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
};

// Create Draft Order
async function createDraftOrder(draftOrderData: any) {
  try {
    console.log('📝 Creating draft order...');
    
    const response = await fetch(`${ADMIN_API_URL}/draft_orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN
      },
      body: JSON.stringify(draftOrderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Shopify API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('✅ Draft order created:', result.draft_order.id);

    const successResponse = json({
      success: true,
      draftOrder: result.draft_order,
      message: 'Draft order created successfully'
    });
    return addCorsHeaders(successResponse);

  } catch (error) {
    console.error('❌ Error creating draft order:', error);
    const errorResponse = json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create draft order' 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}

// Update Draft Order
async function updateDraftOrder(draftOrderId: string, draftOrderData: any) {
  try {
    console.log('📝 Updating draft order:', draftOrderId);
    
    const response = await fetch(`${ADMIN_API_URL}/draft_orders/${draftOrderId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN
      },
      body: JSON.stringify(draftOrderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Shopify API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('✅ Draft order updated:', draftOrderId);

    const successResponse = json({
      success: true,
      draftOrder: result.draft_order,
      message: 'Draft order updated successfully'
    });
    return addCorsHeaders(successResponse);

  } catch (error) {
    console.error('❌ Error updating draft order:', error);
    const errorResponse = json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update draft order' 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}

// Delete Draft Order
async function deleteDraftOrder(draftOrderId: string) {
  try {
    console.log('🗑️ Deleting draft order:', draftOrderId);
    
    const response = await fetch(`${ADMIN_API_URL}/draft_orders/${draftOrderId}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Shopify API Error: ${JSON.stringify(errorData)}`);
    }

    console.log('✅ Draft order deleted:', draftOrderId);

    const successResponse = json({
      success: true,
      message: 'Draft order deleted successfully'
    });
    return addCorsHeaders(successResponse);

  } catch (error) {
    console.error('❌ Error deleting draft order:', error);
    const errorResponse = json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete draft order' 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}

// Complete Draft Order
async function completeDraftOrder(draftOrderId: string) {
  try {
    console.log('🎯 Completing draft order:', draftOrderId);
    
    const response = await fetch(`${ADMIN_API_URL}/draft_orders/${draftOrderId}/complete.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN
      },
      body: JSON.stringify({
        payment_pending: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Shopify API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('✅ Draft order completed:', result.draft_order.order_id);

    const successResponse = json({
      success: true,
      draftOrder: result.draft_order,
      orderId: result.draft_order.order_id,
      message: 'Order placed successfully'
    });
    return addCorsHeaders(successResponse);

  } catch (error) {
    console.error('❌ Error completing draft order:', error);
    const errorResponse = json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete draft order' 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}

// Handle GET requests (Optional - for testing)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = json({ 
    message: 'Draft Orders API is working!',
    endpoints: {
      'POST /api/draft-orders': 'Create, update, delete, or complete draft orders',
      'Available actions': ['create', 'update', 'delete', 'complete']
    }
  });
  return addCorsHeaders(response);
}; 