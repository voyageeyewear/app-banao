import { useState, useEffect, useCallback } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Select,
  Checkbox,
  Banner,
  Toast,
  Frame,
  Modal,
  FormLayout,
  ButtonGroup,
  DataTable,
  Badge,
  InlineStack,
  Thumbnail,
  TextContainer,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Types
interface SharkTankProduct {
  id?: number;
  brand: string;
  title: string;
  image: string;
  video?: string;
  tag: string;
  showTag: boolean;
  order: number;
  enabled: boolean;
}

interface SharkTankConfig {
  id: number;
  title: string;
  subtitle: string;
  enabled: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  try {
    // Get Shark Tank configuration
    let config = await prisma.sharkTankConfig.findFirst();
    if (!config) {
      config = await prisma.sharkTankConfig.create({
        data: {
          title: "As Seen on Shark Tank India",
          subtitle: "Style it like the Sharks!",
          enabled: true,
        }
      });
    }

    // Get all Shark Tank products
    const products = await prisma.sharkTankProduct.findMany({
      orderBy: { order: 'asc' }
    });

    return json({ config, products });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ 
      config: { id: 1, title: "As Seen on Shark Tank India", subtitle: "Style it like the Sharks!", enabled: true },
      products: []
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  try {
    switch (actionType) {
      case "updateConfig":
        await prisma.sharkTankConfig.update({
          where: { id: 1 },
          data: {
            title: formData.get("title") as string,
            subtitle: formData.get("subtitle") as string,
            enabled: formData.get("enabled") === "true",
          }
        });
        return json({ success: true, message: "Configuration updated successfully!" });

      case "addProduct":
        await prisma.sharkTankProduct.create({
          data: {
            brand: formData.get("brand") as string,
            title: formData.get("title") as string,
            image: formData.get("image") as string,
            video: formData.get("video") as string || "",
            tag: formData.get("tag") as string,
            showTag: formData.get("showTag") === "true",
            order: parseInt(formData.get("order") as string) || 0,
            enabled: formData.get("enabled") === "true",
          }
        });
        return json({ success: true, message: "Product added successfully!" });

      case "updateProduct":
        const productId = parseInt(formData.get("productId") as string);
        await prisma.sharkTankProduct.update({
          where: { id: productId },
          data: {
            brand: formData.get("brand") as string,
            title: formData.get("title") as string,
            image: formData.get("image") as string,
            video: formData.get("video") as string || "",
            tag: formData.get("tag") as string,
            showTag: formData.get("showTag") === "true",
            order: parseInt(formData.get("order") as string) || 0,
            enabled: formData.get("enabled") === "true",
          }
        });
        return json({ success: true, message: "Product updated successfully!" });

      case "deleteProduct":
        const deleteId = parseInt(formData.get("productId") as string);
        await prisma.sharkTankProduct.delete({
          where: { id: deleteId }
        });
        return json({ success: true, message: "Product deleted successfully!" });

      default:
        return json({ success: false, message: "Invalid action" });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({ success: false, message: "An error occurred" });
  }
};

export default function SharkTankManagement() {
  const { config, products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [editingProduct, setEditingProduct] = useState<SharkTankProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Configuration state
  const [configState, setConfigState] = useState({
    title: config.title,
    subtitle: config.subtitle,
    enabled: config.enabled,
  });

  // Product form state
  const [productForm, setProductForm] = useState<SharkTankProduct>({
    brand: "",
    title: "",
    image: "",
    video: "",
    tag: "",
    showTag: true,
    order: 0,
    enabled: true,
  });

  // Handle action response
  useEffect(() => {
    if (actionData?.success) {
      setShowToast(true);
      setToastContent(actionData.message);
      setShowModal(false);
      setEditingProduct(null);
      setProductForm({
        brand: "",
        title: "",
        image: "",
        video: "",
        tag: "",
        showTag: true,
        order: 0,
        enabled: true,
      });
    } else if (actionData?.success === false) {
      setShowToast(true);
      setToastContent(actionData.message);
    }
  }, [actionData]);

  // Handlers
  const handleConfigSave = () => {
    const formData = new FormData();
    formData.append("actionType", "updateConfig");
    formData.append("title", configState.title);
    formData.append("subtitle", configState.subtitle);
    formData.append("enabled", configState.enabled.toString());
    submit(formData, { method: "post" });
  };

  const handleAddProduct = () => {
    setIsEditing(false);
    setProductForm({
      brand: "",
      title: "",
      image: "",
      video: "",
      tag: "",
      showTag: true,
      order: products.length,
      enabled: true,
    });
    setShowModal(true);
  };

  const handleEditProduct = (product: any) => {
    setIsEditing(true);
    setEditingProduct(product);
    setProductForm(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const formData = new FormData();
      formData.append("actionType", "deleteProduct");
      formData.append("productId", productId.toString());
      submit(formData, { method: "post" });
    }
  };

  const handleProductSave = () => {
    const formData = new FormData();
    formData.append("actionType", isEditing ? "updateProduct" : "addProduct");
    if (isEditing && editingProduct?.id) {
      formData.append("productId", editingProduct.id.toString());
    }
    formData.append("brand", productForm.brand);
    formData.append("title", productForm.title);
    formData.append("image", productForm.image);
    formData.append("video", productForm.video || "");
    formData.append("tag", productForm.tag);
    formData.append("showTag", productForm.showTag.toString());
    formData.append("order", productForm.order.toString());
    formData.append("enabled", productForm.enabled.toString());
    submit(formData, { method: "post" });
  };

  // Tabs
  const tabs = [
    { id: 'products', content: 'Products' },
    { id: 'settings', content: 'Settings' },
    { id: 'preview', content: 'Preview' },
  ];

  // Products table data
  const productRows = products.map((product: any) => [
    <Thumbnail
      source={product.image || "https://via.placeholder.com/100"}
      alt={product.title}
      size="small"
    />,
    product.brand,
    product.title,
    product.video ? (
      <Badge tone="success">Has Video</Badge>
    ) : (
      <Badge>No Video</Badge>
    ),
    product.showTag ? product.tag : "Hidden",
    product.enabled ? (
      <Badge tone="success">Enabled</Badge>
    ) : (
      <Badge tone="critical">Disabled</Badge>
    ),
    <ButtonGroup>
      <Button onClick={() => handleEditProduct(product)} size="slim">
        Edit
      </Button>
      <Button 
        onClick={() => handleDeleteProduct(product.id)} 
        variant="primary"
        tone="critical"
        size="slim"
      >
        Delete
      </Button>
    </ButtonGroup>
  ]);

  return (
    <Frame>
      <Page
        title="Shark Tank Section Management"
        subtitle="Manage your Shark Tank products and settings"
        primaryAction={{
          content: "Add Product",
          onAction: handleAddProduct,
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: '16px 0' }}>
                <InlineStack gap="400" align="center">
                  {tabs.map((tab, index) => (
                    <Button
                      key={tab.id}
                      pressed={activeTab === index}
                      onClick={() => setActiveTab(index)}
                    >
                      {tab.content}
                    </Button>
                  ))}
                </InlineStack>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            {activeTab === 0 && (
              <Card>
                <div style={{ padding: '16px' }}>
                  <h2 style={{ marginBottom: '16px' }}>Shark Tank Products</h2>
                  <DataTable
                    columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
                    headings={['Image', 'Brand', 'Title', 'Video', 'Tag', 'Status', 'Actions']}
                    rows={productRows}
                  />
                </div>
              </Card>
            )}

            {activeTab === 1 && (
              <Card>
                <div style={{ padding: '16px' }}>
                  <h2 style={{ marginBottom: '16px' }}>Shark Tank Settings</h2>
                  <FormLayout>
                    <TextField
                      label="Section Title"
                      value={configState.title}
                      onChange={(value) => setConfigState({ ...configState, title: value })}
                      autoComplete="off"
                    />
                    <TextField
                      label="Section Subtitle"
                      value={configState.subtitle}
                      onChange={(value) => setConfigState({ ...configState, subtitle: value })}
                      autoComplete="off"
                    />
                    <Checkbox
                      label="Enable Shark Tank Section"
                      checked={configState.enabled}
                      onChange={(value) => setConfigState({ ...configState, enabled: value })}
                    />
                    <Button
                      variant="primary"
                      onClick={handleConfigSave}
                      loading={navigation.state === "submitting"}
                    >
                      Save Settings
                    </Button>
                  </FormLayout>
                </div>
              </Card>
            )}

            {activeTab === 2 && (
              <Card>
                <div style={{ padding: '16px' }}>
                  <h2 style={{ marginBottom: '16px' }}>Live Preview</h2>
                  <TextContainer>
                    <p>Your Shark Tank section will appear in the mobile app with {products.length} products.</p>
                    <p>Section: {configState.enabled ? "Enabled" : "Disabled"}</p>
                    <p>Title: {configState.title}</p>
                    <p>Subtitle: {configState.subtitle}</p>
                  </TextContainer>
                </div>
              </Card>
            )}
          </Layout.Section>
        </Layout>

        {/* Product Modal */}
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? "Edit Product" : "Add Product"}
          primaryAction={{
            content: isEditing ? "Update Product" : "Add Product",
            onAction: handleProductSave,
            loading: navigation.state === "submitting",
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setShowModal(false),
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>
              <TextField
                label="Brand Name"
                value={productForm.brand}
                onChange={(value) => setProductForm({ ...productForm, brand: value })}
                autoComplete="off"
              />
              <TextField
                label="Product Title"
                value={productForm.title}
                onChange={(value) => setProductForm({ ...productForm, title: value })}
                autoComplete="off"
              />
              <TextField
                label="Image URL"
                value={productForm.image}
                onChange={(value) => setProductForm({ ...productForm, image: value })}
                autoComplete="off"
                helpText="Product image (JPG, PNG, WebP supported)"
              />
              <TextField
                label="🎥 Video URL (MP4)"
                value={productForm.video || ""}
                onChange={(value) => setProductForm({ ...productForm, video: value })}
                autoComplete="off"
                helpText="⭐ Optional: MP4 video that will play in loop and muted in mobile app"
                placeholder="https://example.com/video.mp4"
              />
              <TextField
                label="Tag Text"
                value={productForm.tag}
                onChange={(value) => setProductForm({ ...productForm, tag: value })}
                autoComplete="off"
                helpText='e.g., "NEW", "POPULAR", "LIMITED"'
              />
              <TextField
                label="Display Order"
                type="number"
                value={productForm.order.toString()}
                onChange={(value) => setProductForm({ ...productForm, order: parseInt(value) || 0 })}
                autoComplete="off"
                helpText="Lower numbers appear first"
              />
              <Checkbox
                label="Show Tag"
                checked={productForm.showTag}
                onChange={(value) => setProductForm({ ...productForm, showTag: value })}
              />
              <Checkbox
                label="Enable Product"
                checked={productForm.enabled}
                onChange={(value) => setProductForm({ ...productForm, enabled: value })}
              />
            </FormLayout>
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