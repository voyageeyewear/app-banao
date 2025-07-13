import { json, type ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const headerData = await request.json();
    
    // Save header settings to database
    const savedHeaderSettings = await db.headerConfig.upsert({
      where: { id: 1 },
      update: {
        enabled: true,
        announcement: headerData.announcement,
        genderTabs: headerData.genderTabs,
        trendingImages: headerData.trendingItems,
        navigation: headerData.logo || {},
        updatedAt: new Date()
      },
      create: {
        id: 1,
        enabled: true,
        announcement: headerData.announcement,
        genderTabs: headerData.genderTabs,
        trendingImages: headerData.trendingItems,
        navigation: headerData.logo || {}
      }
    });

    return json({ 
      success: true, 
      message: "Header settings saved successfully",
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

    if (headerSettings) {
      return json({ 
        success: true, 
        data: {
          announcement: headerSettings.announcement,
          logo: headerSettings.navigation,
          genderTabs: headerSettings.genderTabs,
          trendingItems: headerSettings.trendingImages
        }
      });
    } else {
      // Return default settings if none exist
      return json({ 
        success: true, 
        data: {
          announcement: {
            text: "Free Shipping on Orders Above ₹2000 | Express Delivery Available",
            enabled: true
          },
          logo: {
            text: "GoEye Store",
            enabled: true
          },
          genderTabs: {
            enabled: true,
            tabs: ["All", "Men", "Women", "Unisex"]
          },
          trendingItems: {
            enabled: true,
            items: [
              {
                id: '1',
                title: 'Classic Frames',
                image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=600&fit=crop',
                url: '#'
              },
              {
                id: '2',
                title: 'Modern Styles',
                image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=600&fit=crop',
                url: '#'
              },
              {
                id: '3',
                title: 'Vintage Collection',
                image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=600&fit=crop',
                url: '#'
              }
            ]
          }
        }
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