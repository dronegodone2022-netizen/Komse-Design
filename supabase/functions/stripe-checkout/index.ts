import Stripe from 'npm:stripe@22.6.0';
import { createClient } from 'npm:@supabase/supabase-js@2.115.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const builtInCatalog: Record<string, { name: string; priceEur: number; inStock: boolean }> = {
  'p-1': { name: 'Love & Loyalty Jersey', priceEur: 50, inStock: true },
  'p-2': { name: 'OverSize Mesh Baseball Shirt', priceEur: 50, inStock: true },
  'p-3': { name: 'Unisex Mesh Basketball Cap', priceEur: 25, inStock: true },
  'p-4': { name: 'Unisex Denim Jacket & Pants Set', priceEur: 100, inStock: false },
  'p-5': { name: 'Sierra Leone 66 Independence Jersey', priceEur: 50, inStock: true },
  'p-6': { name: 'Unisex Taffeta Tracksuit', priceEur: 100, inStock: true },
  'p-8': { name: 'Unisex Green White Blue Overall', priceEur: 50, inStock: false },
  'p-9': { name: '+232 Baseball Jersey', priceEur: 50, inStock: false },
  'p-10': { name: 'Unisex Visor Cap', priceEur: 25, inStock: false },
  'p-11': { name: 'Unisex Turtleneck Sweater', priceEur: 50, inStock: false },
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const getClients = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return {
    admin: createClient(supabaseUrl, serviceRoleKey),
    stripe: new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2025-03-31.basil' }),
  };
};

const requireUser = async (request: Request) => {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { admin } = getClients();
  const { data } = await admin.auth.getUser(token);
  return data.user || null;
};

const getCatalog = async (admin: ReturnType<typeof createClient>) => {
  const catalog = new Map(Object.entries(builtInCatalog));
  const { data } = await admin.from('products').select('product_data');
  for (const row of data || []) {
    const product = row.product_data as { id?: string; name?: string; price?: number; inStock?: boolean } | null;
    if (product?.id && typeof product.name === 'string' && typeof product.price === 'number') {
      catalog.set(product.id, { name: product.name, priceEur: product.price, inStock: product.inStock !== false });
    }
  }
  return catalog;
};

const appUrl = () => {
  const value = (Deno.env.get('APP_URL') || '').replace(/\/$/, '');
  return value || 'https://dronegodone2022-netizen.github.io/Komse-Design';
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'POST is required.' }, 405);

  const user = await requireUser(request);
  if (!user) return json({ error: 'A valid customer session is required.' }, 401);
  const { admin, stripe } = getClients();
  const body = await request.json();

  try {
    if (body.action === 'verify') {
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
      if (!sessionId) return json({ error: 'A checkout session ID is required.' }, 400);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') return json({ error: 'Payment has not been completed.' }, 402);
      if (session.metadata?.userId !== user.id) return json({ error: 'This payment does not belong to the signed-in customer.' }, 403);
      return json({ order: {
        id: session.metadata?.orderId || `KOMSE-${session.id.slice(-8).toUpperCase()}`,
        customerName: session.metadata?.customerName || 'Customer',
        customerEmail: session.customer_details?.email || session.customer_email || '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        itemsCount: Number(session.metadata?.itemsCount || 0),
        totalAmountEur: (session.amount_total || 0) / 100,
        status: 'Processing',
        trackingNumber: 'Pending assignment',
        itemsSummary: session.metadata?.itemsSummary || 'KOMSE DESIGN order',
      } });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer;
    if (!items.length || !customer?.email || !body.orderId) return json({ error: 'A valid cart, customer email, and order ID are required.' }, 400);
    const catalog = await getCatalog(admin);
    const normalizedItems = items.map((item: { productId?: string; quantity?: number; selectedSize?: string; selectedColor?: string }) => {
      const product = item.productId ? catalog.get(item.productId) : undefined;
      return { name: product?.name || '', quantity: Math.max(1, Math.floor(item.quantity || 0)), priceEur: product?.priceEur || 0, inStock: product?.inStock === true, selectedSize: item.selectedSize || '', selectedColor: item.selectedColor || '' };
    });
    if (normalizedItems.some((item) => !item.name || item.priceEur <= 0 || !item.inStock) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) {
      return json({ error: 'The cart contains an invalid or unavailable product.' }, 400);
    }
    const subtotalEur = normalizedItems.reduce((total, item) => total + item.priceEur * item.quantity, 0);
    const shippingEur = subtotalEur < 100 ? 7.5 : 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = normalizedItems.map((item) => ({ quantity: item.quantity, price_data: { currency: 'eur', unit_amount: Math.round(item.priceEur * 100), product_data: { name: `${item.name}${item.selectedSize ? ` (${item.selectedSize}, ${item.selectedColor})` : ''}` } } }));
    if (shippingEur) lineItems.push({ quantity: 1, price_data: { currency: 'eur', unit_amount: 750, product_data: { name: 'Shipping' } } });
    const stripeCustomer = await stripe.customers.create({ name: customer.name || 'Customer', email: customer.email, phone: customer.phone || undefined });
    const session = await stripe.checkout.sessions.create({ mode: 'payment', line_items: lineItems, customer: stripeCustomer.id, billing_address_collection: 'required', phone_number_collection: { enabled: true }, shipping_address_collection: { allowed_countries: ['FR', 'GB', 'US', 'SL', 'SN', 'CI', 'GH', 'NG'] }, success_url: `${appUrl()}/?payment=success&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${appUrl()}/?payment=cancelled`, metadata: { orderId: body.orderId, userId: user.id, customerName: customer.name || 'Customer', subtotalEur: subtotalEur.toFixed(2), shippingEur: shippingEur.toFixed(2), itemsCount: String(normalizedItems.reduce((count, item) => count + item.quantity, 0)), itemsSummary: normalizedItems.map((item) => `${item.quantity}x ${item.name}`).join(', ') } });
    return json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout function failed:', error);
    return json({ error: 'Unable to start secure checkout.' }, 502);
  }
});
