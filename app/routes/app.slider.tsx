import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  TextField,
  Select,
  Checkbox,
  Banner,
  Modal,
  Form,
  FormLayout,
  Frame,
  Toast,
  Tabs,
  Badge,
  EmptyState,
  Thumbnail,
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ImageIcon, DeleteIcon, EditIcon, ViewIcon } from "@shopify/polaris-icons";

interface SlideData {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
}

const defaultSlides: SlideData[] = [
  {
    id: '1',
    title: 'Welcome to GoEye Store',
    description: 'Premium Eyewear Collection - Discover the perfect frames for your style',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=400&fit=crop',
    buttonText: 'Shop Now',
    buttonUrl: '/products'
  },
  {
    id: '2',
    title: 'Featured Products',
    description: 'Explore our latest collection of designer eyewear and sunglasses',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=400&fit=crop',
    buttonText: 'View Collection',
    buttonUrl: '/collections/featured'
  },
  {
    id: '3',
    title: 'Summer Sale',
    description: 'Get up to 50% off on selected sunglasses. Limited time offer!',
    image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=400&fit=crop',
    buttonText: 'Shop Sale',
    buttonUrl: '/collections/sale'
  }
];

export default function SliderPage() {
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [sliderEnabled, setSliderEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState('5000');
  const [showArrows, setShowArrows] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);

  // Load saved settings on component mount
  useEffect(() => {
    loadSliderSettings();
  }, []);

  // Auto-rotate preview
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const loadSliderSettings = async () => {
    try {
      // Load from database instead of localStorage
      const response = await fetch('/api/mobile-slider');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSlides(data.data.slides || []);
          setSliderEnabled(data.data.enabled ?? true);
          setAutoPlay(data.data.settings?.autoPlay ?? true);
          setAutoPlaySpeed(data.data.settings?.autoPlaySpeed?.toString() ?? '5000');
          setShowArrows(data.data.settings?.showArrows ?? true);
          setShowDots(data.data.settings?.showDots ?? true);
          console.log('✅ Loaded slider settings from database');
        }
      } else {
        console.log('⚠️ Could not load from database, using defaults');
      }
    } catch (error) {
      console.error('Error loading slider settings:', error);
    }
  };

  const saveSliderSettings = async () => {
    try {
      // Prepare slider data
      const sliderData = {
        enabled: sliderEnabled,
        slides: slides,
        settings: {
          autoPlay,
          autoPlaySpeed,
          showArrows,
          showDots
        }
      };

      // Save to database
      const response = await fetch('/api/slider/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sliderData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setToastContent('✨ Slider settings saved! Run "./build-apk.sh" to create APK with your changes.');
        console.log('🔄 Slider settings saved to database successfully');
      } else {
        throw new Error(data.error || 'Failed to save to database');
      }
      
      setShowToast(true);
      
    } catch (error) {
      console.error('Error saving slider settings:', error);
      setToastContent(`Error saving slider settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowToast(true);
    }
  };

  const addNewSlide = () => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      title: 'New Slide',
      description: 'Enter your slide description here',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=400&fit=crop',
      buttonText: 'Learn More',
      buttonUrl: '/'
    };
    setEditingSlide(newSlide);
    setShowEditModal(true);
  };

  const editSlide = (slide: SlideData) => {
    setEditingSlide({ ...slide });
    setShowEditModal(true);
  };

  const deleteSlide = (id: string) => {
    setSlides(slides.filter(slide => slide.id !== id));
    
    // Update timestamp for dynamic updates
    const timestamp = Date.now().toString();
    localStorage.setItem('goeye_slider_last_update', timestamp);
    console.log('🗑️ Slide deleted, timestamp updated:', timestamp);
  };

  const saveSlide = () => {
    if (!editingSlide) return;

    if (slides.find(s => s.id === editingSlide.id)) {
      // Update existing slide
      setSlides(slides.map(s => s.id === editingSlide.id ? editingSlide : s));
    } else {
      // Add new slide
      setSlides([...slides, editingSlide]);
    }

    setShowEditModal(false);
    setEditingSlide(null);
  };

  const tabs = [
    {
      id: 'slides',
      content: 'Slides Management',
      accessibilityLabel: 'Manage slider slides',
    },
    {
      id: 'settings',
      content: 'Slider Settings',
      accessibilityLabel: 'Configure slider settings',
    },
    {
      id: 'preview',
      content: 'Preview',
      accessibilityLabel: 'Preview slider',
    },
  ];

  const speedOptions = [
    { label: '2 seconds', value: '2000' },
    { label: '3 seconds', value: '3000' },
    { label: '4 seconds', value: '4000' },
    { label: '5 seconds', value: '5000' },
    { label: '6 seconds', value: '6000' },
    { label: '8 seconds', value: '8000' },
    { label: '10 seconds', value: '10000' },
  ];

  const renderSlidesTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Slider Slides ({slides.length})
              </Text>
              <Button variant="primary" onClick={addNewSlide}>
                Add New Slide
              </Button>
            </InlineStack>

            {slides.length === 0 ? (
              <EmptyState
                heading="No slides yet"
                action={{
                  content: 'Add your first slide',
                  onAction: addNewSlide,
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create engaging slider content for your mobile app</p>
              </EmptyState>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {slides.map((slide, index) => (
                  <Card key={slide.id}>
                    <InlineStack gap="400" align="space-between">
                      <InlineStack gap="400">
                        <Thumbnail
                          source={slide.image}
                          alt={slide.title}
                          size="small"
                        />
                        <BlockStack gap="100">
                          <Text as="h3" variant="headingSm">
                            {slide.title}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {slide.description.length > 60 
                              ? slide.description.substring(0, 60) + '...'
                              : slide.description
                            }
                          </Text>
                          <Badge>{`Slide ${index + 1}`}</Badge>
                        </BlockStack>
                      </InlineStack>
                      <InlineStack gap="200">
                        <Button
                          icon={EditIcon}
                          onClick={() => editSlide(slide)}
                        >
                          Edit
                        </Button>
                        <Button
                          icon={DeleteIcon}
                          tone="critical"
                          onClick={() => deleteSlide(slide.id)}
                          disabled={slides.length <= 1}
                        >
                          Delete
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  </Card>
                ))}
              </div>
            )}
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderSettingsTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="500">
            <Text as="h2" variant="headingMd">
              Slider Configuration
            </Text>

            <Checkbox
              label="Enable slider in mobile app"
              checked={sliderEnabled}
              onChange={setSliderEnabled}
              helpText="Toggle to show/hide the slider in your mobile app"
            />

            <Checkbox
              label="Auto-play slides"
              checked={autoPlay}
              onChange={setAutoPlay}
              helpText="Automatically transition between slides"
            />

            <Select
              label="Auto-play speed"
              options={speedOptions}
              onChange={setAutoPlaySpeed}
              value={autoPlaySpeed}
              disabled={!autoPlay}
              helpText="How long each slide is displayed"
            />

            <Checkbox
              label="Show navigation arrows"
              checked={showArrows}
              onChange={setShowArrows}
              helpText="Display left/right arrow buttons"
            />

            <Checkbox
              label="Show dots indicator"
              checked={showDots}
              onChange={setShowDots}
              helpText="Display dots to indicate current slide"
            />

                         <InlineStack gap="200">
               <Button variant="primary" onClick={saveSliderSettings}>
                 Save Settings
               </Button>
               <Button onClick={loadSliderSettings}>
                 Reset to Saved
               </Button>
             </InlineStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderPreviewTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Mobile App Preview
            </Text>
            
            {!sliderEnabled && (
              <Banner tone="info">
                Slider is currently disabled. Enable it in the Settings tab to see the preview.
              </Banner>
            )}

            <div style={{
              maxWidth: '350px',
              margin: '0 auto',
              background: '#000',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: sliderEnabled ? 'transparent' : '#f0f0f0'
              }}>
                {sliderEnabled && slides.length > 0 ? (
                  <>
                    <img
                      src={slides[previewIndex]?.image}
                      alt={slides[previewIndex]?.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      color: 'white',
                      padding: '20px 15px 15px',
                    }}>
                                             <Text as="h3" variant="headingSm" tone="base">
                         {slides[previewIndex]?.title}
                       </Text>
                       <Text as="p" variant="bodySm" tone="base">
                         {slides[previewIndex]?.description}
                       </Text>
                    </div>
                    {showDots && slides.length > 1 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '6px'
                      }}>
                        {slides.map((_, index) => (
                          <div
                            key={index}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: index === previewIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                              cursor: 'pointer'
                            }}
                            onClick={() => setPreviewIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#666'
                  }}>
                                         <Text as="p" variant="bodySm">
                       {sliderEnabled ? 'No slides configured' : 'Slider disabled'}
                     </Text>
                  </div>
                )}
              </div>
            </div>

                         <Text as="p" variant="bodySm" tone="subdued" alignment="center">
               This is how the slider will appear in your mobile app
             </Text>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  return (
    <Frame>
      <Page>
        <TitleBar title="Slider Management" />
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                <Box paddingBlockStart="400">
                  {selectedTab === 0 && renderSlidesTab()}
                  {selectedTab === 1 && renderSettingsTab()}
                  {selectedTab === 2 && renderPreviewTab()}
                </Box>
              </Tabs>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Edit Slide Modal */}
        <Modal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={editingSlide?.id && slides.find(s => s.id === editingSlide.id) ? "Edit Slide" : "Add New Slide"}
          primaryAction={{
            content: 'Save',
            onAction: saveSlide,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowEditModal(false),
            },
          ]}
        >
          <Modal.Section>
            {editingSlide && (
              <FormLayout>
                <TextField
                  label="Slide Title"
                  value={editingSlide.title}
                  onChange={(value) => setEditingSlide({...editingSlide, title: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Description"
                  value={editingSlide.description}
                  onChange={(value) => setEditingSlide({...editingSlide, description: value})}
                  multiline={3}
                  autoComplete="off"
                />
                <TextField
                  label="Image URL"
                  value={editingSlide.image}
                  onChange={(value) => setEditingSlide({...editingSlide, image: value})}
                  autoComplete="off"
                  helpText="Enter a direct link to an image (JPG, PNG, WebP)"
                />
                <TextField
                  label="Button Text"
                  value={editingSlide.buttonText}
                  onChange={(value) => setEditingSlide({...editingSlide, buttonText: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Button URL"
                  value={editingSlide.buttonUrl}
                  onChange={(value) => setEditingSlide({...editingSlide, buttonUrl: value})}
                  autoComplete="off"
                  helpText="Where users go when they tap the button (e.g., /products, /collections/featured)"
                />
              </FormLayout>
            )}
          </Modal.Section>
        </Modal>

        {/* Toast notification */}
        {showToast && (
          <Toast
            content={toastContent}
            onDismiss={() => setShowToast(false)}
          />
        )}
      </Page>
    </Frame>
  );
} 