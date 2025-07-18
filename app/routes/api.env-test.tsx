import { json } from "@remix-run/node";

// Test endpoint to check environment variables
export const loader = async () => {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  
  // Clean admin token the same way as in draft-orders API
  const cleanedAdminToken = adminToken ? adminToken
    .replace(/\s/g, '') // Remove all whitespace including newlines, tabs, etc.
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
    .trim() : '';
  
  return json({
    environment: process.env.NODE_ENV,
    hasAdminToken: !!adminToken,
    adminTokenLength: adminToken ? adminToken.length : 0,
    cleanedAdminTokenLength: cleanedAdminToken.length,
    adminTokenPrefix: adminToken ? adminToken.substring(0, 8) + '...' : 'NOT SET',
    cleanedAdminTokenPrefix: cleanedAdminToken ? cleanedAdminToken.substring(0, 8) + '...' : 'NOT SET',
    hasStorefrontToken: !!storefrontToken,
    timestamp: new Date().toISOString(),
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('SHOPIFY')),
    tokenValidation: {
      startsWithShpat: cleanedAdminToken.startsWith('shpat_'),
      hasNonPrintableChars: adminToken ? adminToken !== cleanedAdminToken : false,
      originalHasWhitespace: adminToken ? /\s/.test(adminToken) : false
    }
  });
}; 