import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch products
  const productsResponse = await admin.graphql(
    `#graphql
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              totalInventory
              images(first: 1) { edges { node { url } } }
              variants(first: 5) { 
                edges { 
                  node { 
                    id
                    title
                    price 
                  } 
                } 
              }
            }
          }
        }
      }
    `
  );
  const productsJson = await productsResponse.json();
  const products = productsJson.data.products.edges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      title: node.title,
      description: node.description,
      inventory: node.totalInventory,
      image: node.images.edges[0]?.node.url || null,
      images: node.images.edges.map((img: any) => img.node.url),
      price: node.variants.edges[0]?.node.price || null,
      variants: node.variants.edges.map((v: any) => ({
        id: v.node.id,
        title: v.node.title
      })),
    };
  });

  // Fetch collections with products
  const collectionsResponse = await admin.graphql(
    `#graphql
      query {
        collections(first: 50) {
          edges {
            node {
              id
              title
              image { url }
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    description
                    totalInventory
                    images(first: 5) { edges { node { url } } }
                    variants(first: 5) { 
                      edges { 
                        node { 
                          id
                          title
                          price 
                        } 
                      } 
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
  );
  const collectionsJson = await collectionsResponse.json();
  const collections = collectionsJson.data.collections.edges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      title: node.title,
      image: node.image?.url || null,
      products: node.products.edges.map((pEdge: any) => {
        const p = pEdge.node;
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          inventory: p.totalInventory,
          image: p.images.edges[0]?.node.url || null,
          images: p.images.edges.map((img: any) => img.node.url),
          price: p.variants.edges[0]?.node.price || null,
          variants: p.variants.edges.map((v: any) => ({
            id: v.node.id,
            title: v.node.title
          })),
        };
      })
    };
  });

  return json({ products, collections });
}; 