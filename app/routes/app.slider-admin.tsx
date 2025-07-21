import { useState } from "react";
import {
  Card,
  Page,
  Layout,
  Button,
  TextField,
  Select,
  Banner,
} from "@shopify/polaris";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Fetch collections from Shopify
    const collectionsResponse = await admin.graphql(`
      query getCollections {
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `);

    // Fetch products from Shopify
    const productsResponse = await admin.graphql(`
      query getProducts {
        products(first: 100) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
    `);

    const collections = await collectionsResponse.json();
    const products = await productsResponse.json();

    return json({
      collections: collections.data?.collections?.edges || [],
      products: products.data?.products?.edges || []
    });

  } catch (error) {
    console.error('Error loading data:', error);
    return json({ 
      collections: [], 
      products: [],
      error: 'Failed to load data'
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    console.log('Slider data saved:', Object.fromEntries(formData));
    return json({ success: true, message: 'Slider updated successfully!' });
  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export default function SliderAdmin() {
  const { collections, products } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [sliderData, setSliderData] = useState({
    collection: 'classic',
    badge: '9 to 5',
    title: 'Sleek',
    subtitle: 'Designed to Turn Heads',
    description: 'Blast of colors, Style, trends',
    background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
    image: 'https://images.unsplash.com/photo-1559087867-ce4c91325525?w=1200&h=800&fit=crop',
    ctaText1: 'Shop Collection',
    ctaLink1: 'classic-eyewear',
    ctaType1: 'collection',
    ctaText2: 'View Details',
    ctaLink2: 'eyejack-black-square-polarized-sunglasses-for-men-women-1905pcl2072',
    ctaType2: 'product'
  });

  const collectionOptions = [
    { label: 'Classic Collection', value: 'classic' },
    { label: 'Premium Collection', value: 'premium' },
    { label: 'Sport Collection', value: 'sport' },
    ...collections.map((col: any) => ({
      label: col.node.title,
      value: col.node.handle
    }))
  ];

  const productOptions = products.map((prod: any) => ({
    label: prod.node.title,
    value: prod.node.handle
  }));

  const backgroundOptions = [
    { label: 'Blue Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { label: 'Orange Gradient', value: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)' },
    { label: 'Green Gradient', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { label: 'Purple Gradient', value: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)' },
    { label: 'Gold Gradient', value: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)' },
  ];

  const handleSave = () => {
    const formData = new FormData();
    Object.entries(sliderData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('action', 'save');
    
    submit(formData, { method: 'post' });
  };

  const handlePreview = () => {
    window.open('/pages/classic-collection.html', '_blank');
  };

  return (
    <Page 
      title="Slider Manager" 
      subtitle="Manage Classic Collection slider content"
      primaryAction={{
        content: 'Save Changes',
        onAction: handleSave,
      }}
      secondaryActions={[
        {
          content: 'Preview Slider',
          onAction: handlePreview,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Banner title="Slider Management">
            <p>Create and manage beautiful sliders for your navigation tabs. Each slide can link to collections or specific products.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <h3 style={{ marginBottom: '16px' }}>Slide Content</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Select
                    label="Collection"
                    options={collectionOptions}
                    value={sliderData.collection}
                    onChange={(value) => setSliderData(prev => ({ ...prev, collection: value }))}
                  />
                  
                  <TextField
                    label="Badge Text"
                    value={sliderData.badge}
                    onChange={(value) => setSliderData(prev => ({ ...prev, badge: value }))}
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <TextField
                    label="Title"
                    value={sliderData.title}
                    onChange={(value) => setSliderData(prev => ({ ...prev, title: value }))}
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Subtitle"
                    value={sliderData.subtitle}
                    onChange={(value) => setSliderData(prev => ({ ...prev, subtitle: value }))}
                    autoComplete="off"
                  />
                </div>

                <TextField
                  label="Description"
                  value={sliderData.description}
                  onChange={(value) => setSliderData(prev => ({ ...prev, description: value }))}
                  multiline={3}
                  autoComplete="off"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Select
                    label="Background"
                    options={backgroundOptions}
                    value={sliderData.background}
                    onChange={(value) => setSliderData(prev => ({ ...prev, background: value }))}
                  />
                  
                  <TextField
                    label="Image URL"
                    value={sliderData.image}
                    onChange={(value) => setSliderData(prev => ({ ...prev, image: value }))}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <h3 style={{ marginBottom: '16px' }}>CTA Buttons</h3>
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* First CTA Button */}
              <div style={{ padding: '16px', border: '1px solid #e1e1e1', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '16px' }}>Primary Button</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <TextField
                    label="Button Text"
                    value={sliderData.ctaText1}
                    onChange={(value) => setSliderData(prev => ({ ...prev, ctaText1: value }))}
                    autoComplete="off"
                  />
                  
                  <Select
                    label="Link Type"
                    options={[
                      { label: 'Collection', value: 'collection' },
                      { label: 'Product', value: 'product' }
                    ]}
                    value={sliderData.ctaType1}
                    onChange={(value) => setSliderData(prev => ({ ...prev, ctaType1: value }))}
                  />
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <Select
                    label={sliderData.ctaType1 === 'collection' ? 'Collection' : 'Product'}
                    options={sliderData.ctaType1 === 'collection' ? collectionOptions : productOptions}
                    value={sliderData.ctaLink1}
                    onChange={(value) => setSliderData(prev => ({ ...prev, ctaLink1: value }))}
                  />
                </div>
              </div>

              {/* Second CTA Button */}
              <div style={{ padding: '16px', border: '1px solid #e1e1e1', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '16px' }}>Secondary Button</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <TextField
                    label="Button Text"
                    value={sliderData.ctaText2}
                    onChange={(value) => setSliderData(prev => ({ ...prev, ctaText2: value }))}
                    autoComplete="off"
                  />
                  
                  <Select
                    label="Link Type"
                    options={[
                      { label: 'Collection', value: 'collection' },
                      { label: 'Product', value: 'product' }
                    ]}
                    value={sliderData.ctaType2}
                    onChange={(value) => setSliderData(prev => ({ ...prev, ctaType2: value }))}
                  />
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <Select
                    label={sliderData.ctaType2 === 'collection' ? 'Collection' : 'Product'}
                    options={sliderData.ctaType2 === 'collection' ? collectionOptions : productOptions}
                    value={sliderData.ctaLink2}
                    onChange={(value) => setSliderData(prev => ({ ...prev, ctaLink2: value }))}
                  />
                </div>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <h3 style={{ marginBottom: '16px' }}>Preview</h3>
              <div style={{ 
                padding: '40px', 
                background: sliderData.background,
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 20px',
                borderRadius: '25px',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                {sliderData.badge}
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{sliderData.title}</h1>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', opacity: 0.9 }}>{sliderData.subtitle}</h2>
              <p style={{ marginBottom: '30px', opacity: 0.8 }}>{sliderData.description}</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {sliderData.ctaText1}
                </button>
                <button style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {sliderData.ctaText2}
                </button>
                                </div>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  } 