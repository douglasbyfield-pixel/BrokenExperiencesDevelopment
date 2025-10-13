import { db } from "@server/db";
import { 
  userLocations, 
  geofenceRegions, 
  proximityNotifications, 
  pushSubscriptions,
  experience 
} from "@server/db/schema";
import { eq, and, sql, lt, gt } from "drizzle-orm";
import webpush from "web-push";

// Configure web push if environment variables are available
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log("✅ Web push notifications configured");
} else {
  console.warn("⚠️ VAPID keys not found - push notifications will be disabled");
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeofenceRegion {
  id: string;
  experienceId: string;
  latitude: number;
  longitude: number;
  radius: number;
  title: string;
  description: string;
}

class GeofencingService {
  // Update user location and check for proximity
  async updateUserLocation(userId: string, locationData: LocationData) {
    try {
      // Update user's current location using the existing userLocations table
      await db
        .insert(userLocations)
        .values({
          userId,
          latitude: locationData.latitude.toString(),
          longitude: locationData.longitude.toString(),
          accuracy: locationData.accuracy.toString(),
          lastUpdated: new Date(locationData.timestamp),
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userLocations.userId,
          set: {
            latitude: locationData.latitude.toString(),
            longitude: locationData.longitude.toString(),
            accuracy: locationData.accuracy.toString(),
            lastUpdated: new Date(locationData.timestamp),
          },
        });

      // Check for proximity to geofence regions
      await this.checkProximityAndNotify(userId);

      return { success: true };
    } catch (error) {
      console.error("Update location error:", error);
      throw error;
    }
  }

  // Get geofence regions near a location
  async getRegionsNearLocation(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
  ): Promise<GeofenceRegion[]> {
    try {
      // Use Haversine formula to find nearby regions
      const regions = await db
        .select({
          id: geofenceRegions.id,
          experienceId: geofenceRegions.experienceId,
          latitude: geofenceRegions.latitude,
          longitude: geofenceRegions.longitude,
          radius: geofenceRegions.radius,
          title: experience.title,
          description: experience.description,
        })
        .from(geofenceRegions)
        .innerJoin(experience, eq(geofenceRegions.experienceId, experience.id))
        .where(
          and(
            eq(geofenceRegions.active, true),
            // Rough bounding box filter for performance
            gt(geofenceRegions.latitude, (latitude - radiusMeters / 111000).toString()),
            lt(geofenceRegions.latitude, (latitude + radiusMeters / 111000).toString()),
            gt(geofenceRegions.longitude, (longitude - radiusMeters / (111000 * Math.cos(latitude * Math.PI / 180))).toString()),
            lt(geofenceRegions.longitude, (longitude + radiusMeters / (111000 * Math.cos(latitude * Math.PI / 180))).toString())
          )
        );

      // Filter by exact distance using Haversine formula
      const nearbyRegions = regions.filter((region) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          parseFloat(region.latitude),
          parseFloat(region.longitude)
        );
        return distance <= radiusMeters;
      });

      return nearbyRegions.map(region => ({
        id: region.id,
        experienceId: region.experienceId,
        latitude: parseFloat(region.latitude),
        longitude: parseFloat(region.longitude),
        radius: region.radius,
        title: region.title || "Unknown Issue",
        description: region.description || "",
      }));
    } catch (error) {
      console.error("Get regions near location error:", error);
      throw error;
    }
  }

  // Get all active geofence regions
  async getAllActiveRegions(): Promise<GeofenceRegion[]> {
    try {
      const regions = await db
        .select({
          id: geofenceRegions.id,
          experienceId: geofenceRegions.experienceId,
          latitude: geofenceRegions.latitude,
          longitude: geofenceRegions.longitude,
          radius: geofenceRegions.radius,
          title: experience.title,
          description: experience.description,
        })
        .from(geofenceRegions)
        .innerJoin(experience, eq(geofenceRegions.experienceId, experience.id))
        .where(eq(geofenceRegions.active, true));

      return regions.map(region => ({
        id: region.id,
        experienceId: region.experienceId,
        latitude: parseFloat(region.latitude),
        longitude: parseFloat(region.longitude),
        radius: region.radius,
        title: region.title || "Unknown Issue",
        description: region.description || "",
      }));
    } catch (error) {
      console.error("Get all active regions error:", error);
      throw error;
    }
  }

  // Create geofence region for an experience
  async createGeofenceRegion(
    experienceId: string,
    latitude: number,
    longitude: number,
    radius: number,
    createdBy: string
  ) {
    try {
      const regionId = crypto.randomUUID();

      await db.insert(geofenceRegions).values({
        id: regionId,
        experienceId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius,
        active: true,
        createdBy,
        createdAt: new Date(),
      });

      return {
        id: regionId,
        experienceId,
        latitude,
        longitude,
        radius,
        active: true,
      };
    } catch (error) {
      console.error("Create geofence region error:", error);
      throw error;
    }
  }

  // Check proximity and send notifications
  async checkProximityAndNotify(userId: string) {
    try {
      // Get user's current location
      const userLocation = await db
        .select()
        .from(userLocations)
        .where(eq(userLocations.userId, userId))
        .limit(1);

      if (userLocation.length === 0) {
        return [];
      }

      const location = userLocation[0];
      const userLat = parseFloat(location.latitude.toString());
      const userLng = parseFloat(location.longitude.toString());

      // Get nearby regions
      const nearbyRegions = await this.getRegionsNearLocation(userLat, userLng, 5000);

      const notifications: any[] = [];

      for (const region of nearbyRegions) {
        const distance = this.calculateDistance(
          userLat,
          userLng,
          region.latitude,
          region.longitude
        );

        // Check if user is within the geofence
        if (distance <= region.radius) {
          // Check if we've already notified this user about this region recently
          const recentNotification = await db
            .select()
            .from(proximityNotifications)
            .where(
              and(
                eq(proximityNotifications.userId, userId),
                eq(proximityNotifications.regionId, region.id),
                gt(proximityNotifications.createdAt, new Date(Date.now() - 3600000)) // Last hour
              )
            )
            .limit(1);

          if (recentNotification.length === 0) {
            // Send notification
            const notification = await this.sendProximityNotification(
              userId,
              region,
              Math.round(distance)
            );
            notifications.push(notification);

            // Record notification
            await db.insert(proximityNotifications).values({
              id: crypto.randomUUID(),
              userId,
              regionId: region.id,
              experienceId: region.experienceId,
              distance: Math.round(distance),
              notified: true,
              createdAt: new Date(),
            });
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error("Check proximity error:", error);
      throw error;
    }
  }

  // Send proximity notification via push
  private async sendProximityNotification(
    userId: string,
    region: GeofenceRegion,
    distance: number
  ) {
    try {
      // Skip push notifications if VAPID keys aren't configured
      if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.log("Skipping push notification - VAPID keys not configured");
        return {
          userId,
          regionId: region.id,
          distance,
          sent: 0,
          message: "Push notifications not configured",
        };
      }

      // Get user's push subscriptions
      const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      const notificationPayload = {
        title: `Nearby Issue: ${region.title}`,
        body: `You're ${distance}m away from a reported issue`,
        icon: "/images/logo.png",
        badge: "/images/logo.png",
        tag: `geofence-${region.id}`,
        data: {
          experienceId: region.experienceId,
          regionId: region.id,
          distance,
          url: `/experience/${region.experienceId}`,
          latitude: region.latitude,
          longitude: region.longitude,
        },
        actions: [
          {
            action: "view",
            title: "👀 View Issue",
          },
          {
            action: "directions",
            title: "🗺️ Get Directions",
          },
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
      };

      const promises = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256Dh,
              auth: subscription.auth,
            },
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notificationPayload)
          );

          console.log(`Proximity notification sent to user ${userId}`);
        } catch (error) {
          console.error(`Failed to send notification to subscription:`, error);
        }
      });

      await Promise.allSettled(promises);

      return {
        userId,
        regionId: region.id,
        distance,
        sent: subscriptions.length,
      };
    } catch (error) {
      console.error("Send proximity notification error:", error);
      throw error;
    }
  }

  // Get user's notification history
  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const notifications = await db
        .select({
          id: proximityNotifications.id,
          regionId: proximityNotifications.regionId,
          experienceId: proximityNotifications.experienceId,
          distance: proximityNotifications.distance,
          createdAt: proximityNotifications.createdAt,
          title: experience.title,
          description: experience.description,
        })
        .from(proximityNotifications)
        .innerJoin(experience, eq(proximityNotifications.experienceId, experience.id))
        .where(eq(proximityNotifications.userId, userId))
        .orderBy(sql`${proximityNotifications.createdAt} DESC`)
        .limit(limit)
        .offset(offset);

      return notifications;
    } catch (error) {
      console.error("Get user notifications error:", error);
      throw error;
    }
  }

  // Delete geofence region
  async deleteGeofenceRegion(regionId: string, userId: string) {
    try {
      await db
        .update(geofenceRegions)
        .set({ 
          active: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(geofenceRegions.id, regionId),
            eq(geofenceRegions.createdBy, userId)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Delete geofence region error:", error);
      throw error;
    }
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const geofencingService = new GeofencingService();