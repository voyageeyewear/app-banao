import { useState, useCallback, useEffect } from "react";
import {
  Card,
  Page,
  Layout,
  Button,
  TextField,
  Select,
  Modal,
  FormLayout,
  Banner,
  DataTable,
  Badge,
  ButtonGroup,
  Thumbnail,
  InlineStack,
  Text,
  BlockStack,
} from "@shopify/polaris";
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  ExternalIcon,
  ImageIcon,
} from "@shopify/polaris-icons";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";

// Types
interface SlideData {
  id: string;
  collection: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  background: string;
  image: string;
  ctaButtons: {
    text: string;
    type: 'primary' | 'secondary';
    linkType: 'collection' | 'product';
    linkValue: string;
  }[];
  isActive: boolean;
  order: number;
}

interface ProductOption {
  label: string;
  value: string;
}

interface CollectionOption {
  label: string;
  value: string;
}

// Loader function to fetch data
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
              featuredImage {
                url
              }
            }
          }
        }
      }
    `);

    const collections = await collectionsResponse.json();
    const products = await productsResponse.json();

    // Mock slider data (in real app, this would come from database)
    const sliderData = [
      {
        id: '1',
        collection: 'classic',
        badge: '9 to 5',
        title: 'Sleek',
        subtitle: 'Designed to Turn Heads',
        description: 'Blast of colors, Style, trends',
        background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
        image: 'https://images.unsplash.com/photo-1559087867-ce4c91325525?w=800&h=600&fit=crop',
        ctaButtons: [
          {
            text: 'Shop Collection',
            type: 'primary' as const,
            linkType: 'collection' as const,
            linkValue: 'classic-eyewear'
          }
        ],
        isActive: true,
        order: 1
      }
    ];

    return json({
      slides: sliderData,
      collections: collections.data?.collections?.edges || [],
      products: products.data?.products?.edges || []
    });

  } catch (error) {
    console.error('Error loading slider data:', error);
    return json({ 
      slides: [], 
      collections: [], 
      products: [],
      error: 'Failed to load data'
    });
  }
};

// Action function to handle form submissions
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    
    // Handle different actions (create, update, delete)
    switch (action) {
      case "create":
        // Create new slide logic
        break;
      case "update":
        // Update slide logic
        break;
      case "delete":
        // Delete slide logic
        break;
    }

    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export default function SliderManager() {
  const { slides, collections, products } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  // State management
  const [selectedSlide, setSelectedSlide] = useState<SlideData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('classic');

  // Form state
  const [formData, setFormData] = useState<Partial<SlideData>>({
    badge: '',
    title: '',
    subtitle: '',
    description: '',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    image: '',
    ctaButtons: [{ text: '', type: 'primary', linkType: 'collection', linkValue: '' }],
    isActive: true,
    order: 1
  });

  // Prepare options for selects
  const collectionOptions: CollectionOption[] = [
    { label: 'Classic Collection', value: 'classic' },
    { label: 'Premium Collection', value: 'premium' },
    { label: 'Sport Collection', value: 'sport' },
    ...collections.map((col: any) => ({
      label: col.node.title,
      value: col.node.handle
    }))
  ];

  const productOptions: ProductOption[] = products.map((prod: any) => ({
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

  // Table data for slides
  const tableRows = slides.map((slide: SlideData) => [
    <div key={slide.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Thumbnail
        source={slide.image || ''}
        alt={slide.title}
        size="small"
      />
      <div>
        <Text variant="bodyMd" fontWeight="semibold">{slide.title}</Text>
        <Text variant="bodySm" tone="subdued">{slide.subtitle}</Text>
      </div>
    </div>,
    <Badge>
      {slide.collection.charAt(0).toUpperCase() + slide.collection.slice(1)}
    </Badge>,
    <Badge tone={slide.isActive ? 'success' : 'critical'}>
      {slide.isActive ? 'Active' : 'Inactive'}
    </Badge>,
    slide.order,
    <ButtonGroup key={`actions-${slide.id}`}>
      <Button
        size="slim"
        icon={EditIcon}
        onClick={() => handleEditSlide(slide)}
      >
        Edit
      </Button>
      <Button
        size="slim"
        icon={ExternalIcon}
        url={`/pages/classic-collection.html?slide=${slide.id}`}
        target="_blank"
      >
        Preview
      </Button>
      <Button
        size="slim"
        icon={DeleteIcon}
        tone="critical"
        onClick={() => handleDeleteSlide(slide.id)}
      >
        Delete
      </Button>
    </ButtonGroup>
  ]);

  // Event handlers
  const handleEditSlide = (slide: SlideData) => {
    setSelectedSlide(slide);
    setFormData(slide);
    setIsModalOpen(true);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      submit(
        { action: 'delete', slideId },
        { method: 'post' }
      );
    }
  };

  const handleSaveSlide = () => {
    const action = selectedSlide ? 'update' : 'create';
    submit(
      { 
        action,
        slideId: selectedSlide?.id,
        ...formData 
      },
      { method: 'post' }
    );
    setIsModalOpen(false);
    setSelectedSlide(null);
  };

  const addCTAButton = () => {
    setFormData(prev => ({
      ...prev,
      ctaButtons: [
        ...(prev.ctaButtons || []),
        { text: '', type: 'secondary', linkType: 'collection', linkValue: '' }
      ]
    }));
  };

  const updateCTAButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...(formData.ctaButtons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    setFormData(prev => ({ ...prev, ctaButtons: updatedButtons }));
  };

  const removeCTAButton = (index: number) => {
    const updatedButtons = (formData.ctaButtons || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ctaButtons: updatedButtons }));
  };

  return (
    <Page
      title="Slider Manager"
      subtitle="Manage slider content for navigation tabs"
      primaryAction={{
        content: 'Add New Slide',
        icon: PlusIcon,
        onAction: () => {
          setSelectedSlide(null);
          setFormData({
            badge: '',
            title: '',
            subtitle: '',
            description: '',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            image: '',
            ctaButtons: [{ text: '', type: 'primary', linkType: 'collection', linkValue: '' }],
            isActive: true,
            order: slides.length + 1
          });
          setIsModalOpen(true);
        }
      }}
    >
      <Layout>
        <Layout.Section>
          <Banner
            title="Slider Management"
            status="info"
          >
            <p>
              Create and manage beautiful sliders for your navigation tabs. 
              Each slide can link to collections or specific products.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <Stack alignment="center" distribution="equalSpacing">
                <Heading>Current Slides</Heading>
                <Select
                  label="Filter by Collection"
                  options={[
                    { label: 'All Collections', value: 'all' },
                    ...collectionOptions
                  ]}
                  value={selectedCollection}
                  onChange={setSelectedCollection}
                />
              </Stack>
            </div>

            <DataTable
              columnContentTypes={['text', 'text', 'text', 'numeric', 'text']}
              headings={['Slide', 'Collection', 'Status', 'Order', 'Actions']}
              rows={tableRows}
            />
          </Card>
        </Layout.Section>

        {/* Edit/Create Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedSlide ? 'Edit Slide' : 'Create New Slide'}
          primaryAction={{
            content: 'Save Slide',
            onAction: handleSaveSlide,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setIsModalOpen(false),
            },
          ]}
          large
        >
          <Modal.Section>
            <FormLayout>
              <FormLayout.Group>
                <Select
                  label="Collection"
                  options={collectionOptions}
                  value={formData.collection || 'classic'}
                  onChange={(value) => setFormData(prev => ({ ...prev, collection: value }))}
                />
                
                <TextField
                  label="Badge Text"
                  value={formData.badge || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, badge: value }))}
                  placeholder="e.g., 9 to 5, Premium, New"
                />
              </FormLayout.Group>

              <FormLayout.Group>
                <TextField
                  label="Title"
                  value={formData.title || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                  placeholder="e.g., Sleek, Timeless, Elegant"
                />
                
                <TextField
                  label="Subtitle"
                  value={formData.subtitle || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, subtitle: value }))}
                  placeholder="e.g., Designed to Turn Heads"
                />
              </FormLayout.Group>

              <TextField
                label="Description"
                value={formData.description || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Brief description of the slide content"
                multiline={3}
              />

              <FormLayout.Group>
                <Select
                  label="Background"
                  options={backgroundOptions}
                  value={formData.background || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, background: value }))}
                />
                
                <TextField
                  label="Image URL"
                  value={formData.image || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  placeholder="https://images.unsplash.com/..."
                />
              </FormLayout.Group>

              {/* CTA Buttons Section */}
              <div style={{ marginTop: '24px' }}>
                <Stack alignment="center" distribution="equalSpacing">
                  <Subheading>CTA Buttons</Subheading>
                  <Button size="slim" onClick={addCTAButton}>
                    Add Button
                  </Button>
                </Stack>

                {formData.ctaButtons?.map((button, index) => (
                  <Card sectioned key={index} subdued>
                    <FormLayout>
                      <FormLayout.Group>
                        <TextField
                          label="Button Text"
                          value={button.text}
                          onChange={(value) => updateCTAButton(index, 'text', value)}
                          placeholder="e.g., Shop Collection"
                        />
                        
                        <Select
                          label="Button Type"
                          options={[
                            { label: 'Primary', value: 'primary' },
                            { label: 'Secondary', value: 'secondary' }
                          ]}
                          value={button.type}
                          onChange={(value) => updateCTAButton(index, 'type', value)}
                        />
                      </FormLayout.Group>

                      <FormLayout.Group>
                        <Select
                          label="Link Type"
                          options={[
                            { label: 'Collection', value: 'collection' },
                            { label: 'Product', value: 'product' }
                          ]}
                          value={button.linkType}
                          onChange={(value) => updateCTAButton(index, 'linkType', value)}
                        />
                        
                        <Select
                          label={button.linkType === 'collection' ? 'Collection' : 'Product'}
                          options={button.linkType === 'collection' ? collectionOptions : productOptions}
                          value={button.linkValue}
                          onChange={(value) => updateCTAButton(index, 'linkValue', value)}
                        />
                      </FormLayout.Group>

                      {formData.ctaButtons && formData.ctaButtons.length > 1 && (
                        <Button
                          size="slim"
                          destructive
                          onClick={() => removeCTAButton(index)}
                        >
                          Remove Button
                        </Button>
                      )}
                    </FormLayout>
                  </Card>
                ))}
              </div>
            </FormLayout>
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
} 