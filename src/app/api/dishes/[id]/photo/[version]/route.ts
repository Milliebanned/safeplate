import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dishPhotos } from "@/db/schema";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Dish photos are public, like the menu they appear on. The version in the address
// changes whenever the photo changes, so each version can be cached forever.
export async function GET(_request: Request, { params }: RouteContext<"/api/dishes/[id]/photo/[version]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });
  const [photo] = await getDb()
    .select({ contentType: dishPhotos.contentType, data: dishPhotos.data })
    .from(dishPhotos)
    .where(eq(dishPhotos.dishId, id));
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
