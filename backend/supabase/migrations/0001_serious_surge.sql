CREATE TABLE "product_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"cert_name" varchar NOT NULL,
	"issuer" varchar,
	"issue_date" date,
	"expiry_date" date,
	"file_url" varchar,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"import_receipt_id" serial NOT NULL,
	"batch_code" varchar,
	"import_date" date NOT NULL,
	"expiry_date" date,
	"quantity_imported" integer NOT NULL,
	"quantity_remaining" integer NOT NULL,
	"unit_cost" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "batches_batch_code_unique" UNIQUE("batch_code")
);
--> statement-breakpoint
CREATE TABLE "import_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_name" varchar,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"import_date" date DEFAULT now(),
	"created_by" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" serial NOT NULL,
	"document_type" varchar NOT NULL,
	"file_url" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_deleted" smallint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product_certifications" ADD CONSTRAINT "product_certifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_import_receipt_id_import_receipts_id_fk" FOREIGN KEY ("import_receipt_id") REFERENCES "public"."import_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_receipts" ADD CONSTRAINT "import_receipts_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_documents" ADD CONSTRAINT "batch_documents_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;