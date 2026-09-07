import React from 'react';

export const VisaLogo = ({ className = "h-4 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M38.86 30.68L44.82 1.32H53.94L47.98 30.68H38.86ZM72.16 1.94C70.36 1.28 67.54 0.8 63.88 0.8C54.4 0.8 47.7 5.86 47.54 13.06C47.38 18.38 52.12 21.36 55.72 23.12C59.42 24.92 60.66 26.08 60.64 27.72C60.62 30.22 57.64 31.34 54.88 31.34C50.98 31.34 48.74 30.62 45.48 29.18L44.02 35.94C46.38 37.04 50.72 37.94 55.22 37.96C65.28 37.96 71.84 33 72.04 25.26C72.14 19.34 68.48 16.28 63.66 13.98C60.74 12.52 58.94 11.46 58.96 9.88C58.96 8.48 60.54 7.02 64.08 7.02C67.06 6.96 69.36 7.64 71.02 8.36L72.16 1.94ZM98.78 1.32H91.76C89.58 1.32 87.94 1.96 87.02 4.16L74.34 30.68H83.82L85.72 25.44H97.34L98.44 30.68H106.82L98.78 1.32ZM88.42 18.06L93.18 4.96L95.9 18.06H88.42ZM31.18 1.32L22.28 21.32L21.28 16.08C19.56 10.22 14.18 4.3 8.3 1.22L16.24 30.66H25.76L39.92 1.32H31.18Z"
      fill="#1434CB"
    />
    <path
      d="M13.26 1.32H0.28L0 1.92C10.14 4.5 16.92 8.86 21.28 16.08L18.04 1.32H13.26Z"
      fill="#F7B600"
    />
  </svg>
);

export const MastercardLogo = ({ className = "h-4 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 62" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="62" rx="6" fill="transparent" />
    <circle cx="35" cy="31" r="22" fill="#EB001B" />
    <circle cx="65" cy="31" r="22" fill="#F79E1B" />
    <path
      d="M50 14.7828C55.2014 18.9959 58.5 25.3217 58.5 32.4138C58.5 39.5059 55.2014 45.8317 50 50.0448C44.7986 45.8317 41.5 39.5059 41.5 32.4138C41.5 25.3217 44.7986 18.9959 50 14.7828Z"
      fill="#FF5F00"
    />
  </svg>
);

export const PaypalLogo = ({ className = "h-4 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.8 3.2L5.6 28.8H12.4L15.2 18.8H19.6C24.4 18.8 28.4 15.6 29.4 10.8C29.8 8.8 29.4 7 28.2 5.6C26.8 4 24.2 3.2 20.8 3.2H12.8Z"
      fill="#003087"
    />
    <path
      d="M17.6 8.4L12.4 27.2H18L20.4 18.8H23.6C27.2 18.8 30.2 16.4 31 12.8C31.3 11.3 31 10 30.1 8.9C29 7.6 27.1 7 24.5 7H17.6V8.4Z"
      fill="#0079C1"
    />
    <text x="35" y="21" fill="#003087" fontSize="20" fontWeight="900" fontFamily="sans-serif">Pay</text>
    <text x="69" y="21" fill="#0079C1" fontSize="20" fontWeight="900" fontFamily="sans-serif">Pal</text>
  </svg>
);

export const ApplePayLogo = ({ className = "h-4 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.18 10.38C15.26 11.5 13.82 12.28 12.38 12.16C12.18 10.66 12.92 9.12 13.82 8.04C14.78 6.9 16.28 6.16 17.62 6C17.84 7.56 17.1 9.2 16.18 10.38ZM17.52 12.62C15.34 12.5 13.56 13.86 12.48 13.86C11.38 13.86 9.88 12.7 8.16 12.74C5.9 12.78 3.76 14.08 2.58 16.14C0.2 20.26 1.98 26.38 4.28 29.7C5.42 31.32 6.74 33.16 8.5 33.08C10.2 33 10.86 31.98 12.9 31.98C14.92 31.98 15.54 33.08 17.34 33.04C19.18 33 20.32 31.38 21.44 29.74C22.74 27.86 23.28 26.02 23.32 25.92C23.24 25.88 19.56 24.46 19.52 20.2C19.48 16.64 22.38 14.92 22.52 14.82C20.84 12.38 18.26 12.66 17.52 12.62Z"
      fill="currentColor"
    />
    <text x="28" y="27" fill="currentColor" fontSize="22" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      Pay
    </text>
  </svg>
);

export const AmexLogo = ({ className = "h-4 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="32" rx="4" fill="#006FCF" />
    <text x="50" y="22" fill="#FFFFFF" fontSize="15" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">
      AMEX
    </text>
  </svg>
);

export const StripeLogo = ({ className = "h-4 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M38.2 11.2C38.2 9.6 39.5 8.9 41.7 8.9C44.7 8.9 48.3 10.1 50.9 11.6V4.3C48 3.1 44.8 2.6 41.7 2.6C34.1 2.6 29 6.6 29 12.1C29 21.2 41.5 19.7 41.5 23.3C41.5 25.1 39.8 25.8 37.3 25.8C33.9 25.8 29.8 24.3 26.8 22.6V30.1C30.2 31.6 33.9 32.3 37.5 32.3C45.3 32.3 50.8 28.5 50.8 22.8C50.7 13.2 38.2 15 38.2 11.2Z"
      fill="#635BFF"
    />
  </svg>
);
