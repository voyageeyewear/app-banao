import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const config = await db.newDropsConfig.findFirst();
  const slides = await db.newDropsSlide.findMany({
    orderBy: { order: 'asc' }
  });

  return json({ config, slides });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "saveConfig") {
      const title = formData.get("title") as string;
      const subtitle = formData.get("subtitle") as string;
      const enabled = formData.get("enabled") === "true";
      const slideInterval = parseInt(formData.get("slideInterval") as string) || 3;

             await db.newDropsConfig.upsert({
         where: { id: 1 },
         update: { title, subtitle, enabled, slide_interval: slideInterval },
         create: { id: 1, title, subtitle, enabled, slide_interval: slideInterval }
       });

      return json({ success: true, message: "Configuration saved successfully!" });
    }

         if (action === "saveSlide") {
       const id = formData.get("id") as string;
       const slide_heading = formData.get("title") as string;
       const slide_subheading = formData.get("subtitle") as string;
       const button_text = formData.get("buttonText") as string;
       const slide_link = formData.get("link") as string;
       const slide_image = formData.get("imageUrl") as string;
       const order = parseInt(formData.get("order") as string) || 0;
       
       const logo_1 = formData.get("logo1Url") as string;
       const logo_1_position = formData.get("logo1Position") as string;
       const logo_1_size = parseInt(formData.get("logo1Size") as string) || 50;
       
       const logo_2 = formData.get("logo2Url") as string;
       const logo_2_position = formData.get("logo2Position") as string;
       const logo_2_size = parseInt(formData.get("logo2Size") as string) || 50;
       
       const logo_3 = formData.get("logo3Url") as string;
       const logo_3_position = formData.get("logo3Position") as string;
       const logo_3_size = parseInt(formData.get("logo3Size") as string) || 50;

       const slideData = {
         slide_heading, slide_subheading, button_text, slide_link, slide_image, order,
         logo_1, logo_1_position, logo_1_size,
         logo_2, logo_2_position, logo_2_size,
         logo_3, logo_3_position, logo_3_size
       };

      if (id && id !== "new") {
        await db.newDropsSlide.update({
          where: { id: parseInt(id) },
          data: slideData
        });
      } else {
        await db.newDropsSlide.create({
          data: slideData
        });
      }

      return json({ success: true, message: "Slide saved successfully!" });
    }

    if (action === "deleteSlide") {
      const id = formData.get("id") as string;
      await db.newDropsSlide.delete({
        where: { id: parseInt(id) }
      });
      return json({ success: true, message: "Slide deleted successfully!" });
    }

  } catch (error) {
    console.error("New Drops action error:", error);
    return json({ success: false, message: "An error occurred" }, { status: 500 });
  }

  return json({ success: false, message: "Invalid action" }, { status: 400 });
};

export default function NewDropsAdmin() {
  const { config, slides } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#2d3748',
            margin: '0 0 10px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎯 New Drops Banner Management
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#718096',
            margin: '0',
            lineHeight: '1.6'
          }}>
            Create and manage dynamic banner slides with multi-logo overlays and rich content
          </p>
        </div>

        {/* Success/Error Messages */}
        {actionData?.message && (
          <div style={{
            background: actionData.success 
              ? 'linear-gradient(135deg, #48bb78, #38a169)' 
              : 'linear-gradient(135deg, #f56565, #e53e3e)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: `2px solid ${actionData.success ? '#48bb78' : '#f56565'}`
          }}>
            {actionData.success ? '✅' : '❌'} {actionData.message}
          </div>
        )}

        {/* Configuration Section */}
        <div style={{
          background: 'linear-gradient(135deg, #4299e1, #3182ce)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(66, 153, 225, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ⚙️ Banner Configuration
          </h2>
          
          <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="hidden" name="action" value="saveConfig" />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Section Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={config?.title || "New Drops"}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Section Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={config?.subtitle || "Fresh collections every 15 days"}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Slide Interval (seconds)
                </label>
                <select
                  name="slideInterval"
                                     defaultValue={config?.slide_interval || 3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  {[2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} seconds</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  Section Status
                </label>
                <select
                  name="enabled"
                  defaultValue={config?.enabled !== false ? "true" : "false"}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="true">✅ Enabled</option>
                  <option value="false">❌ Disabled</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #48bb78, #38a169)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 10px 25px rgba(72, 187, 120, 0.3)',
                alignSelf: 'flex-start'
              }}
              onMouseOver={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
            >
              {isSubmitting ? '💾 Saving...' : '💾 Save Configuration'}
            </button>
          </Form>
        </div>

        {/* Slides Management Section */}
        <div style={{
          background: 'linear-gradient(135deg, #48bb78, #38a169)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(72, 187, 120, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🖼️ Banner Slides ({slides.length})
          </h2>

          {slides.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
              <p style={{ fontSize: '18px', margin: '0 0 20px' }}>No banner slides created yet</p>
              <p style={{ fontSize: '14px', opacity: '0.8', margin: '0' }}>Create your first slide to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {slides.map((slide, index) => (
                <div key={slide.id} style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    display: 'inline-block'
                  }}>
                    SLIDE #{index + 1}
                  </div>
                  
                                     {slide.slide_image && (
                     <img 
                       src={slide.slide_image} 
                       alt={slide.slide_heading}
                       style={{
                         width: '100%',
                         height: '150px',
                         objectFit: 'cover',
                         borderRadius: '8px',
                         marginBottom: '12px'
                       }}
                     />
                   )}
                   
                   <h4 style={{ margin: '0 0 8px', color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>
                     {slide.slide_heading || 'Untitled Slide'}
                   </h4>
                   
                   {slide.slide_subheading && (
                     <p style={{ margin: '0 0 12px', color: '#718096', fontSize: '14px', lineHeight: '1.4' }}>
                       {slide.slide_subheading}
                     </p>
                   )}
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={() => {
                        const slideData = {
                          id: slide.id,
                          title: slide.title,
                          subtitle: slide.subtitle,
                          buttonText: slide.buttonText,
                          link: slide.link,
                          imageUrl: slide.imageUrl,
                          order: slide.order,
                          logo1Url: slide.logo1Url,
                          logo1Position: slide.logo1Position,
                          logo1Size: slide.logo1Size,
                          logo2Url: slide.logo2Url,
                          logo2Position: slide.logo2Position,
                          logo2Size: slide.logo2Size,
                          logo3Url: slide.logo3Url,
                          logo3Position: slide.logo3Position,
                          logo3Size: slide.logo3Size
                        };
                        (window as any).editSlide = slideData;
                        document.getElementById('slideForm')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #4299e1, #3182ce)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      ✏️ Edit
                    </button>
                    
                    <Form method="post" style={{ flex: 1 }}>
                      <input type="hidden" name="action" value="deleteSlide" />
                      <input type="hidden" name="id" value={slide.id} />
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #f56565, #e53e3e)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        onClick={(e) => !confirm('Are you sure you want to delete this slide?') && e.preventDefault()}
                      >
                        🗑️ Delete
                      </button>
                    </Form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Slide Form */}
        <div id="slideForm" style={{
          background: 'linear-gradient(135deg, #ed8936, #dd6b20)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(237, 137, 54, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ➕ Add New Slide
          </h2>
          
          <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <input type="hidden" name="action" value="saveSlide" />
            <input type="hidden" name="id" value="new" id="slideId" />
            
            {/* Basic Slide Info */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: 'white', margin: '0 0 16px', fontSize: '18px' }}>📝 Slide Content</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                    Slide Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="slideTitle"
                    placeholder="Enter slide title"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    id="slideSubtitle"
                    placeholder="Enter subtitle"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    id="slideButtonText"
                    placeholder="Shop Now"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                    Link URL
                  </label>
                  <input
                    type="url"
                    name="link"
                    id="slideLink"
                    placeholder="https://example.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="slideImageUrl"
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    id="slideOrder"
                    defaultValue={slides.length + 1}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Logo Configuration */}
            {[1, 2, 3].map(logoNum => (
              <div key={logoNum} style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ color: 'white', margin: '0 0 16px', fontSize: '18px' }}>
                  🏷️ Logo {logoNum} Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                      Logo {logoNum} URL
                    </label>
                    <input
                      type="url"
                      name={`logo${logoNum}Url`}
                      id={`logo${logoNum}Url`}
                      placeholder={`https://example.com/logo${logoNum}.png`}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.9)',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                      Position
                    </label>
                    <select
                      name={`logo${logoNum}Position`}
                      id={`logo${logoNum}Position`}
                      defaultValue={logoNum === 1 ? "top-left" : logoNum === 2 ? "top-center" : "top-right"}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.9)',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '6px', fontSize: '14px' }}>
                      Size (px)
                    </label>
                    <select
                      name={`logo${logoNum}Size`}
                      id={`logo${logoNum}Size`}
                      defaultValue="50"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.9)',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    >
                      {[30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(size => (
                        <option key={size} value={size}>{size}px</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #48bb78, #38a169)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 10px 25px rgba(72, 187, 120, 0.3)'
                }}
                onMouseOver={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
              >
                {isSubmitting ? '💾 Saving...' : '💾 Save Slide'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Reset form
                  const form = document.querySelector('#slideForm form') as HTMLFormElement;
                  form.reset();
                  (document.getElementById('slideId') as HTMLInputElement).value = 'new';
                  (document.getElementById('slideOrder') as HTMLInputElement).value = String(slides.length + 1);
                }}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #718096, #4a5568)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 10px 25px rgba(113, 128, 150, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔄 Reset Form
              </button>
            </div>
          </Form>
        </div>

        {/* Live Preview Section */}
        <div style={{
          background: 'linear-gradient(135deg, #805ad5, #6b46c1)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 40px rgba(128, 90, 213, 0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📱 Live Preview & Status
          </h2>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: config?.enabled !== false ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              border: `2px solid ${config?.enabled !== false ? 'rgba(72, 187, 120, 0.5)' : 'rgba(245, 101, 101, 0.5)'}`
            }}>
              {config?.enabled !== false ? '🟢 LIVE' : '🔴 DISABLED'}
              <span style={{ opacity: '0.8' }}>
                {config?.enabled !== false ? 'Section is live in mobile app' : 'Section is disabled'}
              </span>
            </div>
            
            <p style={{ color: 'white', margin: '0 0 16px', opacity: '0.9' }}>
              API Endpoint: <code style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '14px'
              }}>/api/live-new-drops</code>
            </p>
            
            <p style={{ color: 'white', margin: '0', opacity: '0.8', fontSize: '14px' }}>
              Changes appear in mobile app within 15 seconds • Auto-refresh enabled
            </p>
          </div>
        </div>
      </div>
      
      {/* Edit Slide JavaScript */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('load', function() {
            if (window.editSlide) {
              const slide = window.editSlide;
              document.getElementById('slideId').value = slide.id;
              document.getElementById('slideTitle').value = slide.title || '';
              document.getElementById('slideSubtitle').value = slide.subtitle || '';
              document.getElementById('slideButtonText').value = slide.buttonText || '';
              document.getElementById('slideLink').value = slide.link || '';
              document.getElementById('slideImageUrl').value = slide.imageUrl || '';
              document.getElementById('slideOrder').value = slide.order || 1;
              
              // Logo fields
              for (let i = 1; i <= 3; i++) {
                document.getElementById('logo' + i + 'Url').value = slide['logo' + i + 'Url'] || '';
                document.getElementById('logo' + i + 'Position').value = slide['logo' + i + 'Position'] || (i === 1 ? 'top-left' : i === 2 ? 'top-center' : 'top-right');
                document.getElementById('logo' + i + 'Size').value = slide['logo' + i + 'Size'] || 50;
              }
              
              delete window.editSlide;
            }
          });
        `
      }} />
    </div>
  );
} 