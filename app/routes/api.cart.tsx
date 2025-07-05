import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { admin } = await authenticate.admin(request);
    const body = await request.json();
    const { action, variantId, quantity = 1, cartId } = body;

    if (action === "createCart") {
      // Create a draft order (cart) using Admin API
      const response = await admin.graphql(
        `#graphql
          mutation draftOrderCreate($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
              draftOrder {
                id
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      quantity
                      variant {
                        id
                        title
                        product {
                          title
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          variables: {
            input: {
              lineItems: [
                {
                  variantId: variantId,
                  quantity: quantity,
                },
              ],
            },
          },
        }
      );

      const data = await response.json() as any;
      
      // Force print the entire response object for debugging
      console.log("FULL DRAFT ORDER CREATE RESPONSE:", JSON.stringify(data, null, 2));
      
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          return json({ error: data.errors[0].message || "GraphQL error" }, { status: 400 });
        }
        return json({ error: "GraphQL errors", details: data.errors }, { status: 400 });
      }
      
      if (data.graphQLErrors) {
        console.error("GraphQL errors:", data.graphQLErrors);
        if (Array.isArray(data.graphQLErrors) && data.graphQLErrors.length > 0) {
          return json({ error: data.graphQLErrors[0].message || "GraphQL error" }, { status: 400 });
        }
        return json({ error: "GraphQL errors", details: data.graphQLErrors }, { status: 400 });
      }
      
      if (data.data?.draftOrderCreate?.userErrors?.length > 0) {
        console.error("Draft order creation errors:", data.data.draftOrderCreate.userErrors);
        return json({ error: "Failed to create cart", details: data.data.draftOrderCreate.userErrors }, { status: 400 });
      }

      const draftOrder = data.data.draftOrderCreate.draftOrder;
      
      // Convert draft order to cart format
      const cart = {
        id: draftOrder.id,
        checkoutUrl: `/admin/draft_orders/${draftOrder.id.split('/').pop()}`,
        lines: {
          edges: draftOrder.lineItems.edges.map((edge: any) => ({
            node: {
              id: edge.node.id,
              quantity: edge.node.quantity,
              merchandise: {
                id: edge.node.variant.id,
                title: edge.node.variant.title,
                product: {
                  title: edge.node.variant.product.title,
                },
              },
            },
          })),
        },
      };

      return json({ cartCreate: { cart } });

    } else if (action === "addToCart") {
      // Add item to existing draft order
      const response = await admin.graphql(
        `#graphql
          mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
            draftOrderUpdate(id: $id, input: $input) {
              draftOrder {
                id
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      quantity
                      variant {
                        id
                        title
                        product {
                          title
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          variables: {
            id: cartId,
            input: {
              lineItems: [
                {
                  variantId: variantId,
                  quantity: quantity,
                },
              ],
            },
          },
        }
      );

      const data = await response.json() as any;
      
      // Force print the entire response object for debugging
      console.log("FULL DRAFT ORDER UPDATE RESPONSE:", JSON.stringify(data, null, 2));
      
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          return json({ error: data.errors[0].message || "GraphQL error" }, { status: 400 });
        }
        return json({ error: "GraphQL errors", details: data.errors }, { status: 400 });
      }
      
      if (data.graphQLErrors) {
        console.error("GraphQL errors:", data.graphQLErrors);
        if (Array.isArray(data.graphQLErrors) && data.graphQLErrors.length > 0) {
          return json({ error: data.graphQLErrors[0].message || "GraphQL error" }, { status: 400 });
        }
        return json({ error: "GraphQL errors", details: data.graphQLErrors }, { status: 400 });
      }

      if (data.data?.draftOrderUpdate?.userErrors?.length > 0) {
        console.error("Draft order update errors:", data.data.draftOrderUpdate.userErrors);
        return json({ error: "Failed to add to cart", details: data.data.draftOrderUpdate.userErrors }, { status: 400 });
      }

      const draftOrder = data.data.draftOrderUpdate.draftOrder;
      
      // Convert draft order to cart format
      const cart = {
        id: draftOrder.id,
        checkoutUrl: `/admin/draft_orders/${draftOrder.id.split('/').pop()}`,
        lines: {
          edges: draftOrder.lineItems.edges.map((edge: any) => ({
            node: {
              id: edge.node.id,
              quantity: edge.node.quantity,
              merchandise: {
                id: edge.node.variant.id,
                title: edge.node.variant.title,
                product: {
                  title: edge.node.variant.product.title,
                },
              },
            },
          })),
        },
      };

      return json({ cartLinesAdd: { cart } });

    } else {
      return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    // Log the full error object
    console.error("Cart API error:", error);
    // Try to extract more details if available
    let errorDetails: any = { message: error?.message };
    if (error?.stack) errorDetails.stack = error.stack;
    if (error?.graphQLErrors) errorDetails.graphQLErrors = error.graphQLErrors;
    if (error?.response) errorDetails.response = error.response;
    return json({ error: "Internal server error", details: errorDetails }, { status: 500 });
  }
}; 