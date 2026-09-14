import Stripe from 'npm:stripe@22.6.0';
import { createClient } from 'npm:@supabase/supabase-js@2.115.0';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const getOrderFromSession = (session: Stripe.Checkout.Session) => {
  const totalAmountEur = (session.amount_total || 0) / 100;
  const subtotalEur = Number(session.metadata?.subtotalEur || totalAmountEur);
  return {
    user_id: session.metadata?.userId || null,
    stripe_session_id: session.id,
    customer_name: session.metadata?.customerName || session.customer_details?.name || 'Customer',
    customer_email: session.customer_details?.email || session.customer_email || '',
    subtotal_eur: subtotalEur,
    shipping_eur: Number(session.metadata?.shippingEur || Math.max(0, totalAmountEur - subtotalEur)),
    total_amount_eur: totalAmountEur,
    items_count: Number(session.metadata?.itemsCount || 0),
    items_summary: session.metadata?.itemsSummary || 'KOMSE DESIGN order',
    status: 'Processing',
    tracking_number: 'Pending assignment',
  };
};

const sendPaidOrderEmail = async (order: ReturnType<typeof getOrderFromSession>) => {
  const hook = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  if (!hook || !from || !order.customer_email) {
    console.warn('Payment email skipped: RESEND_API_KEY, MAIL_FROM, or customer email is missing.');
    return;
  }
  const text = ['Thank you for your KOMSE DESIGN order.', '', `Order: ${order.stripe_session_id}`, `Customer: ${order.customer_name}`, `Items: ${order.items_count}`, `Products: ${order.items_summary}`, `Total paid: EUR ${order.total_amount_eur}`, '', 'Your payment was received successfully.'].join('\n');
  const recipients = [order.customer_email, Deno.env.get('ADMIN_EMAIL')].filter(Boolean);
  for (const to of recipients) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hook}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: `KOMSE DESIGN payment confirmation: ${order.stripe_session_id}`,
        text,
      }),
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Resend rejected ${to}: ${response.status} ${details}`);
    }
  }
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'POST is required.' }, 405);
  const signature = request.headers.get('stripe-signature');
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  if (!signature || !secret) return json({ error: 'Stripe webhook is not configured.' }, 503);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return json({ error: 'Invalid Stripe webhook signature.' }, 400);
  }
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') return json({ received: true });
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') return json({ received: true });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const order = getOrderFromSession(session);
  if (!order.user_id) return json({ error: 'Checkout session is missing its user ID.' }, 500);
  const { error } = await admin.from('orders').upsert(order, { onConflict: 'stripe_session_id' });
  if (error) return json({ error: 'Unable to persist paid checkout.' }, 500);
  try {
    await sendPaidOrderEmail(order);
  } catch (error) {
    console.error('Payment email delivery failed; order was recorded:', error);
  }
  return json({ received: true });
});
