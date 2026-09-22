CREATE TABLE "training_inquiries" (
	"id" serial PRIMARY KEY,
	"organization" varchar(160) NOT NULL,
	"contact_name" varchar(140) NOT NULL,
	"contact_email" varchar(254) NOT NULL,
	"phone" varchar(40),
	"track" varchar(24) NOT NULL,
	"format" varchar(24) NOT NULL,
	"group_size" integer,
	"city" varchar(120),
	"country" varchar(100),
	"target_timing" varchar(120),
	"notes" text,
	"status" varchar(24) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
