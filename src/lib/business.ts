// Business identity shown in the legal notice, contact page, invoices and support links.
export const BUSINESS = {
  name: 'KOMSE DESIGN',
  addressLines: ['1 Allée du Bleuet de France, Bâtiment B204', '57950 Montigny-lès-Metz', 'Moselle, France'],
  city: 'Montigny-lès-Metz',
  country: 'France',
  email: 'support@komsedesign.com',
  phone: '+33 7 67 54 30 93',
  whatsappNumber: '33767543093',
  // Required in the French legal notice (mentions légales). Fill in once registered.
  siret: '',
  host: 'Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Cyprus',
} as const;

export const whatsappLink = (message: string) =>
  `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;
