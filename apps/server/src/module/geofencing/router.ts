import { Elysia } from "elysia";
import { geofencingService } from "./service";
import { supabaseSession } from "@server/lib/auth/view";
import { z } from "zod";

// Request/Response schemas
const locationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  timestamp: z.number(),
});

const geofenceRegionSchema = z.object({
  experienceId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().max(10000), // Max 10km radius
});

export const geofencingRouter = new Elysia({ 
  prefix: "/geofence",
  tags: ["Geofencing"] 
})
  .use(supabaseSession)

  // Update user location
  .post(
    "/location",
    async (ctx: any) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new Error("Unauthorized");
        }

        const locationData = locationUpdateSchema.parse(ctx.body);

        await geofencingService.updateUserLocation(ctx.session.user.id, locationData);

        return { success: true, message: "Location updated successfully" };
      } catch (error) {
        console.error("Location update error:", error);
        throw new Error("Failed to update location");
      }
    },
    {
      body: locationUpdateSchema,
    }
  )

  // Get nearby geofence regions
  .get("/regions", async (ctx: any) => {
    try {
      const lat = ctx.query.lat ? parseFloat(ctx.query.lat) : undefined;
      const lng = ctx.query.lng ? parseFloat(ctx.query.lng) : undefined;
      const radius = ctx.query.radius ? parseInt(ctx.query.radius) : 5000; // Default 5km

      if (lat && lng) {
        // Get regions near specific location
        const regions = await geofencingService.getRegionsNearLocation(
          lat,
          lng,
          radius
        );
        return regions;
      } else {
        // Get all active regions
        const allRegions = await geofencingService.getAllActiveRegions();
        return allRegions;
      }
    } catch (error) {
      console.error("Get regions error:", error);
      throw new Error("Failed to get geofence regions");
    }
  })

  // Create geofence region for an experience
  .post(
    "/regions",
    async (ctx: any) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new Error("Unauthorized");
        }

        const regionData = geofenceRegionSchema.parse(ctx.body);

        const region = await geofencingService.createGeofenceRegion(
          regionData.experienceId,
          regionData.latitude,
          regionData.longitude,
          regionData.radius,
          ctx.session.user.id
        );

        return {
          success: true,
          message: "Geofence region created",
          region,
        };
      } catch (error) {
        console.error("Create region error:", error);
        throw new Error("Failed to create geofence region");
      }
    },
    {
      body: geofenceRegionSchema,
    }
  )

  // Check proximity and send notifications
  .post("/check-proximity", async (ctx: any) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const notifications = await geofencingService.checkProximityAndNotify(
        ctx.session.user.id
      );

      return {
        success: true,
        notifications: notifications.length,
        message: `Checked proximity, sent ${notifications.length} notifications`,
      };
    } catch (error) {
      console.error("Proximity check error:", error);
      throw new Error("Failed to check proximity");
    }
  })

  // Get user's notification history
  .get("/notifications", async (ctx: any) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new Error("Unauthorized");
      }

      const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;
      const offset = ctx.query.offset ? parseInt(ctx.query.offset) : 0;

      const notifications = await geofencingService.getUserNotifications(
        ctx.session.user.id,
        limit,
        offset
      );

      return notifications;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw new Error("Failed to get notifications");
    }
  })

  // Delete geofence region
  .delete("/regions/:regionId", async (ctx: any) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new Error("Unauthorized");
      }

      await geofencingService.deleteGeofenceRegion(
        ctx.params.regionId,
        ctx.session.user.id
      );

      return {
        success: true,
        message: "Geofence region deleted",
      };
    } catch (error) {
      console.error("Delete region error:", error);
      throw new Error("Failed to delete geofence region");
    }
  });