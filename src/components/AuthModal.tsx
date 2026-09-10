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
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialAuthMode?: 'login' | 'register';
  initialDashboardTab?: 'orders' | 'address' | 'profile';
  completeProfileForCheckout?: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({
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
  if (!isOpen) return null;

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

  // Edit Address states
  const [editAddress, setEditAddress] = useState(currentUser?.address || 'Sample Street 1');
  const [editPostalCode, setEditPostalCode] = useState(currentUser?.postalCode || '');
  const [editCity, setEditCity] = useState(currentUser?.city || 'Paris');
  const [editCountry, setEditCountry] = useState(currentUser?.country || 'France');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '+33 6 12 34 56 78');
  const [editPhoneCode, setEditPhoneCode] = useState(() => getDialCode(currentUser?.country || 'France'));
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState('');

  // Tracking states
  const [trackingOrder, setTrackingOrder] = useState<UserOrder | null>(null);
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
      redirectTo: `${window.location.origin}/?reset_password=1`,
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/?auth=google` },
    });
    if (error) setAuthError(`Unable to continue with Google: ${error.message}`);
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

  const getTrackingHistory = (order: UserOrder) => {
    const carrier = order.trackingNumber.startsWith('LP-')
      ? 'La Poste Colissimo Paris'
      : order.trackingNumber.startsWith('FEDEX-')
      ? 'FedEx Express International'
      : 'DHL Express Paris Atelier';

    if (order.status === 'Delivered') {
      return [
        { date: `${order.date} • 14:32`, title: 'Package Delivered', desc: 'Handed directly to recipient at registered address. Signed for by customer.', location: `${order.customerName ? order.customerName : 'Recipient Address'}`, status: 'completed' },
        { date: `${order.date} • 08:15`, title: 'Out for Delivery', desc: `Package loaded onto ${carrier} express courier van.`, location: 'Local Express Delivery Hub', status: 'completed' },
        { date: `${order.date} • 03:40`, title: 'Arrived at Local Destination Hub', desc: 'Import customs cleared. Package sorted for final route delivery.', location: 'Regional Destination Gateway', status: 'completed' },
        { date: '1 Day Prior • 19:10', title: 'In Flight Transit', desc: 'Departed Paris Charles de Gaulle Airport (CDG) via Express Air Cargo.', location: 'Paris CDG Airport, France', status: 'completed' },
        { date: '2 Days Prior • 16:00', title: 'Package Dispatched', desc: `Handed over to ${carrier} at KOMSE Paris Atelier. Registered tracking ID.`, location: 'Paris Atelier, France', status: 'completed' },
        { date: '2 Days Prior • 10:00', title: 'Quality Checked & Packed', desc: 'Garment tailored, quality inspected, and packaged in premium heritage box.', location: 'KOMSE Design Studio', status: 'completed' },
      ];
    } else if (order.status === 'Shipped') {
      return [
        { date: 'Today • 08:30', title: 'Out for Delivery / Express Transit', desc: `Package is currently en route via ${carrier}. Estimated arrival today.`, location: 'En Route to Destination Address', status: 'active' },
        { date: 'Yesterday • 18:20', title: 'Arrived at Transit Hub', desc: 'Customs clearance documents verified and approved for final route.', location: 'International Gateway Facility', status: 'completed' },
        { date: `${order.date} • 16:00`, title: 'Dispatched from Paris Atelier', desc: `Package picked up by ${carrier} courier service.`, location: 'Paris Atelier, France', status: 'completed' },
        { date: `${order.date} • 09:15`, title: 'Order Prepared & Tailored', desc: 'Garment tailored and packed with custom heritage seal.', location: 'KOMSE Design Studio', status: 'completed' },
      ];
    } else if (order.status === 'Processing') {
      return [
        { date: 'Active Now', title: 'Crafting & Embroidery In Progress', desc: 'Your order is currently being tailored & embroidered by master artisans at our Paris Atelier.', location: 'KOMSE Paris Studio', status: 'active' },
        { date: `${order.date} • 10:00`, title: 'Order Confirmed & Approved', desc: 'Payment received. Tailoring ticket issued to Paris atelier line.', location: 'KOMSE Paris Studio', status: 'completed' },
      ];
    } else {
      return [
        { date: `${order.date}`, title: 'Order Cancelled', desc: 'This order was cancelled and refunded per customer or administrative request.', location: 'KOMSE System', status: 'cancelled' },
      ];
    }
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
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      onUpdateUser({
        ...currentUser,
        address: editAddress,
        postalCode: editPostalCode,
        city: editCity,
        country: editCountry,
        phone: `${editPhoneCode} ${editPhoneNumber}`.trim(),
      });
      setAddressSaved(true);
      setTimeout(() => setAddressSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FCFBF9] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-300 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#121212] text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-4 pr-8">
              {currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={`${currentUser.name} profile`}
                  className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white/20"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#C5A059] text-stone-950 flex items-center justify-center text-xl font-black shadow-md border-2 border-white/20">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                  <span className="bg-[#C5A059]/20 text-[#C5A059] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#C5A059]/30">
                    VIP Member
                  </span>
                </div>
                <p className="text-xs text-stone-400">{currentUser.email}</p>
                <p className="text-[11px] text-stone-500">Member since {currentUser.joinedDate || '2024'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">
                Welcome to KOMSE
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {authMode === 'login' ? 'SIGN IN TO YOUR ACCOUNT' : 'JOIN THE CULTURAL CLUB'}
              </h2>
              <p className="text-xs text-stone-400">
                Access your orders, custom design history, and express checkout.
              </p>
            </div>
          )}
        </div>

        {/* LOGGED IN USER DASHBOARD */}
        {currentUser ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Dashboard Tabs Bar */}
            <div className="flex border-b border-stone-200 bg-[#F4F3EF] px-6 text-xs font-bold text-stone-700 flex-shrink-0">
              <button
                onClick={() => setDashboardTab('orders')}
                className={`py-3 px-4 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors ${
                  dashboardTab === 'orders'
                    ? 'border-[#C5A059] text-stone-950 font-extrabold bg-white'
                    : 'border-transparent hover:text-stone-900'
                }`}
              >
                <Package className="w-4 h-4 text-[#C5A059]" /> My Orders ({userOrders.length})
              </button>
              <button
                onClick={() => setDashboardTab('address')}
                className={`py-3 px-4 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors ${
                  dashboardTab === 'address'
                    ? 'border-[#C5A059] text-stone-950 font-extrabold bg-white'
                    : 'border-transparent hover:text-stone-900'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#C5A059]" /> Delivery Address
              </button>
              <button
                onClick={() => setDashboardTab('profile')}
                className={`py-3 px-4 border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors ${
                  dashboardTab === 'profile'
                    ? 'border-[#C5A059] text-stone-950 font-extrabold bg-white'
                    : 'border-transparent hover:text-stone-900'
                }`}
              >
                <User className="w-4 h-4 text-[#C5A059]" /> Profile Details
              </button>
            </div>

            {/* Dashboard Content Panel */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
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
                          <ArrowLeft className="w-4 h-4 text-[#C5A059]" /> ← Back to Order List
                        </button>

                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          LIVE EXPRESS TRACKER
                        </span>
                      </div>

                      {/* Order & Carrier Card Header */}
                      <div className="bg-[#121212] text-white p-5 rounded-xl border border-stone-800 space-y-4 shadow-md">
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
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : trackingOrder.status === 'Processing'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
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
                            <span className="text-[10px] text-stone-400 font-bold uppercase block">Express Carrier</span>
                            <span className="font-bold text-stone-100 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#C5A059]" />
                              {trackingOrder.trackingNumber.startsWith('LP-')
                                ? 'La Poste Colissimo France'
                                : trackingOrder.trackingNumber.startsWith('FEDEX-')
                                ? 'FedEx Express International'
                                : 'DHL Express Paris Atelier'}
                            </span>
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
                            <span className="text-[9px] text-stone-500">Paris Studio</span>
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
                            <span className="text-[10px] font-bold text-stone-900">Tailored</span>
                            <span className="text-[9px] text-stone-500">Handcrafted</span>
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
                          <MapPin className="w-4 h-4 text-[#C5A059]" /> Detailed Logistics History Log
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
                              <span className="text-[10px] text-[#C5A059] font-semibold block pt-0.5">
                                📍 {event.location}
                              </span>
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
                            onClick={() => window.print()}
                            className="bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 font-bold px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 text-xs transition-colors shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#C5A059]" /> Print Shipping Invoice
                          </button>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/33612345678?text=Hello%20KOMSE%20Design%20Support,%20I%20need%20help%20with%20delivery%20for%20Order%20${trackingOrder.id}%20(Tracking:%20${trackingOrder.trackingNumber})`}
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
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                        <h3 className="font-bold text-stone-900 text-sm uppercase">Order History</h3>
                        <span className="text-stone-500 text-[11px]">Click "Track Shipment" to view real-time location</span>
                      </div>

                      {userOrders.length === 0 ? (
                        <div className="text-center py-10 space-y-3 bg-stone-100/60 rounded-xl p-6">
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
                              className="border border-stone-200 rounded-xl p-4 bg-white space-y-3 shadow-2xs hover:border-stone-300 transition-colors"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                                <div>
                                  <span className="font-extrabold text-stone-900 text-sm block">
                                    {ord.id}
                                  </span>
                                  <span className="text-[11px] text-stone-500">Placed on {ord.date}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      ord.status === 'Delivered'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
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
                                  {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'} • Dispatch Studio: Paris, France
                                </p>
                              </div>

                              {renderRatingPrompt(ord)}

                              <div className="flex items-center justify-between pt-2 border-t border-stone-100 bg-[#FAF9F6] -mx-4 -mb-4 p-3 rounded-b-xl text-[11px]">
                                <span className="text-stone-600 font-medium flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" /> Tracking ID: {ord.trackingNumber}
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setOrderToDelete(ord)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                  <button
                                    onClick={() => setTrackingOrder(ord)}
                                    className="bg-stone-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                  >
                                    Track Shipment <ChevronRight className="w-3 h-3 text-[#C5A059]" />
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
                <form onSubmit={handleSaveAddress} className="space-y-4 max-w-md">
                  {completeProfileForCheckout && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
                      Complete your shipping details below to continue to secure checkout.
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-sm uppercase">Default Shipping Address</h3>
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
                      className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
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
                        className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Country</label>
                        <select
                          value={editCountry}
                          onChange={(e) => {
                            setEditCountry(e.target.value);
                            setEditPhoneCode(getDialCode(e.target.value));
                          }}
                          className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
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
                        className="p-2.5 border border-stone-300 rounded bg-white text-stone-900"
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
                        className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-black text-white font-bold uppercase px-6 py-2.5 rounded shadow cursor-pointer transition-colors"
                  >
                    Save Address Changes
                  </button>
                </form>
              )}

              {dashboardTab === 'profile' && (
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 text-sm uppercase">Personal Account Info</h3>
                    <p className="text-stone-500 text-[11px]">Manage your membership preferences.</p>
                  </div>

                  <div className="space-y-3 bg-white p-4 border border-stone-200 rounded-xl">
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
                        <label className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white font-bold uppercase px-3 py-2 rounded text-[11px] cursor-pointer transition-colors">
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
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-semibold">Full Name</span>
                      <span className="font-bold text-stone-900">{currentUser.name}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-semibold">Email Address</span>
                      <span className="font-bold text-stone-900">{currentUser.email}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-semibold">Phone</span>
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

            {/* Logout Footer */}
            <div className="p-4 bg-[#F4F3EF] border-t border-stone-200 flex items-center justify-between text-xs flex-shrink-0">
              <span className="text-stone-500 text-[11px]">Logged in as {currentUser.email}</span>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="text-red-600 hover:text-red-800 font-bold uppercase flex items-center gap-1.5 cursor-pointer bg-red-50 hover:bg-red-100 px-4 py-2 rounded border border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* UNAUTHENTICATED LOGIN / SIGN UP PANEL */
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* Tab Selector */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-4 text-sm font-bold">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`cursor-pointer pb-1 transition-all ${
                    authMode === 'login'
                      ? 'text-stone-900 border-b-2 border-[#C5A059]'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className={`cursor-pointer pb-1 transition-all ${
                    authMode === 'register'
                      ? 'text-stone-900 border-b-2 border-[#C5A059]'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {isLocalhost && (
                <button
                  onClick={handleDemoLogin}
                  className="bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#9A7A38] hover:text-[#7C6026] border border-[#C5A059]/40 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Quick Demo Login
                </button>
              )}
            </div>

            {/* Success Feedback */}
            {authSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {authSuccess}
              </div>
            )}

            {/* Error Feedback */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold">
                {authError}
              </div>
            )}

            {!resetPasswordMode && (
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold uppercase py-3 rounded shadow-sm cursor-pointer transition-colors text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-[11px] font-black text-[#4285F4]">G</span>
                Continue with Google
              </button>
            )}

            {resetPasswordMode ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase text-stone-900">Set a new password</h3>
                  <p className="mt-1 text-stone-500">Choose a new password for your KOMSE account.</p>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-black text-white font-bold uppercase py-3 rounded shadow cursor-pointer transition-colors text-xs tracking-wider"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordMode(false);
                    setAuthError('');
                  }}
                  className="w-full text-stone-600 hover:text-stone-900 text-xs font-bold uppercase cursor-pointer"
                >
                  Back to Sign In
                </button>
              </form>
            ) : authMode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                    <input type="checkbox" className="rounded border-stone-300 text-[#C5A059]" defaultChecked />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetCooldownSeconds > 0}
                    className="text-[#C5A059] font-bold hover:underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetCooldownSeconds > 0 ? `Resend in ${resetCooldownSeconds}s` : 'Forgot Password?'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-black text-white font-bold uppercase py-3 rounded shadow cursor-pointer transition-colors text-xs tracking-wider"
                >
                  Sign In
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Phone Number (Optional)</label>
                  <div className="grid grid-cols-[auto_1fr] gap-2">
                    <select
                      value={registrationPhoneCode}
                      onChange={(event) => setRegistrationPhoneCode(event.target.value)}
                      className="p-2.5 border border-stone-300 rounded bg-white text-stone-900"
                      aria-label="Country dialing code"
                    >
                      {COUNTRY_OPTIONS.map((option) => (
                        <option key={option.code} value={option.dialCode}>{option.dialCode}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Country / Region</label>
                  <select
                    value={registrationCountry}
                    onChange={(event) => {
                      setRegistrationCountry(event.target.value);
                      setRegistrationPhoneCode(getDialCode(event.target.value));
                    }}
                    className="w-full p-2.5 border border-stone-300 rounded bg-white text-stone-900"
                  >
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option.code} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-stone-300 rounded bg-white text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500">
                  By creating an account, you agree to KOMSE DESIGN Terms of Service and Privacy Policy.
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C5A059] hover:bg-[#A88238] text-stone-950 font-bold uppercase py-3 rounded shadow cursor-pointer transition-colors text-xs tracking-wider"
                >
                  Create Account
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
