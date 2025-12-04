ALTER TABLE "chat_messages" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "sender" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ALTER COLUMN "created_at" SET NOT NULL;