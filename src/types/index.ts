export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';
export type PaymentTerms = 'due-on-receipt' | 'net-15' | 'net-30' | 'net-60';
export type ReminderTone = 'gentle' | 'friendly' | 'urgent';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentRecord {
  paidAt: string;
  method?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientToken: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  notes: string;
  paymentRecord?: PaymentRecord;
  createdAt: string;
}

export interface Client {
  name: string;
  email: string;
  token: string;
  invoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalUnpaid: number;
  totalPaid: number;
  overdueCount: number;
  totalInvoices: number;
}

export interface ReminderResult {
  tone: ReminderTone;
  subject: string;
  body: string;
  daysOverdue: number;
}
