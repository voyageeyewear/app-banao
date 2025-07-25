import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Handle CORS preflight requests
export async function options() {
  const response = new Response(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  console.log("🔍 Header settings API: Starting save process");

  try {
    // Authenticate the request
    console.log("🔐 Authenticating request...");
    await authenticate.admin(request);
    console.log("✅ Authentication successful");

    // Parse request data
    console.log("📝 Parsing request data...");
    const requestData = await request.json();
    console.log("✅ Request data parsed successfully");
    console.log("📊 Data received:", JSON.stringify(requestData, null, 2));

    // Extract and validate data
    const headerSettings = requestData.header;
    const trendingSlides = requestData.trending_slides || [];
    const navItems = requestData.nav_items || [];
    const announcementBar = requestData.announcement_bar || {};
    const menuSettings = requestData.menu_settings || {};
    
    console.log("📊 Nav items to save:", JSON.stringify(navItems, null, 2));
    console.log("📊 Announcement bar to save:", JSON.stringify(announcementBar, null, 2));

    if (!headerSettings) {
      console.error("❌ Missing header settings");
      return json({ 
        success: false, 
        error: "Missing header settings",
        details: "No header data provided"
      }, { status: 400 });
    }

    console.log("✅ Data validation passed");

    // Save to database
    console.log("💾 Saving to database...");
    const savedSettings = await db.headerConfig.upsert({
      where: { id: 1 },
      update: {
        enabled: true,
        announcement: announcementBar,
        genderTabs: { enabled: headerSettings.enable_menu_drawer, tabs: ["All", "Men", "Women"] },
        trendingImages: {
          enabled: true,
          title: headerSettings.trending_title,
          subtitle: headerSettings.trending_subtitle,
          slides: trendingSlides
        },
        navigation: {
          logo_url: headerSettings.logo_url,
          header_background: headerSettings.header_background_color,
          nav_text_color: headerSettings.nav_text_color,
          nav_active_color: headerSettings.nav_active_color,
          icon_color: headerSettings.icon_color,
          icon_hover_color: headerSettings.icon_hover_color,
          cart_icon_color: headerSettings.cart_icon_color,
          wishlist_icon_color: headerSettings.wishlist_icon_color,
          account_icon_color: headerSettings.account_icon_color,
          menu_icon_color: headerSettings.menu_icon_color,
          enable_wishlist: headerSettings.enable_wishlist_icon,
          enable_account: headerSettings.enable_account_icon,
          enable_cart: headerSettings.enable_cart_icon,
          nav_items: navItems,
          menu_settings: menuSettings,
          offer_button: {
            enabled: headerSettings.enable_offer_button,
            text: headerSettings.offer_button_text,
            link: headerSettings.offer_button_link
          }
        },
        updatedAt: new Date()
      },
      create: {
        id: 1,
        enabled: true,
        announcement: announcementBar,
        genderTabs: { enabled: headerSettings.enable_menu_drawer, tabs: ["All", "Men", "Women"] },
        trendingImages: {
          enabled: true,
          title: headerSettings.trending_title,
          subtitle: headerSettings.trending_subtitle,
          slides: trendingSlides
        },
        navigation: {
          logo_url: headerSettings.logo_url,
          header_background: headerSettings.header_background_color,
          nav_text_color: headerSettings.nav_text_color,
          nav_active_color: headerSettings.nav_active_color,
          icon_color: headerSettings.icon_color,
          icon_hover_color: headerSettings.icon_hover_color,
          cart_icon_color: headerSettings.cart_icon_color,
          wishlist_icon_color: headerSettings.wishlist_icon_color,
          account_icon_color: headerSettings.account_icon_color,
          menu_icon_color: headerSettings.menu_icon_color,
          enable_wishlist: headerSettings.enable_wishlist_icon,
          enable_account: headerSettings.enable_account_icon,
          enable_cart: headerSettings.enable_cart_icon,
          nav_items: navItems,
          menu_settings: menuSettings,
          offer_button: {
            enabled: headerSettings.enable_offer_button,
            text: headerSettings.offer_button_text,
            link: headerSettings.offer_button_link
          }
        }
      }
    });

    console.log("✅ Database save successful");
    console.log("🎉 Save completed successfully");

    return json({ 
      success: true, 
      message: "Header settings saved successfully",
      data: { id: savedSettings.id, updatedAt: savedSettings.updatedAt }
    });

  } catch (error) {
    console.error("💥 Error in header settings API:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack");
    
    return json({ 
      success: false, 
      error: "Failed to save header settings",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Helper function to add CORS headers to responses
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function loader({ request }: ActionFunctionArgs) {
  console.log("🔍 Header settings loader: Starting...");
  
  try {
    // Skip authentication for GET requests (public API for mobile app)
    console.log("✅ Public API access - skipping authentication for GET request");
    
    // Load header settings from database
    const headerSettings = await db.headerConfig.findFirst({
      where: { id: 1 }
    });

    const defaultSlides = [
      {
        id: "1",
        title: "Premium Eyeglasses",
        image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=440&h=540&fit=crop&crop=center&q=80",
        link_url: "/collections/eyeglasses",
        enabled: true,
        order: 1,
      },
      {
        id: "2",
        title: "Blue Light Blockers",
        image_url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=440&h=540&fit=crop&crop=center&q=80",
        link_url: "/collections/blue-light",
        enabled: true,
        order: 2,
      },
      {
        id: "3",
        title: "Designer Sunglasses",
        image_url: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=440&h=540&fit=crop&crop=center&q=80",
        link_url: "/collections/sunglasses",
        enabled: true,
        order: 3,
      },
      {
        id: "4",
        title: "Reading Glasses",
        image_url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=440&h=540&fit=crop&crop=center&q=80",
        link_url: "/collections/reading",
        enabled: true,
        order: 4,
      },
      {
        id: "5",
        title: "Sports Eyewear",
        image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=440&h=540&fit=crop&crop=center&q=80",
        link_url: "/collections/sports",
        enabled: true,
        order: 5,
      },
    ];

    let responseData;
    if (headerSettings && headerSettings.navigation && headerSettings.trendingImages) {
      const navigation = headerSettings.navigation as any;
      const trendingData = headerSettings.trendingImages as any;
      
      console.log("📊 Navigation from DB:", JSON.stringify(navigation, null, 2));
      console.log("📊 Announcement from DB:", JSON.stringify(headerSettings.announcement, null, 2));
      
      responseData = { 
        success: true, 
        header: {
          logo_url: navigation.logo_url || "",
          trending_title: trendingData.title || "#Trending On",
          trending_subtitle: trendingData.subtitle || "GoEye",
          header_background_color: navigation.header_background || "#FFFFFF",
          nav_text_color: navigation.nav_text_color || "#6B7280",
          nav_active_color: navigation.nav_active_color || "#1E1B4B",
          icon_color: navigation.icon_color || "#ffffff",
          icon_hover_color: navigation.icon_hover_color || "#ffffff",
          cart_icon_color: navigation.cart_icon_color || "#ffffff",
          wishlist_icon_color: navigation.wishlist_icon_color || "#ffffff",
          account_icon_color: navigation.account_icon_color || "#ffffff",
          menu_icon_color: navigation.menu_icon_color || "#ffffff",
          enable_menu_drawer: headerSettings.genderTabs ? (headerSettings.genderTabs as any).enabled : true,
          enable_wishlist_icon: navigation.enable_wishlist !== false,
          enable_account_icon: navigation.enable_account !== false,
          enable_cart_icon: navigation.enable_cart !== false,
          enable_offer_button: navigation.offer_button ? navigation.offer_button.enabled : true,
          offer_button_text: navigation.offer_button ? navigation.offer_button.text : "50% OFF",
          offer_button_link: navigation.offer_button ? navigation.offer_button.link : "",
        },
        trending_slides: trendingData.slides || defaultSlides,
        nav_items: navigation.nav_items || [
          { id: "1", title: "All", link: "/collections/all", enabled: true, order: 1 },
          { id: "2", title: "Classic", link: "/collections/classic", enabled: true, order: 2 },
          { id: "3", title: "Premium", link: "/collections/premium", enabled: true, order: 3 },
        ],
        announcement_bar: headerSettings.announcement || {
          enabled: true,
          text: "Free shipping on orders over $50! 🚚",
          background_color: "#1E1B4B",
          text_color: "#ffffff",
          scroll_speed: 5000,
        },
        menu_settings: navigation.menu_settings || {
          background_color: "#ffffff",
          text_color: "#333333",
          hover_color: "#1E1B4B",
          enable_search: true,
          enable_categories: true,
        }
      };
    } else {
      responseData = { 
        success: true, 
        header: {
          logo_url: "",
          trending_title: "#Trending On",
          trending_subtitle: "GoEye",
          header_background_color: "#FFFFFF",
          nav_text_color: "#6B7280",
          nav_active_color: "#1E1B4B",
          icon_color: "#ffffff",
          icon_hover_color: "#ffffff",
          cart_icon_color: "#ffffff",
          wishlist_icon_color: "#ffffff",
          account_icon_color: "#ffffff",
          menu_icon_color: "#ffffff",
          enable_menu_drawer: true,
          enable_wishlist_icon: true,
          enable_account_icon: true,
          enable_cart_icon: true,
          enable_offer_button: true,
          offer_button_text: "50% OFF",
          offer_button_link: "",
        },
        trending_slides: defaultSlides,
        nav_items: [
          { id: "1", title: "All", link: "/collections/all", enabled: true, order: 1 },
          { id: "2", title: "Classic", link: "/collections/classic", enabled: true, order: 2 },
          { id: "3", title: "Premium", link: "/collections/premium", enabled: true, order: 3 },
        ],
        announcement_bar: {
          enabled: true,
          text: "Free shipping on orders over $50! 🚚",
          background_color: "#1E1B4B",
          text_color: "#ffffff",
          scroll_speed: 5000,
        },
        menu_settings: {
          background_color: "#ffffff",
          text_color: "#333333",
          hover_color: "#1E1B4B",
          enable_search: true,
          enable_categories: true,
        }
      };
    }

    // Create response with CORS headers for mobile app
    const response = json(responseData);
    return addCorsHeaders(response);

  } catch (error) {
    console.error("❌ Error loading header settings:", error);
    const errorResponse = json({ 
      success: false, 
      error: "Failed to load header settings"
    }, { status: 500 });
    
    return addCorsHeaders(errorResponse);
  }
} 