import { json } from "@remix-run/node";

// Test endpoint to check environment variables
export const loader = async () => {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  
  return json({
    environment: process.env.NODE_ENV,
    hasAdminToken: !!adminToken,
    adminTokenLength: adminToken ? adminToken.length : 0,
    adminTokenPrefix: adminToken ? adminToken.substring(0, 8) + '...' : 'NOT SET',
    hasStorefrontToken: !!storefrontToken,
    timestamp: new Date().toISOString(),
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('SHOPIFY'))
  });
}; 