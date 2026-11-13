export const PAY_METHODS = [
  {
    id: 'fpx',
    label: 'Online banking (FPX)',
    note: 'Pay straight from your bank account',
  },
  {
    id: 'card',
    label: 'Credit or debit card',
    note: 'Visa and Mastercard',
  },
  {
    id: 'ewallet',
    label: 'E-wallet or DuitNow QR',
    note: 'Scan with your e-wallet or banking app',
  },
  {
    id: 'cod',
    label: 'Cash on delivery',
    note: 'Pay the rider when it arrives',
  },
] as const;

export type PayMethod = (typeof PAY_METHODS)[number]['id'];

export const DEMO_BANKS = [
  { id: 'a', name: 'Demo Bank A' },
  { id: 'b', name: 'Demo Bank B' },
  { id: 'c', name: 'Demo Bank C', offline: true },
];

export type FailReason =
  | 'declined'
  | 'insufficient_funds'
  | 'bank_declined'
  | 'bank_unavailable'
  | 'otp_failed'
  | 'qr_expired'
  | 'wallet_declined'
  | 'cancelled';

export const FAIL_REASONS: Record<FailReason, string> = {
  declined: 'Your card was declined by the bank.',
  insufficient_funds: 'The card does not have enough funds.',
  bank_declined: 'The payment was declined in your bank.',
  bank_unavailable: 'Your bank is offline right now.',
  otp_failed: 'The one-time password did not match.',
  qr_expired: 'The QR code expired before it was paid.',
  wallet_declined: 'The payment was declined in your e-wallet.',
  cancelled: 'You cancelled the payment.',
};

export const NEXT_STEPS: Record<FailReason, string> = {
  declined: 'Try another card, or pay by FPX online banking instead.',
  insufficient_funds:
    'Top up the account, use another card, or pay by FPX or e-wallet.',
  bank_declined:
    'Approve the request in your bank app next time, or choose another bank.',
  bank_unavailable:
    'Pick another bank, or try again in a few minutes. Banks go offline for maintenance.',
  otp_failed: 'Ask your bank for a new code and type it exactly as sent.',
  qr_expired:
    'Open the payment again for a fresh QR code. Each one lasts five minutes.',
  wallet_declined:
    'Approve it in your e-wallet next time, or choose another way to pay.',
  cancelled: 'Your order is saved. Pay whenever you are ready.',
};

export const TEST_CARDS = [
  { number: '4242424242424242', result: 'Payment succeeds' },
  { number: '4000000000003220', result: 'Asks for a one-time password' },
  { number: '4000000000000002', result: 'Card declined' },
  { number: '4000000000009995', result: 'Insufficient funds' },
] as const;

export const TEST_OTP = '123456';

export const MY_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Labuan',
  'W.P. Putrajaya',
];

export const digits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
