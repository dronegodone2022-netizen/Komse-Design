import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { CurrencyCode, ActiveTab, CartItem, Product, ProductCategory, CustomDesignDetails, ReproductionRequest } from './types';
import { PRODUCTS } from './data/products';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CollectionsGrid } from './components/CollectionsGrid';
import { BestSellers } from './components/BestSellers';
import { FAQSection } from './components/FAQSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { LegalModal } from './components/LegalModal';
import { CustomOrderModal } from './components/CustomOrderModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { FAQModal } from './components/FAQModal';
import { AuthModal } from './components/AuthModal';
import { UserProfile, UserOrder } from './types';
import { ShopView } from './components/ShopView';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CheckCircle2 } from 'lucide-react';
import { detectDefaultCurrency } from './utils/currencyDetector';
import { supabase } from './lib/supabase';
import { profileFromRow, profileToRow } from './lib/profile';
import { apiUrl } from './lib/api';

const AdminModal = lazy(() => import('./components/AdminModal').then((module) => ({ default: module.AdminModal })));

type ProductOverride = {
  product: Product;
  base: Product;
};

const isReproductionRequest = (value: unknown): value is ReproductionRequest => {
  if (!value || typeof value !== 'object') return false;
  const request = value as Partial<ReproductionRequest>;
  return (
    typeof request.id === 'string' &&
    typeof request.productId === 'string' &&
    typeof request.productName === 'string' &&
    typeof request.productImage === 'string' &&
    typeof request.productPriceEur === 'number' &&
    typeof request.selectedSize === 'string' &&
    typeof request.selectedColor === 'string' &&
    typeof request.customerContact === 'string' &&
    typeof request.requestedAt === 'string' &&
    ['Pending', 'In Production', 'Fulfilled', 'Declined'].includes(request.status as string)
  );
};

const productsMatch = (left: Product, right: Product) => JSON.stringify(left) === JSON.stringify(right);
const REMOVED_PRODUCT_IDS = new Set(['p-7']);

const readDeletedIds = (key: string): Set<string> => {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
  } catch (e) {
    return new Set();
  }
};

const writeDeletedIds = (key: string, ids: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch (e) {}
};

const orderFromRow = (row: Record<string, unknown>): UserOrder => ({
  id: typeof row.stripe_session_id === 'string' ? row.stripe_session_id : String(row.id),
  customerName: typeof row.customer_name === 'string' ? row.customer_name : undefined,
  customerEmail: typeof row.customer_email === 'string' ? row.customer_email : undefined,
  date: typeof row.created_at === 'string' ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : '',
  itemsCount: typeof row.items_count === 'number' ? row.items_count : 0,
  totalAmountEur: Number(row.total_amount_eur || 0),
  status: ['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(String(row.status)) ? row.status as UserOrder['status'] : 'Processing',
  trackingNumber: typeof row.tracking_number === 'string' ? row.tracking_number : 'Pending assignment',
  itemsSummary: typeof row.items_summary === 'string' ? row.items_summary : 'KOMSE DESIGN order',
});

const reproductionFromRow = (row: Record<string, unknown>): ReproductionRequest => ({
  id: String(row.id),
  productId: String(row.product_id || ''),
  productName: String(row.product_name || 'KOMSE DESIGN item'),
  productImage: String(row.product_image || ''),
  productPriceEur: Number(row.product_price_eur || 0),
  selectedSize: String(row.selected_size || ''),
  selectedColor: String(row.selected_color || ''),
  customerContact: String(row.customer_contact || ''),
  notes: typeof row.notes === 'string' ? row.notes : undefined,
  requestedAt: typeof row.created_at === 'string' ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : '',
  status: ['Pending', 'In Production', 'Fulfilled', 'Declined'].includes(String(row.status)) ? row.status as ReproductionRequest['status'] : 'Pending',
});

const readProductOverrides = (): Record<string, ProductOverride> => {
  try {
    const raw = localStorage.getItem('komse_product_overrides');
    return raw ? (JSON.parse(raw) as Record<string, ProductOverride>) : {};
  } catch (e) {
    return {};
  }
};

const mergeProductsFromStorage = (): Product[] => {
  try {
    const raw = localStorage.getItem('komse_products');
    const stored: Product[] = raw ? (JSON.parse(raw) as Product[]) : [];
    const overrides = readProductOverrides();
    const codeProducts = PRODUCTS.map((codeProduct) => {
      const override = overrides[codeProduct.id];
      if (override && productsMatch(override.base, codeProduct)) return override.product;
      return codeProduct;
    });
    const codeIds = new Set(PRODUCTS.map((product) => product.id));
    const deletedProductIds = readDeletedIds('komse_deleted_products');
    const adminProducts = stored.filter(
      (product) => !codeIds.has(product.id) && !REMOVED_PRODUCT_IDS.has(product.id) && !deletedProductIds.has(product.id),
    );
    return [...codeProducts.filter((product) => !deletedProductIds.has(product.id)), ...adminProducts];
  } catch (e) {
    return PRODUCTS;
  }
};

const productsSignature = JSON.stringify(PRODUCTS);

const productFromRow = (row: Record<string, unknown>): Product | null => {
  if (!row.product_data || typeof row.product_data !== 'object') return null;
  const product = row.product_data as Partial<Product>;
  if (typeof product.id !== 'string' || typeof product.name !== 'string') return null;
  return product as Product;
};

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [shopCategory, setShopCategory] = useState<string>('All');
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(() => detectDefaultCurrency());

  // Products State (Managed live via Admin Panel)
  const [productsList, setProductsList] = useState<Product[]>(() => mergeProductsFromStorage());

  const notifyUsers = (action: 'added' | 'updated', product: Product) => {
    const recipients = usersList
      .map((user) => user.email)
      .filter((email): email is string => Boolean(email));
    if (recipients.length === 0) return;

    void fetch(apiUrl('/api/product-notification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        product: { name: product.name, category: product.category, price: product.price },
        recipients,
      }),
    }).catch((error) => console.error('Product notification failed:', error));
  };

  const notifyAdminOfOrder = (order: UserOrder) => {
    void fetch(apiUrl('/api/order-notification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    }).catch((error) => console.error('Order notification failed:', error));
  };

  const adminRequest = async (path: string, options: RequestInit = {}) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error('Administrator session expired. Please sign in again.');
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Admin request failed.');
    return result;
  };

  useEffect(() => {
    setProductsList(mergeProductsFromStorage());
  }, [productsSignature]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const loadProducts = async () => {
      const { data, error } = await client.from('products').select('product_data');
      if (error) {
        console.error('Product catalog load failed:', error);
        return;
      }

      const databaseProducts = (data || [])
        .map((row) => productFromRow(row as Record<string, unknown>))
        .filter((product): product is Product => product !== null);
      const databaseProductIds = new Set(databaseProducts.map((product) => product.id));
      setProductsList((current) => [
        ...current.filter((product) => PRODUCTS.some((base) => base.id === product.id)),
        ...databaseProducts,
        ...current.filter((product) => !PRODUCTS.some((base) => base.id === product.id) && !databaseProductIds.has(product.id)),
      ]);
    };

    void loadProducts();
  }, []);

  useEffect(() => {
      try {
        localStorage.setItem('komse_products', JSON.stringify(productsList));
      } catch (e) {}
  }, [productsList]);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const getRoutePath = () => {
    const params = new URLSearchParams(window.location.search);
    const pathParam = params.get('path');
    if (pathParam) return pathParam;
    return window.location.pathname;
  };

  // Modals Visibility
  const [adminModalOpen, setAdminModalOpen] = useState(() => getRoutePath() === '/admin');
  const [customOrderModalOpen, setCustomOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    setSelectedProduct((currentProduct) => {
      if (!currentProduct) return currentProduct;
      return productsList.find((product) => product.id === currentProduct.id) || null;
    });
  }, [productsList]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(() => {
    const paymentStatus = new URLSearchParams(window.location.search).get('payment');
    return paymentStatus === 'success';
  });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');

  const handleOpenPrivacy = () => {
    setLegalModalTab('privacy');
    setLegalModalOpen(true);
  };

  const handleOpenTerms = () => {
    setLegalModalTab('terms');
    setLegalModalOpen(true);
  };

  // User Accounts & Admin Management State
  const [authModalOpen, setAuthModalOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('reset_password') === '1' || params.get('auth') === 'google';
  });
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(() => sessionStorage.getItem('komse_checkout_after_auth') === 'true');
  const [completeProfileForCheckout, setCompleteProfileForCheckout] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const pendingCheckoutOrder = useRef<UserOrder | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoadedForUserId, setCartLoadedForUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      setCartLoadedForUserId(null);
      return;
    }
    setCartLoadedForUserId(null);
    try {
      const saved = localStorage.getItem(`komse_cart_${currentUser.id}`);
      const parsed = saved ? JSON.parse(saved) : [];
      setCartItems(Array.isArray(parsed) ? parsed : []);
    } catch (e) {}
    setCartLoadedForUserId(currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || cartLoadedForUserId !== currentUser.id) return;
    try {
      localStorage.setItem(`komse_cart_${currentUser.id}`, JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems, cartLoadedForUserId, currentUser]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const restoreSession = async () => {
      const { data } = await client.auth.getSession();
      if (!data.session) return;
      const { data: profile } = await client.from('profiles').select('*').eq('id', data.session.user.id).maybeSingle();
      if (profile) setCurrentUser(profileFromRow(profile as Record<string, unknown>));
    };

    void restoreSession();
    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setCurrentUser(null);
        return;
      }
      const { data: profile } = await client.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (profile) setCurrentUser(profileFromRow(profile as Record<string, unknown>));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !checkoutAfterAuth) return;
    setCheckoutAfterAuth(false);
    sessionStorage.removeItem('komse_checkout_after_auth');
    const profileComplete = Boolean(
      currentUser.name?.trim() &&
      currentUser.email?.trim() &&
      currentUser.phone?.trim() &&
      currentUser.address?.trim() &&
      currentUser.postalCode?.trim() &&
      currentUser.city?.trim() &&
      currentUser.country?.trim()
    );
    if (profileComplete) {
      setAuthModalOpen(false);
      setCheckoutModalOpen(true);
    } else {
      setCompleteProfileForCheckout(true);
      setAuthModalOpen(true);
    }
  }, [checkoutAfterAuth, currentUser]);

  const wishlistStorageKey = currentUser ? `komse_wishlist_${currentUser.id}` : 'komse_wishlist_guest';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(wishlistStorageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      setWishlistIds(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
    } catch (e) {
      setWishlistIds([]);
    }
  }, [wishlistStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlistIds));
    } catch (e) {}
  }, [wishlistIds, wishlistStorageKey]);

  const defaultUsers: UserProfile[] = [
    {
      id: 'usr-101',
      name: 'Demo Administrator',
      email: 'demo-admin@example.com',
      phone: '+33 6 12 34 56 78',
      address: 'Sample Street 1',
      city: 'Paris',
      country: 'France',
      joinedDate: 'January 2024',
      role: 'Admin',
      status: 'Active',
      ordersCount: 2,
    },
    {
      id: 'usr-102',
      name: 'Sample Customer',
      email: 'customer-one@example.com',
      phone: '+33 6 98 76 54 32',
      address: 'Sample Street 2',
      city: 'Paris',
      country: 'France',
      joinedDate: 'March 2025',
      role: 'Customer',
      status: 'Active',
      ordersCount: 1,
    },
    {
      id: 'usr-103',
      name: 'Sample Customer Two',
      email: 'customer-two@example.com',
      phone: '+232 76 123 456',
      address: 'Sample Street 3',
      city: 'Freetown',
      country: 'Sierra Leone',
      joinedDate: 'May 2025',
      role: 'Customer',
      status: 'Active',
      ordersCount: 3,
    },
  ];
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const deletedUserIds = readDeletedIds('komse_deleted_users');
    try {
      const saved = localStorage.getItem('komse_users');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed.filter((user) => user && typeof user.id === 'string' && !deletedUserIds.has(user.id));
    } catch (e) {
      console.warn('Failed to load saved users:', e);
    }
    return window.location.hostname === 'localhost'
      ? defaultUsers.filter((user) => !deletedUserIds.has(user.id))
      : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('komse_users', JSON.stringify(usersList));
    } catch (e) {}
  }, [usersList]);

  useEffect(() => {
    if (!supabase || window.location.pathname !== '/admin' || currentUser?.role !== 'Admin') return;
    const client = supabase;

    const loadAdminUsers = async () => {
      const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Admin user list load failed:', error);
        return;
      }
      setUsersList((data || []).map((row) => profileFromRow(row as Record<string, unknown>)));
    };

    void loadAdminUsers();
  }, [currentUser]);

  useEffect(() => {
    const client = supabase;
    if (!client || !currentUser) return;

    const loadUserRecords = async () => {
      const [{ data: orders }, { data: requests }] = await Promise.all([
        client.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        client.from('reproduction_requests').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
      ]);

      if (orders?.length) {
        const savedOrders = orders.map((row) => orderFromRow(row as Record<string, unknown>));
        setUserOrders((previous) => [
          ...savedOrders,
          ...previous.filter((order) => !savedOrders.some((savedOrder) => savedOrder.id === order.id)),
        ]);
      }
      if (requests?.length) {
        const savedRequests = requests.map((row) => reproductionFromRow(row as Record<string, unknown>));
        setReproductionRequests((previous) => [
          ...savedRequests,
          ...previous.filter((request) => !savedRequests.some((savedRequest) => savedRequest.id === request.id)),
        ]);
      }
    };

    void loadUserRecords();
  }, [currentUser]);

  const [userOrders, setUserOrders] = useState<UserOrder[]>(() => {
    const defaultOrders: UserOrder[] = [
      {
      id: 'ORD-2026-1001',
      customerName: 'Sample Customer Three',
      customerEmail: 'customer-three@example.com',
      date: 'January 14, 2026',
      itemsCount: 1,
      totalAmountEur: 65.0,
      status: 'Delivered',
      trackingNumber: 'DHL-109283-SL',
      itemsSummary: '1x Salone Heritage Gold Tee (M)',
    },
      {
      id: 'ORD-2026-2104',
      customerName: 'Sample Customer Four',
      customerEmail: 'customer-four@example.com',
      date: 'February 22, 2026',
      itemsCount: 2,
      totalAmountEur: 180.0,
      status: 'Delivered',
      trackingNumber: 'LP-882190-FR',
      itemsSummary: '1x Freetown Heavyweight Hoodie (XL), 1x Cap',
    },
      {
      id: 'ORD-2026-3409',
      customerName: 'Sample Customer Five',
      customerEmail: 'customer-five@example.com',
      date: 'March 18, 2026',
      itemsCount: 3,
      totalAmountEur: 210.0,
      status: 'Delivered',
      trackingNumber: 'DHL-339102-SL',
      itemsSummary: '2x KOMSE Heritage Tee (L), 1x Canvas Tote Bag',
    },
      {
      id: 'ORD-2026-4511',
      customerName: 'Sample Customer Six',
      customerEmail: 'customer-six@example.com',
      date: 'April 09, 2026',
      itemsCount: 1,
      totalAmountEur: 120.0,
      status: 'Delivered',
      trackingNumber: 'FEDEX-449102-GH',
      itemsSummary: '1x Unisex Denim Jacket & Pants Set (L)',
    },
      {
      id: 'ORD-2026-5820',
      customerName: 'Sample Customer Two',
      customerEmail: 'customer-two@example.com',
      date: 'May 28, 2026',
      itemsCount: 2,
      totalAmountEur: 155.0,
      status: 'Delivered',
      trackingNumber: 'DHL-558291-SL',
      itemsSummary: '1x Sierra Leopard Print Hoodie (S), 1x Cap',
    },
      {
      id: 'ORD-2026-7712',
      customerName: 'Sample Customer',
      customerEmail: 'customer-one@example.com',
      date: 'June 15, 2026',
      itemsCount: 1,
      totalAmountEur: 45.0,
      status: 'Delivered',
      trackingNumber: 'LP-339201928-FR',
      itemsSummary: '1x Custom Embroidered Cap',
    },
      {
      id: 'ORD-2026-8103',
      customerName: 'Sample Customer Seven',
      customerEmail: 'customer-seven@example.com',
      date: 'July 20, 2026',
      itemsCount: 3,
      totalAmountEur: 240.0,
      status: 'Delivered',
      trackingNumber: 'RM-772910-UK',
      itemsSummary: '2x Komse Gold Crest Tee (L), 1x Windbreaker',
    },
      {
      id: 'ORD-2026-8891',
      customerName: 'Demo Administrator',
      customerEmail: 'demo-admin@example.com',
      date: 'August 02, 2026',
      itemsCount: 2,
      totalAmountEur: 145.0,
      status: 'Shipped',
      trackingNumber: 'DHL-892183921-FR',
      itemsSummary: '1x KOMSE Heritage Tee (L), 1x Freetown Heavyweight Hoodie (M)',
    },
      {
      id: 'ORD-2026-9012',
      customerName: 'Sample Customer',
      customerEmail: 'customer-one@example.com',
      date: 'August 06, 2026',
      itemsCount: 1,
      totalAmountEur: 95.0,
      status: 'Processing',
      trackingNumber: 'LP-990182-FR',
      itemsSummary: '1x West African Cotton Sweatshirt (M)',
    },
    ];
    const deletedOrderIds = readDeletedIds('komse_deleted_orders');
    try {
      const saved = localStorage.getItem('komse_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return [...parsed, ...defaultOrders.filter((order) => !parsed.some((savedOrder) => savedOrder.id === order.id))]
            .filter((order) => order && typeof order.id === 'string' && !deletedOrderIds.has(order.id));
        }
      }
    } catch (e) {
      console.warn('Failed to load saved orders:', e);
    }
    return window.location.hostname === 'localhost'
      ? defaultOrders.filter((order) => !deletedOrderIds.has(order.id))
      : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('komse_orders', JSON.stringify(userOrders));
    } catch (e) {}
  }, [userOrders]);

  // Out-of-Stock Reproduction Requests state
  const [reproductionRequests, setReproductionRequests] = useState<ReproductionRequest[]>(() => {
    try {
      const saved = localStorage.getItem('komse_reproduction_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(isReproductionRequest);
      }
    } catch (e) {
      console.warn('Failed to load reproduction requests:', e);
    }
    return [];
  });

  const handleAddReproductionRequest = (
    data: Omit<ReproductionRequest, 'id' | 'requestedAt' | 'status'>
  ) => {
    const newReq: ReproductionRequest = {
      ...data,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }),
      status: 'Pending',
    };
    setReproductionRequests((prev) => {
      const updated = [newReq, ...prev];
      try {
        localStorage.setItem('komse_reproduction_requests', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (supabase && currentUser) {
      void supabase.from('reproduction_requests').insert({
        user_id: currentUser.id,
        product_name: data.productName,
        product_image: data.productImage,
        product_price_eur: data.productPriceEur,
        selected_size: data.selectedSize,
        selected_color: data.selectedColor,
        customer_contact: data.customerContact,
        notes: data.notes || null,
        status: 'Pending',
      });
    }
    showToast(`Reproduction request #${newReq.id} submitted to Admin!`);
  };

  const handleUpdateReproductionStatus = (id: string, status: ReproductionRequest['status']) => {
    setReproductionRequests((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
      try {
        localStorage.setItem('komse_reproduction_requests', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (supabase) void supabase.from('reproduction_requests').update({ status }).eq('id', id);
  };

  const handleDeleteReproductionRequest = (id: string) => {
    setReproductionRequests((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('komse_reproduction_requests', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (supabase) void supabase.from('reproduction_requests').delete().eq('id', id);
  };

  // Product CRUD Handlers for Admin Panel
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: `p-${Date.now()}`,
    };
    if (supabase) {
      void adminRequest('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ product: created }),
      }).catch((error) => {
        console.error('Product create failed:', error);
        showToast(`Product could not be saved: ${error.message}`);
      });
    }
    setProductsList((prev) => {
      const next = [created, ...prev];
      try {
        localStorage.setItem('komse_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    notifyUsers('added', created);
    showToast(`Product "${created.name}" created successfully!`);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    if (supabase) {
      void adminRequest('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ product: updatedProd }),
      }).catch((error) => {
        console.error('Product update failed:', error);
        showToast(`Product could not be updated: ${error.message}`);
      });
    }
    setProductsList((prev) => {
      const next = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      try {
        localStorage.setItem('komse_products', JSON.stringify(next));
        const codeProduct = PRODUCTS.find((product) => product.id === updatedProd.id);
        if (codeProduct) {
          const overrides = readProductOverrides();
          overrides[updatedProd.id] = { product: updatedProd, base: codeProduct };
          localStorage.setItem('komse_product_overrides', JSON.stringify(overrides));
        }
      } catch (e) {}
      return next;
    });
    notifyUsers('updated', updatedProd);
    showToast(`Product "${updatedProd.name}" updated successfully!`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (supabase) {
      void adminRequest(`/api/admin/products/${encodeURIComponent(productId)}`, { method: 'DELETE' }).catch((error) => {
        console.error('Product delete failed:', error);
        showToast(`Product could not be deleted: ${error.message}`);
      });
    }
    const deletedProductIds = readDeletedIds('komse_deleted_products');
    deletedProductIds.add(productId);
    writeDeletedIds('komse_deleted_products', deletedProductIds);
    setProductsList((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('komse_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast('Product deleted from inventory');
  };

  // Order CRUD Handlers for Admin Panel
  const handleUpdateOrderStatus = (orderId: string, status: UserOrder['status'], trackingNumber?: string) => {
    if (supabase) {
      void adminRequest(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, trackingNumber }),
      }).catch((error) => {
        console.error('Order update failed:', error);
        showToast(`Order could not be updated: ${error.message}`);
      });
    }
    setUserOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, trackingNumber: trackingNumber ?? o.trackingNumber } : o))
    );
    showToast(`Order ${orderId} updated to ${status}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    const deletedOrderIds = readDeletedIds('komse_deleted_orders');
    deletedOrderIds.add(orderId);
    writeDeletedIds('komse_deleted_orders', deletedOrderIds);
    setUserOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (supabase) {
      void adminRequest(`/api/admin/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' }).catch((error) => {
        console.error('Order delete failed:', error);
        showToast(`Order could not be deleted: ${error.message}`);
      });
    }
    showToast(`Order ${orderId} removed`);
  };

  const handleAddOrder = (newOrder: Omit<UserOrder, 'id'>) => {
    const createdOrder: UserOrder = {
      ...newOrder,
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setUserOrders((prev) => [createdOrder, ...prev]);
    showToast(`Manual order ${createdOrder.id} generated`);
  };

  const persistCompletedCheckout = (order: UserOrder, user: UserProfile) => {
    if (!supabase) return;
    const subtotalEur = Math.max(0, order.totalAmountEur - (order.totalAmountEur < 100 ? 7.5 : 0));
    void supabase.from('orders').insert({
      user_id: user.id,
      stripe_session_id: order.id,
      customer_name: order.customerName || 'Customer',
      customer_email: order.customerEmail || user.email,
      subtotal_eur: subtotalEur,
      shipping_eur: order.totalAmountEur - subtotalEur,
      total_amount_eur: order.totalAmountEur,
      items_count: order.itemsCount,
      items_summary: order.itemsSummary,
      status: order.status,
      tracking_number: order.trackingNumber,
    }).then(({ error }) => {
      if (error) console.error('Completed order persistence failed:', error);
    });
  };

  useEffect(() => {
    if (!currentUser || !pendingCheckoutOrder.current) return;
    const order = pendingCheckoutOrder.current;
    pendingCheckoutOrder.current = null;
    persistCompletedCheckout(order, currentUser);
  }, [currentUser]);

  const handleCompletedCheckout = (order: UserOrder) => {
    setUserOrders((prev) => (prev.some((existingOrder) => existingOrder.id === order.id) ? prev : [order, ...prev]));
    if (currentUser) persistCompletedCheckout(order, currentUser);
    else pendingCheckoutOrder.current = order;
    notifyAdminOfOrder(order);
    showToast(`New order ${order.id} added to the Admin dashboard`);
  };

  const handleRateOrder = (orderId: string, rating: number, comment?: string) => {
    const targetOrder = userOrders.find((o) => o.id === orderId);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    setUserOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              rating,
              reviewComment: comment,
              ratedAt: dateStr,
            }
          : o
      )
    );

    if (targetOrder) {
      setProductsList((prevProducts) =>
        prevProducts.map((p) => {
          if (targetOrder.itemsSummary.toLowerCase().includes(p.name.toLowerCase())) {
            const newCount = p.reviewCount + 1;
            const newRating = Number(((p.rating * p.reviewCount + rating) / newCount).toFixed(1));
            return {
              ...p,
              rating: Math.min(5.0, Math.max(1.0, newRating)),
              reviewCount: newCount,
            };
          }
          return p;
        })
      );
    }

    showToast(`Thank you! You rated order ${orderId} ${rating}/5 ⭐`);
  };

  // User CRUD Handlers for Admin Panel
  const handleAddUser = (newUser: Omit<UserProfile, 'id'>) => {
    const createdUser: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    setUsersList((prev) => [createdUser, ...prev]);
    showToast(`Account created for ${createdUser.name}`);
  };

  const handleUpdateUserAdmin = (updatedUser: UserProfile) => {
    setUsersList((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    showToast(`User ${updatedUser.name} updated`);
  };

  const handleDeleteUser = (userId: string) => {
    const deletedUserIds = readDeletedIds('komse_deleted_users');
    deletedUserIds.add(userId);
    writeDeletedIds('komse_deleted_users', deletedUserIds);
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    showToast('User account removed');
  };

  const handleOpenFAQ = (cat?: string) => {
    if (cat) {
      setFaqCategory(cat);
    } else {
      setFaqCategory('all');
    }
    setFaqModalOpen(true);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (checkoutAfterAuth) {
      setCheckoutAfterAuth(false);
      sessionStorage.removeItem('komse_checkout_after_auth');
      const profileComplete = Boolean(
        user.name?.trim() &&
        user.email?.trim() &&
        user.phone?.trim() &&
        user.address?.trim() &&
        user.postalCode?.trim() &&
        user.city?.trim() &&
        user.country?.trim()
      );
      if (profileComplete) {
        setAuthModalOpen(false);
        setCheckoutModalOpen(true);
      } else {
        setCompleteProfileForCheckout(true);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCheckoutAfterAuth(false);
    if (supabase) void supabase.auth.signOut();
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    setUsersList((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
    if (supabase) {
      void supabase
        .from('profiles')
        .upsert(profileToRow(updated), { onConflict: 'id' })
        .then(({ error }) => {
          if (error) {
            console.error('Profile save failed:', error);
            showToast(`Profile could not be saved: ${error.message}`);
          }
        });
    }
    if (
      completeProfileForCheckout &&
      currentUser?.id === updated.id &&
      updated.name?.trim() &&
      updated.email?.trim() &&
      updated.phone?.trim() &&
      updated.address?.trim() &&
      updated.postalCode?.trim() &&
      updated.city?.trim() &&
      updated.country?.trim()
    ) {
      setCompleteProfileForCheckout(false);
      setAuthModalOpen(false);
      setCheckoutModalOpen(true);
    }
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number) => {
    if (!currentUser) {
      setAuthInitialMode('register');
      setAuthModalOpen(true);
      showToast('Create an account or sign in before adding items to your cart.');
      return;
    }
    const itemUniqueId = `${product.id}-${size}-${color}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemUniqueId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemUniqueId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemUniqueId,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });
    showToast(`Added ${quantity}x "${product.name}" to cart!`);
  };

  const handleAddCustomToCart = (customDetails: CustomDesignDetails, price: number) => {
    if (!currentUser) {
      setAuthInitialMode('register');
      setAuthModalOpen(true);
      showToast('Create an account or sign in before adding items to your cart.');
      return;
    }
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: `Custom ${customDetails.garmentType}`,
      category:
        customDetails.garmentType === 'Cap'
          ? 'Caps'
          : customDetails.garmentType === 'Jacket'
          ? 'Jackets'
          : customDetails.garmentType === 'Shirt'
          ? 'Shirts'
          : customDetails.garmentType === 'Overalls'
          ? 'Overalls'
          : 'Jersey T-Shirts',
      price: price,
      rating: 5.0,
      reviewCount: 1,
      image: PRODUCTS[0].image,
      gallery: [PRODUCTS[0].image],
      description: `Custom ${customDetails.garmentType} in ${customDetails.garmentColor} with text "${customDetails.customText}"`,
      features: ['Handcrafted custom embroidery', 'Made to order in Paris studio'],
      sizes: [customDetails.size],
      colors: [{ name: customDetails.garmentColor, hex: customDetails.garmentColorHex }],
      inStock: true,
    };

    const cartId = `custom-cart-${Date.now()}`;
    setCartItems((prev) => [
      ...prev,
      {
        id: cartId,
        product: customProduct,
        selectedSize: customDetails.size,
        selectedColor: customDetails.garmentColor,
        quantity: 1,
        customDesignDetails: customDetails,
      },
    ]);
    showToast('Custom item added to your cart!');
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart');
  };

  // Wishlist Operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        showToast('Item removed from wishlist');
        return prev.filter((id) => id !== productId);
      }
      showToast('Saved item to wishlist!');
      return [...prev, productId];
    });
  };

  const handleMoveWishlistToCart = (product: Product) => {
    handleAddToCart(product, product.sizes[0] || 'M', product.colors[0]?.name || 'Black', 1);
    setWishlistIds((prev) => prev.filter((id) => id !== product.id));
  };

  const handleProceedToCheckout = () => {
    if (currentUser) {
      const profileComplete = Boolean(
        currentUser.name?.trim() &&
        currentUser.email?.trim() &&
        currentUser.phone?.trim() &&
        currentUser.address?.trim() &&
        currentUser.postalCode?.trim() &&
        currentUser.city?.trim() &&
        currentUser.country?.trim()
      );
      if (!profileComplete) {
        setCompleteProfileForCheckout(true);
        setAuthModalOpen(true);
        return;
      }
      setCheckoutModalOpen(true);
      return;
    }
    setCheckoutAfterAuth(true);
    sessionStorage.setItem('komse_checkout_after_auth', 'true');
    setAuthInitialMode('register');
    setAuthModalOpen(true);
  };

  // Navigation handlers
  const handleSelectCategory = (category: ProductCategory) => {
    setShopCategory(category);
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'about') {
      setAboutModalOpen(true);
      return;
    }
    if (tab === 'contact') {
      setContactModalOpen(true);
      return;
    }
    if (tab === 'collections') {
      setShopCategory('All');
      setActiveTab('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'corporate') {
      setShopCategory('Corporate Wear');
      setActiveTab('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'accessories') {
      setShopCategory('Accessories');
      setActiveTab('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bestSellerProducts = productsList.filter((p) => p.isBestSeller);
  const wishlistProducts = productsList.filter((p) => wishlistIds.includes(p.id));
  const customerOrders = currentUser
    ? userOrders.filter((order) => order.customerEmail?.toLowerCase() === currentUser.email.toLowerCase())
    : [];
  const isAdminPage = getRoutePath() === '/admin';

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-stone-900 selection:bg-[#C5A059] selection:text-white flex flex-col justify-between">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] text-white px-5 py-3 rounded-lg shadow-2xl border border-[#C5A059] flex items-center gap-2.5 animate-in slide-in-from-bottom-5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Storefront */}
      <div className={isAdminPage ? 'hidden' : ''}>
        <TopBar
          currentCurrency={currentCurrency}
          onCurrencyChange={(code) => setCurrentCurrency(code)}
        />
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          wishlistCount={wishlistIds.length}
          currentUser={currentUser}
          onOpenCart={() => setCartDrawerOpen(true)}
          onOpenWishlist={() => setWishlistDrawerOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAccount={() => setAuthModalOpen(true)}
        />

        {/* Main Body Content based on Active View */}
        <main>
          {activeTab === 'home' && (
            <>
              {/* Hero Banner with Trust Bar */}
              <HeroSection
                onGetInTouch={() => setContactModalOpen(true)}
                onBrowseShop={() => {
                  setShopCategory('All');
                  setActiveTab('shop');
                }}
              />

              {/* Shop by Collections 6-Card Grid */}
              <CollectionsGrid
                onSelectCategory={handleSelectCategory}
                onViewAll={() => {
                  setShopCategory('All');
                  setActiveTab('shop');
                }}
              />

              {/* Best Sellers Grid */}
              <BestSellers
                products={bestSellerProducts}
                currentCurrency={currentCurrency}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onQuickAdd={(product) =>
                  handleAddToCart(
                    product,
                    product.sizes[0] || 'M',
                    product.colors[0]?.name || 'Black',
                    1
                  )
                }
                onProductClick={(product) => {
                  setSelectedProduct(product);
                  setProductModalOpen(true);
                }}
                onViewAllProducts={() => {
                  setShopCategory('All');
                  setActiveTab('shop');
                }}
              />

              {/* Testimonials Community Voices Section */}
              <TestimonialsSection />

              {/* Homepage Frequently Asked Questions Section */}
              <FAQSection onOpenContact={() => setContactModalOpen(true)} />
            </>
          )}

          {activeTab === 'shop' && (
            <ShopView
              products={productsList}
              initialCategory={shopCategory}
              currentCurrency={currentCurrency}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onQuickAdd={(product) =>
                handleAddToCart(
                  product,
                  product.sizes[0] || 'M',
                  product.colors[0]?.name || 'Black',
                  1
                )
              }
              onProductClick={(product) => {
                setSelectedProduct(product);
                setProductModalOpen(true);
              }}
              onStartCustomOrder={() => setCustomOrderModalOpen(true)}
            />
          )}
        </main>
      </div>

      {!isAdminPage && (
        <>
          {/* Newsletter & Footer */}
          <div>
            <Newsletter />
            <Footer
              onTabChange={handleTabChange}
              onSelectCategory={handleSelectCategory}
              onOpenContact={() => setContactModalOpen(true)}
              onOpenAbout={() => setAboutModalOpen(true)}
              onOpenFAQ={handleOpenFAQ}
              onOpenPrivacy={handleOpenPrivacy}
              onOpenTerms={handleOpenTerms}
            />
          </div>

          {/* Global Interactive Modals & Drawers */}
          <LegalModal
            isOpen={legalModalOpen}
            onClose={() => setLegalModalOpen(false)}
            initialTab={legalModalTab}
          />
          <CustomOrderModal
            isOpen={customOrderModalOpen}
            onClose={() => setCustomOrderModalOpen(false)}
            onAddToCart={handleAddCustomToCart}
          />

          <ProductDetailModal
        product={selectedProduct}
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        currentCurrency={currentCurrency}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSubmitReproductionRequest={handleAddReproductionRequest}
      />

          <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        currentCurrency={currentCurrency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={handleProceedToCheckout}
      />

          <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cartItems={cartItems}
        currentCurrency={currentCurrency}
        currentUser={currentUser}
        onClearCart={() => setCartItems([])}
        onOrderCompleted={handleCompletedCheckout}
      />

          <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={productsList}
        currentCurrency={currentCurrency}
        onSelectProduct={(product) => {
          setSelectedProduct(product);
          setProductModalOpen(true);
        }}
      />

          <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlistProducts={wishlistProducts}
        currentCurrency={currentCurrency}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveWishlistToCart}
      />

          <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />

          <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />

          <FAQModal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        initialCategory={faqCategory}
        onOpenContact={() => setContactModalOpen(true)}
        onStartCustomOrder={() => setCustomOrderModalOpen(true)}
      />

          <AuthModal
        isOpen={authModalOpen}
        initialAuthMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        completeProfileForCheckout={completeProfileForCheckout}
        initialDashboardTab={completeProfileForCheckout ? 'address' : 'orders'}
        onDeleteOrder={handleDeleteOrder}
        userOrders={customerOrders}
        allUsers={usersList}
        onOpenContact={() => setContactModalOpen(true)}
        onRateOrder={handleRateOrder}
          />
        </>
      )}

      {isAdminPage && (
        <Suspense fallback={null}>
          <AdminModal
            isOpen={adminModalOpen}
            isPage={isAdminPage}
            onClose={() => {
              setAdminModalOpen(false);
              window.history.replaceState({}, '', '/');
            }}
            products={productsList}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            orders={userOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onAddOrder={handleAddOrder}
            reproductionRequests={reproductionRequests}
            onUpdateReproductionStatus={handleUpdateReproductionStatus}
            onDeleteReproductionRequest={handleDeleteReproductionRequest}
            users={usersList}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUserAdmin}
            onDeleteUser={handleDeleteUser}
            currentCurrency={currentCurrency}
          />
        </Suspense>
      )}
    </div>
  );
}
