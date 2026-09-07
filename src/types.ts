export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'NLE' | 'SLL';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to EUR (1.0)
  label: string;
}

export type ProductCategory =
  | 'Jersey T-Shirts'
  | 'Sweaters'
  | 'Jackets'
  | 'Caps'
  | 'Shirts'
  | 'Overalls'
  | 'Accessories';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in EUR
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  secondaryImage?: string;
  gallery: string[];
  description: string;
  features: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  isBestSeller?: boolean;
  isNew?: boolean;
  inStock: boolean;
}

export interface CustomDesignDetails {
  garmentType: 'T-Shirt' | 'Hoodie' | 'Jacket' | 'Cap' | 'Shirt' | 'Overalls';
  garmentColor: string;
  garmentColorHex: string;
  size: string;
  customText?: string;
  textColor?: string;
  fontStyle?: string;
  patternName?: string;
  patternSvg?: string;
  notes?: string;
  uploadedLogoUrl?: string;
}

export interface CartItem {
  id: string; // unique ID combining product id + size + color
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  customDesignDetails?: CustomDesignDetails;
}

export interface WishlistItem {
  productId: string;
}

export interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  joinedDate?: string;
  role?: 'Admin' | 'Customer';
  status?: 'Active' | 'Suspended';
  ordersCount?: number;
}

export interface UserOrder {
  id: string;
  customerName?: string;
  customerEmail?: string;
  date: string;
  itemsCount: number;
  totalAmountEur: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  itemsSummary: string;
  rating?: number;
  reviewComment?: string;
  ratedAt?: string;
}

export interface ReproductionRequest {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPriceEur: number;
  selectedSize: string;
  selectedColor: string;
  customerContact: string; // Email or Phone/WhatsApp
  notes?: string;
  requestedAt: string;
  status: 'Pending' | 'In Production' | 'Fulfilled' | 'Declined';
}

export type ActiveTab = 'home' | 'shop' | 'collections' | 'corporate' | 'accessories' | 'about' | 'contact';
