import * as p from "drizzle-orm/pg-core";
import { experience } from "./experience";

export const experienceImage = p.pgTable("experience_image", {
  id: p.uuid().primaryKey().defaultRandom(),
  experience_id: p.uuid().references(() => experience.id),
  image_url: p.text().notNull(),
  created_at: p.timestamp().notNull().defaultNow(),
  updated_at: p.timestamp().notNull().defaultNow(),
});