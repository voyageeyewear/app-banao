import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  try {
    const settings = await db.categoriesConfig.findFirst({
      where: { id: 1 }
    });

    if (settings) {
      return json({
        success: true,
        data: {
          title: settings.title,
          enabled: settings.enabled,
          categories: settings.categories as any[],
          products: settings.products as any[]
        }
      });
    } else {
      return json({
        success: true,
        data: null
      });
    }
  } catch (error) {
    console.error('Error loading categories settings:', error);
    return json({
      success: false,
      error: 'Failed to load settings'
    }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { title, enabled, categories, products } = body;

    const settings = await db.categoriesConfig.upsert({
      where: { id: 1 },
      update: {
        title,
        enabled,
        categories: categories as any,
        products: products as any,
        updatedAt: new Date()
      },
      create: {
        id: 1,
        title,
        enabled,
        categories: categories as any,
        products: products as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error saving categories settings:', error);
    return json({
      success: false,
      error: 'Failed to save settings'
    }, { status: 500 });
  }
}; 