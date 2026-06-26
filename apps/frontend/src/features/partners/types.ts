export interface TrustedCompany {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrustedCompanyInput {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
