ALTER TABLE "sub_categories" DROP CONSTRAINT "sub_categories_parent_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "cart" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "product_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "quantity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "chat_sessions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chat_sessions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "quantity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sold" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "is_deleted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "is_primary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "total" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_details" ALTER COLUMN "order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_details" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_details" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_details" ALTER COLUMN "method" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_categories" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" DROP COLUMN "import_date";