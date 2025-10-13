-- Create geofencing tables

-- Geofence regions around experiences
CREATE TABLE IF NOT EXISTS geofence_regions (
  id TEXT PRIMARY KEY,
  experience_id TEXT NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  radius INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track proximity notifications sent to users
CREATE TABLE IF NOT EXISTS proximity_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  region_id TEXT NOT NULL,
  experience_id TEXT NOT NULL,
  distance INTEGER NOT NULL,
  notified BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_geofence_regions_experience_id ON geofence_regions(experience_id);
CREATE INDEX IF NOT EXISTS idx_geofence_regions_active ON geofence_regions(active);
CREATE INDEX IF NOT EXISTS idx_geofence_regions_coordinates ON geofence_regions(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_proximity_notifications_user_id ON proximity_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_proximity_notifications_created_at ON proximity_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_proximity_notifications_region_id ON proximity_notifications(region_id);