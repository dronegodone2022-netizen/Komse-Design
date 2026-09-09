import React, { useState, useMemo } from 'react';
import { Product, UserOrder, UserProfile, ProductCategory, CurrencyCode, ReproductionRequest } from '../types';
import { CURRENCIES } from '../data/products';
import { supabase } from '../lib/supabase';
import komseLogoImg from '../assets/images/komse_official_logo.png';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import {
  X,
  Package,
  ShoppingBag,
  Users,
  LayoutDashboard,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Shield,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  Key,
  Lock,
  LogOut,
  ShieldAlert,
  Mail,
  AlertTriangle,
  RefreshCcw,
  Check,
  Info,
  Activity,
  Clock,
  History,
  UserPlus,
  Truck,
  FileText,
  Filter,
  ArrowUpRight,
  Upload,
  Image as ImageIcon,
  FileImage,
  UploadCloud,
  Star,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  isPage?: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  orders: UserOrder[];
  onUpdateOrderStatus: (orderId: string, status: UserOrder['status'], trackingNumber?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddOrder: (order: Omit<UserOrder, 'id'>) => void;
  reproductionRequests?: ReproductionRequest[];
  onUpdateReproductionStatus?: (id: string, status: ReproductionRequest['status']) => void;
  onDeleteReproductionRequest?: (id: string) => void;
  users: UserProfile[];
  onAddUser: (user: Omit<UserProfile, 'id'>) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  currentCurrency: CurrencyCode;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  category: 'registration' | 'order' | 'policy' | 'catalog';
  action: string;
  details: string;
  actorName: string;
  actorEmail?: string;
  badgeText: string;
  badgeStyle: string;
  targetId?: string;
}

type AdminTab = 'overview' | 'products' | 'orders' | 'reproductions' | 'users' | 'activity';

type DeleteConfirmation = {
  type: 'product' | 'order' | 'reproduction' | 'user';
  id: string;
  label: string;
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  isPage = false,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddOrder,
  reproductionRequests = [],
  onUpdateReproductionStatus,
  onDeleteReproductionRequest,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentCurrency,
}) => {
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('admin@komse.com');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Reproduction Requests filter & search
  const [reproductionSearch, setReproductionSearch] = useState('');
  const [reproductionStatusFilter, setReproductionStatusFilter] = useState<string>('All');

  // Notification Toast State inside Admin
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => {
      setAdminToast(null);
    }, 4000);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'product') onDeleteProduct(deleteConfirmation.id);
    if (deleteConfirmation.type === 'order') onDeleteOrder(deleteConfirmation.id);
    if (deleteConfirmation.type === 'reproduction' && onDeleteReproductionRequest) {
      onDeleteReproductionRequest(deleteConfirmation.id);
    }
    if (deleteConfirmation.type === 'user') onDeleteUser(deleteConfirmation.id);

    showAdminToast(`${deleteConfirmation.label} deleted`);
    setDeleteConfirmation(null);
  };

  // Product Filter & Form State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Device Image File State
  const [deviceImageFileName, setDeviceImageFileName] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showWebUrlFallback, setShowWebUrlFallback] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'T-Shirts' as ProductCategory,
    price: 45,
    originalPrice: 55,
    rating: 5.0,
    reviewCount: 12,
    description: '',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    features: 'Premium Heavyweight Cotton, Tailored Fit',
    sizes: 'S, M, L, XL',
    colors: 'Heritage Black (#121212), Sierra Gold (#C5A059)',
    isBestSeller: false,
    isNew: true,
    inStock: true,
  });

  // Order Search & Form State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrderTracking, setEditingOrderTracking] = useState<{ id: string; tracking: string } | null>(null);

  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    itemsSummary: '',
    totalAmountEur: 85,
    status: 'Processing' as UserOrder['status'],
    trackingNumber: 'DHL-' + Math.floor(100000 + Math.random() * 900000) + '-FR',
  });

  // User Search & Form State
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('All');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Modals for User Password Reset & Suspension
  const [passwordResetUser, setPasswordResetUser] = useState<UserProfile | null>(null);
  const [tempGeneratedPassword, setTempGeneratedPassword] = useState<string>('');
  const [customResetNote, setCustomResetNote] = useState<string>('');

  const [suspensionTargetUser, setSuspensionTargetUser] = useState<UserProfile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState<string>('Website Policy Violation');
  const [suspensionDetails, setSuspensionDetails] = useState<string>('');

  // Activity Log State
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('All');
  const [activitySearch, setActivitySearch] = useState<string>('');

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([
    {
      id: 'log-101',
      timestamp: 'Today at 18:15',
      category: 'registration',
      action: 'New User Registration',
      details: 'Aminata Bangura registered a new customer account from Freetown, Sierra Leone.',
      actorName: 'Aminata Bangura',
      actorEmail: 'aminata.bangura@freetown.sl',
      badgeText: 'USER REGISTERED',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      targetId: 'usr-103',
    },
    {
      id: 'log-102',
      timestamp: 'Today at 17:40',
      category: 'order',
      action: 'Order Status Change',
      details: 'Order ORD-2026-8891 status updated to SHIPPED (Tracking: DHL-882194-FR).',
      actorName: 'Sylvester Ghamoi',
      actorEmail: 'sylvester@rainforestbuilder.com',
      badgeText: 'ORDER SHIPPED',
      badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300',
      targetId: 'ORD-2026-8891',
    },
    {
      id: 'log-103',
      timestamp: 'Today at 15:22',
      category: 'policy',
      action: 'Password Reset Issued',
      details: 'Admin issued a temporary password reset token for account Sylvester Ghamoi.',
      actorName: 'Sylvester Ghamoi',
      actorEmail: 'sylvester@rainforestbuilder.com',
      badgeText: 'PASSWORD RESET',
      badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
      targetId: 'usr-101',
    },
    {
      id: 'log-104',
      timestamp: 'August 07, 2026 at 11:05',
      category: 'registration',
      action: 'New User Registration',
      details: 'Marie Dupont created a customer profile from Paris, France.',
      actorName: 'Marie Dupont',
      actorEmail: 'marie.dupont@gmail.com',
      badgeText: 'USER REGISTERED',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      targetId: 'usr-102',
    },
    {
      id: 'log-105',
      timestamp: 'August 06, 2026 at 09:30',
      category: 'order',
      action: 'New Purchase Order',
      details: 'Order ORD-2026-7712 placed by Marie Dupont (€45.00 - Heritage Black Tee).',
      actorName: 'Marie Dupont',
      actorEmail: 'marie.dupont@gmail.com',
      badgeText: 'NEW ORDER',
      badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
      targetId: 'ORD-2026-7712',
    },
    {
      id: 'log-106',
      timestamp: 'August 05, 2026 at 14:12',
      category: 'policy',
      action: 'Policy Enforcement Audit',
      details: 'Compliance audit completed. 0 policy violations detected on recent customer actions.',
      actorName: 'System Auditor',
      badgeText: 'POLICY AUDIT',
      badgeStyle: 'bg-stone-200 text-stone-800 border-stone-300',
    },
    {
      id: 'log-107',
      timestamp: 'August 04, 2026 at 16:50',
      category: 'catalog',
      action: 'Catalog Inventory Update',
      details: 'Product "Freetown Gold Heavyweight Tee" inventory updated to IN STOCK.',
      actorName: 'Admin Inventory',
      badgeText: 'CATALOG UPDATE',
      badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      targetId: 'p-1',
    },
  ]);

  const addActivityLog = (
    category: 'registration' | 'order' | 'policy' | 'catalog',
    action: string,
    details: string,
    actorName: string,
    badgeText: string,
    badgeStyle: string,
    actorEmail?: string,
    targetId?: string
  ) => {
    const newEntry: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      category,
      action,
      details,
      actorName,
      actorEmail,
      badgeText,
      badgeStyle,
      targetId,
    };
    setActivityLogs((prev) => [newEntry, ...prev]);
  };

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'France',
    role: 'Customer' as 'Admin' | 'Customer',
    status: 'Active' as 'Active' | 'Suspended',
  });

  // Process orders for Financial Overview trend line chart
  const financialTrendData = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const sorted = [...validOrders].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    let cumulative = 0;
    return sorted.map((order) => {
      cumulative += order.totalAmountEur;
      const shortDate = order.date
        .replace(/, 202\d/, '')
        .replace('August', 'Aug')
        .replace('July', 'Jul')
        .replace('June', 'Jun')
        .replace('May', 'May')
        .replace('April', 'Apr')
        .replace('March', 'Mar')
        .replace('February', 'Feb')
        .replace('January', 'Jan');

      return {
        id: order.id,
        date: order.date,
        displayDate: shortDate,
        amount: order.totalAmountEur,
        cumulativeTotal: cumulative,
        customer: order.customerName || 'Customer',
        items: order.itemsCount,
        status: order.status,
      };
    });
  }, [orders]);

  if (!isOpen) return null;

  // Currency converter
  const formatPrice = (amountEur: number) => {
    const curr = CURRENCIES[currentCurrency] || CURRENCIES.EUR;
    return `${curr.symbol}${(amountEur * curr.rate).toFixed(2)}`;
  };

  // KPI Calculations
  const totalRevenueEur = orders.reduce((acc, order) => acc + (order.status !== 'Cancelled' ? order.totalAmountEur : 0), 0);
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const totalUsersCount = users.length;
  const suspendedUsersCount = users.filter((u) => u.status === 'Suspended').length;

  // Device Image Upload Handlers for Product Creation
  const handleDeviceImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showAdminToast('Please select a valid image file (PNG, JPG, WEBP, SVG, etc.).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setProductFormData((prev) => ({
        ...prev,
        image: dataUrl,
        gallery: prev.gallery ? [dataUrl, ...prev.gallery] : [dataUrl],
      }));
      setDeviceImageFileName(file.name);
      showAdminToast(`Selected image "${file.name}" from your device!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeviceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      files.forEach((file) => handleDeviceImageFile(file));
    }
  };

  const handleDeviceImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleDeviceImageFile(file);
    }
  };

  // Admin Auth Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);

    const validDemoEmails = ['admin@komse.com', 'admin@komse.design', 'sylvester@rainforestbuilder.com', 'admin'];
    const isValidDemoEmail = validDemoEmails.includes(adminEmail.toLowerCase().trim());
    const isValidDemoPassword = adminPassword.trim() === 'admin123' || adminPassword.trim() === 'admin2026';
    if (!supabase && window.location.hostname === 'localhost' && isValidDemoEmail && isValidDemoPassword) {
      setIsAdminAuthenticated(true);
      showAdminToast('Demo administrator session authenticated.');
      return;
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error || !data.user) {
        setAdminAuthError(
          error?.message === 'Invalid login credentials'
            ? 'Supabase could not verify this email and password. Create or reset this user in Supabase Authentication → Users.'
            : error?.message || 'Unable to authenticate administrator.',
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError || profile?.role !== 'Admin' || profile?.status !== 'Active') {
        await supabase.auth.signOut();
        setAdminAuthError('This account does not have active administrator access.');
        return;
      }

      setIsAdminAuthenticated(true);
      showAdminToast('Welcome Administrator! Session authenticated.');
      return;
    }

    setAdminAuthError(
      window.location.hostname === 'localhost'
        ? 'Invalid administrator credentials. Access restricted.'
        : 'Supabase authentication is not configured for this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in GitHub Actions.',
    );
  };

  const handleAutofillAdmin = () => {
    setAdminEmail('admin@komse.com');
    setAdminPassword('admin123');
    setAdminAuthError(null);
  };

  // Product submit handler
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = productFormData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const featuresArray = productFormData.features.split(',').map((f) => f.trim()).filter(Boolean);
    const colorsArray = productFormData.colors.split(',').map((c) => {
      const match = c.match(/(.+)\((#.+)\)/);
      if (match) {
        return { name: match[1].trim(), hex: match[2].trim() };
      }
      return { name: c.trim(), hex: '#121212' };
    });

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: productFormData.name,
        category: productFormData.category,
        price: Number(productFormData.price),
        originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : undefined,
        rating: Number(productFormData.rating) || 5.0,
        reviewCount: Number(productFormData.reviewCount) || 1,
        description: productFormData.description,
        image: productFormData.gallery && productFormData.gallery.length > 0 ? productFormData.gallery[0] : productFormData.image,
        gallery: productFormData.gallery && productFormData.gallery.length > 0 ? productFormData.gallery : productFormData.image ? [productFormData.image] : [],
        features: featuresArray,
        sizes: sizesArray,
        colors: colorsArray,
        isBestSeller: productFormData.isBestSeller,
        isNew: productFormData.isNew,
        inStock: productFormData.inStock,
      });
      setEditingProduct(null);
    } else {
      onAddProduct({
        name: productFormData.name,
        category: productFormData.category,
        price: Number(productFormData.price),
        originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : undefined,
        rating: Number(productFormData.rating) || 5.0,
        reviewCount: Number(productFormData.reviewCount) || 1,
        description: productFormData.description,
        image: productFormData.gallery && productFormData.gallery.length > 0 ? productFormData.gallery[0] : productFormData.image,
        gallery: productFormData.gallery && productFormData.gallery.length > 0 ? productFormData.gallery : productFormData.image ? [productFormData.image] : [],
        features: featuresArray,
        sizes: sizesArray,
        colors: colorsArray,
        isBestSeller: productFormData.isBestSeller,
        isNew: productFormData.isNew,
        inStock: productFormData.inStock,
      });
      setIsAddingProduct(false);
    }

    setProductFormData({
      name: '',
      category: 'Jersey T-Shirts',
      price: 45,
      originalPrice: 55,
      rating: 5.0,
      reviewCount: 12,
      description: '',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      features: 'Premium Heavyweight Cotton, Tailored Fit',
      sizes: 'S, M, L, XL',
      colors: 'Heritage Black (#121212), Sierra Gold (#C5A059)',
      isBestSeller: false,
      isNew: true,
      inStock: true,
    });
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      rating: product.rating ?? 5.0,
      reviewCount: product.reviewCount ?? 1,
      description: product.description,
      image: product.image,
      gallery: product.gallery && product.gallery.length > 0 ? product.gallery : product.image ? [product.image] : [],
      features: product.features.join(', '),
      sizes: product.sizes.join(', '),
      colors: product.colors.map((c) => `${c.name} (${c.hex})`).join(', '),
      isBestSeller: !!product.isBestSeller,
      isNew: !!product.isNew,
      inStock: product.inStock,
    });
    setIsAddingProduct(true);
  };

  // Order Submit
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const custName = newOrderForm.customerName || 'Walk-in Customer';
    const custEmail = newOrderForm.customerEmail || 'customer@komse.com';
    onAddOrder({
      customerName: custName,
      customerEmail: custEmail,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      itemsCount: 1,
      totalAmountEur: Number(newOrderForm.totalAmountEur),
      status: newOrderForm.status,
      trackingNumber: newOrderForm.trackingNumber,
      itemsSummary: newOrderForm.itemsSummary || 'Custom Apparel Purchase',
    });

    addActivityLog(
      'order',
      'New Order Recorded',
      `Manual purchase order recorded for ${custName} (€${newOrderForm.totalAmountEur} - ${newOrderForm.itemsSummary || 'Custom Apparel'}). Status: ${newOrderForm.status}.`,
      custName,
      'NEW ORDER',
      'bg-purple-100 text-purple-800 border-purple-300',
      custEmail
    );

    setIsAddingOrder(false);
    setNewOrderForm({
      customerName: '',
      customerEmail: '',
      itemsSummary: '',
      totalAmountEur: 85,
      status: 'Processing',
      trackingNumber: 'DHL-' + Math.floor(100000 + Math.random() * 900000) + '-FR',
    });
  };

  // User Handlers
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone,
        address: userFormData.address,
        city: userFormData.city,
        country: userFormData.country,
        role: userFormData.role,
        status: userFormData.status,
      });
      setEditingUser(null);
      showAdminToast(`Account profile for ${userFormData.name} updated.`);
    } else {
      onAddUser({
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone,
        address: userFormData.address,
        city: userFormData.city,
        country: userFormData.country,
        role: userFormData.role,
        status: userFormData.status,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });

      addActivityLog(
        'registration',
        'New Account Registration',
        `User profile created for ${userFormData.name} (${userFormData.email}). Role: ${userFormData.role}, Status: ${userFormData.status}.`,
        userFormData.name,
        'USER REGISTERED',
        'bg-emerald-100 text-emerald-800 border-emerald-300',
        userFormData.email
      );

      setIsAddingUser(false);
      showAdminToast(`New user account created for ${userFormData.name}.`);
    }
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'France',
      role: 'Customer',
      status: 'Active',
    });
  };

  const startEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || 'France',
      role: user.role || 'Customer',
      status: user.status || 'Active',
    });
    setIsAddingUser(true);
  };

  // Password Reset Trigger
  const triggerPasswordReset = (user: UserProfile) => {
    setPasswordResetUser(user);
    const randPass = 'Komse#' + Math.floor(1000 + Math.random() * 9000);
    setTempGeneratedPassword(randPass);
    setCustomResetNote('');
  };

  const handleConfirmPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;

    addActivityLog(
      'policy',
      'Password Reset Issued',
      `Admin issued a temporary password reset token (${tempGeneratedPassword}) for user ${passwordResetUser.name}.`,
      passwordResetUser.name,
      'PASSWORD RESET',
      'bg-amber-100 text-amber-800 border-amber-300',
      passwordResetUser.email,
      passwordResetUser.id
    );

    showAdminToast(
      `Password reset successful for ${passwordResetUser.name}. Temporary password (${tempGeneratedPassword}) and reset email sent to ${passwordResetUser.email}`
    );
    setPasswordResetUser(null);
  };

  // Suspension Trigger
  const triggerUserSuspension = (user: UserProfile) => {
    if (user.status === 'Suspended') {
      // Direct Reactivation
      onUpdateUser({ ...user, status: 'Active' });
      addActivityLog(
        'policy',
        'Account Access Restored',
        `Account access restored for user ${user.name}. Account status is now ACTIVE.`,
        user.name,
        'ACCOUNT RESTORED',
        'bg-emerald-100 text-emerald-800 border-emerald-300',
        user.email,
        user.id
      );
      showAdminToast(`Account access restored for ${user.name}. Status is now ACTIVE.`);
    } else {
      // Open Suspension Policy Reason Modal
      setSuspensionTargetUser(user);
      setSuspensionReason('Website Policy Violation');
      setSuspensionDetails('');
    }
  };

  const handleConfirmSuspension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspensionTargetUser) return;

    onUpdateUser({
      ...suspensionTargetUser,
      status: 'Suspended',
    });

    addActivityLog(
      'policy',
      'Account Suspended',
      `Account for ${suspensionTargetUser.name} suspended. Reason: ${suspensionReason}.${suspensionDetails ? ` Notes: ${suspensionDetails}` : ''}`,
      suspensionTargetUser.name,
      'ACCOUNT SUSPENDED',
      'bg-red-100 text-red-800 border-red-300',
      suspensionTargetUser.email,
      suspensionTargetUser.id
    );

    showAdminToast(`Account for ${suspensionTargetUser.name} has been SUSPENDED due to: ${suspensionReason}.`);
    setSuspensionTargetUser(null);
  };

  // Order Status Change Handler
  const handleOrderStatusChange = (orderId: string, newStatus: UserOrder['status'], trackingNumber?: string) => {
    onUpdateOrderStatus(orderId, newStatus, trackingNumber);
    const targetOrder = orders.find((o) => o.id === orderId);
    const customer = targetOrder?.customerName || 'Customer';
    const email = targetOrder?.customerEmail;

    addActivityLog(
      'order',
      `Order Status -> ${newStatus.toUpperCase()}`,
      `Order ${orderId} for ${customer} status updated to ${newStatus}.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      customer,
      `ORDER ${newStatus.toUpperCase()}`,
      newStatus === 'Delivered'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
        : newStatus === 'Shipped'
        ? 'bg-blue-100 text-blue-800 border-blue-300'
        : newStatus === 'Cancelled'
        ? 'bg-red-100 text-red-800 border-red-300'
        : 'bg-amber-100 text-amber-800 border-amber-300',
      email,
      orderId
    );
  };

  // Filtered Lists
  const filteredProducts = products.filter((p) => {
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchesQuery = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchesQuery =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      o.itemsSummary.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredReproductionRequests = reproductionRequests.filter((r) => {
    const matchesStatus = reproductionStatusFilter === 'All' || r.status === reproductionStatusFilter;
    const q = reproductionSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.customerContact.toLowerCase().includes(q) ||
      r.selectedSize.toLowerCase().includes(q) ||
      r.selectedColor.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const filteredUsers = users.filter((u) => {
    const matchesStatus = userStatusFilter === 'All' || (u.status || 'Active') === userStatusFilter;
    const matchesRole = userRoleFilter === 'All' || (u.role || 'Customer') === userRoleFilter;
    const matchesQuery =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase()));
    return matchesStatus && matchesRole && matchesQuery;
  });

  const filteredActivityLogs = activityLogs.filter((log) => {
    const matchesCategory = activityCategoryFilter === 'All' || log.category === activityCategoryFilter;
    const q = activitySearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      (log.targetId && log.targetId.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className={isPage
      ? 'h-screen overflow-hidden bg-[#FAF9F6]'
      : 'fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200'}>
      <div className={isPage
        ? 'h-full w-full bg-[#FCFBF9] overflow-hidden flex flex-col'
        : 'bg-[#FCFBF9] w-full max-w-6xl rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[92vh]'}>
        {/* Header Bar */}
        <div className="relative bg-[#121212] text-white px-6 py-4 flex items-center justify-center border-b border-stone-800">
          <div className="flex items-center justify-center gap-5 sm:gap-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center font-black shadow-md overflow-hidden shrink-0">
                <img src={komseLogoImg} alt="KOMSE Logo" className="w-full h-full object-contain" />
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#C5A059] text-stone-950 flex items-center justify-center font-black shadow-md">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h2 className="text-lg font-black tracking-tight uppercase">KOMSE ADMIN PORTAL</h2>
                {isAdminAuthenticated ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3 h-3" /> Authenticated
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Restricted
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">Manage catalog inventory, customer orders, and account policy enforcement</p>
            </div>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  showAdminToast('Signed out of Admin Session.');
                }}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors cursor-pointer border border-stone-700"
                title="Lock Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ADMIN AUTHENTICATION GUARD SCREEN */}
        {!isAdminAuthenticated ? (
          <div className="p-8 sm:p-12 bg-[#FAF9F6] flex flex-col items-center justify-center flex-1 my-auto">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-stone-200 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] text-[#C5A059] flex items-center justify-center mx-auto shadow-md border border-[#C5A059]/40">
                <Lock className="w-8 h-8 text-[#C5A059]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase">ADMIN AUTHENTICATION REQUIRED</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Access to product management, customer orders, and user account controls requires unique administrator credentials.
                </p>
              </div>

              {/* Error Banner */}
              {adminAuthError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2 text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Administrator Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@komse.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Admin Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#121212] hover:bg-black text-[#C5A059] font-bold text-xs uppercase py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Shield className="w-4 h-4" /> Sign In to Admin Portal
                </button>
              </form>

              {/* Autofill Demo Credentials Shortcut */}
              <div className="pt-4 border-t border-stone-100 flex flex-col items-center gap-2">
                <span className="text-[11px] text-stone-400 font-medium">Demo Administrator Credentials</span>
                <button
                  type="button"
                  onClick={handleAutofillAdmin}
                  className="bg-[#F7F4EE] hover:bg-[#EFEADF] border border-[#C5A059]/40 text-[#A88238] px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Autofill Demo Admin Logins (admin@komse.com / admin123)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Toast Notification in Admin */}
            {adminToast && (
              <div className="bg-[#121212] text-[#C5A059] px-6 py-2.5 text-xs font-bold flex items-center justify-between border-b border-stone-800 animate-in slide-in-from-top duration-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C5A059]" />
                  <span>{adminToast}</span>
                </div>
                <button onClick={() => setAdminToast(null)} className="text-stone-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-[#1A1A1A] px-6 flex items-center gap-2 border-b border-stone-800 overflow-x-auto">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'products', label: `Products (${products.length})`, icon: Package },
                { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
                { id: 'reproductions', label: `Reproduction Requests (${reproductionRequests.length})`, icon: RefreshCcw },
                { id: 'users', label: `Users & Policies (${users.length})`, icon: Users },
                { id: 'activity', label: `Activity Log (${activityLogs.length})`, icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as AdminTab);
                      setIsAddingProduct(false);
                      setIsAddingOrder(false);
                      setIsAddingUser(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-[#C5A059] text-[#C5A059] bg-[#242424]'
                        : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-[#222]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Body Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-[#FAF9F6]">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
                        <span>Total Revenue</span>
                        <div className="p-2 rounded-lg bg-amber-50 text-[#C5A059]">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-stone-900">{formatPrice(totalRevenueEur)}</div>
                      <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last month
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
                        <span>Total Orders</span>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-stone-900">{totalOrdersCount}</div>
                      <div className="text-[11px] text-stone-500">
                        {orders.filter((o) => o.status === 'Processing').length} awaiting shipment
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
                        <span>Active Products</span>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-stone-900">{totalProductsCount}</div>
                      <div className="text-[11px] text-stone-500">
                        {products.filter((p) => p.inStock).length} currently in stock
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
                        <span>Users & Policies</span>
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-stone-900">{totalUsersCount}</div>
                      <div className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                        <UserX className="w-3.5 h-3.5" /> {suspendedUsersCount} suspended for policy
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="bg-[#121212] text-white p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black uppercase text-[#C5A059]">Quick Admin Shortcuts</h3>
                      <p className="text-xs text-stone-300">Add inventory, update customer records, or process orders directly</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => {
                          setActiveTab('products');
                          setIsAddingProduct(true);
                          setEditingProduct(null);
                        }}
                        className="bg-[#C5A059] hover:bg-[#A88238] text-stone-950 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('orders');
                          setIsAddingOrder(true);
                        }}
                        className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Manual Order
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('users');
                          setIsAddingUser(true);
                          setEditingUser(null);
                        }}
                        className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add User
                      </button>
                    </div>
                  </div>

                  {/* Financial Overview Section with Trend Line Chart */}
                  <div className="bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#C5A059]" />
                          <h3 className="font-black text-stone-900 uppercase text-base tracking-wide">Financial Overview & Revenue Trends</h3>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Order value progression over time generated dynamically from user orders ({orders.length} orders total)
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-lg border border-stone-200 text-xs">
                        <div className="px-3 py-1 bg-white rounded shadow-2xs font-bold text-stone-900 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Total Revenue: <strong className="text-emerald-700">{formatPrice(totalRevenueEur)}</strong></span>
                        </div>
                        <div className="px-3 py-1 bg-white rounded shadow-2xs font-bold text-stone-800">
                          <span>AOV: <strong className="text-[#C5A059]">{formatPrice(totalRevenueEur / (orders.filter((o) => o.status !== 'Cancelled').length || 1))}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Recharts Financial Line Chart */}
                    {financialTrendData.length === 0 ? (
                      <div className="py-12 text-center text-stone-400 text-xs">
                        No active order records found to chart revenue trends.
                      </div>
                    ) : (
                      <div className="w-full h-72 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={financialTrendData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="financialGoldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#C5A059" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                            <XAxis
                              dataKey="displayDate"
                              stroke="#78716C"
                              fontSize={11}
                              tickLine={false}
                              axisLine={{ stroke: '#E7E5E4' }}
                            />
                            <YAxis
                              stroke="#78716C"
                              fontSize={11}
                              tickLine={false}
                              axisLine={{ stroke: '#E7E5E4' }}
                              tickFormatter={(value) => formatPrice(value)}
                            />
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-[#121212] border border-[#C5A059] p-3 rounded-lg shadow-2xl text-white text-xs space-y-1.5 min-w-[210px] z-50">
                                      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                                        <span className="font-mono text-[#C5A059] font-bold">{data.id}</span>
                                        <span className="text-stone-400 text-[10px]">{data.date}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-stone-300">Order Total:</span>
                                        <span className="font-black text-emerald-400 text-sm">{formatPrice(data.amount)}</span>
                                      </div>
                                      <div className="flex items-center justify-between border-t border-stone-800/80 pt-1">
                                        <span className="text-stone-400">Cumulative Total:</span>
                                        <span className="font-bold text-[#C5A059]">{formatPrice(data.cumulativeTotal)}</span>
                                      </div>
                                      <div className="text-[10px] text-stone-400 flex items-center justify-between pt-0.5">
                                        <span>Customer: {data.customer}</span>
                                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">{data.status}</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="cumulativeTotal"
                              stroke="#C5A059"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#financialGoldGradient)"
                              activeDot={{ r: 6, fill: '#121212', stroke: '#C5A059', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <h3 className="font-black text-stone-900 uppercase text-sm">Recent Store Orders</h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-[#C5A059] hover:underline cursor-pointer"
                      >
                        View All Orders →
                      </button>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {orders.slice(0, 4).map((order) => (
                        <div key={order.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                              <span>{order.id}</span>
                              <span className="text-stone-400 font-normal">• {order.date}</span>
                            </div>
                            <div className="text-stone-600 truncate max-w-md">{order.itemsSummary}</div>
                            {order.customerName && <div className="text-[11px] text-stone-500">Customer: {order.customerName}</div>}
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-stone-900">{formatPrice(order.totalAmountEur)}</span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent System Activity Preview */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#C5A059]" />
                        <h3 className="font-black text-stone-900 uppercase text-sm">Recent System Activity</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className="text-xs font-bold text-[#C5A059] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        View Full Activity Log ({activityLogs.length}) →
                      </button>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {activityLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 border ${log.badgeStyle}`}>
                              {log.badgeText}
                            </span>
                            <span className="font-bold text-stone-900 truncate">{log.action}:</span>
                            <span className="text-stone-600 truncate max-w-sm hidden md:inline">{log.details}</span>
                          </div>
                          <span className="text-[11px] font-bold text-stone-400 shrink-0 font-mono">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Product Controls Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="All">All Categories</option>
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Shirts">Shirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Jackets">Jackets</option>
                        <option value="Overalls">Overalls</option>
                        <option value="Caps">Caps</option>
                        <option value="Corporate Wear">Corporate Wear</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductFormData({
                          name: '',
                          category: 'Jersey T-Shirts',
                          price: 45,
                          originalPrice: 55,
                          rating: 0,
                          reviewCount: 0,
                          description: '',
                          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
                          gallery: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
                          features: 'Premium Heavyweight Cotton, Tailored Fit',
                          sizes: 'S, M, L, XL',
                          colors: 'Heritage Black (#121212), Sierra Gold (#C5A059)',
                          isBestSeller: false,
                          isNew: true,
                          inStock: true,
                        });
                        setIsAddingProduct(!isAddingProduct);
                      }}
                      className="bg-[#C5A059] hover:bg-[#A88238] text-stone-950 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {isAddingProduct ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingProduct ? 'Cancel' : 'Add New Product'}</span>
                    </button>
                  </div>

                  {/* Add / Edit Product Form Drawer */}
                  {isAddingProduct && (
                    <form onSubmit={handleProductSubmit} className="bg-white p-6 rounded-xl border-2 border-[#C5A059] shadow-md space-y-4 animate-in slide-in-from-top-2">
                      <h3 className="font-black text-stone-900 uppercase text-sm border-b border-stone-200 pb-2">
                        {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Product Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Freetown Gold Embroidered Polo"
                            value={productFormData.name}
                            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
                          <select
                            value={productFormData.category}
                            onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value as ProductCategory })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          >
                            <option value="T-Shirts">T-Shirts</option>
                            <option value="Shirts">Shirts</option>
                            <option value="Hoodies">Hoodies</option>
                            <option value="Jackets">Jackets</option>
                            <option value="Overalls">Overalls</option>
                            <option value="Caps">Caps</option>
                            <option value="Corporate Wear">Corporate Wear</option>
                            <option value="Accessories">Accessories</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Price (EUR €)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={productFormData.price}
                            onChange={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#C5A059] fill-[#C5A059]" />
                            <span>Product Rating ⭐ (1.0 - 5.0)</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={productFormData.rating}
                            onChange={(e) => setProductFormData({ ...productFormData, rating: parseFloat(e.target.value) || 5.0 })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50 font-bold text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Total Verified Reviews Count</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={productFormData.reviewCount}
                            onChange={(e) => setProductFormData({ ...productFormData, reviewCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Product features and cultural story details..."
                          value={productFormData.description}
                          onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                        />
                      </div>

                      {/* Device Image Upload Zone */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-700 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                            <span>Product Image (Select File from Device)</span>
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal normal-case">Supports PNG, JPG, WEBP, SVG</span>
                        </label>

                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingImage(true);
                          }}
                          onDragLeave={() => setIsDraggingImage(false)}
                          onDrop={handleDeviceImageDrop}
                          onClick={() => document.getElementById('admin-device-image-input')?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
                            isDraggingImage
                              ? 'border-[#C5A059] bg-[#C5A059]/10'
                              : 'border-stone-300 hover:border-[#C5A059] bg-stone-50/80 hover:bg-stone-100/50'
                          }`}
                        >
                          <input
                            type="file"
                            id="admin-device-image-input"
                            accept="image/*"
                            onChange={handleDeviceImageChange}
                            className="hidden"
                            multiple
                          />

                          {productFormData.gallery && productFormData.gallery.length > 0 ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                              <div className="flex gap-3 shrink-0">
                                {(productFormData.gallery || []).slice(0, 4).map((g, idx) => (
                                  <div key={g + idx} className="relative group">
                                    <img
                                      src={g}
                                      alt={`Gallery ${idx + 1}`}
                                      className={`w-24 h-24 object-cover rounded-lg border border-stone-300 shadow-xs bg-white ${idx === 0 ? 'ring-2 ring-[#C5A059]' : ''}`}
                                    />
                                    <div className="absolute top-1 right-1 flex gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // remove this image
                                          setProductFormData((prev) => ({
                                            ...prev,
                                            gallery: prev.gallery ? prev.gallery.filter((_, i) => i !== idx) : [],
                                            image: idx === 0 ? (prev.gallery && prev.gallery[1]) || '' : prev.image,
                                          }));
                                        }}
                                        className="bg-white/90 rounded-full p-0.5 text-xs text-red-600"
                                        aria-label={`Remove image ${idx + 1}`}
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // set this image as primary
                                        setProductFormData((prev) => ({
                                          ...prev,
                                          gallery: prev.gallery ? [g, ...prev.gallery.filter((_, i) => i !== idx)] : [g],
                                          image: g,
                                        }));
                                      }}
                                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label={`Set image ${idx + 1} as primary`}
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-300">
                                    Device Image Loaded
                                  </span>
                                  {deviceImageFileName && (
                                    <span className="text-xs font-bold text-stone-900 truncate max-w-xs">{deviceImageFileName}</span>
                                  )}
                                </div>
                                <p className="text-xs text-stone-600">
                                  Image selected directly from device. Click box or drag a new image to replace.
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      document.getElementById('admin-device-image-input')?.click();
                                    }}
                                    className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Upload className="w-3.5 h-3.5" /> Choose Another Image
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                              e.stopPropagation();
                                              setProductFormData((prev) => ({ ...prev, image: '', gallery: [] }));
                                              setDeviceImageFileName(null);
                                            }}
                                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Clear Image
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-4 text-center space-y-2">
                              <div className="w-12 h-12 rounded-full bg-[#121212] text-[#C5A059] flex items-center justify-center mx-auto shadow-xs">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-stone-900">
                                  Click to Choose Image File from Device
                                </p>
                                <p className="text-[11px] text-stone-500">
                                  Drag & drop your product photo or click to browse computer files
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Optional Web URL Accordion Toggle */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowWebUrlFallback(!showWebUrlFallback)}
                            className="text-[11px] font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
                          >
                            {showWebUrlFallback ? 'Hide Web URL Input' : 'Or paste an Image Web URL link instead'}
                          </button>

                          {showWebUrlFallback && (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                placeholder="https://images.unsplash.com/photo-..."
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50 focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newImageUrl) return;
                                  setProductFormData((prev) => ({
                                    ...prev,
                                    gallery: prev.gallery ? [newImageUrl, ...prev.gallery] : [newImageUrl],
                                    image: prev.image || newImageUrl,
                                  }));
                                  setNewImageUrl('');
                                  showAdminToast('Added image URL to gallery');
                                }}
                                className="px-3 py-2 bg-[#C5A059] text-stone-900 rounded text-xs font-bold"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Available Sizes (comma separated)</label>
                          <input
                            type="text"
                            value={productFormData.sizes}
                            onChange={(e) => setProductFormData({ ...productFormData, sizes: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Color Palette (e.g. Name (#HEX))</label>
                          <input
                            type="text"
                            value={productFormData.colors}
                            onChange={(e) => setProductFormData({ ...productFormData, colors: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                            placeholder="Heritage Black (#121212), Sierra Gold (#C5A059)"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-stone-100">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                          <input
                            type="checkbox"
                            checked={productFormData.inStock}
                            onChange={(e) => setProductFormData({ ...productFormData, inStock: e.target.checked })}
                            className="w-4 h-4 accent-[#C5A059]"
                          />
                          <span>In Stock</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                          <input
                            type="checkbox"
                            checked={productFormData.isBestSeller}
                            onChange={(e) => setProductFormData({ ...productFormData, isBestSeller: e.target.checked })}
                            className="w-4 h-4 accent-[#C5A059]"
                          />
                          <span>Best Seller</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                          <input
                            type="checkbox"
                            checked={productFormData.isNew}
                            onChange={(e) => setProductFormData({ ...productFormData, isNew: e.target.checked })}
                            className="w-4 h-4 accent-[#C5A059]"
                          />
                          <span>New Arrival</span>
                        </label>

                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingProduct(false)}
                            className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs font-bold uppercase cursor-pointer hover:bg-stone-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#121212] hover:bg-black text-[#C5A059] px-6 py-2 rounded text-xs font-bold uppercase cursor-pointer"
                          >
                            {editingProduct ? 'Save Changes' : 'Create Product'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Products Table */}
                  <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-100 text-stone-600 text-[11px] font-bold uppercase tracking-wider border-b border-stone-200">
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price</th>
                            <th className="p-3.5">Rating ⭐</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Badges</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5 flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md border border-stone-200 bg-stone-100" />
                                <div>
                                  <div className="font-bold text-stone-900">{p.name}</div>
                                  <div className="text-[10px] text-stone-400">ID: {p.id}</div>
                                </div>
                              </td>
                              <td className="p-3.5 text-stone-700 font-medium">{p.category}</td>
                              <td className="p-3.5 font-bold text-stone-900">{formatPrice(p.price)}</td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-1 text-stone-900 font-bold">
                                  <Star className="w-3.5 h-3.5 text-[#C5A059] fill-[#C5A059]" />
                                  <span>{p.rating ? p.rating.toFixed(1) : '5.0'}</span>
                                  <span className="text-[10px] text-stone-400 font-normal">({p.reviewCount || 0})</span>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <button
                                  onClick={() => onUpdateProduct({ ...p, inStock: !p.inStock })}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                                    p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                                </button>
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-1">
                                  {p.isBestSeller && (
                                    <span className="bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      BESTSELLER
                                    </span>
                                  )}
                                  {p.isNew && (
                                    <span className="bg-stone-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      NEW
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => startEditProduct(p)}
                                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmation({ type: 'product', id: p.id, label: `Product "${p.name}"` })}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Controls Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search Order ID or Customer..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsAddingOrder(!isAddingOrder)}
                      className="bg-[#C5A059] hover:bg-[#A88238] text-stone-950 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {isAddingOrder ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingOrder ? 'Cancel' : 'Create Order'}</span>
                    </button>
                  </div>

                  {/* Add Order Form Drawer */}
                  {isAddingOrder && (
                    <form onSubmit={handleOrderSubmit} className="bg-white p-6 rounded-xl border-2 border-[#C5A059] shadow-md space-y-4 animate-in slide-in-from-top-2">
                      <h3 className="font-black text-stone-900 uppercase text-sm border-b border-stone-200 pb-2">
                        Record Manual Customer Order
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Customer Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Marie Dupont"
                            value={newOrderForm.customerName}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Customer Email</label>
                          <input
                            type="email"
                            required
                            placeholder="marie.dupont@gmail.com"
                            value={newOrderForm.customerEmail}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, customerEmail: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Items Purchased</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 1x Freetown Heavyweight Hoodie (L)"
                            value={newOrderForm.itemsSummary}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, itemsSummary: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Total Amount (EUR €)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newOrderForm.totalAmountEur}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, totalAmountEur: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Order Status</label>
                          <select
                            value={newOrderForm.status}
                            onChange={(e) => setNewOrderForm({ ...newOrderForm, status: e.target.value as UserOrder['status'] })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingOrder(false)}
                          className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs font-bold uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#121212] hover:bg-black text-[#C5A059] px-6 py-2 rounded text-xs font-bold uppercase cursor-pointer"
                        >
                          Save Order
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Orders Table */}
                  <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-100 text-stone-600 text-[11px] font-bold uppercase tracking-wider border-b border-stone-200">
                            <th className="p-3.5">Order Info</th>
                            <th className="p-3.5">Customer</th>
                            <th className="p-3.5">Items Purchased</th>
                            <th className="p-3.5">Amount</th>
                            <th className="p-3.5">Customer Rating</th>
                            <th className="p-3.5">Tracking #</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-stone-900">{order.id}</div>
                                <div className="text-[10px] text-stone-500">{order.date}</div>
                              </td>
                              <td className="p-3.5">
                                <div className="font-bold text-stone-900">{order.customerName || 'Customer'}</div>
                                <div className="text-[10px] text-stone-500">{order.customerEmail || 'N/A'}</div>
                              </td>
                              <td className="p-3.5 max-w-xs text-stone-700 truncate">{order.itemsSummary}</td>
                              <td className="p-3.5 font-bold text-stone-900">{formatPrice(order.totalAmountEur)}</td>
                              <td className="p-3.5">
                                {order.rating ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1 text-[#C5A059] font-bold">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span>{order.rating}/5</span>
                                      {order.ratedAt && <span className="text-[10px] text-stone-400 font-normal">({order.ratedAt})</span>}
                                    </div>
                                    {order.reviewComment && (
                                      <div className="text-[10px] text-stone-600 italic max-w-xs truncate" title={order.reviewComment}>
                                        "{order.reviewComment}"
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-stone-400 text-[10px] italic">Not rated yet</span>
                                )}
                              </td>
                              <td className="p-3.5 font-mono text-[11px]">
                                {editingOrderTracking?.id === order.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editingOrderTracking.tracking}
                                      onChange={(e) => setEditingOrderTracking({ id: order.id, tracking: e.target.value })}
                                      className="px-2 py-1 text-xs border border-stone-300 rounded font-mono w-32"
                                    />
                                    <button
                                      onClick={() => {
                                        handleOrderStatusChange(order.id, order.status, editingOrderTracking.tracking);
                                        setEditingOrderTracking(null);
                                      }}
                                      className="p-1 text-emerald-600 hover:text-emerald-800"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingOrderTracking({ id: order.id, tracking: order.trackingNumber })}
                                    className="hover:text-[#C5A059] flex items-center gap-1 cursor-pointer"
                                    title="Click to edit tracking"
                                  >
                                    <span>{order.trackingNumber || 'Add Tracking'}</span>
                                    <Edit2 className="w-3 h-3 text-stone-400" />
                                  </button>
                                )}
                              </td>
                              <td className="p-3.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusChange(order.id, e.target.value as UserOrder['status'])}
                                  className={`px-2 py-1 text-[11px] font-bold uppercase rounded border focus:outline-none ${
                                    order.status === 'Delivered'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : order.status === 'Shipped'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : order.status === 'Cancelled'
                                      ? 'bg-red-50 text-red-800 border-red-300'
                                      : 'bg-amber-50 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setDeleteConfirmation({ type: 'order', id: order.id, label: `Order ${order.id}` })}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* REPRODUCTION REQUESTS TAB */}
              {activeTab === 'reproductions' && (
                <div className="space-y-6">
                  {/* KPI Cards for Reproductions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
                      <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">Total Requests</span>
                      <p className="text-2xl font-black text-stone-900">{reproductionRequests.length}</p>
                    </div>
                    <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 shadow-xs space-y-1">
                      <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
                      <p className="text-2xl font-black text-amber-900">
                        {reproductionRequests.filter((r) => r.status === 'Pending').length}
                      </p>
                    </div>
                    <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 shadow-xs space-y-1">
                      <span className="text-blue-800 text-[10px] font-bold uppercase tracking-wider">In Atelier Production</span>
                      <p className="text-2xl font-black text-blue-900">
                        {reproductionRequests.filter((r) => r.status === 'In Production').length}
                      </p>
                    </div>
                    <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1">
                      <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Fulfilled & Restocked</span>
                      <p className="text-2xl font-black text-emerald-900">
                        {reproductionRequests.filter((r) => r.status === 'Fulfilled').length}
                      </p>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search Request ID, Product, Contact..."
                          value={reproductionSearch}
                          onChange={(e) => setReproductionSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <select
                        value={reproductionStatusFilter}
                        onChange={(e) => setReproductionStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Production">In Production</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>

                    <div className="text-xs text-stone-500 font-medium">
                      Showing <strong>{filteredReproductionRequests.length}</strong> of <strong>{reproductionRequests.length}</strong> submitted reproduction requests
                    </div>
                  </div>

                  {/* Reproductions Table */}
                  <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 uppercase font-black tracking-wider text-[10px]">
                            <th className="p-3.5">Request ID & Date</th>
                            <th className="p-3.5">Out of Stock Item</th>
                            <th className="p-3.5">Requested Specs</th>
                            <th className="p-3.5">Customer Contact</th>
                            <th className="p-3.5">Notes</th>
                            <th className="p-3.5">Status Action</th>
                            <th className="p-3.5 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {filteredReproductionRequests.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-stone-500 text-xs">
                                No reproduction requests found matching criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredReproductionRequests.map((req) => (
                              <tr key={req.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="p-3.5">
                                  <span className="font-mono font-bold text-stone-900 block">{req.id}</span>
                                  <span className="text-[10px] text-stone-500">{req.requestedAt}</span>
                                </td>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={req.productImage}
                                      alt={req.productName}
                                      className="w-10 h-10 object-cover rounded border border-stone-200"
                                    />
                                    <div>
                                      <p className="font-bold text-stone-900 leading-tight">{req.productName}</p>
                                      <p className="text-[10px] text-stone-500">
                                        Base: {CURRENCIES[currentCurrency].symbol}{(req.productPriceEur * CURRENCIES[currentCurrency].rate).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <div className="space-y-0.5">
                                    <span className="inline-block bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200 mr-1">
                                      Size: {req.selectedSize}
                                    </span>
                                    <span className="inline-block bg-[#121212] text-[#C5A059] text-[10px] font-bold px-2 py-0.5 rounded">
                                      Color: {req.selectedColor}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3.5 font-medium">
                                  <a
                                    href={`mailto:${req.customerContact}`}
                                    className="text-stone-900 hover:text-[#C5A059] underline font-semibold flex items-center gap-1"
                                  >
                                    <Mail className="w-3 h-3 text-stone-400" />
                                    {req.customerContact}
                                  </a>
                                </td>
                                <td className="p-3.5 text-stone-600 max-w-xs truncate" title={req.notes || 'None'}>
                                  {req.notes || <span className="text-stone-400 italic">No notes provided</span>}
                                </td>
                                <td className="p-3.5">
                                  <select
                                    value={req.status}
                                    onChange={(e) => {
                                      const newStatus = e.target.value as ReproductionRequest['status'];
                                      if (onUpdateReproductionStatus) {
                                        onUpdateReproductionStatus(req.id, newStatus);
                                        showAdminToast(`Updated reproduction request ${req.id} to ${newStatus}`);
                                      }
                                    }}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase border cursor-pointer ${
                                      req.status === 'Fulfilled'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : req.status === 'In Production'
                                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                                        : req.status === 'Declined'
                                        ? 'bg-stone-100 text-stone-600 border-stone-300'
                                        : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="In Production">In Production</option>
                                    <option value="Fulfilled">Fulfilled</option>
                                    <option value="Declined">Declined</option>
                                  </select>
                                </td>
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => setDeleteConfirmation({ type: 'reproduction', id: req.id, label: `Reproduction request ${req.id}` })}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                    title="Delete Request"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS & POLICIES TAB */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Controls & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search User, Email, City..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active Only</option>
                        <option value="Suspended">Suspended Only</option>
                      </select>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="All">All Roles</option>
                        <option value="Customer">Customers Only</option>
                        <option value="Admin">Administrators Only</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setUserFormData({
                          name: '',
                          email: '',
                          phone: '',
                          address: '',
                          city: '',
                          country: 'France',
                          role: 'Customer',
                          status: 'Active',
                        });
                        setIsAddingUser(!isAddingUser);
                      }}
                      className="bg-[#C5A059] hover:bg-[#A88238] text-stone-950 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {isAddingUser ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingUser ? 'Cancel' : 'Create Account'}</span>
                    </button>
                  </div>

                  {/* Add / Edit User Form Drawer */}
                  {isAddingUser && (
                    <form onSubmit={handleUserSubmit} className="bg-white p-6 rounded-xl border-2 border-[#C5A059] shadow-md space-y-4 animate-in slide-in-from-top-2">
                      <h3 className="font-black text-stone-900 uppercase text-sm border-b border-stone-200 pb-2">
                        {editingUser ? `Edit Account Details: ${editingUser.name}` : 'Create New User Account'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aminata Bangura"
                            value={userFormData.name}
                            onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="aminata@domain.com"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="+33 6 00 00 00 00"
                            value={userFormData.phone}
                            onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">City</label>
                          <input
                            type="text"
                            placeholder="Paris"
                            value={userFormData.city}
                            onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase mb-1">User Role</label>
                          <select
                            value={userFormData.role}
                            onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'Admin' | 'Customer' })}
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                          >
                            <option value="Customer">Customer</option>
                            <option value="Admin">Administrator</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingUser(false)}
                          className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs font-bold uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#121212] hover:bg-black text-[#C5A059] px-6 py-2 rounded text-xs font-bold uppercase cursor-pointer"
                        >
                          {editingUser ? 'Save User' : 'Create Account'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Users Table */}
                  <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-100 text-stone-600 text-[11px] font-bold uppercase tracking-wider border-b border-stone-200">
                            <th className="p-3.5">User Details</th>
                            <th className="p-3.5">Contact</th>
                            <th className="p-3.5">Location</th>
                            <th className="p-3.5">Role</th>
                            <th className="p-3.5">Account Status</th>
                            <th className="p-3.5 text-right">Policy & Security Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5 flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-[#121212] text-[#C5A059] flex items-center justify-center font-black text-xs border border-[#C5A059]/30">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.role === 'Admin' && <Shield className="w-3.5 h-3.5 text-[#C5A059]" />}
                                  </div>
                                  <div className="text-[10px] text-stone-400">ID: {u.id}</div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-medium text-stone-800">{u.email}</div>
                                {u.phone && <div className="text-[10px] text-stone-500">{u.phone}</div>}
                              </td>

                              <td className="p-3.5 text-stone-700">
                                {u.city ? `${u.city}, ${u.country || 'France'}` : u.country || 'France'}
                              </td>

                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    u.role === 'Admin' ? 'bg-[#C5A059] text-stone-950 font-extrabold' : 'bg-stone-100 text-stone-800'
                                  }`}
                                >
                                  {u.role || 'Customer'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                {u.status === 'Suspended' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                                    <UserX className="w-3 h-3" /> Suspended
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <UserCheck className="w-3 h-3" /> Active
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Reset Password Action */}
                                  <button
                                    onClick={() => triggerPasswordReset(u)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Reset user password and send recovery link"
                                  >
                                    <Key className="w-3 h-3" />
                                    <span>Reset Password</span>
                                  </button>

                                  {/* Suspend / Reactivate Action */}
                                  {u.status === 'Suspended' ? (
                                    <button
                                      onClick={() => triggerUserSuspension(u)}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Restore account access"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>Restore Account</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => triggerUserSuspension(u)}
                                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Suspend account for policy violation"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>Suspend</span>
                                    </button>
                                  )}

                                  {/* Edit Profile */}
                                  <button
                                    onClick={() => startEditUser(u)}
                                    className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded cursor-pointer"
                                    title="Edit User Profile"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Profile */}
                                  <button
                                    onClick={() => setDeleteConfirmation({ type: 'user', id: u.id, label: `Account for ${u.name}` })}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                    title="Delete Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVITY LOG TAB */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {/* Controls Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Search action, details, user name or email..."
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <select
                        value={activityCategoryFilter}
                        onChange={(e) => setActivityCategoryFilter(e.target.value as any)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="All">All Categories</option>
                        <option value="registration">Registrations</option>
                        <option value="order">Order Updates</option>
                        <option value="policy">Policy & Enforcement</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                      <History className="w-4 h-4 text-[#C5A059]" />
                      <span>{filteredActivityLogs.length} Events Recorded</span>
                    </div>
                  </div>

                  {/* Activity Log List */}
                  <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
                    {filteredActivityLogs.length === 0 ? (
                      <div className="p-12 text-center text-stone-500 space-y-2">
                        <Activity className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="font-bold text-stone-700">No activity events found matching your filter.</p>
                        <p className="text-xs text-stone-400">Try clearing your search query or changing category filter.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100">
                        {filteredActivityLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="mt-0.5 shrink-0">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${log.badgeStyle}`}>
                                  {log.badgeText}
                                </span>
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-stone-900 text-sm">{log.action}</span>
                                  <span className="text-[#C5A059] font-medium text-[11px]">• By {log.actorName}</span>
                                  {log.actorEmail && (
                                    <span className="text-stone-400 font-mono text-[10px]">({log.actorEmail})</span>
                                  )}
                                </div>
                                <p className="text-stone-600 leading-relaxed text-xs">{log.details}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center text-stone-400 font-mono text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              <span>{log.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* PASSWORD RESET MODAL */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm uppercase">
                <Key className="w-5 h-5" />
                <span>Reset Customer Password</span>
              </div>
              <button onClick={() => setPasswordResetUser(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="font-bold text-stone-900">{passwordResetUser.name}</div>
                <div className="text-stone-500">{passwordResetUser.email}</div>
                <div className="text-[10px] text-stone-400 mt-1">ID: {passwordResetUser.id}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">Generated Temporary Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={tempGeneratedPassword}
                    className="w-full px-3 py-2 font-mono text-sm border border-stone-300 rounded bg-stone-100 text-stone-900 font-bold"
                  />
                  <button
                    onClick={() => {
                      const rand = 'Komse#' + Math.floor(1000 + Math.random() * 9000);
                      setTempGeneratedPassword(rand);
                    }}
                    className="p-2 bg-stone-200 hover:bg-stone-300 rounded cursor-pointer"
                    title="Regenerate Password"
                  >
                    <RefreshCcw className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">Optional Admin Note to Customer</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Your temporary password has been set. Please update upon your next login."
                  value={customResetNote}
                  onChange={(e) => setCustomResetNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Confirming will overwrite the current user password, send a recovery dispatch email to <strong>{passwordResetUser.email}</strong>, and unblock login attempts.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPasswordResetUser(null)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPasswordReset}
                className="bg-[#121212] hover:bg-black text-[#C5A059] px-5 py-2 rounded text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" /> Issue Password Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND USER POLICY MODAL */}
      {suspensionTargetUser && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase">
                <UserX className="w-5 h-5" />
                <span>Suspend User Account</span>
              </div>
              <button onClick={() => setSuspensionTargetUser(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspension} className="space-y-4 text-xs">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="font-bold text-stone-900">{suspensionTargetUser.name}</div>
                <div className="text-stone-600">{suspensionTargetUser.email}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Policy Violation Reason</label>
                <select
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50 font-medium"
                >
                  <option value="Website Policy Violation">Website Policy & Terms Violation</option>
                  <option value="Fraudulent Purchase Risk">Fraudulent Purchase or Chargeback Attempt</option>
                  <option value="Spamming or Abusive Conduct">Spamming or Abusive Customer Conduct</option>
                  <option value="Unverified Identity">Unverified Fake Account</option>
                  <option value="User Self-Request">User Self-Requested Account Pause</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Additional Policy Notes</label>
                <textarea
                  rows={2}
                  placeholder="Internal notes regarding account policy enforcement..."
                  value={suspensionDetails}
                  onChange={(e) => setSuspensionDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded bg-stone-50"
                />
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded text-[11px] text-red-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>
                  When suspended, <strong>{suspensionTargetUser.name}</strong> will be blocked from logging into their account, placing orders, or accessing bespoke customization services until restored.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSuspensionTargetUser(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <UserX className="w-3.5 h-3.5" /> Confirm Account Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
            className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 id="delete-confirmation-title" className="text-lg font-black uppercase text-stone-900">
              Confirm Deletion
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Are you sure you want to delete <strong className="text-stone-900">{deleteConfirmation.label}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="rounded border border-stone-300 px-5 py-2.5 text-xs font-bold uppercase text-stone-700 transition-colors hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 rounded bg-red-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-md transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
