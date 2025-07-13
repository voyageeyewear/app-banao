import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs/promises";
import { join } from "path";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Read the mobile app HTML file
    const htmlPath = join(process.cwd(), "build", "client", "mobile-app.html");
    const htmlContent = await readFile(htmlPath, "utf-8");
    
    // Return the HTML file as a response
    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error serving mobile app:", error);
    
    // Return a fallback HTML
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile App Loading...</title>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>Mobile App Loading...</h1>
        <p>The mobile app is loading. Please wait...</p>
        <p style="color: #666; font-size: 14px;">
          Error: Could not load mobile app HTML file
        </p>
    </div>
</body>
</html>
    `;
    
    return new Response(fallbackHtml, {
      headers: {
        "Content-Type": "text/html",
      },
      status: 500,
    });
  }
}; 