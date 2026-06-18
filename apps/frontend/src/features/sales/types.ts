export type SalesInquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'WON'
  | 'LOST';

export interface SalesInquiry {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone: string | null;
  service: string;
  budget: string | null;
  timeline: string | null;
  message: string;
  source: string;
  status: SalesInquiryStatus;
  adminNote: string | null;
  contactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesInquiryPayload {
  name: string;
  email: string;
  companyName: string;
  phone?: string;
  service: string;
  budget?: string;
  timeline?: string;
  message: string;
  source?: string;
}
