ALTER TABLE "shops" ADD COLUMN "rating" double precision;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "review_count" integer;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "photo_credit" varchar(140);