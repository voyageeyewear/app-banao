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
      id: 'colors',
      content: 'Colors & Design',
      accessibilityLabel: 'Colors and design settings',
      panelID: 'colors-settings-panel',
    },
  ];

  const saveHeaderSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/header-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ header: headerSettings }),
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
        if (data.header) {
          setHeaderSettings(data.header);
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  useEffect(() => {
    loadHeaderSettings();
  }, []);

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
        subtitle="Manage your mobile header settings"
        primaryAction={{
          content: "Save Settings",
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