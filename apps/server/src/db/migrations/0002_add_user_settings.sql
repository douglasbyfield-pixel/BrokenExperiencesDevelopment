CREATE TABLE IF NOT EXISTS "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"issue_updates" boolean DEFAULT true,
	"weekly_report" boolean DEFAULT false,
	"show_profile" boolean DEFAULT true,
	"show_activity" boolean DEFAULT true,
	"show_stats" boolean DEFAULT true,
	"theme" text DEFAULT 'light',
	"language" text DEFAULT 'en',
	"map_style" text DEFAULT 'satellite-v9',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settin

gs_theme_check" CHECK ("theme" IN ('light', 'dark', 'system'));--> statement-breakpoint