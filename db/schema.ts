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

// Training enquiries from companies and hotels booking the consultant program.
// These are private leads: the API only ever writes them, and nothing reads them
// back over HTTP, so a submitted enquiry cannot be listed by anyone else.
export const trainingInquiries = pgTable("training_inquiries", {
  id: serial("id").primaryKey(),
  organization: varchar("organization", { length: 160 }).notNull(),
  contactName: varchar("contact_name", { length: 140 }).notNull(),
  contactEmail: varchar("contact_email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  // Which track the session runs: "corporate" for HR and business travel teams,
  // "hotel" for front desk and concierge teams.
  track: varchar("track", { length: 24 }).notNull(),
  // How it is delivered: "onsite", "virtual", or "either".
  format: varchar("format", { length: 24 }).notNull(),
  groupSize: integer("group_size"),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 100 }),
  // Free text rather than a date, because enquiries arrive as "late March",
  // "before our Q2 sales kickoff", or a specific day, and all three are useful.
  targetTiming: varchar("target_timing", { length: 120 }),
  notes: text("notes"),
  // Set during follow-up, never read from the request.
  status: varchar("status", { length: 24 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
