import { createClient } from 'npm:@supabase/supabase-js@2.115.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'PATCH') return json({ error: 'PATCH is required.' }, 405);

  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Administrator authentication is required.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Administrator authentication is required.' }, 401);

  const { data: profile } = await admin.from('profiles').select('role, status').eq('id', userData.user.id).maybeSingle();
  if (profile?.role !== 'Admin' || profile.status !== 'Active') return json({ error: 'Active administrator access is required.' }, 403);

  let body: { orderId?: string; status?: string; trackingNumber?: string };
  try { body = await request.json(); } catch { return json({ error: 'A valid JSON body is required.' }, 400); }
  const orderReference = body.orderId || '';
  if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(body.status || '')) return json({ error: 'A valid order status is required.' }, 400);

  const { data: order, error: lookupError } = await admin
    .from('orders')
    .select('stripe_session_id, order_id, customer_name, customer_email, items_summary, total_amount_eur')
    .or(`order_id.eq.${orderReference},stripe_session_id.eq.${orderReference}`)
    .maybeSingle();
  if (lookupError) return json({ error: lookupError.message }, 502);
  if (!order) return json({ error: 'Order was not found.' }, 404);

  const updates = { status: body.status, tracking_number: body.trackingNumber || 'Pending assignment' };
  const { error: updateError } = await admin.from('orders').update(updates).eq('stripe_session_id', order.stripe_session_id);
  if (updateError) return json({ error: updateError.message }, 502);

  let emailSent = false;
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  if (resendKey && from && order.customer_email) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: order.customer_email,
        subject: `KOMSE DESIGN order ${order.order_id || orderReference} update`,
        text: [
          `Hello ${order.customer_name || 'Customer'},`, '',
          `Your KOMSE DESIGN order ${order.order_id || orderReference} is now ${body.status}.`,
          `Tracking number: ${updates.tracking_number}`,
          `Products: ${order.items_summary || 'KOMSE DESIGN order'}`,
          `Total paid: EUR ${order.total_amount_eur ?? 'N/A'}`, '',
          'Thank you for shopping with KOMSE DESIGN.',
        ].join('\n'),
      }),
    });
    if (!response.ok) console.error('Order status email failed:', response.status, await response.text());
    else emailSent = true;
  }

  return json({ updated: true, emailSent, order: { ...order, ...updates } });
});
