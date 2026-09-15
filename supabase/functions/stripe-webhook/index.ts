import Stripe from 'npm:stripe@22.6.0';
import { createClient } from 'npm:@supabase/supabase-js@2.115.0';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const publicAppUrl = () => {
  const configured = (Deno.env.get('APP_URL') || '')
    .trim()
    .replace(/^APP_URL\s*=\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/$/, '');
  try {
    const parsed = new URL(configured);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString().replace(/\/$/, '');
  } catch {
    console.warn('Invalid APP_URL secret; using the Hostinger production URL.');
  }
  return 'https://komsedesign.com';
};

const formatAddress = (address?: Stripe.Address | null, name?: string | null) => {
  if (!address) return 'Shipping address was not provided.';
  return [name, address.line1, address.line2, [address.postal_code, address.city].filter(Boolean).join(' '), address.state, address.country]
    .filter(Boolean)
    .join(', ');
};

const getOrderFromSession = (session: Stripe.Checkout.Session) => {
  const totalAmountEur = (session.amount_total || 0) / 100;
  const subtotalEur = Number(session.metadata?.subtotalEur || totalAmountEur);
  const shippingAddress = session.shipping_details?.address || session.customer_details?.address;
  const itemsData = session.metadata?.itemsData || '[]';
  return {
    user_id: session.metadata?.userId || null,
    order_id: session.metadata?.orderId || `KOMSE-${session.id.slice(-8).toUpperCase()}`,
    stripe_session_id: session.id,
    customer_name: session.metadata?.customerName || session.customer_details?.name || 'Customer',
    customer_email: session.customer_details?.email || session.customer_email || '',
    subtotal_eur: subtotalEur,
    shipping_eur: Number(session.metadata?.shippingEur || Math.max(0, totalAmountEur - subtotalEur)),
    total_amount_eur: totalAmountEur,
    items_count: Number(session.metadata?.itemsCount || 0),
    items_summary: session.metadata?.itemsSummary || 'KOMSE DESIGN order',
    items_data: itemsData,
    shipping_address: formatAddress(shippingAddress, session.shipping_details?.name || session.customer_details?.name),
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
  const orderReference = order.order_id;
  let items: Array<{ productId?: string; name?: string; quantity?: number; selectedSize?: string; selectedColor?: string }> = [];
  try { items = JSON.parse(order.items_data); } catch { /* Keep the legacy summary below. */ }
  const productLines = items.length
    ? items.map((item) => `${item.quantity || 1}x ${item.name || 'Product'}${item.productId ? `\n  ${publicAppUrl()}/?product=${encodeURIComponent(item.productId)}` : ''}${item.selectedSize ? `\n  Size: ${item.selectedSize}${item.selectedColor ? `, Color: ${item.selectedColor}` : ''}` : ''}`).join('\n')
    : order.items_summary;
  const orderDetails = [`Order: ${orderReference}`, `Customer name: ${order.customer_name}`, `Customer email: ${order.customer_email}`, `Items: ${order.items_count}`, '', 'Products:', productLines, '', `Shipping address: ${order.shipping_address}`, `Total paid: EUR ${order.total_amount_eur}`].join('\n');
  const emails = [
    { to: order.customer_email, subject: `KOMSE DESIGN payment confirmation: ${orderReference}`, text: ['Thank you for your KOMSE DESIGN order.', '', orderDetails, '', 'Your payment was received successfully.'].join('\n') },
    Deno.env.get('ADMIN_EMAIL')
      ? { to: Deno.env.get('ADMIN_EMAIL')!, reply_to: order.customer_email, subject: `New KOMSE DESIGN order: ${orderReference}`, text: ['New customer order received.', '', orderDetails].join('\n') }
      : null,
  ].filter((email): email is { to: string; subject: string; text: string } => Boolean(email));
  for (const email of emails) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hook}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: email.to,
        reply_to: 'reply_to' in email ? email.reply_to : undefined,
        subject: email.subject,
        text: email.text,
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
  const { items_data: _itemsData, shipping_address: _shippingAddress, ...orderForDatabase } = order;
  const { error } = await admin.from('orders').upsert(orderForDatabase, { onConflict: 'stripe_session_id' });
  if (error) return json({ error: 'Unable to persist paid checkout.' }, 500);
  try {
    await sendPaidOrderEmail(order);
  } catch (error) {
    console.error('Payment email delivery failed; order was recorded:', error);
  }
  return json({ received: true });
});
