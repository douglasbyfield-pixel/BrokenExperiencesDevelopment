-- Create geofence_regions table
CREATE TABLE IF NOT EXISTS "geofence_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"radius" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

-- Create proximity_notifications table
CREATE TABLE IF NOT EXISTS "proximity_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"region_id" text NOT NULL,
	"experience_id" text NOT NULL,
	"distance" integer NOT NULL,
	"notified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

