import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Authenticate the request
    await authenticate.admin(request);
    
    const requestData = await request.json();
    
    // Extract header settings and trending slides
    const headerSettings = requestData.header;
    const trendingSlides = requestData.trending_slides || [];
    
    // Save header settings to database
    const savedHeaderSettings = await db.headerConfig.upsert({
      where: { id: 1 },
      update: {
        enabled: true,
        announcement: {
          text: "Header announcement",
          enabled: true
        },
        genderTabs: {
          enabled: headerSettings.enable_menu_drawer,
          tabs: ["All", "Men", "Women"]
        },
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
          enable_wishlist: headerSettings.enable_wishlist_icon,
          enable_account: headerSettings.enable_account_icon,
          enable_cart: headerSettings.enable_cart_icon,
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
        announcement: {
          text: "Header announcement",
          enabled: true
        },
        genderTabs: {
          enabled: headerSettings.enable_menu_drawer,
          tabs: ["All", "Men", "Women"]
        },
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
          enable_wishlist: headerSettings.enable_wishlist_icon,
          enable_account: headerSettings.enable_account_icon,
          enable_cart: headerSettings.enable_cart_icon,
          offer_button: {
            enabled: headerSettings.enable_offer_button,
            text: headerSettings.offer_button_text,
            link: headerSettings.offer_button_link
          }
        }
      }
    });

    return json({ 
      success: true, 
      message: "Header settings and trending slides saved successfully",
      data: savedHeaderSettings
    });

  } catch (error) {
    console.error("Error saving header settings:", error);
    return json({ 
      success: false, 
      error: "Failed to save header settings",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function loader() {
  try {
    // Load header settings from database
    const headerSettings = await db.headerConfig.findFirst({
      where: { id: 1 }
    });

    if (headerSettings && headerSettings.navigation && headerSettings.trendingImages) {
      const navigation = headerSettings.navigation as any;
      const trendingData = headerSettings.trendingImages as any;
      
      return json({ 
        success: true, 
        header: {
          logo_url: navigation.logo_url || "",
          trending_title: trendingData.title || "#Trending On",
          trending_subtitle: trendingData.subtitle || "GoEye",
          header_background_color: navigation.header_background || "#FFFFFF",
          nav_text_color: navigation.nav_text_color || "#6B7280",
          nav_active_color: navigation.nav_active_color || "#1E1B4B",
          enable_menu_drawer: headerSettings.genderTabs ? (headerSettings.genderTabs as any).enabled : true,
          enable_wishlist_icon: navigation.enable_wishlist !== false,
          enable_account_icon: navigation.enable_account !== false,
          enable_cart_icon: navigation.enable_cart !== false,
          enable_offer_button: navigation.offer_button ? navigation.offer_button.enabled : true,
          offer_button_text: navigation.offer_button ? navigation.offer_button.text : "50% OFF",
          offer_button_link: navigation.offer_button ? navigation.offer_button.link : "",
        },
        trending_slides: trendingData.slides || [
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
        ]
      });
    } else {
      // Return default settings if none exist
      return json({ 
        success: true, 
        header: {
          logo_url: "",
          trending_title: "#Trending On",
          trending_subtitle: "GoEye",
          header_background_color: "#FFFFFF",
          nav_text_color: "#6B7280",
          nav_active_color: "#1E1B4B",
          enable_menu_drawer: true,
          enable_wishlist_icon: true,
          enable_account_icon: true,
          enable_cart_icon: true,
          enable_offer_button: true,
          offer_button_text: "50% OFF",
          offer_button_link: "",
        },
        trending_slides: [
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
        ]
      });
    }

  } catch (error) {
    console.error("Error loading header settings:", error);
    return json({ 
      success: false, 
      error: "Failed to load header settings"
    }, { status: 500 });
  }
} 