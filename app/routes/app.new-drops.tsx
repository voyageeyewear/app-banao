import { useState, useEffect } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import db from "../db.server";

interface NewDropsConfig {
  id: number;
  title: string;
  subtitle: string;
  slide_interval: number;
  enabled: boolean;
}

interface NewDropsSlide {
  id: number;
  slide_image: string;
  slide_link: string;
  slide_heading: string;
  slide_subheading: string;
  button_text: string;
  logo_1: string;
  logo_1_position: string;
  logo_1_size: number;
  logo_2: string;
  logo_2_position: string;
  logo_2_size: number;
  logo_3: string;
  logo_3_position: string;
  logo_3_size: number;
  order: number;
  enabled: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Get config
    let config = await db.newDropsConfig.findFirst();
    if (!config) {
      config = await db.newDropsConfig.create({
        data: {}
      });
    }

    // Get slides
    const slides = await db.newDropsSlide.findMany({
      orderBy: { order: 'asc' }
    });

    return json({ config, slides });
  } catch (error) {
    console.error('Error loading new drops data:', error);
    return json({ config: null, slides: [] });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "update_config") {
      const title = formData.get("title") as string;
      const subtitle = formData.get("subtitle") as string;
      const slide_interval = parseInt(formData.get("slide_interval") as string) || 3;
      const enabled = formData.get("enabled") === "true";

      await db.newDropsConfig.upsert({
        where: { id: 1 },
        update: { title, subtitle, slide_interval, enabled },
        create: { title, subtitle, slide_interval, enabled }
      });

      return json({ success: true, message: "Config updated successfully" });
    }

    if (action === "add_slide") {
      const slideData = {
        slide_image: formData.get("slide_image") as string || "",
        slide_link: formData.get("slide_link") as string || "",
        slide_heading: formData.get("slide_heading") as string || "",
        slide_subheading: formData.get("slide_subheading") as string || "",
        button_text: formData.get("button_text") as string || "",
        logo_1: formData.get("logo_1") as string || "",
        logo_1_position: formData.get("logo_1_position") as string || "top-left",
        logo_1_size: parseInt(formData.get("logo_1_size") as string) || 50,
        logo_2: formData.get("logo_2") as string || "",
        logo_2_position: formData.get("logo_2_position") as string || "top-center",
        logo_2_size: parseInt(formData.get("logo_2_size") as string) || 50,
        logo_3: formData.get("logo_3") as string || "",
        logo_3_position: formData.get("logo_3_position") as string || "top-right",
        logo_3_size: parseInt(formData.get("logo_3_size") as string) || 50,
        order: parseInt(formData.get("order") as string) || 0,
        enabled: formData.get("enabled") !== "false"
      };

      await db.newDropsSlide.create({ data: slideData });
      return json({ success: true, message: "Slide added successfully" });
    }

    if (action === "update_slide") {
      const slideId = parseInt(formData.get("slideId") as string);
      const slideData = {
        slide_image: formData.get("slide_image") as string || "",
        slide_link: formData.get("slide_link") as string || "",
        slide_heading: formData.get("slide_heading") as string || "",
        slide_subheading: formData.get("slide_subheading") as string || "",
        button_text: formData.get("button_text") as string || "",
        logo_1: formData.get("logo_1") as string || "",
        logo_1_position: formData.get("logo_1_position") as string || "top-left",
        logo_1_size: parseInt(formData.get("logo_1_size") as string) || 50,
        logo_2: formData.get("logo_2") as string || "",
        logo_2_position: formData.get("logo_2_position") as string || "top-center",
        logo_2_size: parseInt(formData.get("logo_2_size") as string) || 50,
        logo_3: formData.get("logo_3") as string || "",
        logo_3_position: formData.get("logo_3_position") as string || "top-right",
        logo_3_size: parseInt(formData.get("logo_3_size") as string) || 50,
        order: parseInt(formData.get("order") as string) || 0,
        enabled: formData.get("enabled") !== "false"
      };

      await db.newDropsSlide.update({
        where: { id: slideId },
        data: slideData
      });

      return json({ success: true, message: "Slide updated successfully" });
    }

    if (action === "delete_slide") {
      const slideId = parseInt(formData.get("slideId") as string);
      await db.newDropsSlide.delete({ where: { id: slideId } });
      return json({ success: true, message: "Slide deleted successfully" });
    }

    return json({ success: false, message: "Invalid action" });
  } catch (error) {
    console.error('Error in new drops action:', error);
    return json({ success: false, message: "Database error occurred" });
  }
};

export default function NewDropsAdmin() {
  const { config, slides } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [editingSlide, setEditingSlide] = useState<NewDropsSlide | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      setEditingSlide(null);
      setShowAddForm(false);
    }
  }, [actionData]);

  const LogoPositionSelect = ({ name, defaultValue }: { name: string; defaultValue: string }) => (
    <select 
      name={name} 
      defaultValue={defaultValue} 
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all bg-white"
    >
      <option value="top-left">📍 Top Left</option>
      <option value="top-center">📍 Top Center</option>
      <option value="top-right">📍 Top Right</option>
      <option value="bottom-left">📍 Bottom Left</option>
      <option value="bottom-right">📍 Bottom Right</option>
    </select>
  );

  const SlideForm = ({ slide, isEdit }: { slide?: NewDropsSlide; isEdit?: boolean }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {isEdit ? "Edit Banner Slide" : "Create New Banner Slide"}
        </h3>
        <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-purple-700">Slide Builder</span>
        </div>
      </div>
      
      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value={isEdit ? "update_slide" : "add_slide"} />
        {isEdit && <input type="hidden" name="slideId" value={slide?.id} />}

        {/* Basic Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image URL *</label>
              <input
                type="url"
                name="slide_image"
                defaultValue={slide?.slide_image || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://example.com/banner-image.jpg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 358x480px aspect ratio</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination Link</label>
              <input
                type="url"
                name="slide_link"
                defaultValue={slide?.slide_link || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://your-store.com/collection"
              />
              <p className="text-xs text-gray-500 mt-1">Where users go when they tap the banner</p>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Text Content & Call-to-Action
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                name="slide_heading"
                defaultValue={slide?.slide_heading || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="New Collection"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
              <input
                type="text"
                name="slide_subheading"
                defaultValue={slide?.slide_subheading || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Discover our latest styles"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                name="button_text"
                defaultValue={slide?.button_text || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Shop Now"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                name="order"
                defaultValue={slide?.order || 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </div>

        {/* Logo Overlays */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Brand Logo Overlays
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Optional</span>
          </h4>
          
          {/* Logo 1 */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-yellow-200">
            <h5 className="font-medium text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Logo 1
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image URL</label>
                <input
                  type="url"
                  name="logo_1"
                  defaultValue={slide?.logo_1 || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/logo1.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <LogoPositionSelect name="logo_1_position" defaultValue={slide?.logo_1_position || "top-left"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
                <input
                  type="number"
                  name="logo_1_size"
                  defaultValue={slide?.logo_1_size || 50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  min="30"
                  max="100"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Logo 2 */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-yellow-200">
            <h5 className="font-medium text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              Logo 2
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image URL</label>
                <input
                  type="url"
                  name="logo_2"
                  defaultValue={slide?.logo_2 || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/logo2.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <LogoPositionSelect name="logo_2_position" defaultValue={slide?.logo_2_position || "top-center"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
                <input
                  type="number"
                  name="logo_2_size"
                  defaultValue={slide?.logo_2_size || 50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  min="30"
                  max="100"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Logo 3 */}
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h5 className="font-medium text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Logo 3
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image URL</label>
                <input
                  type="url"
                  name="logo_3"
                  defaultValue={slide?.logo_3 || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/logo3.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <LogoPositionSelect name="logo_3_position" defaultValue={slide?.logo_3_position || "top-right"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size (px)</label>
                <input
                  type="number"
                  name="logo_3_size"
                  defaultValue={slide?.logo_3_size || 50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  min="30"
                  max="100"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Slide Settings */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Slide Settings
          </h4>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={slide?.enabled !== false}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Enable this slide</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Disabled slides won't appear in the mobile app banner</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setEditingSlide(null);
              setShowAddForm(false);
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEdit ? "Update Slide" : "Create Slide"}
              </span>
            )}
          </button>
        </div>
      </Form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                New Drops Banner Management
              </h1>
              <p className="text-gray-600 mt-1">Create and manage beautiful banner slides for your mobile app</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live API</span>
              </div>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-800">/api/live-new-drops</code>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {actionData?.message && (
          <div className={`rounded-xl border p-4 ${actionData.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-3 ${actionData.success ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {actionData.success ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              {actionData.message}
            </div>
          </div>
        )}

        {/* Configuration Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Banner Configuration
            </h2>
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-blue-700">Global Settings</span>
            </div>
          </div>
          
          <Form method="post" className="space-y-6">
            <input type="hidden" name="action" value="update_config" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={config?.title || "New Drops"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="New Drops"
                />
                <p className="text-xs text-gray-500">Displayed as the section heading in mobile app</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={config?.subtitle || "Fresh collections every 15 days"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Fresh collections every 15 days"
                />
                <p className="text-xs text-gray-500">Appears below the title</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Slide Interval</label>
                <div className="relative">
                  <input
                    type="number"
                    name="slide_interval"
                    defaultValue={config?.slide_interval || 3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="2"
                    max="10"
                    placeholder="3"
                  />
                  <span className="absolute right-3 top-3 text-gray-500 text-sm">seconds</span>
                </div>
                <p className="text-xs text-gray-500">How often slides change automatically</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Status</label>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      name="enabled"
                      value="true"
                      defaultChecked={config?.enabled !== false}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Enable New Drops Section</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">Turn the entire section on/off in mobile app</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Configuration...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Configuration
                  </span>
                )}
              </button>
            </div>
          </Form>
        </div>

        {/* Slides Management */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Banner Slides
                <span className="ml-3 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                  {slides?.length || 0} slides
                </span>
              </h2>
              <p className="text-gray-600 mt-1">Manage individual banner slides with rich content and branding</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-lg"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Slide
              </span>
            </button>
          </div>

        {showAddForm && <SlideForm />}
        {editingSlide && <SlideForm slide={editingSlide} isEdit={true} />}

        <div className="space-y-4">
          {slides && slides.length > 0 ? (
                                 slides.map((slide: NewDropsSlide) => (
              <div key={slide.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-medium">{slide.slide_heading || 'Untitled Slide'}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${slide.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {slide.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="text-sm text-gray-500">Order: {slide.order}</span>
                    </div>
                    {slide.slide_subheading && (
                      <p className="text-gray-600 text-sm mb-2">{slide.slide_subheading}</p>
                    )}
                    {slide.slide_image && (
                      <div className="mb-2">
                        <img src={slide.slide_image} alt="Slide" className="w-20 h-20 object-cover rounded" />
                      </div>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      {slide.button_text && <div>Button: {slide.button_text}</div>}
                      {slide.logo_1 && <div>Logo 1: {slide.logo_1_position} ({slide.logo_1_size}px)</div>}
                      {slide.logo_2 && <div>Logo 2: {slide.logo_2_position} ({slide.logo_2_size}px)</div>}
                      {slide.logo_3 && <div>Logo 3: {slide.logo_3_position} ({slide.logo_3_size}px)</div>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="delete_slide" />
                      <input type="hidden" name="slideId" value={slide.id} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to delete this slide?')) {
                            e.preventDefault();
                          }
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No slides configured. Add your first slide to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
} 