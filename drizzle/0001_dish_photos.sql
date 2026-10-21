CREATE TABLE "dish_photos" (
	"dish_id" uuid PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"data" "bytea" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dishes" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "dish_photos" ADD CONSTRAINT "dish_photos_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;