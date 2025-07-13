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
  Form,
  FormLayout,
  Frame,
  Toast,
  Tabs,
  Badge,
  Divider,
  Thumbnail,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

// Simplified Header Settings Interface
interface HeaderSettings {
  // Basic Settings
  logo_url: string;
  trending_title: string;
  trending_subtitle: string;
  
  // Color Settings
  header_background_color: string;
  nav_text_color: string;
  nav_active_color: string;
  
  // Feature Toggles
  enable_menu_drawer: boolean;
  enable_wishlist_icon: boolean;
  enable_account_icon: boolean;
  enable_cart_icon: boolean;
  enable_offer_button: boolean;
  
  // Offer Button
  offer_button_text: string;
  offer_button_link: string;
}

// Trending Slide Interface
interface TrendingSlide {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  enabled: boolean;
  order: number;
}

export default function HeaderManagement() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
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
  });

  const [trendingSlides, setTrendingSlides] = useState<TrendingSlide[]>([
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
  ]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const tabs = [
    {
      id: 'general',
      content: 'General Settings',
      accessibilityLabel: 'General header settings',
      panelID: 'general-settings-panel',
    },
    {
      id: 'trending',
      content: 'Trending Slider',
      accessibilityLabel: 'Trending slider management',
      panelID: 'trending-slider-panel',
    },
    {
      id: 'colors',
      content: 'Colors & Design',
      accessibilityLabel: 'Colors and design settings',
      panelID: 'colors-settings-panel',
    },
  ];

  const saveHeaderSettings = async () => {
    setLoading(true);
    try {
      const allData = {
        header: headerSettings,
        trending_slides: trendingSlides,
      };

      const response = await fetch('/api/header-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allData),
      });

      if (response.ok) {
        setToastMessage('Header settings and trending slides saved successfully!');
        setShowToast(true);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving header settings:', error);
      setToastMessage('Error saving settings. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadHeaderSettings = async () => {
    try {
      const response = await fetch('/api/header-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.header) {
          setHeaderSettings(data.header);
        }
        if (data.trending_slides) {
          setTrendingSlides(data.trending_slides);
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  useEffect(() => {
    loadHeaderSettings();
  }, []);

  // Trending Slides Management Functions
  const addTrendingSlide = () => {
    const newSlide: TrendingSlide = {
      id: Date.now().toString(),
      title: "New Trending Item",
      image_url: "",
      link_url: "",
      enabled: true,
      order: trendingSlides.length + 1,
    };
    setTrendingSlides([...trendingSlides, newSlide]);
  };

  const updateTrendingSlide = (id: string, field: keyof TrendingSlide, value: any) => {
    setTrendingSlides(slides =>
      slides.map(slide =>
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const deleteTrendingSlide = (id: string) => {
    setTrendingSlides(slides => slides.filter(slide => slide.id !== id));
  };

  const moveSlide = (id: string, direction: 'up' | 'down') => {
    const currentIndex = trendingSlides.findIndex(slide => slide.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === trendingSlides.length - 1)
    ) {
      return;
    }

    const newSlides = [...trendingSlides];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newSlides[currentIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[currentIndex]];
    
    // Update order numbers
    newSlides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    
    setTrendingSlides(newSlides);
  };

  const renderGeneralSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Basic Settings</Text>
          <FormLayout>
            <TextField
              label="Logo Image URL"
              value={headerSettings.logo_url}
              onChange={(value) => setHeaderSettings({...headerSettings, logo_url: value})}
              placeholder="https://example.com/logo.png"
              autoComplete="off"
            />
            <TextField
              label="Trending Title"
              value={headerSettings.trending_title}
              onChange={(value) => setHeaderSettings({...headerSettings, trending_title: value})}
              placeholder="#Trending On"
              autoComplete="off"
            />
            <TextField
              label="Trending Subtitle"
              value={headerSettings.trending_subtitle}
              onChange={(value) => setHeaderSettings({...headerSettings, trending_subtitle: value})}
              placeholder="GoEye"
              autoComplete="off"
            />
          </FormLayout>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Feature Settings</Text>
          <FormLayout>
            <Checkbox
              label="Show Menu Drawer"
              checked={headerSettings.enable_menu_drawer}
              onChange={(checked) => setHeaderSettings({...headerSettings, enable_menu_drawer: checked})}
            />
            <Checkbox
              label="Show Wishlist Icon"
              checked={headerSettings.enable_wishlist_icon}
              onChange={(checked) => setHeaderSettings({...headerSettings, enable_wishlist_icon: checked})}
            />
            <Checkbox
              label="Show Account Icon"
              checked={headerSettings.enable_account_icon}
              onChange={(checked) => setHeaderSettings({...headerSettings, enable_account_icon: checked})}
            />
            <Checkbox
              label="Show Cart Icon"
              checked={headerSettings.enable_cart_icon}
              onChange={(checked) => setHeaderSettings({...headerSettings, enable_cart_icon: checked})}
            />
          </FormLayout>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Offer Button</Text>
          <FormLayout>
            <Checkbox
              label="Enable Offer Button"
              checked={headerSettings.enable_offer_button}
              onChange={(checked) => setHeaderSettings({...headerSettings, enable_offer_button: checked})}
            />
            {headerSettings.enable_offer_button && (
              <>
                <TextField
                  label="Button Text"
                  value={headerSettings.offer_button_text}
                  onChange={(value) => setHeaderSettings({...headerSettings, offer_button_text: value})}
                  placeholder="50% OFF"
                  autoComplete="off"
                />
                <TextField
                  label="Button Link"
                  value={headerSettings.offer_button_link}
                  onChange={(value) => setHeaderSettings({...headerSettings, offer_button_link: value})}
                  placeholder="/collections/sale"
                  autoComplete="off"
                />
              </>
            )}
          </FormLayout>
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderTrendingSlider = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">Trending Slides Management</Text>
            <Button onClick={addTrendingSlide} variant="primary">
              Add New Slide
            </Button>
          </InlineStack>
          <Text variant="bodyMd" tone="subdued" as="p">
            Manage the trending slides displayed in your mobile header. Drag to reorder or use the controls below.
          </Text>
        </BlockStack>
      </Card>

      {trendingSlides.length === 0 ? (
        <Card>
          <BlockStack gap="400" align="center">
            <Text variant="headingMd" as="h3">No Slides Added</Text>
            <Text variant="bodyMd" tone="subdued" as="p">
              Add your first trending slide to get started.
            </Text>
            <Button onClick={addTrendingSlide} variant="primary">
              Add First Slide
            </Button>
          </BlockStack>
        </Card>
      ) : (
        trendingSlides
          .sort((a, b) => a.order - b.order)
          .map((slide, index) => (
            <Card key={slide.id}>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingSm" as="h4">
                    Slide #{slide.order}: {slide.title || 'Untitled'}
                  </Text>
                  <InlineStack gap="200">
                    <Badge tone={slide.enabled ? "success" : "critical"}>
                      {slide.enabled ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="slim"
                      onClick={() => moveSlide(slide.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="slim"
                      onClick={() => moveSlide(slide.id, 'down')}
                      disabled={index === trendingSlides.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      size="slim"
                      tone="critical"
                      onClick={() => deleteTrendingSlide(slide.id)}
                    >
                      Delete
                    </Button>
                  </InlineStack>
                </InlineStack>

                <FormLayout>
                  <InlineStack gap="400">
                    <div style={{ flex: 2 }}>
                      <TextField
                        label="Slide Title"
                        value={slide.title}
                        onChange={(value) => updateTrendingSlide(slide.id, 'title', value)}
                        placeholder="Premium Eyeglasses"
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Checkbox
                        label="Enable this slide"
                        checked={slide.enabled}
                        onChange={(checked) => updateTrendingSlide(slide.id, 'enabled', checked)}
                      />
                    </div>
                  </InlineStack>

                  <TextField
                    label="Image URL"
                    value={slide.image_url}
                    onChange={(value) => updateTrendingSlide(slide.id, 'image_url', value)}
                    placeholder="https://images.unsplash.com/photo-xyz..."
                    autoComplete="off"
                    helpText="Recommended size: 440x540px for best quality"
                  />

                  <TextField
                    label="Link URL"
                    value={slide.link_url}
                    onChange={(value) => updateTrendingSlide(slide.id, 'link_url', value)}
                    placeholder="/collections/eyeglasses"
                    autoComplete="off"
                    helpText="Where users will go when they click this slide"
                  />

                  {slide.image_url && (
                    <Box>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">Preview:</Text>
                      <Box paddingBlockStart="200">
                        <Thumbnail
                          source={slide.image_url}
                          alt={slide.title}
                          size="large"
                        />
                      </Box>
                    </Box>
                  )}
                </FormLayout>
              </BlockStack>
            </Card>
          ))
      )}

      <Card>
        <BlockStack gap="300">
          <Text variant="headingSm" as="h3">Trending Slider Stats</Text>
          <InlineStack gap="400">
            <Text variant="bodyMd" as="p">
              Total Slides: <Text variant="bodyMd" as="span" fontWeight="semibold">{trendingSlides.length}</Text>
            </Text>
            <Text variant="bodyMd" as="p">
              Active Slides: <Text variant="bodyMd" as="span" fontWeight="semibold">{trendingSlides.filter(s => s.enabled).length}</Text>
            </Text>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderColorsSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Header Colors</Text>
          <FormLayout>
            <TextField
              label="Header Background Color"
              value={headerSettings.header_background_color}
              onChange={(value) => setHeaderSettings({...headerSettings, header_background_color: value})}
              placeholder="#FFFFFF"
              autoComplete="off"
            />
            <TextField
              label="Navigation Text Color"
              value={headerSettings.nav_text_color}
              onChange={(value) => setHeaderSettings({...headerSettings, nav_text_color: value})}
              placeholder="#6B7280"
              autoComplete="off"
            />
            <TextField
              label="Active Navigation Color"
              value={headerSettings.nav_active_color}
              onChange={(value) => setHeaderSettings({...headerSettings, nav_active_color: value})}
              placeholder="#1E1B4B"
              autoComplete="off"
            />
          </FormLayout>
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderTrendingSlider();
      case 2:
        return renderColorsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  const toastMarkup = showToast ? (
    <Toast
      content={toastMessage}
      onDismiss={() => setShowToast(false)}
    />
  ) : null;

  return (
    <Frame>
      <Page
        title="Header Management"
        subtitle="Manage your mobile header settings and trending slides"
        primaryAction={{
          content: "Save All Settings",
          loading: loading,
          onAction: saveHeaderSettings,
        }}
      >
        <TitleBar title="Header Management" />
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
              <Box padding="400">
                {renderTabContent()}
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      {toastMarkup}
    </Frame>
  );
} 