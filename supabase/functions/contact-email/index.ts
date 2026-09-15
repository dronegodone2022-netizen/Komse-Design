const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'POST is required.' }, 405);

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  const recipient = Deno.env.get('ADMIN_EMAIL');
  if (!apiKey || !from || !recipient) {
    return json({ error: 'Email service is not configured.' }, 503);
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'A valid JSON body is required.' }, 400);
  }

  const name = body.name?.trim() || '';
  const email = body.email?.trim() || '';
  const subject = body.subject?.trim() || '';
  const message = body.message?.trim() || '';
  if (!name || !isEmail(email) || !subject || !message) {
    return json({ error: 'Name, valid email, subject, and message are required.' }, 400);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: recipient,
      reply_to: email,
      subject: `KOMSE DESIGN contact form: ${subject}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, '', message].join('\n'),
    }),
  });

  if (!response.ok) {
    console.error('Resend contact email failed:', response.status, await response.text());
    return json({ error: 'Unable to send your message right now.' }, 502);
  }

  return json({ sent: true });
});
