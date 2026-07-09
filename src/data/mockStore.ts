import type { Invoice, LineItem, PaymentTerms, Client, DashboardStats } from '../types';

const STORAGE_KEY = 'invoiceTrackerStore';
const VERSION_KEY = 'invoiceTrackerVersion';
const STORE_VERSION = 2;

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 10);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function createLineItem(desc: string, qty: number, price: number): LineItem {
  return { id: generateId(), description: desc, quantity: qty, unitPrice: price };
}

const SEED_INVOICES: Invoice[] = [
  {
    id: generateId(),
    number: 'INV-001',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acmecorp.com',
    clientToken: 'acme01',
    lineItems: [
      createLineItem('Website Redesign', 1, 350000),
      createLineItem('UI/UX Consultation', 3, 12000),
    ],
    subtotal: 386000,
    taxRate: 18,
    taxAmount: 69480,
    discount: 0,
    total: 455480,
    status: 'paid',
    issueDate: daysAgo(45),
    dueDate: daysAgo(15),
    paymentTerms: 'net-30',
    notes: 'Thank you for your business!',
    paymentRecord: { paidAt: daysAgo(12) },
    createdAt: daysAgo(45),
  },
  {
    id: generateId(),
    number: 'INV-002',
    clientName: 'Globex Inc',
    clientEmail: 'finance@globexinc.com',
    clientToken: 'globex02',
    lineItems: [
      createLineItem('Mobile App Development - Phase 1', 1, 600000),
      createLineItem('API Integration', 1, 200000),
    ],
    subtotal: 800000,
    taxRate: 18,
    taxAmount: 144000,
    discount: 40000,
    total: 904000,
    status: 'paid',
    issueDate: daysAgo(60),
    dueDate: daysAgo(30),
    paymentTerms: 'net-30',
    notes: 'Net 30 payment terms. Discount applied for early engagement.',
    paymentRecord: { paidAt: daysAgo(28) },
    createdAt: daysAgo(60),
  },
  {
    id: generateId(),
    number: 'INV-003',
    clientName: 'Wayne Enterprises',
    clientEmail: 'ap@wayneent.com',
    clientToken: 'wayne03',
    lineItems: [
      createLineItem('Security Audit Report', 1, 250000),
      createLineItem('Vulnerability Assessment', 1, 140000),
    ],
    subtotal: 390000,
    taxRate: 18,
    taxAmount: 70200,
    discount: 0,
    total: 460200,
    status: 'unpaid',
    issueDate: daysAgo(10),
    dueDate: daysFromNow(20),
    paymentTerms: 'net-30',
    notes: 'Payment due within 30 days of invoice date.',
    createdAt: daysAgo(10),
  },
  {
    id: generateId(),
    number: 'INV-004',
    clientName: 'Stark Industries',
    clientEmail: 'accounts@starkind.com',
    clientToken: 'stark04',
    lineItems: [
      createLineItem('Cloud Infrastructure Setup', 1, 450000),
      createLineItem('DevOps Consulting', 5, 15000),
      createLineItem('Documentation', 1, 60000),
    ],
    subtotal: 585000,
    taxRate: 18,
    taxAmount: 105300,
    discount: 15000,
    total: 675300,
    status: 'unpaid',
    issueDate: daysAgo(5),
    dueDate: daysFromNow(25),
    paymentTerms: 'net-30',
    notes: 'Thank you for choosing our services. Payment via bank transfer preferred.',
    createdAt: daysAgo(5),
  },
  {
    id: generateId(),
    number: 'INV-005',
    clientName: 'Umbrella Corp',
    clientEmail: 'finance@umbrellacorp.com',
    clientToken: 'umbrella05',
    lineItems: [
      createLineItem('Data Analytics Platform', 1, 550000),
      createLineItem('Training Workshop', 2, 40000),
    ],
    subtotal: 630000,
    taxRate: 18,
    taxAmount: 113400,
    discount: 0,
    total: 743400,
    status: 'overdue',
    issueDate: daysAgo(50),
    dueDate: daysAgo(20),
    paymentTerms: 'net-30',
    notes: 'Please remit payment at your earliest convenience.',
    createdAt: daysAgo(50),
  },
  {
    id: generateId(),
    number: 'INV-006',
    clientName: 'Cyberdyne Systems',
    clientEmail: 'billing@cyberdyne.com',
    clientToken: 'cyber06',
    lineItems: [
      createLineItem('AI Model Training', 1, 900000),
      createLineItem('Data Pipeline Setup', 1, 280000),
      createLineItem('Ongoing Support (3 months)', 3, 65000),
    ],
    subtotal: 1375000,
    taxRate: 18,
    taxAmount: 247500,
    discount: 75000,
    total: 1547500,
    status: 'overdue',
    issueDate: daysAgo(75),
    dueDate: daysAgo(45),
    paymentTerms: 'net-30',
    notes: 'Volume discount applied. Please contact us for any questions.',
    createdAt: daysAgo(75),
  },
];

function loadStore(): Invoice[] {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version && Number(version) >= STORE_VERSION) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.length > 0) return parsed;
      }
    }
  } catch { /* ignore */ }
  localStorage.setItem(VERSION_KEY, String(STORE_VERSION));
  return SEED_INVOICES;
}

function saveStore(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

let invoices: Invoice[] = loadStore();
let nextNumber = invoices.length + 1;

function updateStatuses(): void {
  const today = new Date().toISOString().split('T')[0];
  invoices = invoices.map((inv) => {
    if (inv.status === 'paid') return inv;
    if (inv.dueDate < today) return { ...inv, status: 'overdue' as const };
    return inv;
  });
  saveStore(invoices);
}

updateStatuses();

export function getInvoices(): Invoice[] {
  return [...invoices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id);
}

export function getInvoicesByStatus(status: string): Invoice[] {
  if (status === 'all') return getInvoices();
  return getInvoices().filter((i) => i.status === status);
}

export function getClientInvoices(token: string): Invoice[] {
  return invoices
    .filter((i) => i.clientToken === token)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getClientByToken(token: string): { name: string; email: string } | undefined {
  const inv = invoices.find((i) => i.clientToken === token);
  if (!inv) return undefined;
  return { name: inv.clientName, email: inv.clientEmail };
}

export function getStats(): DashboardStats {
  updateStatuses();
  return {
    totalRevenue: invoices.reduce((s, i) => s + i.total, 0),
    totalUnpaid: invoices
      .filter((i) => i.status === 'unpaid')
      .reduce((s, i) => s + i.total, 0),
    totalPaid: invoices
      .filter((i) => i.status === 'paid')
      .reduce((s, i) => s + i.total, 0),
    overdueCount: invoices.filter((i) => i.status === 'overdue').length,
    totalInvoices: invoices.length,
  };
}

export function getClients(): Client[] {
  const map = new Map<string, Client>();
  for (const inv of invoices) {
    const existing = map.get(inv.clientToken);
    if (existing) {
      existing.invoiceCount += 1;
      existing.totalInvoiced += inv.total;
      if (inv.status === 'paid') existing.totalPaid += inv.total;
      else existing.outstanding += inv.total;
    } else {
      map.set(inv.clientToken, {
        name: inv.clientName,
        email: inv.clientEmail,
        token: inv.clientToken,
        invoiceCount: 1,
        totalInvoiced: inv.total,
        totalPaid: inv.status === 'paid' ? inv.total : 0,
        outstanding: inv.status !== 'paid' ? inv.total : 0,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function addInvoice(data: {
  clientName: string;
  clientEmail: string;
  lineItems: LineItem[];
  taxRate: number;
  discount: number;
  dueDate: string;
  paymentTerms: PaymentTerms;
  notes: string;
}): Invoice {
  const number = `INV-${String(nextNumber).padStart(3, '0')}`;
  nextNumber += 1;

  const existingClient = invoices.find(
    (i) => i.clientName.toLowerCase() === data.clientName.toLowerCase()
  );
  const clientToken = existingClient?.clientToken ?? generateToken();

  const subtotal = data.lineItems.reduce(
    (s, li) => s + li.quantity * li.unitPrice,
    0
  );
  const taxAmount = Math.round(subtotal * (data.taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount - data.discount) * 100) / 100;

  const inv: Invoice = {
    id: generateId(),
    number,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientToken,
    lineItems: data.lineItems,
    subtotal,
    taxRate: data.taxRate,
    taxAmount,
    discount: data.discount,
    total,
    status: 'unpaid',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: data.dueDate,
    paymentTerms: data.paymentTerms,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  invoices.push(inv);
  saveStore(invoices);
  return inv;
}

export function markAsPaid(id: string): Invoice | undefined {
  const idx = invoices.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  invoices[idx] = {
    ...invoices[idx],
    status: 'paid',
    paymentRecord: { paidAt: new Date().toISOString() },
  };
  saveStore(invoices);
  return invoices[idx];
}

export function deleteInvoice(id: string): boolean {
  const idx = invoices.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  invoices.splice(idx, 1);
  saveStore(invoices);
  return true;
}

export function bulkMarkAsPaid(ids: string[]): number {
  let count = 0;
  for (const id of ids) {
    const idx = invoices.findIndex((i) => i.id === id);
    if (idx !== -1 && invoices[idx].status !== 'paid') {
      invoices[idx] = {
        ...invoices[idx],
        status: 'paid',
        paymentRecord: { paidAt: new Date().toISOString() },
      };
      count++;
    }
  }
  saveStore(invoices);
  return count;
}

export function bulkDelete(ids: string[]): number {
  const set = new Set(ids);
  const before = invoices.length;
  invoices = invoices.filter((i) => !set.has(i.id));
  saveStore(invoices);
  return before - invoices.length;
}

export function searchInvoices(query: string): Invoice[] {
  const q = query.toLowerCase();
  return getInvoices().filter(
    (i) =>
      i.clientName.toLowerCase().includes(q) ||
      i.number.toLowerCase().includes(q) ||
      i.clientEmail.toLowerCase().includes(q)
  );
}

export function resetStore(): void {
  invoices = [...SEED_INVOICES];
  nextNumber = invoices.length + 1;
  saveStore(invoices);
}

export function getOverdueInvoices(): Invoice[] {
  return invoices.filter((i) => i.status === 'overdue');
}
