CREATE TABLE "shops" (
	"id" serial PRIMARY KEY,
	"name" varchar(140) NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"textures" text NOT NULL,
	"specialties" text NOT NULL,
	"booking_url" text,
	"contact_email" varchar(254) NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
