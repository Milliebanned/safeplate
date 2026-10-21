// Applies database migrations, then makes sure the public Demo Bistro restaurant exists.
// Runs before every Vercel build, so each preview deployment gets an up-to-date database.
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.log("migrate: no DATABASE_URL, skipping");
    return;
  }
  process.env.DATABASE_URL = url;

  const { randomBytes } = await import("node:crypto");
  const { eq } = await import("drizzle-orm");
  const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
  const bcrypt = (await import("bcryptjs")).default;
  const { getDb } = await import("../src/db/index");
  const { restaurants, users } = await import("../src/db/schema");
  const { loadSampleMenu } = await import("../src/db/sample");

  const db = getDb();
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrate: migrations applied");

  const existing = await db.select().from(restaurants).where(eq(restaurants.slug, "demo-bistro"));
  if (existing.length === 0) {
    await db.transaction(async (tx) => {
      // The demo owner gets a random password nobody knows: Demo Bistro is read-only in practice.
      const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
      const [user] = await tx
        .insert(users)
        .values({ email: "demo@safeplate.app", passwordHash })
        .returning({ id: users.id });
      const [restaurant] = await tx
        .insert(restaurants)
        .values({ ownerId: user.id, name: "Demo Bistro", slug: "demo-bistro" })
        .returning({ id: restaurants.id });
      await loadSampleMenu(tx, restaurant.id);
    });
    console.log("migrate: Demo Bistro created");
  } else {
    console.log("migrate: Demo Bistro already exists");
  }

  // Give Demo Bistro's sample dishes their bundled photos (safe to run on every build).
  const { SAMPLE_DISHES } = await import("../src/lib/sample-menu");
  const { and, isNull } = await import("drizzle-orm");
  const { dishes } = await import("../src/db/schema");
  const [demo] = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.slug, "demo-bistro"));
  for (const d of SAMPLE_DISHES) {
    if (!d.image || !demo) continue;
    await db
      .update(dishes)
      .set({ imageUrl: d.image })
      .where(and(eq(dishes.restaurantId, demo.id), eq(dishes.name, d.name), isNull(dishes.imageUrl)));
  }
  await (db.$client as { end: () => Promise<void> }).end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
