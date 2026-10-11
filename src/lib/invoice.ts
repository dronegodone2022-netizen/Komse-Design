import { UserOrder, UserProfile } from '../types';

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

const eur = (amount: number) => `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Splits "2x KOMSE Heritage Tee (L), 1x Cap" into quantity/description rows.
const itemRows = (summary: string) =>
  summary
    .split(/,\s*(?=\d+x\s)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(\d+)x\s+(.*)$/);
      return match ? { quantity: Number(match[1]), description: match[2] } : { quantity: 1, description: part };
    });

const buildInvoiceHtml = (order: UserOrder, customer: UserProfile | null, logoUrl: string) => {
  const shipping = order.shippingEur ?? 0;
  const subtotal = order.subtotalEur ?? Math.max(0, order.totalAmountEur - shipping);
  const address = customer
    ? [customer.address, [customer.postalCode, customer.city].filter(Boolean).join(' '), customer.country].filter(Boolean)
    : [];
  const rows = itemRows(order.itemsSummary)
    .map((item) => `<tr><td>${escapeHtml(item.description)}</td><td class="num">${item.quantity}</td></tr>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(order.id)} - KOMSE DESIGN</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1c1917; font-size: 12px; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #121212; padding-bottom: 16px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { height: 56px; }
  .brand h1 { font-size: 20px; margin: 0; letter-spacing: 0.04em; }
  .brand p { margin: 2px 0 0; color: #78716c; font-size: 11px; }
  .doc { text-align: right; }
  .doc h2 { margin: 0; font-size: 22px; letter-spacing: 0.12em; color: #a88238; }
  .doc p { margin: 3px 0 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 22px 0; }
  .box h3 { margin: 0 0 6px; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #78716c; }
  .box p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #78716c; border-bottom: 1px solid #d6d3d1; padding: 8px 0; }
  td { padding: 10px 0; border-bottom: 1px solid #f0eeea; }
  .num { text-align: right; width: 90px; }
  .totals { margin-left: auto; width: 260px; margin-top: 16px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top: 2px solid #121212; margin-top: 6px; padding-top: 8px; font-size: 15px; font-weight: 700; }
  .status { display: inline-block; padding: 2px 8px; border: 1px solid #a88238; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  .foot { margin-top: 36px; padding-top: 12px; border-top: 1px solid #e7e5e4; color: #78716c; font-size: 10px; text-align: center; }
</style>
</head>
<body>
  <div class="head">
    <div class="brand">
      <img src="${escapeHtml(logoUrl)}" alt="KOMSE DESIGN" />
      <div><h1>KOMSE DESIGN</h1><p>From Sierra Leone to the world · komsedesign.com</p></div>
    </div>
    <div class="doc">
      <h2>INVOICE</h2>
      <p><strong>${escapeHtml(order.id)}</strong></p>
      <p>Order date: ${escapeHtml(order.date || '-')}</p>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h3>Billed &amp; shipped to</h3>
      <p><strong>${escapeHtml(order.customerName || customer?.name || 'Customer')}</strong></p>
      ${address.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
      <p>${escapeHtml(order.customerEmail || customer?.email || '')}</p>
      ${customer?.phone ? `<p>${escapeHtml(customer.phone)}</p>` : ''}
    </div>
    <div class="box">
      <h3>Shipment</h3>
      <p>Tracking: <strong>${escapeHtml(order.trackingNumber || 'Pending assignment')}</strong></p>
      <p>Items: ${order.itemsCount || itemRows(order.itemsSummary).reduce((n, i) => n + i.quantity, 0)}</p>
      <p>Status: <span class="status">${escapeHtml(order.status)}</span></p>
    </div>
    <div class="box">
      <h3>Payment</h3>
      <p>Paid online via Stripe</p>
      <p>Currency: EUR</p>
    </div>
  </div>

  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${eur(subtotal)}</span></div>
    <div><span>Shipping</span><span>${shipping ? eur(shipping) : 'Free'}</span></div>
    <div class="grand"><span>Total paid</span><span>${eur(order.totalAmountEur)}</span></div>
  </div>

  <div class="foot">Thank you for shopping with KOMSE DESIGN. Questions about this order? Contact support@komsedesign.com quoting ${escapeHtml(order.id)}.</div>
</body>
</html>`;
};

// Prints through a hidden iframe so only the invoice is printed and no pop-up blocker interferes.
export const printInvoice = (order: UserOrder, customer: UserProfile | null, logoUrl: string) => {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc || !frame.contentWindow) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(buildInvoiceHtml(order, customer, new URL(logoUrl, window.location.href).href));
  doc.close();

  const print = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 1000);
  };
  const logo = doc.querySelector('img');
  if (logo && !logo.complete) {
    logo.addEventListener('load', print, { once: true });
    logo.addEventListener('error', print, { once: true });
  } else {
    print();
  }
};
