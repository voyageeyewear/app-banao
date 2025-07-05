import React, { useState, useEffect, useRef } from "react";
import { Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { loader as shopifyDataLoader } from "./api.shopify-data";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const HOMEPAGE_COMPONENTS = [
  { type: "Header", label: "Header" },
  { type: "AnnouncementBar", label: "Announcement Bar" },
  { type: "ImageSlider", label: "Image Slider" },
  { type: "FeaturedProduct", label: "Featured Product" },
  { type: "ProductCarousel", label: "Product Carousel" },
  { type: "Spacer", label: "Spacer" },
  { type: "BannerCTA", label: "Banner with CTA" },
  { type: "Footer", label: "Footer" },
];

const PDP_COMPONENTS = [
  { type: "ProductImageGallery", label: "Product Image Gallery" },
  { type: "ProductInfo", label: "Product Information" },
  { type: "ProductVariants", label: "Product Variants" },
  { type: "ProductDescription", label: "Product Description" },
  { type: "AddToCart", label: "Add to Cart" },
  { type: "ProductReviews", label: "Product Reviews" },
  { type: "RelatedProducts", label: "Related Products" },
  { type: "Spacer", label: "Spacer" },
  { type: "BannerCTA", label: "Banner with CTA" },
];

interface ComponentType {
  type: string;
  label: string;
}

interface CanvasItem {
  id: string;
  type: string;
  props?: Record<string, any>;
}

interface DraggablePaletteItemProps {
  component: ComponentType;
  onDragStart?: (component: ComponentType) => void;
}

function DraggablePaletteItem({ component, onDragStart }: DraggablePaletteItemProps) {
  return (
    <li
      style={{
        padding: "8px 12px",
        marginBottom: 8,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 4,
        cursor: "grab",
      }}
      draggable
      onDragStart={e => {
        e.dataTransfer.setData("component", JSON.stringify(component));
        if (onDragStart) onDragStart(component);
      }}
    >
      {component.label}
    </li>
  );
}

interface SortableItemProps {
  id: string;
  type: string;
  index: number;
}

function SortableItem({ id, type, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        style={{
          padding: 16,
          background: isDragging ? '#e0f7fa' : '#fafafa',
          border: '1px solid #ddd',
          borderRadius: 6,
          marginBottom: 12,
          boxShadow: isDragging ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
        }}
      >
        <strong>{type}</strong> (Component #{index + 1})
      </div>
    </div>
  );
}

interface ShopifyProduct {
  id: string;
  title: string;
  description?: string;
  inventory?: number;
  image: string | null;
  images?: string[];
  price: string | null;
  handle: string;
  variants?: { id: string; title: string }[];
}

interface ShopifyCollection {
  id: string;
  title: string;
  image: string | null;
  products?: ShopifyProduct[];
}

interface CartLine {
  node: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      product: {
        title: string;
      };
    };
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: CartLine[];
  };
}

function PropertyEditor({
  item,
  products,
  collections,
  onChange,
}: {
  item: CanvasItem;
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  onChange: (props: Record<string, any>) => void;
}) {
  if (!item) return null;
  const { type, props = {} } = item;

  // Dynamically import ReactQuill only on the client
  const [Quill, setQuill] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import("react-quill").then((mod) => {
      if (mounted) setQuill(() => mod.default);
      import("react-quill/dist/quill.snow.css");
    });
    return () => { mounted = false; };
  }, []);

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ ...props, image: ev.target?.result });
    };
    reader.readAsDataURL(file);
  };

  switch (type) {
    case "Header":
      return (
        <div>
          <label>Header Text</label>
          <input
            type="text"
            value={props.text || ""}
            onChange={e => onChange({ ...props, text: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          />
        </div>
      );
    case "AnnouncementBar":
      return (
        <div>
          <label>Announcement</label>
          {Quill ? (
            <Quill
              theme="snow"
              value={props.text || ""}
              onChange={(val: string) => onChange({ ...props, text: val })}
              style={{ marginBottom: 12 }}
            />
          ) : (
            <div>Loading editor…</div>
          )}
        </div>
      );
    case "FeaturedProduct":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      );
    case "ProductCarousel":
      return (
        <div>
          <label>Collection</label>
          <select
            value={props.collectionId || collections[0]?.id || ""}
            onChange={e => onChange({ ...props, collectionId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      );
    case "BannerCTA":
      return (
        <div>
          <label>Heading</label>
          <input
            type="text"
            value={props.heading || ""}
            onChange={e => onChange({ ...props, heading: e.target.value })}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <label>Subtext</label>
          {Quill ? (
            <Quill
              theme="snow"
              value={props.subtext || ""}
              onChange={(val: string) => onChange({ ...props, subtext: val })}
              style={{ marginBottom: 8 }}
            />
          ) : (
            <div>Loading editor…</div>
          )}
          <label>Button Label</label>
          <input
            type="text"
            value={props.button || ""}
            onChange={e => onChange({ ...props, button: e.target.value })}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <label>Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', marginBottom: 8, padding: '4px' }} />
          {props.image && (
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <img src={props.image} alt="Banner" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #ddd' }} />
            </div>
          )}
        </div>
      );
    case "ProductImageGallery":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <label>Gallery Style</label>
          <select
            value={props.galleryStyle || "grid"}
            onChange={e => onChange({ ...props, galleryStyle: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            <option value="grid">Grid Layout</option>
            <option value="carousel">Carousel</option>
            <option value="masonry">Masonry</option>
          </select>
        </div>
      );
    case "ProductInfo":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <label>Show Price</label>
          <input
            type="checkbox"
            checked={props.showPrice !== false}
            onChange={e => onChange({ ...props, showPrice: e.target.checked })}
            style={{ marginBottom: 12 }}
          />
          <label>Show SKU</label>
          <input
            type="checkbox"
            checked={props.showSku !== false}
            onChange={e => onChange({ ...props, showSku: e.target.checked })}
            style={{ marginBottom: 12 }}
          />
        </div>
      );
    case "ProductVariants":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <label>Variant Display</label>
          <select
            value={props.variantDisplay || "dropdown"}
            onChange={e => onChange({ ...props, variantDisplay: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            <option value="dropdown">Dropdown</option>
            <option value="buttons">Buttons</option>
            <option value="swatches">Color Swatches</option>
          </select>
        </div>
      );
    case "ProductDescription":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <label>Show Full Description</label>
          <input
            type="checkbox"
            checked={props.showFullDescription !== false}
            onChange={e => onChange({ ...props, showFullDescription: e.target.checked })}
            style={{ marginBottom: 12 }}
          />
        </div>
      );
    case "AddToCart":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <label>Button Style</label>
          <select
            value={props.buttonStyle || "primary"}
            onChange={e => onChange({ ...props, buttonStyle: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
          <label>Show Quantity Selector</label>
          <input
            type="checkbox"
            checked={props.showQuantity !== false}
            onChange={e => onChange({ ...props, showQuantity: e.target.checked })}
            style={{ marginBottom: 12 }}
          />
        </div>
      );
    case "ProductReviews":
      return (
        <div>
          <label>Product</label>
          <select
            value={props.productId || products[0]?.id || ""}
            onChange={e => onChange({ ...props, productId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <label>Show Rating</label>
          <input
            type="checkbox"
            checked={props.showRating !== false}
            onChange={e => onChange({ ...props, showRating: e.target.checked })}
            style={{ marginBottom: 12 }}
          />
          <label>Show Review Count</label>
          <input
            type="checkbox"
            checked={props.showReviewCount !== false}
            onChange={e => onChange({ ...props, showReviewCount: e.target.checked })}
            style={{ marginBottom: 12 }}
          />
        </div>
      );
    case "RelatedProducts":
      return (
        <div>
          <label>Collection</label>
          <select
            value={props.collectionId || collections[0]?.id || ""}
            onChange={e => onChange({ ...props, collectionId: e.target.value })}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <label>Number of Products</label>
          <input
            type="number"
            value={props.productCount || 4}
            min={1}
            max={12}
            onChange={e => onChange({ ...props, productCount: Number(e.target.value) })}
            style={{ width: "100%", marginBottom: 12 }}
          />
        </div>
      );
    case "Spacer":
      return (
        <div>
          <label>Height (px)</label>
          <input
            type="number"
            value={props.height || 40}
            min={8}
            max={200}
            onChange={e => onChange({ ...props, height: Number(e.target.value) })}
            style={{ width: "100%", marginBottom: 12 }}
          />
        </div>
      );
    default:
      return <div>No editable properties.</div>;
  }
}

function Preview({ 
  items, 
  products, 
  collections,
  designType
}: { 
  items: CanvasItem[]; 
  products: ShopifyProduct[]; 
  collections: ShopifyCollection[];
  designType: 'homepage' | 'pdp';
}) {
  const [view, setView] = React.useState<'main' | 'product'>('main');
  const [selectedProduct, setSelectedProduct] = React.useState<ShopifyProduct | null>(null);
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const handleProductClick = (product: ShopifyProduct) => {
    setSelectedProduct(product);
    setView('product');
  };

  const handleBack = () => {
    setView('main');
    setSelectedProduct(null);
  };

  const handleAddToCart = async (product: ShopifyProduct) => {
    setCartLoading(true);
    try {
      let newCart = cart;
      let variantId: string;
      if (product.variants && product.variants.length > 0) {
        variantId = product.variants[0].id;
      } else {
        variantId = product.id;
      }
      if (!cart) {
        newCart = await createCart(variantId, 1);
      } else {
        newCart = await addToCart(cart.id, variantId, 1);
      }
      setCart(newCart);
      setShowCart(true);
    } catch (err) {
      alert("Failed to add to cart: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div
      style={{
        width: 320,
        height: 640,
        border: '1px solid #aaa',
        borderRadius: 24,
        background: '#fff',
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      {/* Simulated mobile status bar */}
      <div style={{ height: 32, background: '#f5f5f5', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>
        9:41 AM &nbsp;|&nbsp; 100% 🔋
      </div>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {view === 'main' ? (
          items.length === 0 ? (
            <div style={{ color: '#bbb', textAlign: 'center', marginTop: 120 }}>
              <p>App preview will appear here.</p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
                Currently viewing: {designType === 'homepage' ? 'Homepage' : 'Product Detail Page'}
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const props = item.props || {};
              switch (item.type) {
                case 'Header':
                  return (
                    <div key={item.id} style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
                      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{props.text || 'Your Store'}</h1>
                    </div>
                  );
                case 'AnnouncementBar':
                  return (
                    <div key={item.id} style={{ padding: '8px 16px', background: '#000', color: '#fff', fontSize: 13, textAlign: 'center' }}>
                      <span dangerouslySetInnerHTML={{ __html: props.text || '🎉 Free shipping on orders over $50!' }} />
                    </div>
                  );
                case 'ImageSlider':
                  return (
                    <div key={item.id} style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: '#999' }}>Image Slider</p>
                    </div>
                  );
                case 'FeaturedProduct': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: 16 }}>
                      <div 
                        style={{ 
                          background: '#f5f5f5', 
                          height: 240, 
                          borderRadius: 8, 
                          marginBottom: 12, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleProductClick(product)}
                      >
                        {product.image ? <img src={product.image} alt={product.title} style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8 }} /> : <span style={{ color: '#999' }}>Product Image</span>}
                      </div>
                      <h3 
                        style={{ margin: '0 0 4px', fontSize: 18, cursor: 'pointer' }}
                        onClick={() => handleProductClick(product)}
                      >
                        {product.title}
                      </h3>
                      <p style={{ margin: '0 0 12px', color: '#666' }}>{product.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20, fontWeight: 600 }}>${product.price}</span>
                        <button 
                          style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ) : null;
                }
                case 'ProductCarousel': {
                  const collection = collections.find(c => c.id === props.collectionId) || collections[0];
                  const carouselProducts = collection?.products?.length ? collection.products : products.slice(0, 3);
                  return (
                    <div key={item.id} style={{ padding: '16px 0' }}>
                      <h3 style={{ margin: '0 16px 12px', fontSize: 16 }}>{collection?.title || 'Featured Products'}</h3>
                      <div style={{ display: 'flex', overflowX: 'auto', gap: 12, padding: '0 16px' }}>
                        {carouselProducts.map((product) => (
                          <div 
                            key={product.id} 
                            style={{ flex: '0 0 140px', cursor: 'pointer' }}
                            onClick={() => handleProductClick(product)}
                          >
                            <div style={{ background: '#f5f5f5', height: 140, borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {product.image ? <img src={product.image} alt={product.title} style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8 }} /> : <span style={{ color: '#999' }}>Image</span>}
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>{product.title}</h4>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>${product.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                case 'Spacer':
                  return <div key={item.id} style={{ height: props.height || 40 }} />;
                case 'ProductImageGallery': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <div style={{ 
                        background: '#f5f5f5', 
                        height: 300, 
                        borderRadius: 8, 
                        marginBottom: 12, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            style={{ 
                              maxHeight: '100%', 
                              maxWidth: '100%', 
                              objectFit: 'cover',
                              borderRadius: 8 
                            }} 
                          />
                        ) : (
                          <span style={{ color: '#999' }}>Product Image Gallery</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                        Gallery Style: {props.galleryStyle || 'grid'}
                      </div>
                    </div>
                  ) : null;
                }
                case 'ProductInfo': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: '#333' }}>
                        {product.title}
                      </h1>
                      {props.showPrice !== false && (
                        <div style={{ marginBottom: '16px' }}>
                          <span style={{ fontSize: 28, fontWeight: 700, color: '#1976d2' }}>
                            ${product.price || '0.00'}
                          </span>
                        </div>
                      )}
                      {props.showSku !== false && (
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                          SKU: {product.id}
                        </div>
                      )}
                    </div>
                  ) : null;
                }
                case 'ProductVariants': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Product Variants</h3>
                      <div style={{ 
                        padding: '12px', 
                        background: '#f9f9f9', 
                        borderRadius: 6,
                        fontSize: 14,
                        color: '#666'
                      }}>
                        Variant Display: {props.variantDisplay || 'dropdown'}
                      </div>
                    </div>
                  ) : null;
                }
                case 'ProductDescription': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Product Description</h3>
                      {product.description && (
                        <p style={{ 
                          margin: '0 0 16px', 
                          color: '#666', 
                          lineHeight: 1.5,
                          fontSize: 14
                        }}>
                          {props.showFullDescription !== false ? product.description : product.description.substring(0, 100) + '...'}
                        </p>
                      )}
                    </div>
                  ) : null;
                }
                case 'AddToCart': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        {props.showQuantity !== false && (
                          <>
                            <label style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Qty:</label>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              border: '1px solid #ddd', 
                              borderRadius: 6,
                              overflow: 'hidden'
                            }}>
                              <button style={{ padding: '8px 12px', border: 'none', background: '#f5f5f5', cursor: 'pointer' }}>-</button>
                              <span style={{ padding: '8px 12px', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>1</span>
                              <button style={{ padding: '8px 12px', border: 'none', background: '#f5f5f5', cursor: 'pointer' }}>+</button>
                            </div>
                          </>
                        )}
                        <button 
                          style={{ 
                            padding: '12px 24px', 
                            background: props.buttonStyle === 'outline' ? 'transparent' : '#1976d2', 
                            color: props.buttonStyle === 'outline' ? '#1976d2' : '#fff', 
                            border: props.buttonStyle === 'outline' ? '2px solid #1976d2' : 'none', 
                            borderRadius: 6, 
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ) : null;
                }
                case 'ProductReviews': {
                  const product = products.find(p => p.id === props.productId) || products[0];
                  return product ? (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Product Reviews</h3>
                      <div style={{ 
                        padding: '12px', 
                        background: '#f9f9f9', 
                        borderRadius: 6,
                        fontSize: 14,
                        color: '#666'
                      }}>
                        {props.showRating !== false && <div>⭐ ⭐ ⭐ ⭐ ⭐ (4.5)</div>}
                        {props.showReviewCount !== false && <div style={{ marginTop: 4 }}>Based on 24 reviews</div>}
                      </div>
                    </div>
                  ) : null;
                }
                case 'RelatedProducts': {
                  const collection = collections.find(c => c.id === props.collectionId) || collections[0];
                  const relatedProducts = collection?.products?.length ? collection.products : products.slice(0, props.productCount || 4);
                  return (
                    <div key={item.id} style={{ padding: '16px' }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Related Products</h3>
                      <div style={{ display: 'flex', overflowX: 'auto', gap: 12 }}>
                        {relatedProducts.map((product) => (
                          <div 
                            key={product.id} 
                            style={{ flex: '0 0 120px', cursor: 'pointer' }}
                            onClick={() => handleProductClick(product)}
                          >
                            <div style={{ background: '#f5f5f5', height: 120, borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {product.image ? <img src={product.image} alt={product.title} style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 8 }} /> : <span style={{ color: '#999' }}>Image</span>}
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: 12 }}>{product.title}</h4>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>${product.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                case 'BannerCTA':
                  return (
                    <div key={item.id} style={{ margin: '16px', padding: '24px', background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                      {props.image && <img src={props.image} alt="Banner" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12 }} />}
                      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{props.heading || 'Special Offer'}</h3>
                      <div style={{ margin: '0 0 16px', color: '#666' }}>
                        <span dangerouslySetInnerHTML={{ __html: props.subtext || 'Get 20% off your first order!' }} />
                      </div>
                      <button style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: 6, cursor: 'pointer' }}>
                        {props.button || 'Shop Now'}
                      </button>
                    </div>
                  );
                case 'Footer':
                  return (
                    <div key={item.id} style={{ padding: '24px 16px', background: '#f5f5f5', marginTop: 'auto' }}>
                      <div style={{ borderTop: '1px solid #ddd', paddingTop: 16, fontSize: 13, color: '#666', textAlign: 'center' }}>
                        © 2024 Your Store. All rights reserved.
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })
          )
        ) : (
          // Product detail view
          selectedProduct && (
            <div style={{ padding: 16 }}>
              <button onClick={handleBack} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>← Back</button>
              <div style={{ background: '#f5f5f5', height: 240, borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedProduct.image ? <img src={selectedProduct.image} alt={selectedProduct.title} style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8 }} /> : <span style={{ color: '#999' }}>Product Image</span>}
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{selectedProduct.title}</h3>
              <p style={{ margin: '0 0 12px', color: '#666' }}>{selectedProduct.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 600 }}>${selectedProduct.price}</span>
                {selectedProduct.inventory !== undefined && (
                  <span style={{ fontSize: 14, color: selectedProduct.inventory > 0 ? '#4caf50' : '#f44336', fontWeight: 500 }}>
                    {selectedProduct.inventory > 0 ? `${selectedProduct.inventory} in stock` : 'Out of stock'}
                  </span>
                )}
              </div>
              <button
                onClick={async () => {
                  setCartLoading(true);
                  let newCart = cart;
                  let variantId: string;
                  if (selectedProduct.variants && selectedProduct.variants.length > 0) {
                    variantId = selectedProduct.variants[0].id;
                  } else {
                    variantId = selectedProduct.id;
                  }
                  if (!cart) {
                    newCart = await createCart(variantId, 1);
                  } else {
                    newCart = await addToCart(cart.id, variantId, 1);
                  }
                  setCart(newCart);
                  setShowCart(true);
                }}
                disabled={cartLoading}
                style={{ width: '100%', background: '#1976d2', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600, marginBottom: 12 }}
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              <button style={{ width: '100%', background: '#fff', color: '#1976d2', border: '1px solid #1976d2', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
                Buy Now
              </button>
            </div>
          )
        )}
      </div>
      {showCart && cart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 400 }}>
            <h3>Cart</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cart.lines.edges.map((edge: CartLine) => (
                <li key={edge.node.id} style={{ marginBottom: 12 }}>
                  <div><b>{edge.node.merchandise.product.title}</b></div>
                  <div>Variant: {edge.node.merchandise.title}</div>
                  <div>Qty: {edge.node.quantity}</div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.open(cart.checkoutUrl, '_blank')}
              style={{ width: '100%', background: '#1976d2', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600, marginBottom: 12 }}
            >
              Checkout
            </button>
            <button
              onClick={() => setShowCart(false)}
              style={{ width: '100%', background: '#eee', color: '#333', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



async function createCart(variantId: string, quantity = 1): Promise<ShopifyCart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "createCart",
      variantId,
      quantity,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.cartCreate.cart;
}

async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<ShopifyCart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "addToCart",
      cartId,
      variantId,
      quantity,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.cartLinesAdd.cart;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return await shopifyDataLoader({ request, params: {}, context: {} });
};

export default function Builder() {
  const { products, collections } = useLoaderData<typeof loader>();
  const [designType, setDesignType] = useState<'homepage' | 'pdp'>('homepage');
  const [homepageItems, setHomepageItems] = useState<CanvasItem[]>([]);
  const [pdpItems, setPdpItems] = useState<CanvasItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pdpActive, setPdpActive] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  
  // Get current items based on design type
  const currentItems = designType === 'homepage' ? homepageItems : pdpItems;
  const setCurrentItems = designType === 'homepage' ? setHomepageItems : setPdpItems;
  
  // Get current components based on design type
  const currentComponents = designType === 'homepage' ? HOMEPAGE_COMPONENTS : PDP_COMPONENTS;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCurrentItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = e.dataTransfer.getData("component");
    console.log("Drop event:", { componentData });
    if (componentData) {
      const component = JSON.parse(componentData);
      const newItem: CanvasItem = {
        id: `${component.type}-${Date.now()}`,
        type: component.type,
        props: {},
      };
      console.log("Adding new item:", newItem);
      setCurrentItems((prev) => {
        const newItems = [...prev, newItem];
        console.log("Updated items:", newItems);
        return newItems;
      });
    }
  };

  const handleSelect = (id: string) => setSelectedId(id);
  const handleDeselect = () => setSelectedId(null);
  const handlePropsChange = (id: string, newProps: Record<string, any>) => {
    setCurrentItems(items => items.map(item => item.id === id ? { ...item, props: newProps } : item));
  };

  // Save current layout to backend
  const handleSave = async () => {
    const name = nameRef.current?.value?.trim() || "Untitled";
    
    // Validate template name
    if (!name || name.length === 0) {
      setSaveStatus("Template name cannot be empty");
      return;
    }
    
    // Check if template has components
    if (currentItems.length === 0) {
      setSaveStatus("Cannot save empty template. Add some components first.");
      return;
    }
    
    setSaveStatus(null);
    try {
      console.log("Saving template:", { name, data: currentItems, designType });
      const res = await fetch("/api/templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, data: currentItems, designType }),
      });
      const data = await res.json();
      console.log("Save response:", { status: res.status, data });
      if (res.ok) {
        setSaveStatus(data.message || "Saved!");
        // Clear the name input after successful save
        if (nameRef.current) {
          nameRef.current.value = "";
        }
      } else {
        setSaveStatus(data.error || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("Failed to save");
    }
  };

  // Load templates from backend
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    setLoadStatus(null);
    try {
      const res = await fetch("/api/templates/load");
      const data = await res.json();
      if (res.ok) {
        // Filter out empty templates and sort by updated date
        const validTemplates = data
          .filter((template: any) => 
            template.data && 
            Array.isArray(template.data) && 
            template.data.length > 0
          )
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        setTemplates(validTemplates);
        
        if (validTemplates.length === 0) {
          setLoadStatus("No templates found. Create and save a template first.");
        }
      } else {
        setLoadStatus(data.error || "Failed to load templates");
      }
    } catch (err) {
      setLoadStatus("Failed to load templates");
    }
    setLoadingTemplates(false);
  };

  // Load a selected template
  const handleLoad = async (id: string) => {
    setLoadStatus(null);
    try {
      const res = await fetch(`/api/templates/load?id=${id}`);
      const data = await res.json();
      if (res.ok && data.data) {
        if (data.designType === 'pdp') {
          setPdpItems(data.data);
          setDesignType('pdp');
        } else {
          setHomepageItems(data.data);
          setDesignType('homepage');
        }
        setShowLoadModal(false);
      } else {
        setLoadStatus(data.error || "Failed to load template");
      }
    } catch (err) {
      setLoadStatus("Failed to load template");
    }
  };

  // Delete a template
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/templates/delete?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh templates list
        fetchTemplates();
        setLoadStatus(`Template "${name}" deleted successfully`);
      } else {
        setLoadStatus(data.error || "Failed to delete template");
      }
    } catch (err) {
      setLoadStatus("Failed to delete template");
    }
  };

  // Handle design type change
  const handleDesignTypeChange = (newDesignType: 'homepage' | 'pdp') => {
    setDesignType(newDesignType);
    setSelectedId(null); // Clear selection when switching
  };

  // Toggle PDP active status
  const handlePdpToggle = async () => {
    const newStatus = !pdpActive;
    
    // If activating and no PDP design exists, show a message
    if (newStatus && pdpItems.length === 0) {
      alert("Please add some components to your Product Detail Page design before activating it.");
      return;
    }
    
    setPdpActive(newStatus);
    
    try {
      const res = await fetch("/api/pdp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          active: newStatus,
          designData: pdpItems 
        }),
      });
      
      if (!res.ok) {
        // Revert if failed
        setPdpActive(!newStatus);
        console.error("Failed to update PDP status");
      } else {
        // Show success message
        const data = await res.json();
        console.log(data.message);
      }
    } catch (err) {
      // Revert if failed
      setPdpActive(!newStatus);
      console.error("Error updating PDP status:", err);
    }
  };

  // Load PDP status on component mount
  useEffect(() => {
    const loadPdpStatus = async () => {
      try {
        const res = await fetch("/api/pdp/status");
        if (res.ok) {
          const data = await res.json();
          setPdpActive(data.active || false);
          if (data.designData && data.designData.length > 0) {
            setPdpItems(data.designData);
          }
        }
      } catch (err) {
        console.error("Error loading PDP status:", err);
      }
    };
    
    loadPdpStatus();
  }, []);

  return (
    <Page>
      <style>{`
        .builder-root {
          width: 100vw;
          min-height: 100vh;
          background: #f5f6fa;
        }
        .builder-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px 0 8px;
          background: #f5f6fa;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .design-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .design-selector label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        .design-selector select {
          padding: 4px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #fff;
          font-size: 14px;
          cursor: pointer;
        }
        .builder-grid {
          display: grid;
          grid-template-columns: 220px 1.5fr 260px 340px;
          gap: 16px;
          align-items: stretch;
          width: 100vw;
          min-height: 0;
          height: calc(100vh - 56px);
          overflow-x: auto;
        }
        @media (max-width: 1200px) {
          .builder-grid {
            grid-template-columns: 48px 1fr 48px 1fr;
          }
        }
        @media (max-width: 900px) {
          .builder-grid {
            grid-template-columns: 1fr;
            gap: 10px;
            height: auto;
            overflow-x: visible;
          }
          .builder-panel, .builder-canvas, .builder-preview {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100vw !important;
            height: auto !important;
            max-height: none !important;
          }
        }
        .builder-panel, .builder-canvas, .builder-preview {
          height: 100%;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          min-height: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid #ececec;
          overflow: hidden;
        }
        .panel-content {
          flex: 1 1 0;
          overflow-y: auto;
          min-height: 0;
          padding: 8px 12px;
        }
        .sticky-header {
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 2;
          padding-bottom: 8px;
        }
        .collapse-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #888;
          float: right;
          margin-left: 8px;
        }
        .collapsed-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid #ececec;
          margin-bottom: 8px;
        }
        @media (max-width: 700px) {
          .builder-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            padding: 8px 4px 0 4px;
          }
          .builder-grid {
            grid-template-columns: 1fr;
            gap: 8px;
            height: auto;
          }
          .builder-panel, .builder-canvas, .builder-preview {
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            padding: 0 !important;
          }
          .panel-content {
            padding: 6px 4px;
          }
        }
      `}</style>
      <div className="builder-root">
        {/* Save/Load Controls */}
        <div className="builder-controls">
          <div className="design-selector">
            <label>Design:</label>
            <select 
              value={designType} 
              onChange={(e) => handleDesignTypeChange(e.target.value as 'homepage' | 'pdp')}
            >
              <option value="homepage">Homepage</option>
              <option value="pdp">Product Detail Page</option>
            </select>
          </div>
          {designType === 'pdp' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>PDP Status:</label>
              <button 
                onClick={handlePdpToggle}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: 6, 
                  background: pdpActive ? '#4caf50' : '#f44336', 
                  color: '#fff', 
                  border: 'none', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                {pdpActive ? 'Active' : 'Inactive'}
              </button>
              {pdpActive && products.length > 0 && (
                <a 
                  href={`/products/${products[0].handle}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: 6, 
                    background: '#1976d2', 
                    color: '#fff', 
                    border: 'none', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: 12,
                    textDecoration: 'none'
                  }}
                >
                  Test PDP
                </a>
              )}
            </div>
          )}
          <input ref={nameRef} type="text" placeholder="Template name" style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc', minWidth: 120, flex: 1 }} />
          <button onClick={handleSave} style={{ padding: '8px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save</button>
          <button onClick={() => { setShowLoadModal(true); fetchTemplates(); }} style={{ padding: '8px 18px', borderRadius: 6, background: '#fff', color: '#1976d2', border: '1px solid #1976d2', fontWeight: 600, cursor: 'pointer' }}>Load</button>
          {saveStatus && <span style={{ marginLeft: 8, color: saveStatus === 'Saved!' ? 'green' : 'red', fontSize: 14 }}>{saveStatus}</span>}
        </div>
        {/* Load Modal */}
        {showLoadModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 500, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 18 }}>Load Template</h3>
              {loadingTemplates ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading templates...</div>
              ) : (
                <>
                  {templates.length === 0 ? (
                    <div style={{ color: '#bbb', textAlign: 'center', padding: '20px' }}>
                      <p>No templates found.</p>
                      <p style={{ fontSize: '14px', marginTop: '8px' }}>Create and save a template first.</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {templates.map(t => (
                          <li key={t.id} style={{ 
                            marginBottom: 12, 
                            padding: '12px', 
                            border: '1px solid #eee', 
                            borderRadius: 8,
                            background: '#fafafa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 16 }}>{t.name}</span>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  onClick={() => handleLoad(t.id)} 
                                  style={{ 
                                    padding: '8px 16px', 
                                    borderRadius: 6, 
                                    background: '#1976d2', 
                                    color: '#fff', 
                                    border: 'none', 
                                    fontWeight: 600, 
                                    cursor: 'pointer',
                                    fontSize: 14
                                  }}
                                >
                                  Load
                                </button>
                                <button 
                                  onClick={() => handleDelete(t.id, t.name)} 
                                  style={{ 
                                    padding: '8px 16px', 
                                    borderRadius: 6, 
                                    background: '#f44336', 
                                    color: '#fff', 
                                    border: 'none', 
                                    fontWeight: 600, 
                                    cursor: 'pointer',
                                    fontSize: 14
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#666' }}>
                              <span>
                                <strong>Type:</strong> {t.designType === 'pdp' ? 'Product Detail Page' : 'Homepage'}
                              </span>
                              <span>
                                <strong>Components:</strong> {t.data?.length || 0}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                              Last updated: {new Date(t.updatedAt).toLocaleString()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {loadStatus && (
                <div style={{ 
                  color: loadStatus.includes('No templates') ? '#666' : 'red', 
                  marginTop: 12, 
                  padding: '8px 12px', 
                  background: loadStatus.includes('No templates') ? '#f5f5f5' : '#ffebee', 
                  borderRadius: 6,
                  fontSize: 14
                }}>
                  {loadStatus}
                </div>
              )}
              <button 
                onClick={() => setShowLoadModal(false)} 
                style={{ 
                  marginTop: 18, 
                  padding: '8px 20px', 
                  borderRadius: 6, 
                  background: '#eee', 
                  color: '#333', 
                  border: 'none', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="builder-grid">
          {/* Component Palette */}
          <div className="builder-panel">
            {paletteCollapsed ? (
              <div className="collapsed-bar">
                <button className="collapse-btn" title="Expand" onClick={() => setPaletteCollapsed(false)}>
                  ▶
                </button>
              </div>
            ) : (
              <>
                <div className="sticky-header" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>Components</h3>
                  <button className="collapse-btn" title="Collapse" onClick={() => setPaletteCollapsed(true)}>
                    ◀
                  </button>
                </div>
                <div className="panel-content">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {currentComponents.map((component) => (
                      <DraggablePaletteItem key={component.type} component={component} />
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Canvas */}
          <div className="builder-canvas">
            <div className="sticky-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Canvas - {designType === 'homepage' ? 'Homepage' : 'Product Detail Page'}
              </h3>
            </div>
            <div className="panel-content" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={handleDeselect}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={currentItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {currentItems.length === 0 ? (
                    <div style={{ color: '#bbb', textAlign: 'center', marginTop: 80 }}>
                      Drag components here to start building your {designType === 'homepage' ? 'homepage' : 'product detail page'}.
                    </div>
                  ) : (
                    currentItems.map((item, idx) => (
                      <div key={item.id} onClick={e => { e.stopPropagation(); handleSelect(item.id); }} style={{ outline: selectedId === item.id ? '2px solid #1976d2' : undefined, borderRadius: 8 }}>
                        <SortableItem id={item.id} type={item.type} index={idx} />
                      </div>
                    ))
                  )}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div style={{ padding: 16, background: '#e0f7fa', border: '1px solid #bbb', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                      <strong>{currentItems.find(i => i.id === activeId)?.type}</strong>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>

          {/* Property Editor */}
          <div className="builder-panel">
            {editorCollapsed ? (
              <div className="collapsed-bar">
                <button className="collapse-btn" title="Expand" onClick={() => setEditorCollapsed(false)}>
                  ◀
                </button>
              </div>
            ) : (
              <>
                <div className="sticky-header" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>
                    Property Editor - {designType === 'homepage' ? 'Homepage' : 'Product Detail Page'}
                  </h3>
                  <button className="collapse-btn" title="Collapse" onClick={() => setEditorCollapsed(true)}>
                    ▶
                  </button>
                </div>
                <div className="panel-content">
                  {selectedId ? (
                    <PropertyEditor item={currentItems.find(i => i.id === selectedId)!} products={products} collections={collections} onChange={props => handlePropsChange(selectedId, props)} />
                  ) : (
                    <div style={{ color: '#bbb', textAlign: 'center', marginTop: 40, padding: '20px' }}>
                      <p>Select a component from the canvas to edit its properties.</p>
                      <p style={{ fontSize: '12px', marginTop: '8px' }}>Click on any component in the canvas area to select it.</p>
                      <p style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
                        Currently editing: {designType === 'homepage' ? 'Homepage' : 'Product Detail Page'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Preview Panel */}
          <div className="builder-preview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent' }}>
            <div className="sticky-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Preview - {designType === 'homepage' ? 'Homepage' : 'Product Detail Page'}
              </h3>
            </div>
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
              <Preview 
                items={currentItems} 
                products={products} 
                collections={collections} 
                designType={designType}
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
} 