export const runtime = 'nodejs'; // web-push needs Node, not Edge

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

webpush.setVapidDetails(
  'mailto:dev@yourdomain.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  // simple protection so only you can call it
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  const { userId, title, body } = await req.json();

  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch subscriptions', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), { status: 500 });
  }

  const payload = JSON.stringify({ title, body });
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
          .eq('user_id', userId)
          .eq('endpoint', s.endpoint);
      } else {
        console.error('push error:', e?.statusCode, e?.body || e?.message);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 });
}