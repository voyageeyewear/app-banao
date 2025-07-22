import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  
  // Load current PDP configuration
  try {
    const url = new URL(request.url);
    const response = await fetch(`${url.origin}/api/pdp-config`);
    const config = response.ok ? await response.json() : getDefaultConfig();
    
    return json({
      config,
      success: false,
      message: ""
    });
  } catch (error) {
    return json({
      config: getDefaultConfig(),
      success: false,
      message: ""
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "save") {
    try {
      // Forward to API
      const url = new URL(request.url);
      const apiResponse = await fetch(`${url.origin}/api/pdp-config`, {
        method: 'POST',
        body: formData
      });
      
      const result = await apiResponse.json();
      
      return json({
        config: result.config || getDefaultConfig(),
        success: result.success || false,
        message: result.message || "Configuration saved"
      });

    } catch (error) {
      console.error('❌ Error saving PDP config:', error);
      return json({
        config: getDefaultConfig(),
        success: false,
        message: "Failed to save configuration"
      }, { status: 500 });
    }
  }

  if (action === "preview") {
    return json({
      config: getDefaultConfig(),
      success: false,
      message: "",
      preview: true
    });
  }

  return redirect("/app/pdp-admin");
}

function getDefaultConfig() {
  return {
    subtitleText: "Premium Eyewear Collection",
    featureText: "Anti-reflective coating & UV protection",
    promoBannerText: "🚚 Free Shipping | 💳 Easy Returns | 🔒 Secure Checkout",
    whatsappNumber: "+919999999999",
    taxText: "incl. of taxes",
    showNewBadge: true,
    showWhatsAppChat: true,
    actionButtons: {
      sizeGuide: "Size Guide",
      tryOn: "Try On",
      reviews: "Reviews"
    }
  };
}

export default function PDPAdmin() {
  const { config, success, message } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [formData, setFormData] = useState(config);

  useEffect(() => {
    if (actionData) {
      setFormData(actionData.config);
    }
  }, [actionData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("action", "save");
    
    // Flatten the data for form submission
    formDataToSubmit.append("subtitleText", formData.subtitleText);
    formDataToSubmit.append("featureText", formData.featureText);
    formDataToSubmit.append("promoBannerText", formData.promoBannerText);
    formDataToSubmit.append("whatsappNumber", formData.whatsappNumber);
    formDataToSubmit.append("taxText", formData.taxText);
    formDataToSubmit.append("showNewBadge", formData.showNewBadge.toString());
    formDataToSubmit.append("showWhatsAppChat", formData.showWhatsAppChat.toString());
    formDataToSubmit.append("sizeGuideText", formData.actionButtons.sizeGuide);
    formDataToSubmit.append("tryOnText", formData.actionButtons.tryOn);
    formDataToSubmit.append("reviewsText", formData.actionButtons.reviews);

    submit(formDataToSubmit, { method: "post" });
  };

  const handlePreview = () => {
    // Open preview in new tab
    const previewUrl = `/pages/product-detail-page.html?handle=demo-product&preview=true`;
    window.open(previewUrl, '_blank');
  };

  const currentMessage = actionData?.message || message;
  const currentSuccess = actionData?.success || success;

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e1e5e9'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#202223',
          margin: '0 0 8px 0'
        }}>
          📱 Product Detail Page Settings
        </h1>
        <p style={{
          color: '#6d7175',
          margin: '0',
          fontSize: '14px'
        }}>
          Customize the content and appearance of your product detail pages
        </p>
      </div>

      {/* Status Message */}
      {currentMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          backgroundColor: currentSuccess ? '#d4edda' : '#f8d7da',
          color: currentSuccess ? '#155724' : '#721c24',
          border: `1px solid ${currentSuccess ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {currentSuccess ? '✅' : '❌'} {currentMessage}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '30px'
      }}>
        {/* Form Section */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#202223',
            marginBottom: '20px'
          }}>
            Content & Text Settings
          </h2>

          {/* Subtitle Text */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Product Subtitle Text
            </label>
            <input
              type="text"
              value={formData.subtitleText}
              onChange={(e) => handleInputChange('subtitleText', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Premium Eyewear Collection"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Appears below the product title
            </small>
          </div>

          {/* Feature Text */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Product Features Text
            </label>
            <input
              type="text"
              value={formData.featureText}
              onChange={(e) => handleInputChange('featureText', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Anti-reflective coating & UV protection"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Displays with green checkmark
            </small>
          </div>

          {/* Promo Banner */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Promo Banner Text
            </label>
            <input
              type="text"
              value={formData.promoBannerText}
              onChange={(e) => handleInputChange('promoBannerText', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="🚚 Free Shipping | 💳 Easy Returns | 🔒 Secure Checkout"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Shows in bottom purchase section
            </small>
          </div>

          {/* Tax Info */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Tax Information Text
            </label>
            <input
              type="text"
              value={formData.taxText}
              onChange={(e) => handleInputChange('taxText', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="incl. of taxes"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Appears next to price in bottom section
            </small>
          </div>

          {/* Action Buttons Section */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#202223',
            marginBottom: '15px',
            marginTop: '30px'
          }}>
            Action Button Labels
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Size Guide Button
              </label>
              <input
                type="text"
                value={formData.actionButtons.sizeGuide}
                onChange={(e) => handleInputChange('actionButtons.sizeGuide', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Size Guide"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Try On Button
              </label>
              <input
                type="text"
                value={formData.actionButtons.tryOn}
                onChange={(e) => handleInputChange('actionButtons.tryOn', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Try On"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Reviews Button
              </label>
              <input
                type="text"
                value={formData.actionButtons.reviews}
                onChange={(e) => handleInputChange('actionButtons.reviews', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Reviews"
              />
            </div>
          </div>

          {/* WhatsApp Settings */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#202223',
            marginBottom: '15px',
            marginTop: '30px'
          }}>
            WhatsApp Integration
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              WhatsApp Number
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="+919999999999"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>
              Include country code (e.g., +91 for India)
            </small>
          </div>

          {/* Feature Toggles */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#202223',
            marginBottom: '15px',
            marginTop: '30px'
          }}>
            Display Options
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.showNewBadge}
                  onChange={(e) => handleInputChange('showNewBadge', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Show "NEW LAUNCH" Badge
                </span>
              </label>
              <small style={{ color: '#6b7280', fontSize: '12px', marginLeft: '24px' }}>
                Displays on new products
              </small>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.showWhatsAppChat}
                  onChange={(e) => handleInputChange('showWhatsAppChat', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Show WhatsApp Chat Button
                </span>
              </label>
              <small style={{ color: '#6b7280', fontSize: '12px', marginLeft: '24px' }}>
                Floating chat button
              </small>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              💾 Save Configuration
            </button>
            
            <button
              onClick={handlePreview}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              👁️ Preview Page
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#202223',
            marginBottom: '15px'
          }}>
            Current Configuration
          </h3>
          
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            lineHeight: '1.5',
            backgroundColor: '#f9fafb',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Subtitle:</strong> {formData.subtitleText}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Feature:</strong> {formData.featureText}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Promo Banner:</strong> {formData.promoBannerText}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>WhatsApp:</strong> {formData.whatsappNumber}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Tax Text:</strong> {formData.taxText}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Action Buttons:</strong> {formData.actionButtons.sizeGuide}, {formData.actionButtons.tryOn}, {formData.actionButtons.reviews}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Show NEW Badge:</strong> {formData.showNewBadge ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Show WhatsApp Chat:</strong> {formData.showWhatsAppChat ? 'Yes' : 'No'}
            </div>
          </div>

          {/* Mobile Preview */}
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#374151'
            }}>
              📱 Mobile Preview
            </div>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              lineHeight: '1.4'
            }}>
              <div>Product Title</div>
              <div style={{ color: '#10b981' }}>✓ {formData.featureText}</div>
              <div style={{ margin: '8px 0' }}>
                [{formData.actionButtons.sizeGuide}] [{formData.actionButtons.tryOn}] [{formData.actionButtons.reviews}]
              </div>
              <div style={{ 
                backgroundColor: '#1B224B', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '10px',
                margin: '8px 0'
              }}>
                {formData.promoBannerText}
              </div>
              {formData.showWhatsAppChat && (
                <div style={{ 
                  backgroundColor: '#25D366', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontSize: '10px',
                  display: 'inline-block'
                }}>
                  💬 Chat with us
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>💡 Quick Tips:</div>
            <ul style={{ margin: '0', paddingLeft: '16px', lineHeight: '1.4' }}>
              <li>Keep text concise for mobile displays</li>
              <li>Test WhatsApp number before saving</li>
              <li>Use emojis in promo banner for visual appeal</li>
              <li>Preview changes before publishing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 