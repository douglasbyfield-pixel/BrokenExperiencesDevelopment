import { pgTable, text, timestamp, boolean, integer, decimal } from "drizzle-orm/pg-core";

// Geofence regions around experiences
export const geofenceRegions = pgTable("geofence_regions", {
  id: text("id").primaryKey(),
  experienceId: text("experience_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  radius: integer("radius").notNull(), // Radius in meters
  active: boolean("active").default(true).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track proximity notifications sent to users
export const proximityNotifications = pgTable("proximity_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  regionId: text("region_id").notNull(),
  experienceId: text("experience_id").notNull(),
  distance: integer("distance").notNull(), // Distance in meters when notified
  notified: boolean("notified").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});