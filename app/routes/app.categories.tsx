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

interface CategoryData {
  id: string;
  name: string;
  image: string;
}

interface ProductData {
  id: string;
  brand: string;
  price: string;
  offer: string;
  image: string;
  category: string;
  link?: string;
  linkType?: 'product' | 'collection' | 'external' | 'none';
}

const defaultCategories: CategoryData[] = [
  {
    id: 'men',
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop&crop=center&q=80'
  },
  {
    id: 'women',
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop&crop=center&q=80'
  },
  {
    id: 'kids',
    name: 'Kids',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop&crop=center&q=80'
  },
  {
    id: 'essentials',
    name: 'Essentials',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=200&h=200&fit=crop&crop=center&q=80'
  }
];

const defaultProducts: ProductData[] = [
  {
    id: 'p1',
    brand: 'John Jacobs',
    price: '3500',
    offer: 'Free lenses + Extra ₹333 Off',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'men'
  },
  {
    id: 'p2',
    brand: 'Vincent Chase',
    price: '1500',
    offer: 'Free lenses + Extra ₹333 Off',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'men'
  },
  {
    id: 'p3',
    brand: 'Vincent Chase',
    price: '1500',
    offer: 'Free lenses + Extra ₹333 Off',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'women'
  },
  {
    id: 'p4',
    brand: 'Lenskart Air',
    price: '2000',
    offer: 'Free lenses + Extra ₹333 Off',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'women'
  },
  {
    id: 'p5',
    brand: 'Hustlr',
    price: '1500',
    offer: 'Free lenses + Extra ₹333 Off',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'kids'
  },
  {
    id: 'p6',
    brand: 'Kids Special',
    price: '1200',
    offer: 'Free lenses + Extra ₹333 Off',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'kids'
  },
  {
    id: 'p7',
    brand: 'Essentials',
    price: '800',
    offer: '60% Off + Free lenses',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'essentials'
  },
  {
    id: 'p8',
    brand: 'Budget Frames',
    price: '600',
    offer: '60% Off + Free lenses',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop&crop=center&q=80',
    category: 'essentials'
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>(defaultCategories);
  const [products, setProducts] = useState<ProductData[]>(defaultProducts);
  const [sectionTitle, setSectionTitle] = useState('Eyeglasses');
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState('');
  
  // Sale Banner State
  const [saleBannerEnabled, setSaleBannerEnabled] = useState(false);
  const [saleBannerLine1, setSaleBannerLine1] = useState('END OF');
  const [saleBannerLine2, setSaleBannerLine2] = useState('SEASON Sale');
  const [saleBannerColor, setSaleBannerColor] = useState('#d32f2f');

  // Load saved settings on component mount
  useEffect(() => {
    loadCategorySettings();
  }, []);

  const loadCategorySettings = async () => {
    try {
      const response = await fetch('/api/categories-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCategories(data.data.categories || defaultCategories);
          setProducts(data.data.products || defaultProducts);
          setSectionTitle(data.data.title || 'Eyeglasses');
          setSectionEnabled(data.data.enabled !== false);
          
          // Load sale banner data
          const saleBanner = data.data.saleBanner || {
            enabled: false,
            line1: "END OF",
            line2: "SEASON Sale",
            backgroundColor: "#d32f2f"
          };
          setSaleBannerEnabled(saleBanner.enabled);
          setSaleBannerLine1(saleBanner.line1);
          setSaleBannerLine2(saleBanner.line2);
          setSaleBannerColor(saleBanner.backgroundColor);
        }
      }
    } catch (error) {
      console.error('Error loading category settings:', error);
    }
  };

  const saveCategorySettings = async () => {
    try {
      const response = await fetch('/api/categories-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: sectionTitle,
          enabled: sectionEnabled,
          categories: categories,
          products: products,
          saleBanner: {
            enabled: saleBannerEnabled,
            line1: saleBannerLine1,
            line2: saleBannerLine2,
            backgroundColor: saleBannerColor
          }
        }),
      });

      if (response.ok) {
        setToastContent('Eyeglasses section settings saved successfully!');
        setShowToast(true);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving category settings:', error);
      setToastContent('Error saving settings. Please try again.');
      setShowToast(true);
    }
  };

  const editCategory = (category: CategoryData) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const saveCategory = () => {
    if (!editingCategory) return;
    
    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    );
    setCategories(updatedCategories);
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const editProduct = (product: ProductData) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const addNewProduct = (category: string) => {
    const newProduct: ProductData = {
      id: Date.now().toString(),
      brand: 'New Brand',
      price: '1000',
      offer: 'Special offer',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop&crop=center&q=80',
      category: category
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

  const renderCategoriesTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">Categories</Text>
              <Button disabled>Add Category</Button>
            </InlineStack>
            <BlockStack gap="300">
              {categories.map((category) => (
                <Card key={category.id} padding="300">
                  <InlineStack align="space-between">
                    <InlineStack gap="300">
                      <Thumbnail source={category.image} alt={category.name} size="small" />
                      <BlockStack gap="100">
                        <Text variant="bodyMd" fontWeight="semibold" as="p">{category.name}</Text>
                        <Text variant="bodySm" tone="subdued" as="p">Category Image</Text>
                      </BlockStack>
                    </InlineStack>
                    <Button icon={EditIcon} onClick={() => editCategory(category)}>
                      Edit
                    </Button>
                  </InlineStack>
                </Card>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderProductsTab = () => (
    <Layout>
      <Layout.Section>
        {categories.map((category) => (
          <Card key={category.id} padding="400">
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">{category.name} Products</Text>
                <Button onClick={() => addNewProduct(category.id)}>Add Product</Button>
              </InlineStack>
              <BlockStack gap="300">
                {products
                  .filter(product => product.category === category.id)
                  .map((product) => (
                    <Card key={product.id} padding="300">
                      <InlineStack align="space-between">
                        <InlineStack gap="300">
                          <Thumbnail source={product.image} alt={product.brand} size="small" />
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="semibold" as="p">{product.brand}</Text>
                            <Text variant="bodySm" tone="subdued" as="p">₹{product.price}</Text>
                            <Text variant="bodySm" tone="subdued" as="p">{product.offer}</Text>
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
        ))}
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
              <Checkbox
                label="Enable Eyeglasses Section"
                checked={sectionEnabled}
                onChange={setSectionEnabled}
              />
            </FormLayout>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderSaleBannerTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Sale Banner Settings</Text>
            <FormLayout>
              <Checkbox
                label="Enable Sale Banner"
                checked={saleBannerEnabled}
                onChange={setSaleBannerEnabled}
                helpText="Show sale banner at the top of product listings"
              />
              
              {saleBannerEnabled && (
                <>
                  <TextField
                    label="Banner Text Line 1"
                    value={saleBannerLine1}
                    onChange={setSaleBannerLine1}
                    placeholder="e.g., END OF"
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Banner Text Line 2" 
                    value={saleBannerLine2}
                    onChange={setSaleBannerLine2}
                    placeholder="e.g., SEASON Sale"
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Background Color"
                    value={saleBannerColor}
                    onChange={setSaleBannerColor}
                    placeholder="#d32f2f"
                    autoComplete="off"
                    helpText="Use hex color code (e.g., #d32f2f for red)"
                  />
                  
                  <Card>
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">Preview</Text>
                      <div
                        style={{
                          background: saleBannerColor,
                          color: 'white',
                          padding: '16px',
                          textAlign: 'center',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{saleBannerLine1}</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{saleBannerLine2}</div>
                      </div>
                    </BlockStack>
                  </Card>
                </>
              )}
            </FormLayout>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const tabs = [
    {
      id: 'categories',
      content: 'Categories',
      accessibilityLabel: 'Categories Tab',
    },
    {
      id: 'products',
      content: 'Products',
      accessibilityLabel: 'Products Tab',
    },
    {
      id: 'settings',
      content: 'Settings',
      accessibilityLabel: 'Settings Tab',
    },
    {
      id: 'saleBanner',
      content: 'Sale Banner',
      accessibilityLabel: 'Sale Banner Tab',
    },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderCategoriesTab();
      case 1:
        return renderProductsTab();
      case 2:
        return renderSettingsTab();
      case 3:
        return renderSaleBannerTab();
      default:
        return renderCategoriesTab();
    }
  };

  return (
    <Frame>
      <Page title="Eyeglasses Section">
        <TitleBar title="Eyeglasses Section Management" />
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs 
                tabs={tabs} 
                selected={selectedTab} 
                onSelect={setSelectedTab}
              >
                <BlockStack gap="400">
                  {selectedTab === 0 && renderCategoriesTab()}
                  {selectedTab === 1 && renderProductsTab()}
                  {selectedTab === 2 && renderSettingsTab()}
                  {selectedTab === 3 && renderSaleBannerTab()}
                </BlockStack>
              </Tabs>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <InlineStack align="space-between">
                <Button onClick={saveCategorySettings} variant="primary">
                  Save Settings
                </Button>
                <Badge tone="info">
                  {sectionEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Category Edit Modal */}
        <Modal
          open={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          title="Edit Category"
          primaryAction={{
            content: 'Save',
            onAction: saveCategory,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setShowCategoryModal(false),
            },
          ]}
        >
          <Modal.Section>
            {editingCategory && (
              <FormLayout>
                <TextField
                  label="Category Name"
                  value={editingCategory.name}
                  onChange={(value) => setEditingCategory({...editingCategory, name: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Image URL"
                  value={editingCategory.image}
                  onChange={(value) => setEditingCategory({...editingCategory, image: value})}
                  autoComplete="off"
                />
              </FormLayout>
            )}
          </Modal.Section>
        </Modal>

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
                  label="Price"
                  value={editingProduct.price}
                  onChange={(value) => setEditingProduct({...editingProduct, price: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Offer"
                  value={editingProduct.offer}
                  onChange={(value) => setEditingProduct({...editingProduct, offer: value})}
                  autoComplete="off"
                />
                <TextField
                  label="Image URL"
                  value={editingProduct.image}
                  onChange={(value) => setEditingProduct({...editingProduct, image: value})}
                  autoComplete="off"
                />
                <Select
                  label="Category"
                  options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                  value={editingProduct.category}
                  onChange={(value) => setEditingProduct({...editingProduct, category: value})}
                />
                <Select
                  label="Link Type"
                  options={[
                    { label: 'None', value: 'none' },
                    { label: 'Link to Product', value: 'product' },
                    { label: 'Link to Collection', value: 'collection' },
                    { label: 'External Link', value: 'external' }
                  ]}
                  value={editingProduct.linkType || 'none'}
                  onChange={(value) => setEditingProduct({...editingProduct, linkType: value as 'product' | 'collection' | 'external' | 'none', link: value === 'none' ? '' : editingProduct.link})}
                />
                {editingProduct.linkType && editingProduct.linkType !== 'none' && (
                  <TextField
                    label={
                      editingProduct.linkType === 'product' ? 'Product ID or Handle' :
                      editingProduct.linkType === 'collection' ? 'Collection ID or Handle' :
                      'External URL'
                    }
                    value={editingProduct.link || ''}
                    onChange={(value) => setEditingProduct({...editingProduct, link: value})}
                    autoComplete="off"
                    helpText={
                      editingProduct.linkType === 'product' ? 'Enter product ID or handle to link to' :
                      editingProduct.linkType === 'collection' ? 'Enter collection ID or handle to link to' :
                      'Enter full URL (e.g., https://example.com)'
                    }
                  />
                )}
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