import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Shopify Storefront API configuration
const STOREFRONT_API_TOKEN = "a6e835e73d77da35f6f64c05ee42ce68";
const SHOP_DOMAIN = "tryongoeye.myshopify.com";

// Helper function to add CORS headers for mobile app access
function addCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Handle OPTIONS request for CORS preflight
export const options = async () => {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  if (request.method !== "POST") {
    const errorResponse = json({ error: "Method not allowed" }, { status: 405 });
    return addCorsHeaders(errorResponse);
  }

  try {
    const body = await request.json();
    const { action, variantId, quantity = 1, cartId } = body;

    let query: string;
    let variables: any;

    if (action === "createCart") {
      query = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
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
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = {
        input: {
          lines: [
            {
              merchandiseId: variantId,
              quantity: quantity,
            },
          ],
        },
      };
    } else if (action === "addToCart") {
      query = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
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
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      variables = {
        cartId: cartId,
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity,
          },
        ],
      };
    } else {
      const errorResponse = json({ error: "Invalid action" }, { status: 400 });
      return addCorsHeaders(errorResponse);
    }

    const response = await fetch(`https://${SHOP_DOMAIN}/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("Storefront API errors:", data.errors);
      const errorResponse = json({ error: "GraphQL errors", details: data.errors }, { status: 400 });
      return addCorsHeaders(errorResponse);
    }

    return addCorsHeaders(json(data.data));
  } catch (error) {
    console.error("Storefront proxy error:", error);
    const errorResponse = json({ error: "Internal server error" }, { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}; 