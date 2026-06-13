export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD';
export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  minorUnit: number;
  supportedByMidtrans: boolean;
  supportedByPaypal: boolean;
}
export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  amount: number;
  basePriceIdr: number | null;
  currencyCode: CurrencyCode;
  interval: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  maxRepositories: number;
  maxScansPerMonth: number;
  enablePdfReport: boolean;
  enableGithubAutoScan: boolean;
  enableRecurring: boolean;
  requiresManualApproval: boolean;
  isEnterprise: boolean;
  isActive: boolean;
  isEstimated: boolean;
  providerAvailability: { midtrans: boolean; paypal: boolean };
  exchangeRateSnapshot: Record<string, unknown> | null;
}
export interface Subscription {
  id: string;
  status: string;
  currencyCode: CurrencyCode;
  plan: Plan;
  usage: { repositories: number; scansThisMonth: number };
}
export interface Payment {
  id: string;
  provider: string;
  status: string;
  currencyCode: CurrencyCode;
  totalAmount: number;
  createdAt: string;
  checkoutUrl: string | null;
}
export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  currencyCode: CurrencyCode;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string;
  lineItems: { description: string; totalAmount: number }[];
}

export interface AdminPlan extends Omit<
  Plan,
  | 'amount'
  | 'currencyCode'
  | 'exchangeRateSnapshot'
  | 'isEstimated'
  | 'providerAvailability'
> {
  prices: {
    id: string;
    currencyCode: CurrencyCode;
    amount: number;
    isActive: boolean;
  }[];
}

export interface AdminSetting {
  key: string;
  label: string;
  category: string;
  description: string;
  sensitive?: boolean;
  configured: boolean;
  source: 'dashboard' | 'database' | 'environment' | 'default' | 'none';
  value: string;
}
