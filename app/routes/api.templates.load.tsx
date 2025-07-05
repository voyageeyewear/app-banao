import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (id) {
      const template = await db.template.findUnique({ where: { id } });
      if (!template) return json({ error: "Template not found" }, { status: 404 });
      return json(template);
    } else {
      // Only return templates that have components
      const templates = await db.template.findMany({ 
        where: {
          data: {
            not: null
          }
        },
        orderBy: { updatedAt: "desc" } 
      });
      return json(templates);
    }
  } catch (err) {
    console.error("Error loading template(s):", err);
    return json({ error: "Failed to load template(s)" }, { status: 500 });
  }
}; 