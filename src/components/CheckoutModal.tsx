import React, { useEffect, useState } from 'react';
import { CartItem, CurrencyCode, UserOrder, UserProfile } from '../types';
import { CURRENCIES } from '../data/products';
import { apiUrl, supabaseFunctionUrl } from '../lib/api';
import { COUNTRY_OPTIONS, detectDefaultCountry, getDialCode } from '../utils/currencyDetector';
import { supabase } from '../lib/supabase';
import { X, CheckCircle, Lock, Download } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentCurrency: CurrencyCode;
  currentUser: UserProfile | null;
  onClearCart: () => void;
  onOrderCompleted: (order: Omit<UserOrder, 'id'> & { id: string }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentCurrency,
  currentUser,
  onClearCart,
  onOrderCompleted,
}) => {
  const currency = CURRENCIES[currentCurrency] || CURRENCIES.EUR;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: detectDefaultCountry(),
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState(() => getDialCode(detectDefaultCountry()));

  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paidTotalEur, setPaidTotalEur] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const subtotalEur = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const shippingEur = subtotalEur >= 100 || cartItems.length === 0 ? 0 : 7.5;
  const totalEur = subtotalEur + shippingEur;

  const formatPrice = (amountEur: number) => {
    return `${currency.symbol}${(amountEur * currency.rate).toFixed(2)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const nameParts = currentUser?.name?.trim().split(/\s+/) || [];
    setFormData((previous) => ({
      firstName: nameParts[0] || previous.firstName,
      lastName: nameParts.slice(1).join(' ') || previous.lastName,
      email: currentUser?.email || previous.email,
      phone: currentUser?.phone || previous.phone,
      address: currentUser?.address || previous.address,
      postalCode: currentUser?.postalCode || previous.postalCode,
      city: currentUser?.city || previous.city,
      country: currentUser?.country || previous.country || 'France',
    }));
    const country = currentUser?.country || detectDefaultCountry();
    const code = getDialCode(country);
    setPhoneCode(code);
    setPhoneNumber((currentUser?.phone || '').replace(new RegExp(`^\\${code}\\s*`), ''));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setFormData((previous) => ({ ...previous, country: previous.country || detectDefaultCountry() }));
    }
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('payment') !== 'success' || !sessionId || sessionStorage.getItem(`komse_paid_${sessionId}`)) return;

    setIsProcessing(true);
    const verifyCheckout = async () => {
      const session = await supabase?.auth.getSession();
      const accessToken = session?.data.session?.access_token;
      if (!accessToken) throw new Error('Please sign in again to verify your payment.');
      const functionUrl = supabaseFunctionUrl('stripe-checkout');
      return fetch(functionUrl || apiUrl(`/api/verify-checkout-session?session_id=${encodeURIComponent(sessionId)}`), {
        ...(functionUrl ? { method: 'POST', body: JSON.stringify({ action: 'verify', sessionId }) } : {}),
        ...(functionUrl ? { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` } } : { headers: { Authorization: `Bearer ${accessToken}` } }),
      });
    };
    verifyCheckout()
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to verify payment.');
        return result.order as Omit<UserOrder, 'id'> & { id: string };
      })
      .then((order) => {
        sessionStorage.setItem(`komse_paid_${sessionId}`, 'true');
        onOrderCompleted(order);
        setOrderId(order.id);
        setPaidTotalEur(order.totalAmountEur);
        setOrderComplete(true);
        onClearCart();
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch((error) => setPaymentError(error instanceof Error ? error.message : 'Unable to verify payment.'))
      .finally(() => setIsProcessing(false));
  }, [onClearCart, onOrderCompleted]);

  const handlePayOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError('');
    try {
      const session = await supabase?.auth.getSession();
      const accessToken = session?.data.session?.access_token;
      if (!accessToken) throw new Error('Please sign in before starting checkout.');
      const functionUrl = supabaseFunctionUrl('stripe-checkout');
      const response = await fetch(functionUrl || apiUrl('/api/create-checkout-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          orderId: `KOMSE-${Math.floor(100000 + Math.random() * 900000)}`,
          customer: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: `${phoneCode} ${phoneNumber}`.trim(),
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || 'Unable to start secure checkout.');
      window.location.assign(result.url);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to start secure checkout. Check that the payment server is online.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FCFBF9] w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 relative flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-[#FCFBF9] z-20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C5A059]" />
            <h2 className="text-xl font-bold text-stone-900 uppercase">
              {orderComplete ? 'ORDER CONFIRMATION' : 'SECURE CHECKOUT'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderComplete ? (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#F3EFE6] text-[#C5A059] rounded-full mx-auto flex items-center justify-center shadow-inner border border-[#C5A059]/40">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block">
                Order Received
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">
                THANK YOU FOR YOUR PURCHASE!
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2">
                Your order <strong className="text-stone-900">{orderId}</strong> has been confirmed. A confirmation email and tracking link have been sent to{' '}
                <strong className="text-stone-900">{formData.email}</strong>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 max-w-md mx-auto text-left text-xs space-y-2 shadow-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-500">Shipping Address:</span>
                <span className="font-semibold text-stone-900">{formData.address}, {formData.city}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-semibold text-emerald-700">Paid via Stripe</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-1 text-sm">
                <span>Total Paid:</span>
                <span className="text-[#C5A059]">{formatPrice(paidTotalEur)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => alert(`Receipt PDF for ${orderId} downloaded!`)}
                className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-bold uppercase px-6 py-3 rounded cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Receipt
              </button>
              <button
                onClick={onClose}
                className="bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase px-6 py-3 rounded cursor-pointer shadow"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handlePayOrder} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Shipping & Payment Details */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase text-stone-800 tracking-wider mb-3 pb-1 border-b border-stone-200">
                    1. Shipping Address
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-600 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-stone-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-stone-600 mb-1">Street Address</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-stone-600 mb-1">Country / Region</label>
                      <select
                        name="country"
                        required
                        value={formData.country}
                        onChange={(event) => {
                          setFormData((previous) => ({ ...previous, country: event.target.value }));
                          setPhoneCode(getDialCode(event.target.value));
                        }}
                        className="w-full p-2 border border-stone-300 rounded bg-white"
                      >
                        {COUNTRY_OPTIONS.map((option) => (
                          <option key={option.code} value={option.name}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-stone-600 mb-1">Phone Number</label>
                      <div className="grid grid-cols-[auto_1fr] gap-2">
                        <select
                          value={phoneCode}
                          onChange={(event) => setPhoneCode(event.target.value)}
                          className="p-2 border border-stone-300 rounded bg-white"
                          aria-label="Country dialing code"
                        >
                          {COUNTRY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.dialCode}>{option.dialCode}</option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(event) => setPhoneNumber(event.target.value)}
                          placeholder="6 12 34 56 78"
                          className="w-full p-2 border border-stone-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Payment */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-stone-800 tracking-wider mb-3 pb-1 border-b border-stone-200">
                    2. Payment Method
                  </h3>
                  <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs text-stone-600">
                    <p className="font-semibold text-stone-900">Secure checkout powered by Stripe</p>
                    <p className="mt-1">Pay by card, PayPal, or Apple Pay when available for your device and location. Payment details are entered securely on Stripe and never stored by KOMSE DESIGN.</p>
                  </div>
                </div>
              </div>

              {/* Right Order Summary Column */}
              <div className="md:col-span-5 bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-stone-900 tracking-wider pb-2 border-b border-stone-200">
                    Order Summary ({cartItems.length} items)
                  </h3>

                  <div className="max-h-48 overflow-y-auto space-y-3 py-3 border-b border-stone-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div className="pr-2">
                          <span className="font-bold text-stone-900 block">{item.product.name}</span>
                          <span className="text-[10px] text-stone-500">
                            Qty: {item.quantity} | Size: {item.selectedSize}
                          </span>
                        </div>
                        <span className="font-semibold text-stone-800">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600 pt-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900">{formatPrice(subtotalEur)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingEur === 0 ? 'FREE' : formatPrice(shippingEur)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-200 pt-2">
                      <span>Total Due</span>
                      <span className="text-[#C5A059]">{formatPrice(totalEur)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  {paymentError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3">{paymentError}</p>}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase py-4 rounded shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-[#C5A059]" />
                    {isProcessing ? 'REDIRECTING TO STRIPE...' : `PAY ${formatPrice(totalEur)}`}
                  </button>
                  <p className="text-[10px] text-center text-stone-500">
                    Card, PayPal, and Apple Pay availability is determined by Stripe
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
