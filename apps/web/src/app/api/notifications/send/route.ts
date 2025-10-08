export const runtime = 'nodejs'; // web-push needs Node, not Edge

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

webpush.setVapidDetails(
  'mailto:dev@yourdomain.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  // simple protection so only you can call it
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }
  const { userId, title, body, broadcast } = await req.json();

  // Support both single user and broadcast
  let query = supabaseAdmin.from('push_subscriptions').select('*');
  
  if (broadcast) {
    // Get all subscriptions for broadcast
    console.log('📢 Broadcasting to all users...');
  } else {
    // Get subscriptions for specific user
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required for non-broadcast messages' }), { status: 400 });
    }
    query = query.eq('user_id', userId);
  }
  
  const { data: subs, error } = await query;

  if (error) {
    console.error('Failed to fetch subscriptions', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), { status: 500 });
  }

  const payload = JSON.stringify({ 
    title: `🔥 ${title}`, 
    body: `${body} • Community Power`,
    icon: 'https://img.icons8.com/fluency/96/megaphone.png',
    badge: 'https://img.icons8.com/fluency/96/megaphone.png',
    requireInteraction: false,
    vibrate: [100, 50, 100],
    timestamp: Date.now(),
    actions: [
      {
        action: 'view',
        title: '🚀 Take Action'
      },
      {
        action: 'share', 
        title: '📢 Share'
      }
    ],
    data: {
      url: '/home',
      timestamp: Date.now(),
      type: 'community_update'
    }
  });
  let sent = 0;

  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
      sent++;
    } catch (e: any) {
      // cleanup stale subs (404/410)
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await supabaseAdmin.from('push_subscriptions')
          .delete()
          .eq('endpoint', s.endpoint);
      } else {
        console.error('push error:', e?.statusCode, e?.body || e?.message);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 });
}