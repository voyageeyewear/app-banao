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

// Navigation Item Interface
interface NavItem {
  id: string;
  title: string;
  link: string;
  enabled: boolean;
  order: number;
}

// Announcement Bar Interface
interface AnnouncementBar {
  enabled: boolean;
  text: string;
  background_color: string;
  text_color: string;
  scroll_speed: number;
}

// Menu Settings Interface
interface MenuSettings {
  background_color: string;
  text_color: string;
  hover_color: string;
  enable_search: boolean;
  enable_categories: boolean;
}

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
  icon_color: string;
  icon_hover_color: string;
  cart_icon_color: string;
  wishlist_icon_color: string;
  account_icon_color: string;
  menu_icon_color: string;
  
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
    icon_color: "#ffffff",
    icon_hover_color: "#ffffff",
    cart_icon_color: "#ffffff",
    wishlist_icon_color: "#ffffff",
    account_icon_color: "#ffffff",
    menu_icon_color: "#ffffff",
    enable_menu_drawer: true,
    enable_wishlist_icon: true,
    enable_account_icon: true,
    enable_cart_icon: true,
    enable_offer_button: true,
    offer_button_text: "50% OFF",
    offer_button_link: "",
  });

  // Navigation Items State
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "1", title: "All", link: "/collections/all", enabled: true, order: 1 },
    { id: "2", title: "Classic", link: "/collections/classic", enabled: true, order: 2 },
    { id: "3", title: "Premium", link: "/collections/premium", enabled: true, order: 3 },
  ]);

  // Announcement Bar State
  const [announcementBar, setAnnouncementBar] = useState<AnnouncementBar>({
    enabled: true,
    text: "Free shipping on orders over $50! 🚚",
    background_color: "#1E1B4B",
    text_color: "#ffffff",
    scroll_speed: 5000,
  });

  // Menu Settings State
  const [menuSettings, setMenuSettings] = useState<MenuSettings>({
    background_color: "#ffffff",
    text_color: "#333333",
    hover_color: "#1E1B4B",
    enable_search: true,
    enable_categories: true,
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
    {
      id: 'navigation',
      content: 'Navigation',
      accessibilityLabel: 'Navigation bar management',
      panelID: 'navigation-settings-panel',
    },
    {
      id: 'announcement',
      content: 'Announcement Bar',
      accessibilityLabel: 'Announcement bar settings',
      panelID: 'announcement-settings-panel',
    },
    {
      id: 'menu',
      content: 'Menu Settings',
      accessibilityLabel: 'Menu drawer settings',
      panelID: 'menu-settings-panel',
    },
  ];

  const saveHeaderSettings = async () => {
    setLoading(true);
    try {
      console.log("🚀 Starting header settings save...");
      const allData = {
        header: headerSettings,
        trending_slides: trendingSlides,
        nav_items: navItems,
        announcement_bar: announcementBar,
        menu_settings: menuSettings,
      };

      console.log("📤 Sending data:", JSON.stringify(allData, null, 2));
      console.log("📤 Nav items specifically:", JSON.stringify(navItems, null, 2));

      const response = await fetch('/api/header-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allData),
      });

      console.log("📡 Response status:", response.status);
      
      const responseData = await response.json();
      console.log("📥 Response data:", responseData);

      if (response.ok && responseData.success) {
        setToastMessage('Header settings and trending slides saved successfully!');
        setShowToast(true);
        console.log("✅ Save successful!");
      } else {
        const errorMessage = responseData.details 
          ? `${responseData.error}: ${responseData.details}`
          : responseData.error || 'Unknown error occurred';
        
        console.error("❌ Save failed:", errorMessage);
        setToastMessage(`Error: ${errorMessage}`);
        setShowToast(true);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error saving header settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setToastMessage(`Error saving settings: ${errorMessage}`);
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
        if (data.nav_items) {
          console.log("📥 Loading nav items:", JSON.stringify(data.nav_items, null, 2));
          setNavItems(data.nav_items);
        }
        if (data.announcement_bar) {
          setAnnouncementBar({
            enabled: data.announcement_bar.enabled ?? true,
            text: data.announcement_bar.text ?? "Free shipping on orders over $50! 🚚",
            background_color: data.announcement_bar.background_color ?? "#1E1B4B",
            text_color: data.announcement_bar.text_color ?? "#ffffff",
            scroll_speed: data.announcement_bar.scroll_speed ?? 5000,
          });
        }
        if (data.menu_settings) {
          setMenuSettings(data.menu_settings);
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  useEffect(() => {
    loadHeaderSettings();
  }, []);

  // Navigation Items Management Functions
  const addNavItem = () => {
    const newNavItem: NavItem = {
      id: Date.now().toString(),
      title: "New Tab",
      link: "/collections/new",
      enabled: true,
      order: navItems.length + 1,
    };
    setNavItems([...navItems, newNavItem]);
  };

  const updateNavItem = (id: string, field: keyof NavItem, value: any) => {
    setNavItems(navItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteNavItem = (id: string) => {
    setNavItems(navItems.filter(item => item.id !== id));
  };

  const moveNavItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = navItems.findIndex(item => item.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < navItems.length) {
      const newNavItems = [...navItems];
      [newNavItems[currentIndex], newNavItems[newIndex]] = [newNavItems[newIndex], newNavItems[currentIndex]];
      
      // Update order values
      newNavItems.forEach((item, index) => {
        item.order = index + 1;
      });
      
      setNavItems(newNavItems);
    }
  };

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

      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">Icon Colors</Text>
          <FormLayout>
            <TextField
              label="Default Icon Color"
              value={headerSettings.icon_color}
              onChange={(value) => setHeaderSettings({...headerSettings, icon_color: value})}
              placeholder="#ffffff"
              autoComplete="off"
              helpText="Default color for all icons"
            />
            <TextField
              label="Icon Hover Color"
              value={headerSettings.icon_hover_color}
              onChange={(value) => setHeaderSettings({...headerSettings, icon_hover_color: value})}
              placeholder="#ffffff"
              autoComplete="off"
              helpText="Color when hovering over icons"
            />
            <TextField
              label="Cart Icon Color"
              value={headerSettings.cart_icon_color}
              onChange={(value) => setHeaderSettings({...headerSettings, cart_icon_color: value})}
              placeholder="#ffffff"
              autoComplete="off"
            />
            <TextField
              label="Wishlist Icon Color"
              value={headerSettings.wishlist_icon_color}
              onChange={(value) => setHeaderSettings({...headerSettings, wishlist_icon_color: value})}
              placeholder="#ffffff"
              autoComplete="off"
            />
            <TextField
              label="Account Icon Color"
              value={headerSettings.account_icon_color}
              onChange={(value) => setHeaderSettings({...headerSettings, account_icon_color: value})}
              placeholder="#ffffff"
              autoComplete="off"
            />
            <TextField
              label="Menu Icon Color"
              value={headerSettings.menu_icon_color}
              onChange={(value) => setHeaderSettings({...headerSettings, menu_icon_color: value})}
              placeholder="#ffffff"
              autoComplete="off"
            />
          </FormLayout>
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderNavigationSettings = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h3">Navigation Items</Text>
              <Button onClick={addNavItem} variant="primary">Add Navigation Item</Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </Layout.Section>
      
      {navItems.map((item, index) => (
        <Layout.Section key={item.id}>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h4">Navigation Item {index + 1}</Text>
                <InlineStack gap="200">
                  <Button 
                    onClick={() => moveNavItem(item.id, 'up')}
                    disabled={index === 0}
                    size="micro"
                  >
                    ↑
                  </Button>
                  <Button 
                    onClick={() => moveNavItem(item.id, 'down')}
                    disabled={index === navItems.length - 1}
                    size="micro"
                  >
                    ↓
                  </Button>
                  <Button onClick={() => deleteNavItem(item.id)} variant="primary" tone="critical" size="micro">
                    Delete
                  </Button>
                </InlineStack>
              </InlineStack>
              
              <FormLayout>
                <InlineStack gap="400">
                  <div style={{ flex: 2 }}>
                    <TextField
                      label="Tab Title"
                      value={item.title}
                      onChange={(value) => updateNavItem(item.id, 'title', value)}
                      placeholder="All, Classic, Premium..."
                      autoComplete="off"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Checkbox
                      label="Enable this tab"
                      checked={item.enabled}
                      onChange={(checked) => updateNavItem(item.id, 'enabled', checked)}
                    />
                  </div>
                </InlineStack>
                
                <TextField
                  label="Link URL"
                  value={item.link}
                  onChange={(value) => updateNavItem(item.id, 'link', value)}
                  placeholder="/collections/all"
                  autoComplete="off"
                  helpText="Where users will go when they click this tab"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      ))}
    </Layout>
  );

  const renderAnnouncementBar = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h3">Announcement Bar Settings</Text>
            <FormLayout>
              <Checkbox
                label="Enable Announcement Bar"
                checked={announcementBar.enabled}
                onChange={(checked) => setAnnouncementBar({...announcementBar, enabled: checked})}
              />
              
              <TextField
                label="Announcement Text"
                value={announcementBar.text}
                onChange={(value) => setAnnouncementBar({...announcementBar, text: value})}
                placeholder="Free shipping on orders over $50! 🚚"
                autoComplete="off"
                helpText="This text will scroll automatically every 5 seconds"
              />
              
              <TextField
                label="Background Color"
                value={announcementBar.background_color}
                onChange={(value) => setAnnouncementBar({...announcementBar, background_color: value})}
                placeholder="#1E1B4B"
                autoComplete="off"
              />
              
              <TextField
                label="Text Color"
                value={announcementBar.text_color}
                onChange={(value) => setAnnouncementBar({...announcementBar, text_color: value})}
                placeholder="#ffffff"
                autoComplete="off"
              />
              
              <TextField
                label="Scroll Speed (milliseconds)"
                type="number"
                value={announcementBar.scroll_speed?.toString() || "5000"}
                onChange={(value) => setAnnouncementBar({...announcementBar, scroll_speed: parseInt(value) || 5000})}
                placeholder="5000"
                autoComplete="off"
                helpText="How long each message displays before scrolling (default: 5000ms = 5 seconds)"
              />
            </FormLayout>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderMenuSettings = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h3">Menu Drawer Settings</Text>
            <FormLayout>
              <TextField
                label="Menu Background Color"
                value={menuSettings.background_color}
                onChange={(value) => setMenuSettings({...menuSettings, background_color: value})}
                placeholder="#ffffff"
                autoComplete="off"
              />
              
              <TextField
                label="Menu Text Color"
                value={menuSettings.text_color}
                onChange={(value) => setMenuSettings({...menuSettings, text_color: value})}
                placeholder="#333333"
                autoComplete="off"
              />
              
              <TextField
                label="Menu Hover Color"
                value={menuSettings.hover_color}
                onChange={(value) => setMenuSettings({...menuSettings, hover_color: value})}
                placeholder="#1E1B4B"
                autoComplete="off"
              />
              
              <Checkbox
                label="Enable Search in Menu"
                checked={menuSettings.enable_search}
                onChange={(checked) => setMenuSettings({...menuSettings, enable_search: checked})}
              />
              
              <Checkbox
                label="Enable Categories in Menu"
                checked={menuSettings.enable_categories}
                onChange={(checked) => setMenuSettings({...menuSettings, enable_categories: checked})}
              />
            </FormLayout>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return renderTrendingSlider();
      case 2:
        return renderColorsSettings();
      case 3:
        return renderNavigationSettings();
      case 4:
        return renderAnnouncementBar();
      case 5:
        return renderMenuSettings();
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