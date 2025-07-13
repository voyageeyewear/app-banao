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
  Divider,
  Grid,
  ColorPicker,
  RangeSlider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ImageIcon, DeleteIcon, EditIcon, ViewIcon, SearchIcon, MenuIcon, CartIcon, ColorIcon } from "@shopify/polaris-icons";

// Header Settings Interface based on Liquid Template
interface HeaderSettings {
  // Trending Section
  trending_title: string;
  trending_subtitle: string;
  trending_background: string;
  
  // Logo Settings
  logo_url: string;
  logo_width: number;
  logo_height: number;
  
  // Color Settings
  header_background_color: string;
  nav_background_color: string;
  nav_text_color: string;
  nav_active_color: string;
  nav_hover_color: string;
  nav_indicator_color: string;
  
  // Icon Settings
  enable_menu_drawer: boolean;
  enable_wishlist_icon: boolean;
  enable_account_icon: boolean;
  enable_cart_icon: boolean;
  icon_color: string;
  icon_hover_color: string;
  
  // Drawer Settings
  drawer_background_color: string;
  drawer_text_color: string;
  drawer_border_color: string;
  cart_count_background: string;
  
  // Offer Button Settings
  enable_offer_button: boolean;
  offer_button_text: string;
  offer_button_link: string;
  enable_pulse_effect: boolean;
  offer_button_color: string;
  offer_button_color_end: string;
}

interface TrendingSlide {
  id: string;
  title: string;
  link: string;
  media_type: 'image' | 'video';
  image_url: string;
  video_url: string;
  video_thumbnail_url: string;
}

interface NavigationTab {
  id: string;
  title: string;
  link_type: 'collection' | 'product';
  collection_id: string;
  product_id: string;
  show_indicator: boolean;
}

interface DrawerMenuItem {
  id: string;
  title: string;
  link: string;
  icon: string;
}

interface DrawerOffer {
  id: string;
  offer_image_url: string;
  offer_title: string;
  offer_subtitle: string;
  offer_link: string;
}

export default function HeaderManagement() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    // Trending Section
    trending_title: "#Trending On",
    trending_subtitle: "GoEye",
    trending_background: "#f8f9fa",
    
    // Logo Settings
    logo_url: "",
    logo_width: 50,
    logo_height: 50,
    
    // Color Settings
    header_background_color: "#FFFFFF",
    nav_background_color: "#FFFFFF",
    nav_text_color: "#6B7280",
    nav_active_color: "#1E1B4B",
    nav_hover_color: "#1E1B4B",
    nav_indicator_color: "#F97316",
    
    // Icon Settings
    enable_menu_drawer: true,
    enable_wishlist_icon: true,
    enable_account_icon: true,
    enable_cart_icon: true,
    icon_color: "#000000",
    icon_hover_color: "#1E1B4B",
    
    // Drawer Settings
    drawer_background_color: "#FFFFFF",
    drawer_text_color: "#1f2937",
    drawer_border_color: "#e5e7eb",
    cart_count_background: "#EF4444",
    
    // Offer Button Settings
    enable_offer_button: true,
    offer_button_text: "50% OFF",
    offer_button_link: "",
    enable_pulse_effect: true,
    offer_button_color: "#FF6B6B",
    offer_button_color_end: "#FF8E8E",
  });

  const [trendingSlides, setTrendingSlides] = useState<TrendingSlide[]>([
    {
      id: "1",
      title: "Premium Eyeglasses",
      link: "",
      media_type: "image",
      image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=440&h=540&fit=crop",
      video_url: "",
      video_thumbnail_url: "",
    },
    {
      id: "2", 
      title: "Blue Light Blockers",
      link: "",
      media_type: "image",
      image_url: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=440&h=540&fit=crop",
      video_url: "",
      video_thumbnail_url: "",
    },
  ]);

  const [navigationTabs, setNavigationTabs] = useState<NavigationTab[]>([
    {
      id: "1",
      title: "All",
      link_type: "collection",
      collection_id: "",
      product_id: "",
      show_indicator: false,
    },
    {
      id: "2",
      title: "Classic",
      link_type: "collection", 
      collection_id: "",
      product_id: "",
      show_indicator: true,
    },
    {
      id: "3",
      title: "Premium",
      link_type: "collection",
      collection_id: "",
      product_id: "",
      show_indicator: false,
    },
  ]);

  const [drawerMenuItems, setDrawerMenuItems] = useState<DrawerMenuItem[]>([
    {
      id: "1",
      title: "Home",
      link: "/",
      icon: "🏠",
    },
    {
      id: "2",
      title: "Collections",
      link: "/collections",
      icon: "👓",
    },
  ]);

  const [drawerOffers, setDrawerOffers] = useState<DrawerOffer[]>([
    {
      id: "1",
      offer_image_url: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=560&h=280&fit=crop",
      offer_title: "Special Offer",
      offer_subtitle: "Up to 50% off",
      offer_link: "",
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
      content: 'Trending Section',
      accessibilityLabel: 'Trending section settings',
      panelID: 'trending-settings-panel',
    },
    {
      id: 'navigation',
      content: 'Navigation Tabs',
      accessibilityLabel: 'Navigation tabs settings',
      panelID: 'navigation-settings-panel',
    },
    {
      id: 'drawer',
      content: 'Menu Drawer',
      accessibilityLabel: 'Menu drawer settings',
      panelID: 'drawer-settings-panel',
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
      const allSettings = {
        header: headerSettings,
        trending_slides: trendingSlides,
        navigation_tabs: navigationTabs,
        drawer_menu_items: drawerMenuItems,
        drawer_offers: drawerOffers,
      };

      const response = await fetch('/api/header-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allSettings),
      });

      if (response.ok) {
        setToastMessage('Header settings saved successfully!');
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
        if (data.header) setHeaderSettings(data.header);
        if (data.trending_slides) setTrendingSlides(data.trending_slides);
        if (data.navigation_tabs) setNavigationTabs(data.navigation_tabs);
        if (data.drawer_menu_items) setDrawerMenuItems(data.drawer_menu_items);
        if (data.drawer_offers) setDrawerOffers(data.drawer_offers);
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  useEffect(() => {
    loadHeaderSettings();
  }, []);

  const addTrendingSlide = () => {
    const newSlide: TrendingSlide = {
      id: Date.now().toString(),
      title: "New Slide",
      link: "",
      media_type: "image",
      image_url: "",
      video_url: "",
      video_thumbnail_url: "",
    };
    setTrendingSlides([...trendingSlides, newSlide]);
  };

  const addNavigationTab = () => {
    const newTab: NavigationTab = {
      id: Date.now().toString(),
      title: "New Tab",
      link_type: "collection",
      collection_id: "",
      product_id: "",
      show_indicator: false,
    };
    setNavigationTabs([...navigationTabs, newTab]);
  };

  const addDrawerMenuItem = () => {
    const newItem: DrawerMenuItem = {
      id: Date.now().toString(),
      title: "New Menu Item",
      link: "",
      icon: "📱",
    };
    setDrawerMenuItems([...drawerMenuItems, newItem]);
  };

  const addDrawerOffer = () => {
    const newOffer: DrawerOffer = {
      id: Date.now().toString(),
      offer_image_url: "",
      offer_title: "New Offer",
      offer_subtitle: "Limited time",
      offer_link: "",
    };
    setDrawerOffers([...drawerOffers, newOffer]);
  };

  const renderGeneralSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Logo Settings</Text>
          <TextField
            label="Logo Image URL"
            value={headerSettings.logo_url}
            onChange={(value) => setHeaderSettings({...headerSettings, logo_url: value})}
            placeholder="https://example.com/logo.png"
            autoComplete="off"
          />
          <InlineStack gap="400">
            <div style={{flex: 1}}>
              <RangeSlider
                label={`Logo Width: ${headerSettings.logo_width}px`}
                value={headerSettings.logo_width}
                min={20}
                max={200}
                onChange={(value) => setHeaderSettings({...headerSettings, logo_width: typeof value === 'number' ? value : value[0]})}
              />
            </div>
            <div style={{flex: 1}}>
              <RangeSlider
                label={`Logo Height: ${headerSettings.logo_height}px`}
                value={headerSettings.logo_height}
                min={20}
                max={100}
                onChange={(value) => setHeaderSettings({...headerSettings, logo_height: typeof value === 'number' ? value : value[0]})}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Icon Settings</Text>
          <InlineStack gap="400">
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
          </InlineStack>
          <InlineStack gap="400">
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
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Offer Button</Text>
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
              <Checkbox
                label="Enable Pulse Animation"
                checked={headerSettings.enable_pulse_effect}
                onChange={(checked) => setHeaderSettings({...headerSettings, enable_pulse_effect: checked})}
              />
            </>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderTrendingSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Trending Section Settings</Text>
          <TextField
            label="Main Title"
            value={headerSettings.trending_title}
            onChange={(value) => setHeaderSettings({...headerSettings, trending_title: value})}
            placeholder="#Trending On"
          />
          <TextField
            label="Subtitle"
            value={headerSettings.trending_subtitle}
            onChange={(value) => setHeaderSettings({...headerSettings, trending_subtitle: value})}
            placeholder="GoEye"
          />
          <TextField
            label="Background Color"
            value={headerSettings.trending_background}
            onChange={(value) => setHeaderSettings({...headerSettings, trending_background: value})}
            placeholder="#f8f9fa"
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">Trending Slides</Text>
            <Button onClick={addTrendingSlide}>Add Slide</Button>
          </InlineStack>
          
          {trendingSlides.map((slide, index) => (
            <Card key={slide.id}>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h4">Slide {index + 1}</Text>
                <TextField
                  label="Title"
                  value={slide.title}
                  onChange={(value) => {
                    const updated = [...trendingSlides];
                    updated[index].title = value;
                    setTrendingSlides(updated);
                  }}
                />
                <Select
                  label="Media Type"
                  options={[
                    {label: 'Image', value: 'image'},
                    {label: 'Video', value: 'video'},
                  ]}
                  value={slide.media_type}
                  onChange={(value) => {
                    const updated = [...trendingSlides];
                    updated[index].media_type = value as 'image' | 'video';
                    setTrendingSlides(updated);
                  }}
                />
                <TextField
                  label="Image URL"
                  value={slide.image_url}
                  onChange={(value) => {
                    const updated = [...trendingSlides];
                    updated[index].image_url = value;
                    setTrendingSlides(updated);
                  }}
                />
                <TextField
                  label="Link URL"
                  value={slide.link}
                  onChange={(value) => {
                    const updated = [...trendingSlides];
                    updated[index].link = value;
                    setTrendingSlides(updated);
                  }}
                />
                <Button 
                  destructive 
                  onClick={() => {
                    setTrendingSlides(trendingSlides.filter((_, i) => i !== index));
                  }}
                >
                  Remove Slide
                </Button>
              </BlockStack>
            </Card>
          ))}
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderNavigationSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">Navigation Tabs</Text>
            <Button onClick={addNavigationTab}>Add Tab</Button>
          </InlineStack>
          
          {navigationTabs.map((tab, index) => (
            <Card key={tab.id}>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h4">Tab {index + 1}</Text>
                <TextField
                  label="Tab Title"
                  value={tab.title}
                  onChange={(value) => {
                    const updated = [...navigationTabs];
                    updated[index].title = value;
                    setNavigationTabs(updated);
                  }}
                />
                <Select
                  label="Link Type"
                  options={[
                    {label: 'Collection', value: 'collection'},
                    {label: 'Product', value: 'product'},
                  ]}
                  value={tab.link_type}
                  onChange={(value) => {
                    const updated = [...navigationTabs];
                    updated[index].link_type = value as 'collection' | 'product';
                    setNavigationTabs(updated);
                  }}
                />
                <TextField
                  label={tab.link_type === 'collection' ? 'Collection ID' : 'Product ID'}
                  value={tab.link_type === 'collection' ? tab.collection_id : tab.product_id}
                  onChange={(value) => {
                    const updated = [...navigationTabs];
                    if (tab.link_type === 'collection') {
                      updated[index].collection_id = value;
                    } else {
                      updated[index].product_id = value;
                    }
                    setNavigationTabs(updated);
                  }}
                />
                <Checkbox
                  label="Show Indicator Dot"
                  checked={tab.show_indicator}
                  onChange={(checked) => {
                    const updated = [...navigationTabs];
                    updated[index].show_indicator = checked;
                    setNavigationTabs(updated);
                  }}
                />
                <Button 
                  destructive 
                  onClick={() => {
                    setNavigationTabs(navigationTabs.filter((_, i) => i !== index));
                  }}
                >
                  Remove Tab
                </Button>
              </BlockStack>
            </Card>
          ))}
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderDrawerSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">Menu Items</Text>
            <Button onClick={addDrawerMenuItem}>Add Menu Item</Button>
          </InlineStack>
          
          {drawerMenuItems.map((item, index) => (
            <Card key={item.id}>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h4">Menu Item {index + 1}</Text>
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(value) => {
                    const updated = [...drawerMenuItems];
                    updated[index].title = value;
                    setDrawerMenuItems(updated);
                  }}
                />
                <TextField
                  label="Link"
                  value={item.link}
                  onChange={(value) => {
                    const updated = [...drawerMenuItems];
                    updated[index].link = value;
                    setDrawerMenuItems(updated);
                  }}
                />
                <TextField
                  label="Icon (emoji)"
                  value={item.icon}
                  onChange={(value) => {
                    const updated = [...drawerMenuItems];
                    updated[index].icon = value;
                    setDrawerMenuItems(updated);
                  }}
                />
                <Button 
                  destructive 
                  onClick={() => {
                    setDrawerMenuItems(drawerMenuItems.filter((_, i) => i !== index));
                  }}
                >
                  Remove Item
                </Button>
              </BlockStack>
            </Card>
          ))}
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">Drawer Offers</Text>
            <Button onClick={addDrawerOffer}>Add Offer</Button>
          </InlineStack>
          
          {drawerOffers.map((offer, index) => (
            <Card key={offer.id}>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h4">Offer {index + 1}</Text>
                <TextField
                  label="Image URL"
                  value={offer.offer_image_url}
                  onChange={(value) => {
                    const updated = [...drawerOffers];
                    updated[index].offer_image_url = value;
                    setDrawerOffers(updated);
                  }}
                />
                <TextField
                  label="Title"
                  value={offer.offer_title}
                  onChange={(value) => {
                    const updated = [...drawerOffers];
                    updated[index].offer_title = value;
                    setDrawerOffers(updated);
                  }}
                />
                <TextField
                  label="Subtitle"
                  value={offer.offer_subtitle}
                  onChange={(value) => {
                    const updated = [...drawerOffers];
                    updated[index].offer_subtitle = value;
                    setDrawerOffers(updated);
                  }}
                />
                <TextField
                  label="Link"
                  value={offer.offer_link}
                  onChange={(value) => {
                    const updated = [...drawerOffers];
                    updated[index].offer_link = value;
                    setDrawerOffers(updated);
                  }}
                />
                <Button 
                  destructive 
                  onClick={() => {
                    setDrawerOffers(drawerOffers.filter((_, i) => i !== index));
                  }}
                >
                  Remove Offer
                </Button>
              </BlockStack>
            </Card>
          ))}
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderColorsSettings = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Header Colors</Text>
          <InlineStack gap="400">
            <div style={{flex: 1}}>
              <TextField
                label="Header Background"
                value={headerSettings.header_background_color}
                onChange={(value) => setHeaderSettings({...headerSettings, header_background_color: value})}
              />
            </div>
            <div style={{flex: 1}}>
              <TextField
                label="Navigation Background"
                value={headerSettings.nav_background_color}
                onChange={(value) => setHeaderSettings({...headerSettings, nav_background_color: value})}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Navigation Colors</Text>
          <InlineStack gap="400">
            <div style={{flex: 1}}>
              <TextField
                label="Text Color"
                value={headerSettings.nav_text_color}
                onChange={(value) => setHeaderSettings({...headerSettings, nav_text_color: value})}
              />
            </div>
            <div style={{flex: 1}}>
              <TextField
                label="Active Color"
                value={headerSettings.nav_active_color}
                onChange={(value) => setHeaderSettings({...headerSettings, nav_active_color: value})}
              />
            </div>
          </InlineStack>
          <InlineStack gap="400">
            <div style={{flex: 1}}>
              <TextField
                label="Hover Color"
                value={headerSettings.nav_hover_color}
                onChange={(value) => setHeaderSettings({...headerSettings, nav_hover_color: value})}
              />
            </div>
            <div style={{flex: 1}}>
              <TextField
                label="Indicator Color"
                value={headerSettings.nav_indicator_color}
                onChange={(value) => setHeaderSettings({...headerSettings, nav_indicator_color: value})}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Icon Colors</Text>
          <InlineStack gap="400">
            <div style={{flex: 1}}>
              <TextField
                label="Icon Color"
                value={headerSettings.icon_color}
                onChange={(value) => setHeaderSettings({...headerSettings, icon_color: value})}
              />
            </div>
            <div style={{flex: 1}}>
              <TextField
                label="Icon Hover Color"
                value={headerSettings.icon_hover_color}
                onChange={(value) => setHeaderSettings({...headerSettings, icon_hover_color: value})}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Offer Button Colors</Text>
          <InlineStack gap="400">
            <div style={{flex: 1}}>
              <TextField
                label="Button Color Start"
                value={headerSettings.offer_button_color}
                onChange={(value) => setHeaderSettings({...headerSettings, offer_button_color: value})}
              />
            </div>
            <div style={{flex: 1}}>
              <TextField
                label="Button Color End"
                value={headerSettings.offer_button_color_end}
                onChange={(value) => setHeaderSettings({...headerSettings, offer_button_color_end: value})}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderTrendingSettings();
      case 2:
        return renderNavigationSettings();
      case 3:
        return renderDrawerSettings();
      case 4:
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
        title="Advanced Header Management"
        subtitle="Manage your mobile header with comprehensive liquid template features"
        primaryAction={{
          content: "Save All Settings",
          loading: loading,
          onAction: saveHeaderSettings,
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                <Card.Section>
                  {renderTabContent()}
                </Card.Section>
              </Tabs>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      {toastMarkup}
    </Frame>
  );
} 