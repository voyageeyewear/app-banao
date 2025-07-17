import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";

const prisma = new PrismaClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  try {
    // Get Looks configuration
    let config = await (prisma as any).looksConfig.findFirst();
    if (!config) {
      config = await (prisma as any).looksConfig.create({
        data: {
          title_cursive: "Style",
          title_bold: "FINDER",
          subtitle: "Discover every look, for every you",
          men_tab_text: "Men",
          women_tab_text: "Women",
          men_explore_title: "Men",
          men_explore_subtitle: "Explore All",
          men_explore_link: "",
          women_explore_title: "Women",
          women_explore_subtitle: "Explore All",
          women_explore_link: "",
          enabled: true,
        }
      });
    }

    // Get all Looks cards
    const cards = await (prisma as any).looksCard.findMany({
      orderBy: [{ type: 'asc' }, { order: 'asc' }]
    });

    // Get Shopify products and collections for dropdowns
    const { admin } = await authenticate.admin(request);
    
    const productsResponse = await admin.graphql(`
      query getProducts($first: Int!) {
        products(first: $first) {
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
    `, { variables: { first: 100 } });

    const collectionsResponse = await admin.graphql(`
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              image {
                url
              }
            }
          }
        }
      }
    `, { variables: { first: 50 } });

    const products = await productsResponse.json();
    const collections = await collectionsResponse.json();

    return json({
      config,
      cards,
      products: products.data?.products?.edges || [],
      collections: collections.data?.collections?.edges || []
    });

  } catch (error) {
    console.error("Looks loader error:", error);
    return json({ 
      config: null, 
      cards: [], 
      products: [], 
      collections: [],
      error: "Failed to load looks data" 
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "updateConfig") {
      const configData = {
        title_cursive: formData.get("title_cursive") as string,
        title_bold: formData.get("title_bold") as string,
        subtitle: formData.get("subtitle") as string,
        men_tab_text: formData.get("men_tab_text") as string,
        women_tab_text: formData.get("women_tab_text") as string,
        men_explore_title: formData.get("men_explore_title") as string,
        men_explore_subtitle: formData.get("men_explore_subtitle") as string,
        men_explore_link: formData.get("men_explore_link") as string,
        women_explore_title: formData.get("women_explore_title") as string,
        women_explore_subtitle: formData.get("women_explore_subtitle") as string,
        women_explore_link: formData.get("women_explore_link") as string,
        enabled: formData.get("enabled") === "on",
      };

      await (prisma as any).looksConfig.upsert({
        where: { id: 1 },
        update: configData,
        create: { ...configData, id: 1 }
      });

      return json({ success: true, message: "Configuration updated successfully!" });
    }

    if (action === "addCard") {
      const cardData = {
        type: formData.get("type") as string,
        title: formData.get("title") as string,
        image: formData.get("image") as string,
        link: formData.get("link") as string,
        productId: formData.get("productId") as string,
        collectionId: formData.get("collectionId") as string,
        productTitle: formData.get("productTitle") as string,
        collectionTitle: formData.get("collectionTitle") as string,
        order: parseInt(formData.get("order") as string) || 0,
        enabled: formData.get("enabled") === "on",
      };

      await (prisma as any).looksCard.create({
        data: cardData
      });

      return json({ success: true, message: "Look card added successfully!" });
    }

    if (action === "updateCard") {
      const cardId = parseInt(formData.get("cardId") as string);
      const cardData = {
        type: formData.get("type") as string,
        title: formData.get("title") as string,
        image: formData.get("image") as string,
        link: formData.get("link") as string,
        productId: formData.get("productId") as string,
        collectionId: formData.get("collectionId") as string,
        productTitle: formData.get("productTitle") as string,
        collectionTitle: formData.get("collectionTitle") as string,
        order: parseInt(formData.get("order") as string) || 0,
        enabled: formData.get("enabled") === "on",
      };

      await (prisma as any).looksCard.update({
        where: { id: cardId },
        data: cardData
      });

      return json({ success: true, message: "Look card updated successfully!" });
    }

    if (action === "deleteCard") {
      const cardId = parseInt(formData.get("cardId") as string);
      await (prisma as any).looksCard.delete({
        where: { id: cardId }
      });

      return json({ success: true, message: "Look card deleted successfully!" });
    }

    return json({ success: false, message: "Invalid action" });

  } catch (error) {
    console.error("Looks action error:", error);
    return json({ 
      success: false, 
      message: "An error occurred: " + (error instanceof Error ? error.message : "Unknown error")
    });
  }
};

export default function LooksPage() {
  const { config, cards, products, collections } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const menCards = cards?.filter((card: any) => card.type === 'men_style') || [];
  const womenCards = cards?.filter((card: any) => card.type === 'women_style') || [];

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎨 Looks Section Management</h1>
      
      {actionData?.message && (
        <div style={{
          padding: "10px",
          margin: "10px 0",
          backgroundColor: actionData.success ? "#d4edda" : "#f8d7da",
          border: `1px solid ${actionData.success ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "4px",
          color: actionData.success ? "#155724" : "#721c24"
        }}>
          {actionData.message}
        </div>
      )}

      {/* Configuration Section */}
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "20px", 
        marginBottom: "30px",
        backgroundColor: "#f9f9f9"
      }}>
        <h2>⚙️ Section Configuration</h2>
        <Form method="post">
          <input type="hidden" name="action" value="updateConfig" />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>Title Cursive:</strong></label>
              <input 
                name="title_cursive" 
                defaultValue={config?.title_cursive || "Style"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Title Bold:</strong></label>
              <input 
                name="title_bold" 
                defaultValue={config?.title_bold || "FINDER"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label><strong>Subtitle:</strong></label>
            <input 
              name="subtitle" 
              defaultValue={config?.subtitle || "Discover every look, for every you"}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>Men Tab Text:</strong></label>
              <input 
                name="men_tab_text" 
                defaultValue={config?.men_tab_text || "Men"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Women Tab Text:</strong></label>
              <input 
                name="women_tab_text" 
                defaultValue={config?.women_tab_text || "Women"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>Men Explore Title:</strong></label>
              <input 
                name="men_explore_title" 
                defaultValue={config?.men_explore_title || "Men"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Men Explore Subtitle:</strong></label>
              <input 
                name="men_explore_subtitle" 
                defaultValue={config?.men_explore_subtitle || "Explore All"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Men Explore Link:</strong></label>
              <input 
                name="men_explore_link" 
                defaultValue={config?.men_explore_link || ""}
                placeholder="/collections/men"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>Women Explore Title:</strong></label>
              <input 
                name="women_explore_title" 
                defaultValue={config?.women_explore_title || "Women"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Women Explore Subtitle:</strong></label>
              <input 
                name="women_explore_subtitle" 
                defaultValue={config?.women_explore_subtitle || "Explore All"}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Women Explore Link:</strong></label>
              <input 
                name="women_explore_link" 
                defaultValue={config?.women_explore_link || ""}
                placeholder="/collections/women"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <input 
                type="checkbox" 
                name="enabled" 
                defaultChecked={config?.enabled !== false}
                style={{ marginRight: "8px" }}
              />
              <strong>Enable Looks Section</strong>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </button>
        </Form>
      </div>

      {/* Add New Card Section */}
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "20px", 
        marginBottom: "30px",
        backgroundColor: "#f0f8ff"
      }}>
        <h2>➕ Add New Look Card</h2>
        <Form method="post">
          <input type="hidden" name="action" value="addCard" />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>Type:</strong></label>
              <select 
                name="type" 
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              >
                <option value="men_style">Men Style</option>
                <option value="women_style">Women Style</option>
              </select>
            </div>
            <div>
              <label><strong>Title:</strong></label>
              <input 
                name="title" 
                placeholder="CEO Look, Glam Queen, etc."
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Order:</strong></label>
              <input 
                name="order" 
                type="number" 
                defaultValue="0"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>Image URL:</strong></label>
              <input 
                name="image" 
                placeholder="https://..."
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label><strong>Link URL:</strong></label>
              <input 
                name="link" 
                placeholder="/collections/ceo-look"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label><strong>🛍️ Link to Product:</strong></label>
              <select 
                name="productId"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                onChange={(e) => {
                  const select = e.target as HTMLSelectElement;
                  const option = select.selectedOptions[0];
                  const titleInput = select.parentElement?.parentElement?.querySelector('input[name="productTitle"]') as HTMLInputElement;
                  if (titleInput) titleInput.value = option.text || '';
                }}
              >
                <option value="">Select Product (Optional)</option>
                {products.map((product: any) => (
                  <option key={product.node.id} value={product.node.id}>
                    {product.node.title}
                  </option>
                ))}
              </select>
              <input type="hidden" name="productTitle" />
            </div>
            <div>
              <label><strong>📂 Link to Collection:</strong></label>
              <select 
                name="collectionId"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                onChange={(e) => {
                  const select = e.target as HTMLSelectElement;
                  const option = select.selectedOptions[0];
                  const titleInput = select.parentElement?.parentElement?.querySelector('input[name="collectionTitle"]') as HTMLInputElement;
                  if (titleInput) titleInput.value = option.text || '';
                }}
              >
                <option value="">Select Collection (Optional)</option>
                {collections.map((collection: any) => (
                  <option key={collection.node.id} value={collection.node.id}>
                    {collection.node.title}
                  </option>
                ))}
              </select>
              <input type="hidden" name="collectionTitle" />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <input 
                type="checkbox" 
                name="enabled" 
                defaultChecked
                style={{ marginRight: "8px" }}
              />
              <strong>Enable Card</strong>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Adding..." : "Add Look Card"}
          </button>
        </Form>
      </div>

      {/* Men's Cards */}
      <div style={{ marginBottom: "30px" }}>
        <h2>👨 Men's Style Cards ({menCards.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
          {menCards.map((card: any) => (
            <div key={card.id} style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: card.enabled ? "#fff" : "#f5f5f5"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h4>{card.title}</h4>
                <span style={{ 
                  padding: "4px 8px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  backgroundColor: card.enabled ? "#d4edda" : "#f8d7da",
                  color: card.enabled ? "#155724" : "#721c24"
                }}>
                  {card.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              
              {card.image && (
                <img 
                  src={card.image} 
                  alt={card.title}
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px", marginBottom: "10px" }}
                />
              )}
              
              <p><strong>Order:</strong> {card.order}</p>
              <p><strong>Link:</strong> {card.link || "None"}</p>
              {card.productTitle && <p><strong>Product:</strong> {card.productTitle}</p>}
              {card.collectionTitle && <p><strong>Collection:</strong> {card.collectionTitle}</p>}
              
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" name="action" value="deleteCard" />
                  <input type="hidden" name="cardId" value={card.id} />
                  <button 
                    type="submit"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                    onClick={(e) => {
                      if (!confirm("Are you sure you want to delete this card?")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Women's Cards */}
      <div style={{ marginBottom: "30px" }}>
        <h2>👩 Women's Style Cards ({womenCards.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
          {womenCards.map((card: any) => (
            <div key={card.id} style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: card.enabled ? "#fff" : "#f5f5f5"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h4>{card.title}</h4>
                <span style={{ 
                  padding: "4px 8px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  backgroundColor: card.enabled ? "#d4edda" : "#f8d7da",
                  color: card.enabled ? "#155724" : "#721c24"
                }}>
                  {card.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              
              {card.image && (
                <img 
                  src={card.image} 
                  alt={card.title}
                  style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px", marginBottom: "10px" }}
                />
              )}
              
              <p><strong>Order:</strong> {card.order}</p>
              <p><strong>Link:</strong> {card.link || "None"}</p>
              {card.productTitle && <p><strong>Product:</strong> {card.productTitle}</p>}
              {card.collectionTitle && <p><strong>Collection:</strong> {card.collectionTitle}</p>}
              
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" name="action" value="deleteCard" />
                  <input type="hidden" name="cardId" value={card.id} />
                  <button 
                    type="submit"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                    onClick={(e) => {
                      if (!confirm("Are you sure you want to delete this card?")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 