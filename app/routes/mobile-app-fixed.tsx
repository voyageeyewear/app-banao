import { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Read the mobile app file
    const filePath = join(process.cwd(), "public", "mobile-app.html");
    let content = await readFile(filePath, "utf-8");
    
    // Apply the variant_id fix
    content = content.replace(
      /function extractVariantId\(productId\) \{[\s\S]*?return `gid:\/\/shopify\/ProductVariant\/\${productId}_001`;[\s\S]*?\}/,
      `function extractVariantId(productId) {
               // For REST Admin API, return numeric variant ID as string
               // In production, this should be the actual variant ID from your product data
               // For now, using a base number + productId to create unique variant IDs
               const baseVariantId = 40000000000; // Base Shopify variant ID
               const numericId = parseInt(productId) || 1;
               return String(baseVariantId + numericId);
           }`
    );
    
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return new Response("Error loading mobile app", { status: 500 });
  }
}; 