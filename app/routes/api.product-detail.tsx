import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Helper function to add CORS headers for mobile app access
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get("handle");
    const id = url.searchParams.get("id");
    
    console.log('🔍 Product detail request:', { handle, id });
    
    if (!handle && !id) {
      const errorResponse = json({ 
        success: false, 
        error: "Product handle or ID is required" 
      }, { status: 400 });
      return addCorsHeaders(errorResponse);
    }
    
    // Mock product data with enhanced details for demo
    // In production, this would fetch from Shopify API
    const mockProducts = [
      {
        id: "1",
        handle: "classic-aviator",
        title: "Classic Aviator Sunglasses",
        subtitle: "Timeless Design, Modern Comfort",
        price: "₹2,499",
        originalPrice: "₹3,499",
        discount: 29,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop"
        ],
        rating: 4.8,
        ratingCount: 342,
        description: "Experience the perfect blend of classic style and modern technology with our premium aviator sunglasses. Featuring UV400 protection and lightweight titanium frames.",
        features: [
          "UV400 Protection",
          "Polarized Lenses", 
          "Titanium Frame",
          "Anti-reflective Coating",
          "Scratch Resistant"
        ],
        isNew: true,
        inStock: true,
        variants: [
          {
            id: "variant_1",
            title: "Gold Frame / Green Lens",
            price: "₹2,499",
            available: true
          },
          {
            id: "variant_2", 
            title: "Silver Frame / Blue Lens",
            price: "₹2,699",
            available: true
          }
        ]
      },
      {
        id: "2",
        handle: "modern-square",
        title: "Modern Square Frames",
        subtitle: "Contemporary Style for Every Occasion",
        price: "₹1,899",
        originalPrice: "₹2,399",
        discount: 21,
        image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&h=800&fit=crop"
        ],
        rating: 4.6,
        ratingCount: 256,
        description: "Modern square frames designed for the contemporary professional. Features blue light filtering technology and ultra-lightweight construction.",
        features: [
          "Blue Light Protection",
          "Lightweight Design",
          "Flexible Hinges",
          "Anti-glare Coating",
          "Durable Material"
        ],
        isNew: false,
        inStock: true,
        variants: [
          {
            id: "variant_3",
            title: "Black Frame / Clear Lens",
            price: "₹1,899", 
            available: true
          },
          {
            id: "variant_4",
            title: "Tortoise Frame / Clear Lens",
            price: "₹1,999",
            available: true
          }
        ]
      },
      {
        id: "3",
        handle: "vintage-round",
        title: "Vintage Round Glasses",
        subtitle: "Retro Charm with Modern Precision",
        price: "₹1,699",
        originalPrice: "₹2,199",
        discount: 23,
        image: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=800&fit=crop"
        ],
        rating: 4.7,
        ratingCount: 189,
        description: "Embrace vintage aesthetics with these perfectly round frames. Handcrafted with premium materials and featuring adjustable nose pads for all-day comfort.",
        features: [
          "Handcrafted Quality",
          "Adjustable Nose Pads",
          "Premium Materials",
          "Vintage Design",
          "Comfortable Fit"
        ],
        isNew: false,
        inStock: true,
        variants: [
          {
            id: "variant_5",
            title: "Gold Frame / Clear Lens",
            price: "₹1,699",
            available: true
          },
          {
            id: "variant_6",
            title: "Silver Frame / Clear Lens", 
            price: "₹1,799",
            available: false
          }
        ]
      },
      {
        id: "4",
        handle: "blue-light-blockers",
        title: "Blue Light Blockers",
        subtitle: "Digital Eye Protection Specialists",
        price: "₹1,299",
        originalPrice: "₹1,799",
        discount: 28,
        image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=800&fit=crop"
        ],
        rating: 4.9,
        ratingCount: 567,
        description: "Protect your eyes from harmful blue light with our advanced filtering technology. Perfect for digital workers and gaming enthusiasts.",
        features: [
          "Advanced Blue Light Filtering",
          "Reduced Eye Strain",
          "Gaming Optimized",
          "Sleep Quality Improvement",
          "Digital Device Protection"
        ],
        isNew: true,
        inStock: true,
        variants: [
          {
            id: "variant_7",
            title: "Black Frame / Blue Light Lens",
            price: "₹1,299",
            available: true
          },
          {
            id: "variant_8",
            title: "Clear Frame / Blue Light Lens",
            price: "₹1,399",
            available: true
          }
        ]
      },
      {
        id: "5",
        handle: "designer-cat-eye",
        title: "Designer Cat Eye",
        subtitle: "Sophisticated Elegance Redefined",
        price: "₹2,199",
        originalPrice: "₹2,899",
        discount: 24,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop"
        ],
        rating: 4.5,
        ratingCount: 298,
        description: "Elevate your style with these designer cat-eye frames. Featuring Italian craftsmanship and premium acetate construction for lasting elegance.",
        features: [
          "Italian Craftsmanship",
          "Premium Acetate",
          "Designer Collection",
          "Elegant Silhouette",
          "Luxury Finish"
        ],
        isNew: false,
        inStock: true,
        variants: [
          {
            id: "variant_9",
            title: "Tortoise Pattern / Clear Lens",
            price: "₹2,199",
            available: true
          },
          {
            id: "variant_10",
            title: "Black / Clear Lens",
            price: "₹2,299",
            available: true
          }
        ]
      }
    ];
    
    // Find product by handle or id
    const product = mockProducts.find(p => 
      (handle && p.handle === handle) || 
      (id && p.id === id)
    );
    
    if (!product) {
      const errorResponse = json({ 
        success: false, 
        error: "Product not found",
        availableProducts: mockProducts.map(p => ({ id: p.id, handle: p.handle, title: p.title }))
      }, { status: 404 });
      return addCorsHeaders(errorResponse);
    }
    
    // Add some dynamic data
    const enhancedProduct = {
      ...product,
      // Add random review count variation
      ratingCount: product.ratingCount + Math.floor(Math.random() * 50),
      // Add availability status
      deliveryTime: "2-3 business days",
      freeShipping: true,
      returnPolicy: "30-day free returns",
      warranty: "1-year manufacturer warranty"
    };
    
    console.log('✅ Product found:', enhancedProduct.title);
    
    const response = json({
      success: true,
      product: enhancedProduct
    });
    
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('Product detail API error:', error);
    const errorResponse = json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}; 