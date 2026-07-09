import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Edit3, Copy, Check } from 'lucide-react';
import { addInvoice } from '../data/mockStore';
import { Input, TextArea, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/Badge';
import { formatCurrency, formatDate, getDueDateFromTerms, getPaymentTermsLabel } from '../utils/format';
import { useToast } from '../hooks/useToast';
import type { LineItem, PaymentTerms } from '../types';

function emptyLineItem(): LineItem {
  return {
    id: Math.random().toString(36).substring(2, 11),
    description: '',
    quantity: 1,
    unitPrice: 0,
  };
}

const paymentTermOptions = [
  { value: 'due-on-receipt', label: 'Due on Receipt' },
  { value: 'net-15', label: 'Net 15' },
  { value: 'net-30', label: 'Net 30' },
  { value: 'net-60', label: 'Net 60' },
];

export default function CreateInvoice() {
  const navigate = useNavigate();
  const toast = useToast();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net-30');
  const [dueDate, setDueDate] = useState(getDueDateFromTerms('net-30'));
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdLink, setCreatedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = useMemo(
    () => lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0),
    [lineItems]
  );
  const taxAmount = useMemo(() => Math.round(subtotal * (taxRate / 100) * 100) / 100, [subtotal, taxRate]);
  const total = useMemo(() => Math.round((subtotal + taxAmount - discount) * 100) / 100, [subtotal, taxAmount, discount]);

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  };

  const addLineItemRow = () => setLineItems((prev) => [...prev, emptyLineItem()]);
  const removeLineItemRow = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const handleTermsChange = (terms: string) => {
    setPaymentTerms(terms as PaymentTerms);
    setDueDate(getDueDateFromTerms(terms));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = 'Client name is required';
    if (!clientEmail.trim()) e.clientEmail = 'Client email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) e.clientEmail = 'Invalid email format';
    if (!dueDate) e.dueDate = 'Due date is required';
    const hasValidItem = lineItems.some((li) => li.description.trim() && li.unitPrice > 0);
    if (!hasValidItem) e.lineItems = 'At least one line item with description and price is required';
    if (discount > subtotal + taxAmount) e.discount = 'Discount cannot exceed subtotal + tax';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const inv = addInvoice({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      lineItems: lineItems.filter((li) => li.description.trim()),
      taxRate,
      discount,
      dueDate,
      paymentTerms,
      notes: notes.trim(),
    });
    const link = `${window.location.origin}/client/${inv.clientToken}`;
    setCreatedLink(link);
    setShowSuccess(true);
    toast.success(`Invoice ${inv.number} created successfully`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Client Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Client Information</h2>
            <div className="space-y-4">
              <Input
                label="Client Name"
                placeholder="Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                error={errors.clientName}
              />
              <Input
                label="Client Email"
                type="email"
                placeholder="billing@acmecorp.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                error={errors.clientEmail}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Payment Terms"
                  options={paymentTermOptions}
                  value={paymentTerms}
                  onChange={(e) => handleTermsChange(e.target.value)}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  error={errors.dueDate}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Line Items</h2>
            {errors.lineItems && (
              <p className="text-xs text-red-600 mb-3">{errors.lineItems}</p>
            )}
            <div className="space-y-3">
              {lineItems.map((li) => (
                <div key={li.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={li.description}
                      onChange={(e) => updateLineItem(li.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={li.quantity}
                        onChange={(e) => updateLineItem(li.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        min={0}
                        step={0.01}
                        value={li.unitPrice || ''}
                        onChange={(e) => updateLineItem(li.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[80px] justify-end">
                        {formatCurrency(li.quantity * li.unitPrice)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLineItemRow(li.id)}
                    disabled={lineItems.length <= 1}
                    className="mt-1 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addLineItemRow}
              className="mt-3 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add Line Item
            </button>
          </div>

          {/* Totals & Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-6 lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Totals</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Tax Rate (%)"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Discount (₹)"
                      type="number"
                      min={0}
                      step={0.01}
                      value={discount || ''}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      error={errors.discount}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tax ({taxRate}%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Discount</span>
                      <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <div>
                <TextArea
                  label="Notes / Payment Terms"
                  placeholder="Thank you for your business! Payment is due within the specified terms."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-2 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Invoice</Button>
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-8 max-w-3xl mx-auto">
          <InvoicePreview
            clientName={clientName || 'Client Name'}
            clientEmail={clientEmail || 'client@email.com'}
            number="INV-???"
            issueDate={new Date().toISOString().split('T')[0]}
            dueDate={dueDate}
            paymentTerms={paymentTerms}
            lineItems={lineItems.filter((li) => li.description.trim())}
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
            discount={discount}
            total={total}
            notes={notes}
            status="unpaid"
          />
          <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Invoice</Button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Modal open={showSuccess} onClose={() => { setShowSuccess(false); navigate('/dashboard'); }} title="Invoice Created!">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Share this link with your client so they can view their invoices:
          </p>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
            <input
              type="text"
              readOnly
              value={createdLink}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none font-mono"
            />
            <Button size="sm" variant="ghost" icon={copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} onClick={handleCopyLink}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="mt-6">
            <Button onClick={() => { setShowSuccess(false); navigate('/dashboard'); }}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface InvoicePreviewProps {
  clientName: string;
  clientEmail: string;
  number: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string;
  status: 'unpaid' | 'paid' | 'overdue';
}

export function InvoicePreview({
  clientName,
  clientEmail,
  number,
  issueDate,
  dueDate,
  paymentTerms,
  lineItems,
  subtotal,
  taxRate,
  taxAmount,
  discount,
  total,
  notes,
  status,
}: InvoicePreviewProps) {
  return (
    <div className="print-area">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{number}</p>
        </div>
        <StatusBadge variant={status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
          <p className="font-semibold text-gray-900 dark:text-white">{clientName}</p>
          <p className="text-gray-500 dark:text-gray-400">{clientEmail}</p>
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Issue Date: </span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(issueDate)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Due Date: </span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(dueDate)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 dark:text-gray-500">Terms: </span>
              <span className="text-gray-700 dark:text-gray-300">{getPaymentTermsLabel(paymentTerms)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items table */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-600">
            <th className="text-left py-2 font-semibold text-gray-600 dark:text-gray-300">Description</th>
            <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-300 w-16">Qty</th>
            <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-300 w-24">Unit Price</th>
            <th className="text-right py-2 font-semibold text-gray-600 dark:text-gray-300 w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <tr key={li.id} className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-2.5 text-gray-700 dark:text-gray-300">{li.description}</td>
              <td className="py-2.5 text-right text-gray-600 dark:text-gray-300">{li.quantity}</td>
              <td className="py-2.5 text-right text-gray-600 dark:text-gray-300">{formatCurrency(li.unitPrice)}</td>
              <td className="py-2.5 text-right font-medium text-gray-900 dark:text-white">
                {formatCurrency(li.quantity * li.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Tax ({taxRate}%)</span>
            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(taxAmount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Discount</span>
              <span className="text-red-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-gray-200 dark:border-gray-600 pt-2 mt-2">
            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="font-bold text-gray-900 dark:text-white text-base">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Notes</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{notes}</p>
        </div>
      )}
    </div>
  );
}
