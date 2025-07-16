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

interface SharkTankProductData {
  id: string;
  brand: string;
  title: string;
  image: string;
  video?: string; // MP4 video URL (optional)
  tag: string;
  showTag: boolean;
}

const defaultProducts: SharkTankProductData[] = [
  {
    id: 'st1',
    brand: 'PHONIC',
    title: 'Smart Audio Glasses',
    image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=330&h=400&fit=crop&crop=center&q=80',
    video: '', // Optional video URL
    tag: 'NEW LAUNCH',
    showTag: true
  },
  {
    id: 'st2',
    brand: 'BLUECUT',
    title: 'Blue Light Blockers',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=330&h=400&fit=crop&crop=center&q=80',
    video: '', // Optional video URL
    tag: 'FEATURED',
    showTag: true
  },
  {
    id: 'st3',
    brand: 'LUXE',
    title: 'Designer Collection',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=330&h=400&fit=crop&crop=center&q=80',
    video: '', // Optional video URL
    tag: 'PREMIUM',
    showTag: true
  },
  {
    id: 'st4',
    brand: 'ACTIVE',
    title: 'Performance Sunglasses',
    image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=330&h=400&fit=crop&crop=center&q=80',
    video: '', // Optional video URL
    tag: 'SPORT',
    showTag: true
  },
  {
    id: 'st5',
    brand: 'JUNIOR',
    title: 'Kids Safety Glasses',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=330&h=400&fit=crop&crop=center&q=80',
    video: '', // Optional video URL
    tag: 'KIDS',
    showTag: true
  }
];

export default function SharkTankPage() {
  const [products, setProducts] = useState<SharkTankProductData[]>(defaultProducts);
  const [sectionTitle, setSectionTitle] = useState('As Seen on Shark Tank India');
  const [sectionSubtitle, setSectionSubtitle] = useState('Style it like the Sharks!');
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [editingProduct, setEditingProduct] = useState<SharkTankProductData | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState('');

  // Load saved settings on component mount
  useEffect(() => {
    loadSharkTankSettings();
  }, []);

  const loadSharkTankSettings = async () => {
    try {
      const response = await fetch('/api/shark-tank-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProducts(data.data.products || defaultProducts);
          setSectionTitle(data.data.title || 'As Seen on Shark Tank India');
          setSectionSubtitle(data.data.subtitle || 'Style it like the Sharks!');
          setSectionEnabled(data.data.enabled !== false);
        }
      }
    } catch (error) {
      console.error('Error loading shark tank settings:', error);
    }
  };

  const saveSharkTankSettings = async () => {
    try {
      const response = await fetch('/api/shark-tank-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: sectionTitle,
          subtitle: sectionSubtitle,
          enabled: sectionEnabled,
          products: products
        }),
      });

      if (response.ok) {
        setToastContent('Shark Tank section settings saved successfully!');
        setShowToast(true);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving shark tank settings:', error);
      setToastContent('Error saving settings. Please try again.');
      setShowToast(true);
    }
  };

  const editProduct = (product: SharkTankProductData) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const addNewProduct = () => {
    const newProduct: SharkTankProductData = {
      id: Date.now().toString(),
      brand: 'NEW BRAND',
      title: 'New Product',
      image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=330&h=400&fit=crop&crop=center&q=80',
      video: '', // Optional video URL
      tag: 'NEW',
      showTag: true
    };
    setEditingProduct(newProduct);
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!editingProduct) return;
    
    const existingIndex = products.findIndex(p => p.id === editingProduct.id);
    if (existingIndex >= 0) {
      const updatedProducts = [...products];
      updatedProducts[existingIndex] = editingProduct;
      setProducts(updatedProducts);
    } else {
      setProducts([...products, editingProduct]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const renderProductsTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">Shark Tank Products</Text>
              <Button onClick={addNewProduct}>Add Product</Button>
            </InlineStack>
            <BlockStack gap="300">
              {products.map((product) => (
                <Card key={product.id} padding="300">
                  <InlineStack align="space-between">
                    <InlineStack gap="300">
                      <Thumbnail source={product.image} alt={product.brand} size="small" />
                      <BlockStack gap="100">
                        <Text variant="bodyMd" fontWeight="semibold" as="p">{product.brand}</Text>
                        <Text variant="bodySm" tone="subdued" as="p">{product.title}</Text>
                        {product.showTag && (
                          <Badge tone="info">{product.tag}</Badge>
                        )}
                      </BlockStack>
                    </InlineStack>
                    <InlineStack gap="200">
                      <Button icon={EditIcon} onClick={() => editProduct(product)}>
                        Edit
                      </Button>
                      <Button 
                        icon={DeleteIcon} 
                        variant="primary"
                        tone="critical"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </InlineStack>
                  </InlineStack>
                </Card>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderSettingsTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Section Settings</Text>
            <FormLayout>
              <TextField
                label="Section Title"
                value={sectionTitle}
                onChange={setSectionTitle}
                placeholder="Enter section title"
                autoComplete="off"
              />
              <TextField
                label="Section Subtitle"
                value={sectionSubtitle}
                onChange={setSectionSubtitle}
                placeholder="Enter section subtitle"
                autoComplete="off"
              />
              <Checkbox
                label="Enable Shark Tank Section"
                checked={sectionEnabled}
                onChange={setSectionEnabled}
              />
            </FormLayout>
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
            <Text variant="headingMd" as="h2">Section Preview</Text>
            <Text variant="bodyMd" as="p">Preview how the Shark Tank section will appear in the mobile app:</Text>
            <Box 
              background="bg-surface-secondary" 
              padding="400" 
              borderRadius="200"
            >
              <BlockStack gap="300">
                <Text variant="headingLg" as="h3">{sectionTitle}</Text>
                <Text variant="bodyMd" tone="subdued" as="p">{sectionSubtitle}</Text>
                <InlineStack gap="200">
                  {products.slice(0, 3).map((product) => (
                    <Box key={product.id} background="bg-surface" padding="200" borderRadius="100">
                      <BlockStack gap="100">
                        <Thumbnail source={product.image} alt={product.brand} size="small" />
                        <Text variant="bodySm" fontWeight="semibold" as="p">{product.brand}</Text>
                        <Text variant="bodySm" tone="subdued" as="p">{product.title}</Text>
                      </BlockStack>
                    </Box>
                  ))}
                </InlineStack>
              </BlockStack>
            </Box>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const tabs = [
    { id: 'products', content: 'Products' },
    { id: 'settings', content: 'Settings' },
    { id: 'preview', content: 'Preview' },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderProductsTab();
      case 1:
        return renderSettingsTab();
      case 2:
        return renderPreviewTab();
      default:
        return renderProductsTab();
    }
  };

  return (
    <Frame>
      <Page title="Shark Tank Section">
        <TitleBar title="Shark Tank Section Management" />
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs 
                tabs={tabs} 
                selected={selectedTab} 
                onSelect={setSelectedTab}
              />
            </Card>
          </Layout.Section>
          <Layout.Section>
            {renderTabContent()}
          </Layout.Section>
          <Layout.Section>
            <Card>
              <InlineStack align="space-between">
                <Button onClick={saveSharkTankSettings} variant="primary">
                  Save Settings
                </Button>
                <Badge tone="info">
                  {sectionEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Product Edit Modal */}
        <Modal
          open={showProductModal}
          onClose={() => setShowProductModal(false)}
          title="Edit Product"
          primaryAction={{
            content: 'Save',
            onAction: saveProduct,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowProductModal(false),
            },
          ]}
        >
          <Modal.Section>
            {editingProduct && (
              <FormLayout>
                <TextField
                  label="Brand Name"
                  value={editingProduct.brand}
                  onChange={(value) => setEditingProduct({...editingProduct, brand: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Product Title"
                  value={editingProduct.title}
                  onChange={(value) => setEditingProduct({...editingProduct, title: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Image URL"
                  value={editingProduct.image}
                  onChange={(value) => setEditingProduct({...editingProduct, image: value})}
                  autoComplete="off"
                  helpText="Product image (JPG, PNG, WebP supported)"
                />
                <TextField
                  label="Video URL (MP4)"
                  value={editingProduct.video || ''}
                  onChange={(value) => setEditingProduct({...editingProduct, video: value})}
                  autoComplete="off"
                  helpText="Optional: MP4 video that will play in loop and muted"
                  placeholder="https://example.com/video.mp4"
                />
                <TextField
                  label="Tag Text"
                  value={editingProduct.tag}
                  onChange={(value) => setEditingProduct({...editingProduct, tag: value})}
                  autoComplete="off"
                />
                <Checkbox
                  label="Show Tag"
                  checked={editingProduct.showTag}
                  onChange={(value) => setEditingProduct({...editingProduct, showTag: value})}
                />
              </FormLayout>
            )}
          </Modal.Section>
        </Modal>

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