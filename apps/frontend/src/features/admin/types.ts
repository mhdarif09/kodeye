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

export interface SalesInquirySummary {
  id: string;
  name: string;
  email: string;
  companyName: string;
  service: string;
  status: string;
  createdAt: string;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalProjects: number;
  totalBlogPosts: number;
  totalSalesInquiries: number;
  recentAuditLogs: AdminAuditLog[];
  recentInquiries: SalesInquirySummary[];
}

export type AdminUserRole = 'USER' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  suspendedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
