import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  textures: text("textures").notNull(),
  specialties: text("specialties").notNull(),
  bookingUrl: text("booking_url"),
  // Set during review, never by the shop itself, so a listing cannot rate itself.
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count"),
  // A shop supplies its own photo; the credit line is who shot it.
  photoUrl: text("photo_url"),
  photoCredit: varchar("photo_credit", { length: 140 }),
  contactEmail: varchar("contact_email", { length: 254 }).notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
