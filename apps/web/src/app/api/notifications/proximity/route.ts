export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Type definitions
type PushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
};

type UserLocation = {
  user_id: string;
  latitude: number;
  longitude: number;
  last_updated: string;
};

type Experience = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  category_name?: string;
};

// Helper function to calculate distance between two points (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Initialize Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Configure web push
function configureWebpush() {
  webpush.setVapidDetails(
    'mailto:dev@brokenexperiences.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    // Simple protection
    if (req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { experienceId, proximityRadius = 5 } = await req.json(); // Default 5km radius

    if (!experienceId) {
      return new Response(JSON.stringify({ error: 'experienceId is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    configureWebpush();

    console.log('📍 Checking proximity notifications for experience:', experienceId);

    // Get the experience details
    const { data: experienceData, error: expError } = await supabaseAdmin
      .from('experiences')
      .select(`
        id,
        title,
        description,
        latitude,
        longitude,
        address,
        categories(name)
      `)
      .eq('id', experienceId)
      .single();

    if (expError || !experienceData) {
      console.error('❌ Failed to fetch experience:', expError);
      return new Response(JSON.stringify({ error: 'Experience not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const experience: Experience = {
      ...experienceData,
      category_name: Array.isArray(experienceData.categories) && experienceData.categories.length > 0 
        ? experienceData.categories[0]?.name || 'General'
        : 'General'
    };

    console.log('✅ Experience found:', {
      title: experience.title,
      location: `${experience.latitude}, ${experience.longitude}`,
      address: experience.address
    });

    // Get all users with location data and notification preferences enabled
    const { data: usersWithLocation, error: usersError } = await supabaseAdmin
      .from('user_locations')
      .select(`
        user_id,
        latitude,
        longitude,
        last_updated,
        user_settings(notifications_enabled, proximity_notifications)
      `)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (usersError) {
      console.error('❌ Failed to fetch user locations:', usersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user locations' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('📍 Found users with location data:', usersWithLocation?.length || 0);

    // Filter users by proximity and notification preferences
    const nearbyUsers: UserLocation[] = [];
    
    for (const userLoc of usersWithLocation || []) {
      // Check notification preferences
      const settings = Array.isArray(userLoc.user_settings) && userLoc.user_settings.length > 0 
        ? userLoc.user_settings[0] 
        : null;
      if (!settings?.notifications_enabled || !settings?.proximity_notifications) {
        continue;
      }

      // Calculate distance
      const distance = getDistance(
        experience.latitude,
        experience.longitude,
        userLoc.latitude,
        userLoc.longitude
      );

      if (distance <= proximityRadius) {
        nearbyUsers.push({
          user_id: userLoc.user_id,
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          last_updated: userLoc.last_updated
        });
        console.log(`👤 Nearby user found: ${userLoc.user_id} (${distance.toFixed(2)}km away)`);
      }
    }

    if (nearbyUsers.length === 0) {
      console.log('📍 No nearby users found within radius');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No nearby users found',
        notified: 0 
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get push subscriptions for nearby users
    const userIds = nearbyUsers.map(u => u.user_id);
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (subsError) {
      console.error('❌ Failed to fetch push subscriptions:', subsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('📱 Found push subscriptions:', subscriptions?.length || 0);

    // Prepare notification payload
    const distance = nearbyUsers.length > 0 ? 
      getDistance(
        experience.latitude,
        experience.longitude,
        nearbyUsers[0].latitude,
        nearbyUsers[0].longitude
      ).toFixed(1) : '0';

    const notificationPayload = JSON.stringify({
      title: `🚨 New Issue Nearby`,
      body: `"${experience.title}" reported ${distance}km from you in ${experience.address}`,
      icon: '/images/logo.png',
      badge: '/images/logo.png',
      tag: `proximity-${experience.id}`,
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200, 100, 200],
      timestamp: Date.now(),
      actions: [
        {
          action: 'view',
          title: '👀 View Issue',
          icon: '/images/logo.png'
        },
        {
          action: 'navigate',
          title: '🧭 Get Directions'
        }
      ],
      data: {
        type: 'proximity_notification',
        experienceId: experience.id,
        url: `/shared/experience/${experience.id}`,
        latitude: experience.latitude,
        longitude: experience.longitude,
        timestamp: Date.now()
      }
    });

    // Send notifications
    let notificationsSent = 0;
    const errors: string[] = [];

    for (const subscription of subscriptions || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          notificationPayload
        );
        notificationsSent++;
        console.log(`✅ Notification sent to user: ${subscription.user_id}`);
      } catch (error: any) {
        console.error(`❌ Failed to send notification to ${subscription.user_id}:`, error?.message);
        
        // Clean up invalid subscriptions
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);
          console.log(`🧹 Cleaned up invalid subscription for user: ${subscription.user_id}`);
        }
        
        errors.push(`User ${subscription.user_id}: ${error?.message}`);
      }
    }

    // Log proximity notification event
    await supabaseAdmin
      .from('notification_logs')
      .insert({
        type: 'proximity',
        experience_id: experience.id,
        recipients_count: notificationsSent,
        proximity_radius: proximityRadius,
        created_at: new Date().toISOString()
      });

    console.log(`✅ Proximity notifications sent: ${notificationsSent}/${subscriptions?.length || 0}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Proximity notifications sent successfully`,
      notified: notificationsSent,
      totalNearbyUsers: nearbyUsers.length,
      totalSubscriptions: subscriptions?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in proximity notification endpoint:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}