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

interface HeaderData {
  announcement: {
    text: string;
    enabled: boolean;
  };
  logo: {
    text: string;
    enabled: boolean;
  };
  genderTabs: {
    enabled: boolean;
    tabs: string[];
  };
  trendingItems: {
    enabled: boolean;
    items: Array<{
      id: string;
      title: string;
      image: string;
      url: string;
    }>;
  };
}

interface CategoryData {
  id: string;
  title: string;
  image: string;
  enabled: boolean;
  products: Array<{
    id: string;
    brand: string;
    price: string;
    offer: string;
    image: string;
  }>;
}

interface EyeglassData {
  sectionTitle: string;
  enabled: boolean;
  categories: CategoryData[];
}

interface SunglassData {
  sectionTitle: string;
  enabled: boolean;
  categories: CategoryData[];
}

interface SharkTankData {
  sectionTitle: string;
  sectionSubtitle: string;
  enabled: boolean;
  products: Array<{
    id: string;
    brand: string;
    title: string;
    image: string;
    tag: string;
    tagColor: string;
  }>;
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

const defaultHeaderData: HeaderData = {
  announcement: {
    text: "Free Shipping on Orders Above ₹2000 | Express Delivery Available",
    enabled: true
  },
  logo: {
    text: "GoEye Store",
    enabled: true
  },
  genderTabs: {
    enabled: true,
    tabs: ["All", "Men", "Women", "Unisex"]
  },
  trendingItems: {
    enabled: true,
    items: [
      {
        id: '1',
        title: 'Classic Frames',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=600&fit=crop',
        url: '#'
      },
      {
        id: '2',
        title: 'Modern Styles',
        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=600&fit=crop',
        url: '#'
      },
      {
        id: '3',
        title: 'Vintage Collection',
        image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=600&fit=crop',
        url: '#'
      }
    ]
  }
};

const defaultEyeglassData: EyeglassData = {
  sectionTitle: "Eyeglasses",
  enabled: true,
  categories: [
    {
      id: 'men',
      title: 'Men',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'John Jacobs',
          price: 'Starts at ₹3500',
          offer: 'Free lenses + Extra ₹333 Off',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'women',
      title: 'Women',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Vincent Chase',
          price: 'Starts at ₹1500',
          offer: 'Free lenses + Extra ₹333 Off',
          image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'kids',
      title: 'Kids',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Hustlr',
          price: 'Starts at ₹1500',
          offer: 'Free lenses + Extra ₹333 Off',
          image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'essentials',
      title: 'Essentials',
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Essentials',
          price: 'Starts at ₹800',
          offer: '60% Off + Free lenses',
          image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=100&h=100&fit=crop'
        }
      ]
    }
  ]
};

const defaultSunglassData: SunglassData = {
  sectionTitle: "Sunglasses",
  enabled: true,
  categories: [
    {
      id: 'men-sunglasses',
      title: 'Men',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Ray-Ban',
          price: 'Starts at ₹4500',
          offer: 'Free case + Extra ₹500 Off',
          image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'women-sunglasses',
      title: 'Women',
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Vincent Chase',
          price: 'Starts at ₹2500',
          offer: 'Free case + Extra ₹500 Off',
          image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'kids-sunglasses',
      title: 'Kids',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Kids Fun',
          price: 'Starts at ₹1800',
          offer: 'Free case + Extra ₹400 Off',
          image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'essentials-sunglasses',
      title: 'Essentials',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop',
      enabled: true,
      products: [
        {
          id: '1',
          brand: 'Budget Sunglasses',
          price: 'Starts at ₹1200',
          offer: '70% Off + Free case',
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop'
        }
      ]
    }
  ]
};

const defaultSharkTankData: SharkTankData = {
  sectionTitle: "As Seen on Shark Tank India",
  sectionSubtitle: "Style it like the Sharks!",
  enabled: true,
  products: [
    {
      id: '1',
      brand: 'PHONIC',
      title: 'Smart Audio Glasses',
      image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=330&h=400&fit=crop',
      tag: 'NEW LAUNCH',
      tagColor: '#00FF47'
    },
    {
      id: '2',
      brand: 'BLUECUT',
      title: 'Blue Light Blockers',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=330&h=400&fit=crop',
      tag: 'FEATURED',
      tagColor: '#00FF47'
    },
    {
      id: '3',
      brand: 'LUXE',
      title: 'Designer Collection',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=330&h=400&fit=crop',
      tag: 'PREMIUM',
      tagColor: '#00FF47'
    },
    {
      id: '4',
      brand: 'ACTIVE',
      title: 'Performance Sunglasses',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=330&h=400&fit=crop',
      tag: 'SPORT',
      tagColor: '#00FF47'
    }
  ]
};

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

  // New state for sections
  const [headerData, setHeaderData] = useState<HeaderData>(defaultHeaderData);
  const [eyeglassData, setEyeglassData] = useState<EyeglassData>(defaultEyeglassData);
  const [sunglassData, setSunglassData] = useState<SunglassData>(defaultSunglassData);
  const [sharkTankData, setSharkTankData] = useState<SharkTankData>(defaultSharkTankData);

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
      id: 'slider',
      content: 'Slider',
      accessibilityLabel: 'Manage slider',
    },
    {
      id: 'header',
      content: 'Header',
      accessibilityLabel: 'Manage header section',
    },
    {
      id: 'eyeglass',
      content: 'Eyeglasses',
      accessibilityLabel: 'Manage eyeglasses section',
    },
    {
      id: 'sunglass',
      content: 'Sunglasses',
      accessibilityLabel: 'Manage sunglasses section',
    },
    {
      id: 'shark-tank',
      content: 'Shark Tank',
      accessibilityLabel: 'Manage shark tank section',
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

  const renderSliderTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Slider Management
              </Text>
              <Button variant="primary" onClick={addNewSlide}>
                Add New Slide
              </Button>
            </InlineStack>

            <Checkbox
              label="Enable slider in mobile app"
              checked={sliderEnabled}
              onChange={setSliderEnabled}
              helpText="Toggle to show/hide the slider in your mobile app"
            />

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

            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">
                  Slider Settings
                </Text>
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
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderHeaderTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Header Section Management
            </Text>
            
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">
                  Announcement Bar
                </Text>
                <Checkbox
                  label="Enable announcement bar"
                  checked={headerData.announcement.enabled}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    announcement: { ...headerData.announcement, enabled: value }
                  })}
                />
                <TextField
                  label="Announcement text"
                  value={headerData.announcement.text}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    announcement: { ...headerData.announcement, text: value }
                  })}
                  multiline={2}
                  autoComplete="off"
                  helpText="Text that scrolls across the top of the app"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">
                  Logo
                </Text>
                <Checkbox
                  label="Enable logo"
                  checked={headerData.logo.enabled}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    logo: { ...headerData.logo, enabled: value }
                  })}
                />
                <TextField
                  label="Logo text"
                  value={headerData.logo.text}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    logo: { ...headerData.logo, text: value }
                  })}
                  autoComplete="off"
                  helpText="Text displayed as the logo"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">
                  Gender Tabs
                </Text>
                <Checkbox
                  label="Enable gender tabs"
                  checked={headerData.genderTabs.enabled}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    genderTabs: { ...headerData.genderTabs, enabled: value }
                  })}
                />
                <TextField
                  label="Tab labels (comma-separated)"
                  value={headerData.genderTabs.tabs.join(', ')}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    genderTabs: { 
                      ...headerData.genderTabs, 
                      tabs: value.split(',').map(tab => tab.trim()) 
                    }
                  })}
                  autoComplete="off"
                  helpText="e.g., All, Men, Women, Unisex"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">
                  Trending Items
                </Text>
                <Checkbox
                  label="Enable trending items"
                  checked={headerData.trendingItems.enabled}
                  onChange={(value) => setHeaderData({
                    ...headerData,
                    trendingItems: { ...headerData.trendingItems, enabled: value }
                  })}
                />
                
                {headerData.trendingItems.items.map((item, index) => (
                  <Card key={item.id}>
                    <BlockStack gap="300">
                      <Text as="h4" variant="bodySm">
                        Trending Item {index + 1}
                      </Text>
                      <TextField
                        label="Title"
                        value={item.title}
                        onChange={(value) => {
                          const newItems = [...headerData.trendingItems.items];
                          newItems[index].title = value;
                          setHeaderData({
                            ...headerData,
                            trendingItems: { ...headerData.trendingItems, items: newItems }
                          });
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        label="Image URL"
                        value={item.image}
                        onChange={(value) => {
                          const newItems = [...headerData.trendingItems.items];
                          newItems[index].image = value;
                          setHeaderData({
                            ...headerData,
                            trendingItems: { ...headerData.trendingItems, items: newItems }
                          });
                        }}
                        autoComplete="off"
                      />
                      <TextField
                        label="Link URL"
                        value={item.url}
                        onChange={(value) => {
                          const newItems = [...headerData.trendingItems.items];
                          newItems[index].url = value;
                          setHeaderData({
                            ...headerData,
                            trendingItems: { ...headerData.trendingItems, items: newItems }
                          });
                        }}
                        autoComplete="off"
                      />
                    </BlockStack>
                  </Card>
                ))}
              </BlockStack>
            </Card>

            <Button variant="primary" onClick={() => {
              setToastContent('✨ Header settings saved!');
              setShowToast(true);
            }}>
              Save Header Settings
            </Button>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderEyeglassTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Eyeglasses Section Management
            </Text>
            
            <Checkbox
              label="Enable eyeglasses section"
              checked={eyeglassData.enabled}
              onChange={(value) => setEyeglassData({
                ...eyeglassData,
                enabled: value
              })}
            />

            <TextField
              label="Section title"
              value={eyeglassData.sectionTitle}
              onChange={(value) => setEyeglassData({
                ...eyeglassData,
                sectionTitle: value
              })}
              autoComplete="off"
            />

            <Text as="h3" variant="headingSm">
              Categories
            </Text>

            {eyeglassData.categories.map((category, index) => (
              <Card key={category.id}>
                <BlockStack gap="300">
                  <InlineStack gap="300" align="space-between">
                    <Text as="h4" variant="bodySm">
                      {category.title} Category
                    </Text>
                    <Checkbox
                      label="Enabled"
                      checked={category.enabled}
                      onChange={(value) => {
                        const newCategories = [...eyeglassData.categories];
                        newCategories[index].enabled = value;
                        setEyeglassData({
                          ...eyeglassData,
                          categories: newCategories
                        });
                      }}
                    />
                  </InlineStack>
                  
                  <TextField
                    label="Category title"
                    value={category.title}
                    onChange={(value) => {
                      const newCategories = [...eyeglassData.categories];
                      newCategories[index].title = value;
                      setEyeglassData({
                        ...eyeglassData,
                        categories: newCategories
                      });
                    }}
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="Category image URL"
                    value={category.image}
                    onChange={(value) => {
                      const newCategories = [...eyeglassData.categories];
                      newCategories[index].image = value;
                      setEyeglassData({
                        ...eyeglassData,
                        categories: newCategories
                      });
                    }}
                    autoComplete="off"
                  />
                  
                  <Thumbnail
                    source={category.image}
                    alt={category.title}
                    size="small"
                  />
                </BlockStack>
              </Card>
            ))}

            <Button variant="primary" onClick={() => {
              setToastContent('✨ Eyeglasses settings saved!');
              setShowToast(true);
            }}>
              Save Eyeglasses Settings
            </Button>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderSunglassTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Sunglasses Section Management
            </Text>
            
            <Checkbox
              label="Enable sunglasses section"
              checked={sunglassData.enabled}
              onChange={(value) => setSunglassData({
                ...sunglassData,
                enabled: value
              })}
            />

            <TextField
              label="Section title"
              value={sunglassData.sectionTitle}
              onChange={(value) => setSunglassData({
                ...sunglassData,
                sectionTitle: value
              })}
            />

            <Text as="h3" variant="headingSm">
              Categories
            </Text>

            {sunglassData.categories.map((category, index) => (
              <Card key={category.id} sectioned>
                <BlockStack gap="300">
                  <InlineStack gap="300" align="space-between">
                    <Text as="h4" variant="bodySm">
                      {category.title} Category
                    </Text>
                    <Checkbox
                      label="Enabled"
                      checked={category.enabled}
                      onChange={(value) => {
                        const newCategories = [...sunglassData.categories];
                        newCategories[index].enabled = value;
                        setSunglassData({
                          ...sunglassData,
                          categories: newCategories
                        });
                      }}
                    />
                  </InlineStack>
                  
                  <TextField
                    label="Category title"
                    value={category.title}
                    onChange={(value) => {
                      const newCategories = [...sunglassData.categories];
                      newCategories[index].title = value;
                      setSunglassData({
                        ...sunglassData,
                        categories: newCategories
                      });
                    }}
                  />
                  
                  <TextField
                    label="Category image URL"
                    value={category.image}
                    onChange={(value) => {
                      const newCategories = [...sunglassData.categories];
                      newCategories[index].image = value;
                      setSunglassData({
                        ...sunglassData,
                        categories: newCategories
                      });
                    }}
                  />
                  
                  <Thumbnail
                    source={category.image}
                    alt={category.title}
                    size="small"
                  />
                </BlockStack>
              </Card>
            ))}

            <Button variant="primary" onClick={() => {
              setToastContent('✨ Sunglasses settings saved!');
              setShowToast(true);
            }}>
              Save Sunglasses Settings
            </Button>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderSharkTankTab = () => (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Shark Tank Section Management
            </Text>
            
            <Checkbox
              label="Enable Shark Tank section"
              checked={sharkTankData.enabled}
              onChange={(value) => setSharkTankData({
                ...sharkTankData,
                enabled: value
              })}
            />

            <TextField
              label="Section title"
              value={sharkTankData.sectionTitle}
              onChange={(value) => setSharkTankData({
                ...sharkTankData,
                sectionTitle: value
              })}
            />

            <TextField
              label="Section subtitle"
              value={sharkTankData.sectionSubtitle}
              onChange={(value) => setSharkTankData({
                ...sharkTankData,
                sectionSubtitle: value
              })}
            />

            <Text as="h3" variant="headingSm">
              Products
            </Text>

            {sharkTankData.products.map((product, index) => (
              <Card key={product.id} sectioned>
                <BlockStack gap="300">
                  <Text as="h4" variant="bodySm">
                    Product {index + 1}
                  </Text>
                  
                  <TextField
                    label="Brand name"
                    value={product.brand}
                    onChange={(value) => {
                      const newProducts = [...sharkTankData.products];
                      newProducts[index].brand = value;
                      setSharkTankData({
                        ...sharkTankData,
                        products: newProducts
                      });
                    }}
                  />
                  
                  <TextField
                    label="Product title"
                    value={product.title}
                    onChange={(value) => {
                      const newProducts = [...sharkTankData.products];
                      newProducts[index].title = value;
                      setSharkTankData({
                        ...sharkTankData,
                        products: newProducts
                      });
                    }}
                  />
                  
                  <TextField
                    label="Product image URL"
                    value={product.image}
                    onChange={(value) => {
                      const newProducts = [...sharkTankData.products];
                      newProducts[index].image = value;
                      setSharkTankData({
                        ...sharkTankData,
                        products: newProducts
                      });
                    }}
                  />
                  
                  <TextField
                    label="Tag text"
                    value={product.tag}
                    onChange={(value) => {
                      const newProducts = [...sharkTankData.products];
                      newProducts[index].tag = value;
                      setSharkTankData({
                        ...sharkTankData,
                        products: newProducts
                      });
                    }}
                  />
                  
                  <TextField
                    label="Tag color"
                    value={product.tagColor}
                    onChange={(value) => {
                      const newProducts = [...sharkTankData.products];
                      newProducts[index].tagColor = value;
                      setSharkTankData({
                        ...sharkTankData,
                        products: newProducts
                      });
                    }}
                    helpText="Hex color code (e.g., #00FF47)"
                  />
                  
                  <Thumbnail
                    source={product.image}
                    alt={product.title}
                    size="small"
                  />
                </BlockStack>
              </Card>
            ))}

            <Button variant="primary" onClick={() => {
              setToastContent('✨ Shark Tank settings saved!');
              setShowToast(true);
            }}>
              Save Shark Tank Settings
            </Button>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  return (
    <Frame>
      <Page>
        <TitleBar title="Mobile App Management" />
        <Layout>
          <Layout.Section>
            <Card>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                <Box paddingBlockStart="400">
                  {selectedTab === 0 && renderSliderTab()}
                  {selectedTab === 1 && renderHeaderTab()}
                  {selectedTab === 2 && renderEyeglassTab()}
                  {selectedTab === 3 && renderSunglassTab()}
                  {selectedTab === 4 && renderSharkTankTab()}
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