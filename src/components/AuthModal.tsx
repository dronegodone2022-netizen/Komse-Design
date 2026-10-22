import React, { useEffect, useState } from 'react';
import { UserProfile, UserOrder } from '../types';
import { supabase } from '../lib/supabase';
import { profileFromRow, profileToRow } from '../lib/profile';
import { COUNTRY_OPTIONS, detectDefaultCountry, getDialCode } from '../utils/currencyDetector';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Package,
  LogOut,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Truck,
  Clock,
  ExternalLink,
  ArrowLeft,
  Copy,
  Check,
  Camera,
  Printer,
  HelpCircle,
  Star,
  Trash2,
  Loader2,
} from 'lucide-react';
import { BUSINESS } from '../lib/business';
import { printInvoice } from '../lib/invoice';
import komseLogoImg from '../assets/images/komse_official_logo.png';

const authInputClass =
  'w-full h-11 rounded-lg border border-stone-300 bg-white text-base sm:text-sm text-stone-900 placeholder:text-stone-400 transition-colors hover:border-stone-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/25';
const authLabelClass = 'block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5';
const authIconClass = 'w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none';

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" className="w-[18px] h-[18px]" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const PasswordToggle = ({ shown, onToggle }: { shown: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={shown ? 'Hide password' : 'Show password'}
    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
  >
    {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
);

const SubmitButton = ({ loading, variant, children }: { loading: boolean; variant: 'dark' | 'gold'; children: React.ReactNode }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full h-11 font-bold uppercase rounded-lg shadow-sm cursor-pointer transition-colors text-xs tracking-wider flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-80 ${
      variant === 'gold' ? 'bg-[#C5A059] hover:bg-[#A88238] text-stone-950' : 'bg-stone-900 hover:bg-black text-white'
    }`}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

interface AuthModalProps {
  isOpen: boolean;
  initialAuthMode?: 'login' | 'register';
  initialDashboardTab?: 'orders' | 'address' | 'profile';
  completeProfileForCheckout?: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void | Promise<void>;
  onDeleteOrder?: (orderId: string) => void;
  userOrders: UserOrder[];
  allUsers?: UserProfile[];
  onOpenContact?: () => void;
  onRateOrder?: (orderId: string, rating: number, comment?: string) => void;
}

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"/>
  </svg>
);

const AuthModalContent: React.FC<AuthModalProps> = ({
  isOpen,
  initialAuthMode = 'login',
  initialDashboardTab = 'orders',
  completeProfileForCheckout = false,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateUser,
  onDeleteOrder,
  userOrders,
  allUsers = [],
  onOpenContact,
  onRateOrder,
}) => {
  const isLocalhost = window.location.hostname === 'localhost';

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'address' | 'profile'>('orders');

  // Rating states for delivered orders
  const [ratingState, setRatingState] = useState<{ [orderId: string]: { star: number; comment: string } }>({});
  const [submittedRatingSuccess, setSubmittedRatingSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !currentUser) setAuthMode(initialAuthMode);
    if (isOpen && currentUser) setDashboardTab(initialDashboardTab);
  }, [currentUser, initialAuthMode, initialDashboardTab, isOpen]);

  const handleStarClick = (orderId: string, star: number) => {
    setRatingState((prev) => ({
      ...prev,
      [orderId]: {
        star,
        comment: prev[orderId]?.comment || '',
      },
    }));
  };

  const handleCommentChange = (orderId: string, comment: string) => {
    setRatingState((prev) => ({
      ...prev,
      [orderId]: {
        star: prev[orderId]?.star || 5,
        comment,
      },
    }));
  };

  const handleSubmitRating = (orderId: string) => {
    const currentRating = ratingState[orderId] || { star: 5, comment: '' };

    if (onRateOrder) {
      onRateOrder(orderId, currentRating.star, currentRating.comment);
    }
    setSubmittedRatingSuccess(orderId);
    setTimeout(() => {
      setSubmittedRatingSuccess(null);
    }, 4000);
  };

  const renderRatingPrompt = (ord: UserOrder) => {
    if (ord.status !== 'Delivered') return null;

    if (ord.rating) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 space-y-1 mt-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You rated this delivered order {ord.rating}/5 ⭐</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">{ord.ratedAt || 'Verified Review'}</span>
          </div>
          {ord.reviewComment && (
            <p className="text-xs text-emerald-700 italic pl-5">"{ord.reviewComment}"</p>
          )}
        </div>
      );
    }

    const currentStar = ratingState[ord.id]?.star || 5;
    const currentComment = ratingState[ord.id]?.comment || '';

    return (
      <div className="bg-[#FAF9F6] border-2 border-dashed border-[#C5A059]/60 rounded-xl p-4 space-y-3 mt-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-xs block">
                Prompt: Rate Your Delivered Order
              </span>
              <span className="text-[10px] text-stone-500">
                Share your feedback on tailoring, fabric quality & fit
              </span>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-300">
            Delivered Item
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shrink-0 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-700 mr-1">Rating:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStarClick(ord.id, s)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer"
                title={`${s} Stars`}
              >
                <Star
                  className={`w-4 h-4 ${
                    currentStar >= s
                      ? 'text-[#C5A059] fill-[#C5A059]'
                      : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Write a quick review comment (e.g. Exceptional fit and luxury finish!)..."
            value={currentComment}
            onChange={(e) => handleCommentChange(ord.id, e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
          />

          <button
            type="button"
            onClick={() => handleSubmitRating(ord.id)}
            className="bg-[#121212] hover:bg-black text-[#C5A059] font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs whitespace-nowrap flex items-center justify-center gap-1"
          >
            Submit Rating ⭐
          </button>
        </div>

        {submittedRatingSuccess === ord.id && (
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in pt-1">
            <Check className="w-4 h-4" /> Thank you for rating your delivered order! Product rating updated.
          </p>
        )}
      </div>
    );
  };

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationCountry, setRegistrationCountry] = useState(() => detectDefaultCountry());
  const [registrationPhoneCode, setRegistrationPhoneCode] = useState(() => getDialCode(detectDefaultCountry()));
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [resetCooldownSeconds, setResetCooldownSeconds] = useState(0);
  const [resetPasswordMode, setResetPasswordMode] = useState(() => new URLSearchParams(window.location.search).get('reset_password') === '1');
  const [newPassword, setNewPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const withAuthSubmitting = (handler: (e: React.FormEvent) => Promise<void> | void) => async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    setAuthSubmitting(true);
    try {
      await handler(e);
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Edit Address states
  const [editAddress, setEditAddress] = useState(currentUser?.address || 'Sample Street 1');
  const [editPostalCode, setEditPostalCode] = useState(currentUser?.postalCode || '');
  const [editCity, setEditCity] = useState(currentUser?.city || '');
  const [editCountry, setEditCountry] = useState(currentUser?.country || 'France');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '+33 6 12 34 56 78');
  const [editPhoneCode, setEditPhoneCode] = useState(() => getDialCode(currentUser?.country || 'France'));
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState('');

  // Tracking states
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const trackingOrder = userOrders.find((order) => order.id === trackingOrderId) || null;
  const setTrackingOrder = (order: UserOrder | null) => setTrackingOrderId(order?.id ?? null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<UserOrder | null>(null);

  useEffect(() => {
    setEditAddress(currentUser?.address || '');
    setEditPostalCode(currentUser?.postalCode || '');
    setEditCity(currentUser?.city || '');
    setEditCountry(currentUser?.country || 'France');
    setEditPhone(currentUser?.phone || '');
    const country = currentUser?.country || 'France';
    const code = getDialCode(country);
    setEditPhoneCode(code);
    setEditPhoneNumber((currentUser?.phone || '').replace(new RegExp(`^\\${code}\\s*`), ''));
  }, [currentUser]);

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleForgotPassword = async () => {
    if (resetCooldownSeconds > 0) {
      setAuthError(`Please wait ${resetCooldownSeconds} seconds before requesting another reset email.`);
      return;
    }
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAuthError('Enter your email address first so we know where to send the reset link.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setAuthError('Please enter a valid email address before requesting a reset.');
      return;
    }
    if (!supabase) {
      setAuthError('Supabase is not configured.');
      return;
    }
    setAuthError('');
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}?reset_password=1`,
    });
    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        setAuthError('Supabase email limit reached. Please wait a few minutes before trying again, or configure custom SMTP in Supabase.');
      } else {
        setAuthError(`Unable to send the reset email: ${error.message}`);
      }
      return;
    }
    setAuthSuccess('Password reset instructions have been sent to your email.');
    setResetCooldownSeconds(60);
    const cooldownTimer = window.setInterval(() => {
      setResetCooldownSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(cooldownTimer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const handleGoogleAuth = async () => {
    if (!supabase) {
      setAuthError('Supabase is not configured.');
      return;
    }
    setAuthError('');
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}?auth=google` },
    });
    if (error) {
      setGoogleLoading(false);
      setAuthError(`Unable to continue with Google: ${error.message}`);
    }
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setAuthError('Your new password must contain at least 6 characters.');
      return;
    }
    if (!supabase) {
      setAuthError('Supabase is not configured.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthError('');
    setNewPassword('');
    setResetPasswordMode(false);
    setAuthSuccess('Password updated successfully. You can now sign in.');
    window.history.replaceState({}, '', window.location.pathname);
  };

  const hasTracking = (order: UserOrder) => Boolean(order.trackingNumber) && order.trackingNumber !== 'Pending assignment';

  // Carrier is inferred from the tracking number format; live scans are on the carrier's own site.
  const carrierFor = (trackingNumber: string) => {
    const code = encodeURIComponent(trackingNumber);
    if (/^DHL/i.test(trackingNumber) || /^\d{10}$/.test(trackingNumber)) {
      return { name: 'DHL Express', url: `https://www.dhl.com/fr-en/home/tracking.html?tracking-id=${code}` };
    }
    if (/^(LP|6A|8[LV]|[A-Z]{2}\d{9}FR)/i.test(trackingNumber)) {
      return { name: 'La Poste / Colissimo', url: `https://www.laposte.fr/outils/suivre-vos-envois?code=${code}` };
    }
    if (/^FEDEX/i.test(trackingNumber)) return { name: 'FedEx', url: `https://www.fedex.com/fedextrack/?trknbr=${code}` };
    if (/^UPS|^1Z/i.test(trackingNumber)) return { name: 'UPS', url: `https://www.ups.com/track?tracknum=${code}` };
    return { name: 'Courier', url: `https://t.17track.net/en#nums=${code}` };
  };

  // Order milestones from the real order status only (no invented times or locations).
  const getTrackingHistory = (order: UserOrder) => {
    if (order.status === 'Cancelled') {
      return [{ date: order.date, title: 'Order cancelled', desc: 'This order was cancelled. Contact support if you have any questions.', location: '', status: 'cancelled' }];
    }
    const shipped = order.status === 'Shipped' || order.status === 'Delivered';
    const carrier = hasTracking(order) ? carrierFor(order.trackingNumber).name : 'our courier';
    return [
      order.status === 'Delivered'
        ? { date: '', title: 'Delivered', desc: 'Your order has been delivered. Enjoy your KOMSE pieces!', location: '', status: 'completed' }
        : null,
      shipped
        ? {
            date: '',
            title: 'Shipped',
            desc: hasTracking(order)
              ? `Handed to ${carrier} with tracking number ${order.trackingNumber}. Use "Track with carrier" for live delivery updates.`
              : 'Your order is on its way. The tracking number will appear here once assigned.',
            location: '',
            status: order.status === 'Delivered' ? 'completed' : 'active',
          }
        : null,
      {
        date: '',
        title: 'Preparing your order',
        desc: `Your pieces are being prepared and packed at our studio in ${BUSINESS.city}.`,
        location: '',
        status: shipped ? 'completed' : 'active',
      },
      { date: order.date, title: 'Order placed', desc: 'Payment received and order confirmed.', location: '', status: 'completed' },
    ].filter((event): event is NonNullable<typeof event> => event !== null);
  };

  // Quick Demo Login Handler
  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'usr-101',
      name: 'Demo Administrator',
      email: 'demo-admin@example.com',
      phone: '+33 6 12 34 56 78',
      address: 'Sample Street 1',
      city: 'Paris',
      country: 'France',
      joinedDate: 'January 2024',
    };
    onLogin(demoUser);
    setAuthSuccess('Successfully logged in as the demo administrator!');
    setTimeout(() => {
      setAuthSuccess('');
    }, 2000);
  };

  // Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAuthError('Email address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setAuthError('Password is required.');
      return;
    }

    if (!supabase) {
      setAuthError('Supabase is not configured.');
      return;
    }

    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data.user) {
      setAuthError('The email address or password is incorrect. Check both fields and try again.');
      return;
    }
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setAuthError('Please confirm your email address before signing in. Check your inbox or spam folder.');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    const supabaseProfile = profile ? profileFromRow(profile as Record<string, unknown>) : null;

    // Check if account is suspended by policy
    const localUser = allUsers.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    const loggedProfile = supabaseProfile || localUser;
    if (loggedProfile && loggedProfile.status === 'Suspended') {
      setAuthError('ACCOUNT SUSPENDED: Your account has been suspended by an administrator due to website policy violation. Please contact support@komse.design to appeal.');
      return;
    }

    const loggedUser: UserProfile = loggedProfile || {
      id: data.user.id,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: data.user.email || email.trim(),
      phone: '+33 6 00 11 22 33',
      address: 'Paris Atelier, 75001',
      city: 'Paris',
      country: 'France',
      joinedDate: 'August 2026',
      role: 'Customer',
      status: 'Active',
    };
    if (!loggedProfile) await supabase.from('profiles').upsert(profileToRow(loggedUser));
    onLogin(loggedUser);
    setAuthSuccess('Welcome back! Login successful.');
    setTimeout(() => {
      setAuthSuccess('');
    }, 2000);
  };

  // Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (!supabase) {
      setAuthError('Supabase is not configured.');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim().replace(/\s+/g, ' ');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (normalizedName.length < 2) {
      setAuthError('Please enter your full name.');
      return;
    }
    setAuthError('');
    const { data: availability, error: availabilityError } = await supabase.rpc('check_registration_availability', {
      requested_email: normalizedEmail,
      requested_name: normalizedName,
    });
    if (availabilityError) {
      setAuthError('Unable to verify account availability. Please try again.');
      return;
    }
    if (availability?.email_taken) {
      setAuthError('An account with this email already exists. Please sign in instead.');
      return;
    }
    if (availability?.name_taken) {
      setAuthError('This name is already in use. Please choose a different name.');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: normalizedName },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    });
    if (error || !data.user) {
      setAuthError(error?.message || 'Unable to create account.');
      return;
    }
    const newUser: UserProfile = {
      id: data.user.id,
      name: normalizedName,
      email: normalizedEmail,
      phone: phone ? `${registrationPhoneCode} ${phone}`.trim() : '',
      address: 'Sample Street 1',
      city: 'Paris',
      country: registrationCountry,
      joinedDate: 'Today',
    };
    if (!data.user.email_confirmed_at || !data.session) {
      if (data.session) await supabase.auth.signOut();
      setAuthMode('login');
      setPassword('');
      setAuthSuccess('Account created. Check your email to confirm your account.');
      return;
    }
    const { error: profileError } = await supabase.from('profiles').upsert(profileToRow(newUser));
    if (profileError) {
      setAuthError(profileError.message);
      return;
    }
    await supabase.auth.signOut();
    setAuthMode('login');
    setPassword('');
    setAuthSuccess('Account created successfully. Please sign in to continue.');
  };

  // Save updated address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      try {
        await onUpdateUser({
          ...currentUser,
          address: editAddress,
          postalCode: editPostalCode,
          city: editCity,
          country: editCountry,
          phone: `${editPhoneCode} ${editPhoneNumber}`.trim(),
        });
        setAddressSaved(true);
        setTimeout(() => setAddressSaved(false), 2500);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Unable to save your shipping address.');
      }
    }
  };

  const accountTabs: { id: 'orders' | 'address' | 'profile'; label: string; shortLabel: string; icon: typeof Package; count?: number }[] = [
    { id: 'orders', label: 'My orders', shortLabel: 'Orders', icon: Package, count: userOrders.length },
    { id: 'address', label: 'Delivery address', shortLabel: 'Address', icon: MapPin },
    { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: User },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in ${currentUser ? 'sm:p-4' : 'p-4'}`}>
      <div
        className={`bg-[#FCFBF9] w-full shadow-2xl relative overflow-hidden flex flex-col ${
          currentUser
            ? 'h-dvh sm:h-[min(780px,92vh)] sm:max-w-4xl sm:rounded-2xl sm:border sm:border-stone-300'
            : 'max-w-md rounded-2xl border border-stone-300 max-h-[90vh]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className={`bg-[#121212] text-white relative flex-shrink-0 ${currentUser ? 'px-4 py-3.5 sm:px-6 sm:py-4' : 'p-6'}`}>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`absolute right-3 sm:right-5 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer ${currentUser ? 'top-1/2 -translate-y-1/2' : 'top-5'}`}
          >
            <X className="w-5 h-5" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3 pr-10 min-w-0">
              {currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={`${currentUser.name} profile`}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover shadow-md ring-2 ring-[#C5A059]/60 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#C5A059] text-stone-950 flex items-center justify-center text-lg font-black shadow-md ring-2 ring-white/10 shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-white truncate">{currentUser.name}</h2>
                  <span className="hidden sm:inline-flex shrink-0 bg-[#C5A059]/15 text-[#E2C68C] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#C5A059]/30">
                    Member
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400 truncate">
                  {currentUser.email}
                  <span className="hidden sm:inline"> · Member since {currentUser.joinedDate || '2024'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pr-10">
              <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-[0.2em] block">
                KOMSE Design
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {resetPasswordMode ? 'Reset your password' : authMode === 'login' ? 'Welcome back' : 'Join the cultural club'}
              </h2>
              <p className="text-sm text-stone-400">
                {authMode === 'login'
                  ? 'Sign in to track orders, revisit your custom designs and check out faster.'
                  : 'Create an account to save designs, track orders and check out faster.'}
              </p>
            </div>
          )}
        </div>

        {/* LOGGED IN USER DASHBOARD */}
        {currentUser ? (
          <div className="flex flex-1 min-h-0">
            {/* Sidebar Navigation (desktop) */}
            <aside className="hidden md:flex w-56 shrink-0 flex-col bg-[#F4F3EF] border-r border-stone-200">
              <nav className="flex-1 p-3 space-y-1" aria-label="Account sections">
                <p className="px-3 pt-2 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">My Account</p>
                {accountTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = dashboardTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      data-account-tab={tab.id}
                      onClick={() => {
                        setDashboardTab(tab.id);
                        setTrackingOrder(null);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                        isActive ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C5A059]' : ''}`} />
                      <span className="flex-1 text-left truncate">{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/15' : 'bg-stone-200 text-stone-600'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-stone-200 space-y-1">
                {currentUser.role === 'Admin' && (
                  <a
                    href={`${import.meta.env.BASE_URL}?path=/admin`} target="_blank" rel="noopener"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-stone-900 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#A88238]" /> Admin dashboard
                  </a>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col min-h-0">
              {/* Segmented Tabs (phones) */}
              <div className="md:hidden px-4 pt-4 shrink-0">
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-200/70" role="tablist" aria-label="Account sections">
                  {accountTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = dashboardTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        data-account-tab={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setDashboardTab(tab.id);
                          setTrackingOrder(null);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A88238]' : ''}`} />
                        {tab.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

            {/* Dashboard Content Panel */}
            <div className="px-4 py-5 sm:p-6 overflow-y-auto flex-1 text-xs">
              {dashboardTab === 'orders' && (
                <div>
                  {trackingOrder ? (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {/* Back Navigation Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                        <button
                          onClick={() => setTrackingOrder(null)}
                          className="flex items-center gap-1.5 text-stone-900 font-bold hover:text-[#C5A059] transition-colors cursor-pointer text-xs"
                        >
                          <ArrowLeft className="w-4 h-4 text-[#C5A059]" /> Back to orders
                        </button>

                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          ORDER TRACKER
                        </span>
                      </div>

                      {/* Order & Carrier Card Header */}
                      <div className="bg-[#121212] text-white p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4 shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">
                              OFFICIAL SHIPMENT
                            </span>
                            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                              {trackingOrder.id}
                            </h3>
                            <p className="text-[11px] text-stone-400">Placed on {trackingOrder.date}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                trackingOrder.status === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : trackingOrder.status === 'Shipped'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                  : trackingOrder.status === 'Processing'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                              }`}
                            >
                              {trackingOrder.status === 'Delivered'
                                ? '✓ DELIVERED'
                                : trackingOrder.status === 'Shipped'
                                ? '✈ IN TRANSIT'
                                : trackingOrder.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-800 text-xs">
                          <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-400 font-bold uppercase block">Tracking Number</span>
                              <span className="font-mono font-bold text-stone-100 text-sm">{trackingOrder.trackingNumber}</span>
                            </div>
                            <button
                              onClick={() => handleCopyTracking(trackingOrder.trackingNumber)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-[#C5A059] rounded border border-stone-700 cursor-pointer flex items-center gap-1 text-[11px] transition-colors"
                              title="Copy Tracking Number"
                            >
                              {copiedTracking ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />{' '}
                                  <span className="text-emerald-400 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 space-y-0.5">
                            <span className="text-[10px] text-stone-400 font-bold uppercase block">Carrier</span>
                            <span className="font-bold text-stone-100 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#C5A059]" />
                              {hasTracking(trackingOrder) ? carrierFor(trackingOrder.trackingNumber).name : 'Assigned when shipped'}
                            </span>
                            {hasTracking(trackingOrder) && (
                              <a
                                href={carrierFor(trackingOrder.trackingNumber).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C5A059] hover:underline pt-1"
                              >
                                Track with carrier <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipment Progress Stepper */}
                      <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-4 shadow-2xs">
                        <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#C5A059]" /> Delivery Status Stepper
                        </h4>

                        <div className="grid grid-cols-4 gap-1 text-center relative py-2">
                          <div className="flex flex-col items-center space-y-1 z-10">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                              ✓
                            </div>
                            <span className="text-[10px] font-bold text-stone-900">Confirmed</span>
                            <span className="text-[9px] text-stone-500">Paid</span>
                          </div>

                          <div className="flex flex-col items-center space-y-1 z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                                trackingOrder.status !== 'Cancelled'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              ✓
                            </div>
                            <span className="text-[10px] font-bold text-stone-900">Preparing</span>
                            <span className="text-[9px] text-stone-500">In our studio</span>
                          </div>

                          <div className="flex flex-col items-center space-y-1 z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                                trackingOrder.status === 'Shipped' || trackingOrder.status === 'Delivered'
                                  ? 'bg-emerald-600 text-white'
                                  : trackingOrder.status === 'Processing'
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {trackingOrder.status === 'Shipped' || trackingOrder.status === 'Delivered' ? '✓' : '3'}
                            </div>
                            <span className="text-[10px] font-bold text-stone-900">Dispatched</span>
                            <span className="text-[9px] text-stone-500">In Transit</span>
                          </div>

                          <div className="flex flex-col items-center space-y-1 z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                                trackingOrder.status === 'Delivered'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {trackingOrder.status === 'Delivered' ? '✓' : '4'}
                            </div>
                            <span className="text-[10px] font-bold text-stone-900">Delivered</span>
                            <span className="text-[9px] text-stone-500">Final Arrival</span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Logistics History */}
                      <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3 shadow-2xs">
                        <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#C5A059]" /> Order progress
                        </h4>

                        <div className="space-y-4 pl-2 border-l-2 border-stone-200 ml-1">
                          {getTrackingHistory(trackingOrder).map((event, idx) => (
                            <div key={idx} className="relative pl-5 space-y-0.5">
                              <div
                                className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                  event.status === 'completed'
                                    ? 'bg-emerald-600'
                                    : event.status === 'active'
                                    ? 'bg-amber-500 ring-2 ring-amber-200'
                                    : 'bg-stone-300'
                                }`}
                              />
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-900 text-xs">{event.title}</span>
                                <span className="text-[10px] text-stone-500 font-medium">{event.date}</span>
                              </div>
                              <p className="text-[11px] text-stone-600">{event.desc}</p>
                              {event.location && (
                                <span className="text-[10px] text-[#C5A059] font-semibold block pt-0.5">
                                  📍 {event.location}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Package Contents & Actions */}
                      <div className="bg-[#FAF9F6] p-4 rounded-xl border border-stone-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <span className="font-bold text-stone-800 text-xs uppercase">Package Contents</span>
                          <span className="font-black text-stone-900 text-xs">Total: €{trackingOrder.totalAmountEur.toFixed(2)}</span>
                        </div>
                        <p className="text-stone-700 text-xs font-semibold">{trackingOrder.itemsSummary}</p>

                        {renderRatingPrompt(trackingOrder)}

                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-200/80">
                          <button
                            onClick={() => printInvoice(trackingOrder, currentUser, komseLogoImg)}
                            className="bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 font-bold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 text-xs transition-colors shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#C5A059]" /> Print invoice
                          </button>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/33767543093?text=Hello%20KOMSE%20Design%20Support,%20I%20need%20help%20with%20delivery%20for%20Order%20${trackingOrder.id}%20(Tracking:%20${trackingOrder.trackingNumber})`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 text-xs transition-colors shadow-2xs"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                              <span>WhatsApp Delivery Support</span>
                            </a>

                            <button
                              onClick={() => {
                                if (onOpenContact) {
                                  onOpenContact();
                                }
                              }}
                              className="bg-stone-900 hover:bg-black text-white font-bold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 text-xs transition-colors shadow-2xs"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-[#C5A059]" /> Email
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Orders List */
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { label: 'Orders', value: String(userOrders.length) },
                          { label: 'In progress', value: String(userOrders.filter((o) => o.status === 'Processing' || o.status === 'Shipped').length) },
                          { label: 'Total spent', value: `€${userOrders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.totalAmountEur, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">{stat.label}</p>
                            <p className="text-base sm:text-xl font-black text-stone-900 mt-1 truncate">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-end justify-between pt-1">
                        <h3 className="font-black text-stone-900 text-base">Order history</h3>
                        <span className="hidden sm:inline text-stone-500 text-[11px]">Track a shipment to see its live progress</span>
                      </div>

                      {userOrders.length === 0 ? (
                        <div className="text-center py-10 space-y-3 bg-white border border-dashed border-stone-300 rounded-2xl p-6">
                          <Package className="w-10 h-10 text-stone-400 mx-auto" />
                          <p className="font-bold text-stone-800 text-sm">No orders placed yet</p>
                          <p className="text-stone-500">
                            Explore our cultural collections or create a custom order design.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userOrders.map((ord) => (
                            <div
                              key={ord.id}
                              className="border border-stone-200 rounded-2xl p-4 bg-white space-y-3 shadow-xs hover:border-stone-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                                <div>
                                  <span className="font-extrabold text-stone-900 text-sm block">
                                    {ord.id}
                                  </span>
                                  <span className="text-[11px] text-stone-500">Placed on {ord.date}</span>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                      ord.status === 'Delivered'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : ord.status === 'Shipped'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : ord.status === 'Cancelled'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                  >
                                    {ord.status}
                                  </span>
                                  <span className="font-black text-stone-900 text-sm">
                                    €{ord.totalAmountEur.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="text-stone-700 space-y-1">
                                <p className="font-semibold text-stone-900">{ord.itemsSummary}</p>
                                <p className="text-[11px] text-stone-500">
                                  {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'} • Ships from {BUSINESS.city}, France
                                </p>
                              </div>

                              {renderRatingPrompt(ord)}

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-100 bg-[#FAF9F6] -mx-4 -mb-4 p-3 rounded-b-2xl text-[11px]">
                                <span className="text-stone-600 font-medium flex items-center gap-1 min-w-0 break-all">
                                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" /> Tracking ID: {ord.trackingNumber}
                                </span>

                                <div className="flex items-center justify-end gap-2 shrink-0">
                                  <button
                                    onClick={() => printInvoice(ord, currentUser, komseLogoImg)}
                                    title="Print invoice"
                                    aria-label={`Print invoice for ${ord.id}`}
                                    className="text-stone-700 hover:text-stone-950 hover:bg-stone-100 px-2 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#C5A059]" /> Invoice
                                  </button>
                                  <button
                                    onClick={() => setOrderToDelete(ord)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                  <button
                                    onClick={() => setTrackingOrder(ord)}
                                    className="bg-stone-900 hover:bg-black text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                                  >
                                    Track shipment <ChevronRight className="w-3 h-3 text-[#C5A059]" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {dashboardTab === 'address' && (
                <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
                  {completeProfileForCheckout && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
                      Complete your shipping details below to continue to secure checkout.
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-black text-stone-900 text-base">Shipping address</h3>
                    <p className="text-stone-500 text-[11px]">Used for automatic express checkout.</p>
                  </div>

                  {addressSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Address updated successfully!
                    </div>
                  )}

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={editPostalCode}
                        onChange={(e) => setEditPostalCode(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-stone-700 font-bold mb-1">Country</label>
                        <select
                          value={editCountry}
                          onChange={(e) => {
                            setEditCountry(e.target.value);
                            setEditPhoneCode(getDialCode(e.target.value));
                          }}
                          className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition"
                        >
                          {COUNTRY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.name}>{option.name}</option>
                          ))}
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Phone Number</label>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <select
                        value={editPhoneCode}
                        onChange={(e) => setEditPhoneCode(e.target.value)}
                        className="px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition"
                        aria-label="Country dialing code"
                      >
                        {COUNTRY_OPTIONS.map((option) => (
                          <option key={option.code} value={option.dialCode}>{option.dialCode}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-stone-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl shadow-sm cursor-pointer transition-colors text-sm"
                  >
                    Save address
                  </button>
                </form>
              )}

              {dashboardTab === 'profile' && (
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-1">
                    <h3 className="font-black text-stone-900 text-base">Profile</h3>
                    <p className="text-stone-500 text-[11px]">Manage your membership preferences.</p>
                  </div>

                  <div className="space-y-3 bg-white p-4 sm:p-6 border border-stone-200 rounded-2xl">
                    <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
                      {currentUser.profilePicture ? (
                        <img
                          src={currentUser.profilePicture}
                          alt={`${currentUser.name} profile`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#C5A059]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#C5A059] text-stone-950 flex items-center justify-center text-xl font-black">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <label className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white font-bold px-3.5 py-2 rounded-lg text-xs cursor-pointer transition-colors">
                          <Camera className="w-4 h-4" />
                          Upload Profile Picture
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                setProfilePictureError('Please choose an image smaller than 5 MB.');
                                event.target.value = '';
                                return;
                              }
                              const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                              if (supabase) {
                                void (async () => {
                                  const path = `${currentUser.id}/profile.${extension}`;
                                  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
                                    upsert: true,
                                    contentType: file.type,
                                  });
                                  if (uploadError) {
                                    setProfilePictureError(uploadError.message);
                                    return;
                                  }
                                  const { data: signedUrl, error: urlError } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60 * 24 * 365);
                                  if (urlError || !signedUrl?.signedUrl) {
                                    setProfilePictureError(urlError?.message || 'Unable to create avatar URL.');
                                    return;
                                  }
                                  onUpdateUser({ ...currentUser, profilePicture: signedUrl.signedUrl });
                                  setProfilePictureError('');
                                })();
                              } else {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    onUpdateUser({ ...currentUser, profilePicture: reader.result });
                                    setProfilePictureError('');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                              event.target.value = '';
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-stone-500 mt-1">PNG, JPG, or WEBP up to 5 MB</p>
                        {profilePictureError && <p className="text-[10px] text-red-600 font-semibold mt-1">{profilePictureError}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-semibold shrink-0">Full Name</span>
                      <span className="font-bold text-stone-900">{currentUser.name}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-semibold shrink-0">Email Address</span>
                      <span className="font-bold text-stone-900 min-w-0 break-all text-right">{currentUser.email}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-semibold shrink-0">Phone</span>
                      <span className="font-bold text-stone-900">{currentUser.phone || editPhone}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-stone-500 font-semibold">Security Status</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Verified User
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {orderToDelete && (
              <div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm"
                onClick={() => setOrderToDelete(null)}
              >
                <div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="profile-delete-order-title"
                  className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 text-center shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <h3 id="profile-delete-order-title" className="text-lg font-black uppercase text-stone-900">
                    Delete Order?
                  </h3>
                  <p className="mt-2 text-sm text-stone-600">
                    Are you sure you want to delete order <strong className="text-stone-900">{orderToDelete.id}</strong>? This action cannot be undone.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderToDelete(null)}
                      className="rounded border border-stone-300 px-5 py-2.5 text-xs font-bold uppercase text-stone-700 transition-colors hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteOrder) onDeleteOrder(orderToDelete.id);
                        if (trackingOrder?.id === orderToDelete.id) setTrackingOrder(null);
                        setOrderToDelete(null);
                      }}
                      className="flex items-center gap-1.5 rounded bg-red-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-md transition-colors hover:bg-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sign-out Footer (phones) */}
            <div className="md:hidden px-4 py-3 bg-[#F4F3EF] border-t border-stone-200 flex items-center justify-between gap-3 text-xs flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {currentUser.role === 'Admin' ? (
                <a href={`${import.meta.env.BASE_URL}?path=/admin`} target="_blank" rel="noopener" className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#A88238]" /> Admin dashboard
                </a>
              ) : (
                <span className="text-stone-500 text-[11px] truncate">Signed in as {currentUser.email}</span>
              )}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="shrink-0 text-red-600 hover:text-red-800 font-bold flex items-center gap-1.5 cursor-pointer bg-white hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
            </div>
          </div>
        ) : (
          /* UNAUTHENTICATED LOGIN / SIGN UP PANEL */
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 text-sm">
            {/* Mode Switch */}
            {!resetPasswordMode && (
              <div role="tablist" aria-label="Account access" className="grid grid-cols-2 gap-1 p-1 bg-stone-100 border border-stone-200 rounded-xl">
                {(['login', 'register'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={authMode === mode}
                    onClick={() => {
                      setAuthMode(mode);
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      authMode === mode
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            )}

            {/* Success Feedback */}
            {authSuccess && (
              <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-px" />
                {authSuccess}
              </div>
            )}

            {/* Error Feedback */}
            {authError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold text-xs">
                {authError}
              </div>
            )}

            {!resetPasswordMode && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full h-11 border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 text-stone-800 font-semibold rounded-lg shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-3 disabled:cursor-wait disabled:opacity-70"
                >
                  {googleLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin text-stone-500" /> : <GoogleLogo />}
                  {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  <span className="h-px flex-1 bg-stone-200" />
                  or use your email
                  <span className="h-px flex-1 bg-stone-200" />
                </div>
              </>
            )}

            {resetPasswordMode ? (
              <form onSubmit={withAuthSubmitting(handleUpdatePassword)} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Set a new password</h3>
                  <p className="mt-1 text-stone-500">Choose a new password for your KOMSE account.</p>
                </div>
                <div>
                  <label htmlFor="auth-new-password" className={authLabelClass}>New Password</label>
                  <div className="relative">
                    <Lock className={authIconClass} />
                    <input
                      id="auth-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${authInputClass} pl-10 pr-11`}
                    />
                    <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  </div>
                </div>
                <SubmitButton loading={authSubmitting} variant="dark">Update Password</SubmitButton>
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordMode(false);
                    setAuthError('');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-stone-500 hover:text-stone-900 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            ) : authMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={withAuthSubmitting(handleLoginSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="auth-login-email" className={authLabelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className={authIconClass} />
                    <input
                      id="auth-login-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${authInputClass} pl-10 pr-3`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-login-password" className={`${authLabelClass} mb-0`}>Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetCooldownSeconds > 0}
                      className="text-xs text-[#9A7A38] font-semibold hover:text-[#7C6026] hover:underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
                    >
                      {resetCooldownSeconds > 0 ? `Resend in ${resetCooldownSeconds}s` : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className={authIconClass} />
                    <input
                      id="auth-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${authInputClass} pl-10 pr-11`}
                    />
                    <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  </div>
                </div>

                <SubmitButton loading={authSubmitting} variant="dark">Sign In</SubmitButton>

                <p className="text-center text-xs text-stone-500">
                  New to KOMSE?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="font-bold text-stone-900 hover:text-[#9A7A38] cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={withAuthSubmitting(handleRegisterSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="auth-register-name" className={authLabelClass}>Full Name</label>
                  <div className="relative">
                    <User className={authIconClass} />
                    <input
                      id="auth-register-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`${authInputClass} pl-10 pr-3`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-register-email" className={authLabelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className={authIconClass} />
                    <input
                      id="auth-register-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${authInputClass} pl-10 pr-3`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-register-country" className={authLabelClass}>Country / Region</label>
                  <select
                    id="auth-register-country"
                    value={registrationCountry}
                    onChange={(event) => {
                      setRegistrationCountry(event.target.value);
                      setRegistrationPhoneCode(getDialCode(event.target.value));
                    }}
                    className={`${authInputClass} px-3`}
                  >
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option.code} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="auth-register-phone" className={authLabelClass}>
                    Phone Number <span className="normal-case tracking-normal font-medium text-stone-400">(optional)</span>
                  </label>
                  <div className="grid grid-cols-[auto_1fr] gap-2">
                    <select
                      value={registrationPhoneCode}
                      onChange={(event) => setRegistrationPhoneCode(event.target.value)}
                      className={`${authInputClass} w-auto px-2.5`}
                      aria-label="Country dialing code"
                    >
                      {COUNTRY_OPTIONS.map((option) => (
                        <option key={option.code} value={option.dialCode}>{option.dialCode}</option>
                      ))}
                    </select>
                    <input
                      id="auth-register-phone"
                      type="tel"
                      autoComplete="tel-national"
                      placeholder="6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${authInputClass} px-3`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-register-password" className={authLabelClass}>Password</label>
                  <div className="relative">
                    <Lock className={authIconClass} />
                    <input
                      id="auth-register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${authInputClass} pl-10 pr-11`}
                    />
                    <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  </div>
                </div>

                <SubmitButton loading={authSubmitting} variant="gold">Create Account</SubmitButton>

                <p className="text-center text-[11px] leading-relaxed text-stone-500">
                  By creating an account, you agree to the KOMSE DESIGN Terms of Service and Privacy Policy.
                </p>
              </form>
            )}

            {isLocalhost && !resetPasswordMode && (
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full border border-dashed border-[#C5A059]/50 bg-[#C5A059]/5 hover:bg-[#C5A059]/15 text-[#9A7A38] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px] uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Quick Demo Login (localhost only)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Hooks live in AuthModalContent so they always run in the same order.
export const AuthModal: React.FC<AuthModalProps> = (props) => (props.isOpen ? <AuthModalContent {...props} /> : null);
