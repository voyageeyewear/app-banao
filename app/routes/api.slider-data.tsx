import { json, type LoaderFunctionArgs } from "@remix-run/node";

// CORS headers function
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Default slider data for different collections
const defaultSliderData = {
  classic: [
    {
      id: 'classic-slide-1',
      badge: '9 to 5',
      title: 'Sleek Aviators',
      subtitle: 'Professional Style',
      description: 'Perfect for the modern workplace',
      image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=500&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Shop Now',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'classic-eyewear'
        },
        {
          text: 'Details',
          type: 'secondary',
          linkType: 'product',
          linkValue: 'eyejack-black-square-polarized-sunglasses-for-men-women-1905pcl2072'
        }
      ]
    },
    {
      id: 'classic-slide-2',
      badge: 'Classic',
      title: 'Round Frames',
      subtitle: 'Timeless Design',
      description: 'Vintage-inspired round eyeglasses',
      image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400&h=500&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Explore',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'round-frames'
        }
      ]
    },
    {
      id: 'classic-slide-3',
      badge: 'Premium',
      title: 'Designer Collection',
      subtitle: 'Luxury Eyewear',
      description: 'Premium materials and craftsmanship',
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=500&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Shop Luxury',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'luxury-frames'
        }
      ]
    },
    {
      id: 'classic-slide-4',
      badge: 'Sport',
      title: 'Active Wear',
      subtitle: 'Performance Sunglasses',
      description: 'Built for active lifestyles',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Shop Sport',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'sport-eyewear'
        }
      ]
    },
    {
      id: 'classic-slide-5',
      badge: 'Trendy',
      title: 'Fashion Forward',
      subtitle: 'Latest Trends',
      description: 'Stay ahead with modern designs',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Discover',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'trendy-frames'
        }
      ]
    }
  ],
  premium: [
    {
      id: 'premium-slide-1',
      badge: 'Luxury',
      title: 'Exclusive',
      subtitle: 'Limited Edition Collection',
      description: 'Handcrafted frames with premium materials and exclusive designs',
      background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Shop Luxury',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'luxury-frames'
        }
      ]
    }
  ],
  sport: [
    {
      id: 'sport-slide-1',
      badge: 'Athletic',
      title: 'Performance',
      subtitle: 'Built for Action',
      description: 'Durable, lightweight frames designed for active lifestyles',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&h=800&fit=crop&crop=center&q=80',
      ctaButtons: [
        {
          text: 'Shop Sport',
          type: 'primary',
          linkType: 'collection',
          linkValue: 'sport-eyewear'
        }
      ]
    }
  ]
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection") || "classic";
    
    console.log('📊 Fetching slider data for collection:', collection);
    
    // Get slides for the requested collection
    const slides = defaultSliderData[collection as keyof typeof defaultSliderData] || defaultSliderData.classic;
    
    const response = json({
      success: true,
      collection,
      slides,
      total: slides.length,
      timestamp: new Date().toISOString()
    });
    
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ Error fetching slider data:', error);
    
    const errorResponse = json({
      success: false,
      error: 'Failed to fetch slider data',
      collection: 'classic',
      slides: defaultSliderData.classic,
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
    return addCorsHeaders(errorResponse);
  }
};

// Handle OPTIONS requests for CORS
export const OPTIONS = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}; 