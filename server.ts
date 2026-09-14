import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = Number(process.env.PORT || process.env.SERVER_PORT || process.env.MAIL_PORT || 3001);

const getOrderFromSession = (session: Stripe.Checkout.Session) => {
  const totalAmountEur = (session.amount_total || 0) / 100;
  const subtotalEur = Number(session.metadata?.subtotalEur || totalAmountEur);
  const shippingEur = Number(session.metadata?.shippingEur || Math.max(0, totalAmountEur - subtotalEur));
  return {
    user_id: session.metadata?.userId || null,
    order_id: session.metadata?.orderId || `KOMSE-${session.id.slice(-8).toUpperCase()}`,
    stripe_session_id: session.id,
    customer_name: session.metadata?.customerName || session.customer_details?.name || 'Customer',
    customer_email: session.customer_details?.email || session.customer_email || '',
    subtotal_eur: subtotalEur,
    shipping_eur: shippingEur,
    total_amount_eur: totalAmountEur,
    items_count: Number(session.metadata?.itemsCount || 0),
    items_summary: session.metadata?.itemsSummary || 'KOMSE DESIGN order',
    status: 'Processing',
    tracking_number: 'Pending assignment',
  };
};

const persistPaidCheckout = async (session: Stripe.Checkout.Session) => {
  const client = getSupabaseAdmin();
  if (!client) throw new Error('Supabase order persistence is not configured.');
  const order = getOrderFromSession(session);
  if (!order.user_id) throw new Error('Checkout session is missing its user ID.');
  const { error } = await client.from('orders').upsert(order, { onConflict: 'stripe_session_id' });
  if (error) throw error;

  const { data: emailClaim, error: claimError } = await client
    .from('orders')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('stripe_session_id', order.stripe_session_id)
    .is('email_sent_at', null)
    .select('stripe_session_id')
    .maybeSingle();
  if (claimError) {
    console.error('Payment email claim failed; order was recorded:', claimError);
    return;
  }
  if (emailClaim) {
    try {
      await sendPaidOrderEmail(order);
    } catch (error) {
      console.error('Payment email delivery failed; order was recorded:', error);
      await client
        .from('orders')
        .update({ email_sent_at: null })
        .eq('stripe_session_id', order.stripe_session_id);
    }
  }
};

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  if (!stripe || !webhookSecret || typeof signature !== 'string') {
    return res.status(503).json({ error: 'Stripe webhook is not configured.' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid Stripe webhook signature.' });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      try {
        await persistPaidCheckout(session);
      } catch (error) {
        console.error('Paid checkout persistence failed:', error);
        return res.status(500).json({ error: 'Unable to persist paid checkout.' });
      }
    }
  }

  return res.json({ received: true });
});

app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://dronegodone2022-netizen.github.io',
    'http://localhost:3000',
  ].filter(Boolean);
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'komse-design-api' });
});

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
};

const getAppUrl = () => {
  const configuredUrl = String(process.env.APP_URL || '').trim().replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production' && /^https?:\/\/localhost(?::\d+)?$/i.test(configuredUrl)) {
    return 'https://dronegodone2022-netizen.github.io/Komse-Design';
  }
  return configuredUrl || 'http://localhost:3000';
};

const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;
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

const requireUser = async (req: express.Request, res: express.Response) => {
  const client = getSupabaseAdmin();
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!client) {
    res.status(503).json({ error: 'Customer authentication is not configured on the server. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
    return null;
  }
  if (!token) {
    res.status(401).json({ error: 'A valid customer session is required.' });
    return null;
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'A valid customer session is required.' });
    return null;
  }
  return { client, user: data.user };
};

const getCatalog = async (client: ReturnType<typeof getSupabaseAdmin>) => {
  const catalog = new Map(Object.entries(builtInCatalog));
  if (!client) return catalog;
  const { data } = await client.from('products').select('product_data');
  for (const row of data || []) {
    const product = row.product_data as { id?: string; name?: string; price?: number; inStock?: boolean } | null;
    if (product?.id && typeof product.name === 'string' && typeof product.price === 'number') {
      catalog.set(product.id, { name: product.name, priceEur: product.price, inStock: product.inStock !== false });
    }
  }
  return catalog;
};

const requireAdmin = async (req: express.Request, res: express.Response) => {
  const client = getSupabaseAdmin();
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!client || !token) {
    res.status(503).json({ error: 'Admin backend authentication is not configured.' });
    return null;
  }

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    res.status(401).json({ error: 'A valid administrator session is required.' });
    return null;
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role, status')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || profile?.role !== 'Admin' || profile.status !== 'Active') {
    res.status(403).json({ error: 'Administrator access is required.' });
    return null;
  }

  return client;
};

app.post('/api/admin/products', async (req, res) => {
  const client = await requireAdmin(req, res);
  if (!client) return;
  const product = req.body?.product as { id?: string; [key: string]: unknown } | undefined;
  if (!product?.id) return res.status(400).json({ error: 'A product with an ID is required.' });

  const { error } = await client.from('products').upsert({ id: product.id, product_data: product });
  if (error) return res.status(502).json({ error: error.message });
  return res.json({ product });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const client = await requireAdmin(req, res);
  if (!client) return;
  const { error } = await client.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(502).json({ error: error.message });
  return res.json({ deleted: true });
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  const client = await requireAdmin(req, res);
  if (!client) return;
  const updates = {
    status: req.body?.status,
    tracking_number: req.body?.trackingNumber,
  };
  if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(updates.status)) {
    return res.status(400).json({ error: 'A valid order status is required.' });
  }
  const { error } = await client.from('orders').update(updates).eq('stripe_session_id', req.params.id);
  if (error) return res.status(502).json({ error: error.message });
  return res.json({ updated: true });
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  const client = await requireAdmin(req, res);
  if (!client) return;
  const { error } = await client.from('orders').delete().eq('stripe_session_id', req.params.id);
  if (error) return res.status(502).json({ error: error.message });
  return res.json({ deleted: true });
});

const countryCodeFor = (country?: string) => {
  const normalizedCountry = country?.trim().toLowerCase();
  const countryCodes: Record<string, string> = {
    france: 'FR',
    'united kingdom': 'GB',
    uk: 'GB',
    'united states': 'US',
    usa: 'US',
    'sierra leone': 'SL',
    senegal: 'SN',
    'cote d ivoire': 'CI',
    'cote d\'ivoire': 'CI',
    ghana: 'GH',
    nigeria: 'NG',
  };
  return countryCodes[normalizedCountry || ''] || 'FR';
};

app.post('/api/create-checkout-session', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ error: 'Stripe payments are not configured on the server. Add STRIPE_SECRET_KEY.' });
  const authenticated = await requireUser(req, res);
  if (!authenticated) return;
  const { items, customer, orderId } = req.body as {
    items?: Array<{ productId?: string; quantity?: number; selectedSize?: string; selectedColor?: string }>;
    customer?: { name?: string; email?: string; phone?: string; address?: string; city?: string; postalCode?: string; country?: string };
    orderId?: string;
  };

  if (!Array.isArray(items) || items.length === 0 || !customer?.email || !orderId) {
    return res.status(400).json({ error: 'A valid cart, customer email, and order ID are required.' });
  }

  const catalog = await getCatalog(authenticated.client);
  const normalizedItems = items.map((item) => {
    const product = item.productId ? catalog.get(item.productId) : undefined;
    return {
      name: product?.name || '',
      quantity: Math.max(1, Math.floor(item.quantity || 0)),
      priceEur: product?.priceEur || 0,
      inStock: product?.inStock === true,
      selectedSize: item.selectedSize || '',
      selectedColor: item.selectedColor || '',
    };
  });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email) || normalizedItems.some((item) => !item.name || item.priceEur <= 0 || !item.inStock)) {
    return res.status(400).json({ error: 'The cart contains an invalid or unavailable product.' });
  }
  const lineItems = normalizedItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'eur',
      unit_amount: Math.round(item.priceEur * 100),
      product_data: { name: `${item.name}${item.selectedSize ? ` (${item.selectedSize}, ${item.selectedColor})` : ''}` },
    },
  }));

  if (lineItems.some((item) => item.price_data.unit_amount <= 0)) {
    return res.status(400).json({ error: 'Cart contains an invalid item price.' });
  }

  const subtotalEur = normalizedItems.reduce((total, item) => total + item.priceEur * item.quantity, 0);
  if (subtotalEur < 100) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: 750,
        product_data: { name: 'Shipping' },
      },
    });
  }

  try {
    const customerName = customer.name || 'Customer';
    const countryCode = countryCodeFor(customer.country);
    const address = {
      line1: customer.address || undefined,
      city: customer.city || undefined,
      postal_code: customer.postalCode || undefined,
      country: countryCode,
    };
    const stripeCustomer = await stripe.customers.create({
      name: customerName,
      email: customer.email,
      phone: customer.phone || undefined,
      address,
      shipping: { name: customerName, address },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer: stripeCustomer.id,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['FR', 'GB', 'US', 'SL', 'SN', 'CI', 'GH', 'NG'] },
      success_url: `${getAppUrl()}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/?payment=cancelled`,
      metadata: {
        orderId,
        userId: authenticated.user.id,
        customerName: customer.name || 'Customer',
        subtotalEur: subtotalEur.toFixed(2),
        shippingEur: (subtotalEur < 100 ? 7.5 : 0).toFixed(2),
        itemsCount: String(items.reduce((count, item) => count + Math.max(1, Math.floor(item.quantity || 0)), 0)),
        itemsSummary: normalizedItems.map((item) => `${item.quantity}x ${item.name}`).join(', '),
      },
    });
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session failed:', error);
    return res.status(502).json({ error: 'Unable to start secure checkout.' });
  }
});

app.get('/api/verify-checkout-session', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ error: 'Stripe payments are not configured on the server. Add STRIPE_SECRET_KEY.' });
  const authenticated = await requireUser(req, res);
  if (!authenticated) return;
  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!sessionId) return res.status(400).json({ error: 'A checkout session ID is required.' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return res.status(402).json({ error: 'Payment has not been completed.' });
    if (session.metadata?.userId !== authenticated.user.id) {
      return res.status(403).json({ error: 'This payment does not belong to the signed-in customer.' });
    }
    if (getSupabaseAdmin() && session.metadata?.userId) {
      try {
        await persistPaidCheckout(session);
      } catch (error) {
        console.error('Completed checkout persistence failed:', error);
        return res.status(502).json({ error: 'Unable to record completed order.' });
      }
    }
    return res.json({
      order: {
        id: session.metadata?.orderId || `KOMSE-${session.id.slice(-8).toUpperCase()}`,
        customerName: session.metadata?.customerName || 'Customer',
        customerEmail: session.customer_details?.email || session.customer_email || '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        itemsCount: Number(session.metadata?.itemsCount || 0),
        totalAmountEur: (session.amount_total || 0) / 100,
        status: 'Processing',
        trackingNumber: 'Pending assignment',
        itemsSummary: session.metadata?.itemsSummary || 'KOMSE DESIGN order',
      },
    });
  } catch (error) {
    console.error('Stripe checkout verification failed:', error);
    return res.status(502).json({ error: 'Unable to verify payment.' });
  }
});

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const sendPaidOrderEmail = async (order: ReturnType<typeof getOrderFromSession>) => {
  const transporter = getTransporter();
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!transporter || !mailFrom) {
    console.warn('Payment email skipped: SMTP environment variables are not configured.');
    return;
  }
  if (!order.customer_email) {
    console.warn(`Payment email skipped: checkout ${order.stripe_session_id} has no customer email.`);
    return;
  }

  const message = {
    from: mailFrom,
    subject: `KOMSE DESIGN payment confirmation: ${order.stripe_session_id}`,
    text: [
      'Thank you for your KOMSE DESIGN order.',
      '',
      `Order: ${order.stripe_session_id}`,
      `Customer: ${order.customer_name}`,
      `Items: ${order.items_count}`,
      `Products: ${order.items_summary}`,
      `Total paid: EUR ${order.total_amount_eur}`,
      '',
      'Your payment was received successfully. We will send further updates as your order progresses.',
    ].join('\n'),
  };
  await transporter.sendMail({ ...message, to: order.customer_email });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await transporter.sendMail({
      ...message,
      to: adminEmail,
      subject: `New KOMSE DESIGN order: ${order.stripe_session_id}`,
    });
  }
};

app.post('/api/product-notification', async (req, res) => {
  const client = await requireAdmin(req, res);
  if (!client) return;
  const { action, product, recipients } = req.body as {
    action?: 'added' | 'updated';
    product?: { name?: string; category?: string; price?: number; image?: string };
    recipients?: string[];
  };

  const validRecipients = Array.isArray(recipients)
    ? [...new Set(recipients.filter((email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)))]
    : [];
  const transporter = getTransporter();
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!transporter || !mailFrom) {
    console.warn('Product email skipped: SMTP environment variables are not configured.');
    return res.status(202).json({ sent: false, reason: 'smtp-not-configured' });
  }

  if (!product?.name || !action || validRecipients.length === 0) {
    return res.status(400).json({ error: 'A product, action, and at least one valid recipient are required.' });
  }

  const subject = action === 'added' ? `New product: ${product.name}` : `Product updated: ${product.name}`;
  const text = [
    `KOMSE DESIGN product ${action}.`,
    '',
    `Name: ${product.name}`,
    `Category: ${product.category || 'Collection'}`,
    `Price: EUR ${product.price ?? 'N/A'}`,
    '',
    'Visit the KOMSE DESIGN website to view the latest details.',
  ].join('\n');

  try {
    await transporter.sendMail({ from: mailFrom, to: validRecipients, subject, text });
    return res.json({ sent: true, recipients: validRecipients.length });
  } catch (error) {
    console.error('Product email failed:', error);
    return res.status(502).json({ error: 'Email delivery failed.' });
  }
});

app.post('/api/order-notification', async (req, res) => {
  const client = await requireAdmin(req, res);
  if (!client) return;
  const { order } = req.body as {
    order?: {
      id?: string;
      customerName?: string;
      customerEmail?: string;
      itemsCount?: number;
      totalAmountEur?: number;
      itemsSummary?: string;
    };
  };
  const transporter = getTransporter();
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!transporter || !mailFrom || !adminEmail) {
    console.warn('Order email skipped: SMTP or ADMIN_EMAIL environment variables are not configured.');
    return res.status(202).json({ sent: false, reason: 'mail-not-configured' });
  }

  if (!order?.id || !order.customerEmail || !order.itemsSummary) {
    return res.status(400).json({ error: 'A valid completed order is required.' });
  }

  try {
    const message = {
      from: mailFrom,
      subject: `KOMSE DESIGN payment confirmation: ${order.id}`,
      text: [
        'Thank you for your KOMSE DESIGN order.',
        '',
        `Order: ${order.id}`,
        `Customer: ${order.customerName || 'Customer'}`,
        `Items: ${order.itemsCount ?? 'N/A'}`,
        `Products: ${order.itemsSummary}`,
        `Total paid: EUR ${order.totalAmountEur ?? 'N/A'}`,
        '',
        'Your payment was received successfully. We will send further updates as your order progresses.',
      ].join('\n'),
    };
    await transporter.sendMail({
      ...message,
      to: order.customerEmail,
    });
    await transporter.sendMail({
      ...message,
      from: mailFrom,
      to: adminEmail,
      subject: `New KOMSE DESIGN order: ${order.id}`,
      text: [
        'A new customer order has been completed.',
        '',
        `Order: ${order.id}`,
        `Customer: ${order.customerName || 'Customer'}`,
        `Email: ${order.customerEmail}`,
        `Items: ${order.itemsCount ?? 'N/A'}`,
        `Products: ${order.itemsSummary}`,
        `Total: EUR ${order.totalAmountEur ?? 'N/A'}`,
      ].join('\n'),
    });
    return res.json({ sent: true });
  } catch (error) {
    console.error('Order email failed:', error);
    return res.status(502).json({ error: 'Email delivery failed.' });
  }
});

const server = app.listen(port, () => {
  console.log(`Mail server listening on http://localhost:${port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received; shutting down.`);
  server.close(() => process.exit(0));
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
