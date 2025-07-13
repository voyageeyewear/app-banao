import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Handle OPTIONS requests for CORS
export async function options() {
  return addCorsHeaders(new Response(null, { status: 200 }));
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("Mobile API: Returning mock data for mobile app");
    
    const mockCollections = [
      {
        id: "1",
        title: "Men's Eyeglasses",
        handle: "mens-eyeglasses",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/mens-glasses.jpg"
      },
      {
        id: "2", 
        title: "Women's Eyeglasses",
        handle: "womens-eyeglasses",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/womens-glasses.jpg"
      },
      {
        id: "3",
        title: "Sunglasses",
        handle: "sunglasses", 
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/sunglasses.jpg"
      },
      {
        id: "4",
        title: "Kids Eyeglasses",
        handle: "kids-eyeglasses",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/kids-glasses.jpg"
      }
    ];

    const mockProducts = [
      {
        id: "1",
        title: "Classic Black Frame",
        handle: "classic-black-frame",
        price: "$99.99",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/black-frame.jpg",
        description: "Stylish black frame eyeglasses"
      },
      {
        id: "2",
        title: "Blue Light Blocking",
        handle: "blue-light-blocking",
        price: "$129.99", 
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/blue-light.jpg",
        description: "Protect your eyes from blue light"
      },
      {
        id: "3",
        title: "Designer Sunglasses",
        handle: "designer-sunglasses",
        price: "$199.99",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/designer-sun.jpg", 
        description: "Premium designer sunglasses"
      },
      {
        id: "4",
        title: "Reading Glasses",
        handle: "reading-glasses",
        price: "$49.99",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/reading.jpg",
        description: "Comfortable reading glasses"
      },
      {
        id: "5",
        title: "Sports Glasses",
        handle: "sports-glasses",
        price: "$179.99",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/sports.jpg",
        description: "Durable sports eyewear"
      },
      {
        id: "6",
        title: "Vintage Style",
        handle: "vintage-style",
        price: "$89.99",
        image: "https://cdn.shopify.com/s/files/1/0123/4567/products/vintage.jpg",
        description: "Retro vintage eyeglasses"
      }
    ];

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    
    if (type === "collections") {
      return addCorsHeaders(json({ collections: mockCollections }));
    } else if (type === "products") {
      return addCorsHeaders(json({ products: mockProducts }));
    }
    
    return addCorsHeaders(json({
      collections: mockCollections,
      products: mockProducts
    }));
    
  } catch (error) {
    console.error("Mobile API Error:", error);
    return addCorsHeaders(json({ 
      error: "Failed to fetch data",
      collections: [],
      products: []
    }, { status: 500 }));
  }
}; 