export type SettingCategory =
  | 'APP'
  | 'GITHUB'
  | 'MIDTRANS'
  | 'PAYPAL'
  | 'BILLING'
  | 'CURRENCY'
  | 'SCANNER'
  | 'REPORT'
  | 'INVOICE'
  | 'SECURITY';

export interface AdminSetting {
  key: string;
  label: string;
  category: SettingCategory;
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SECRET';
  description: string;
  isSecret?: boolean;
  sensitive?: boolean;
  configured: boolean;
  source: 'database' | 'environment' | 'default' | 'none';
  value: string;
  maskedValue?: string;
  whereToGet?: string;
  exampleValue?: string;
  setupStep?: string;
  updatedAt?: string | null;
  updatedBy?: { id: string; name: string; email: string } | null;
}

export interface ProviderTestResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  missingKeys: string[];
}

export interface AdminAuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceKey: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { name: string; email: string } | null;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalOrganizations: number;
  totalRepositories: number;
  totalScanJobs: number;
  totalFindings: number;
  activeSubscriptions: number;
  monthlyRevenue: { currencyCode: string; totalAmount: number };
  providerStatus: Record<string, boolean>;
  recentAuditLogs: AdminAuditLog[];
  recentPayments: {
    id: string;
    provider: string;
    status: string;
    currencyCode: string;
    totalAmount: number;
    createdAt: string;
  }[];
  recentScans: {
    id: string;
    status: string;
    totalFindings: number;
    createdAt: string;
    repository: { name: string };
  }[];
}
