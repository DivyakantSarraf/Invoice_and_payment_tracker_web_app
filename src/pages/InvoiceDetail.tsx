import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  Bell,
  Printer,
  Copy,
  Trash2,
  Mail,
  RotateCw,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { getInvoiceById, markAsPaid, deleteInvoice } from '../data/mockStore';
import StatusBadge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { formatCurrency, formatDate, formatDateLong, daysOverdue, getPaymentTermsLabel } from '../utils/format';
import { generateReminder, regenerateReminder } from '../utils/reminder';
import { useToast } from '../hooks/useToast';
import type { ReminderResult } from '../types';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const inv = id ? getInvoiceById(id) : undefined;
  const [showReminder, setShowReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderResult, setReminderResult] = useState<ReminderResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaidConfirm, setShowPaidConfirm] = useState(false);

  const handleMarkPaid = () => {
    if (!id) return;
    markAsPaid(id);
    toast.success('Invoice marked as paid');
    setShowPaidConfirm(false);
  };

  const handleDelete = () => {
    if (!id) return;
    deleteInvoice(id);
    toast.info('Invoice deleted');
    navigate('/dashboard');
  };

  const handleGenerateReminder = useCallback(() => {
    if (!inv) return;
    setShowReminder(true);
    setReminderLoading(true);
    setReminderResult(null);
    setTimeout(() => {
      setReminderResult(generateReminder(inv));
      setReminderLoading(false);
    }, 1500);
  }, [inv]);

  const handleRegenerate = () => {
    if (!inv) return;
    setReminderLoading(true);
    setReminderResult(null);
    setTimeout(() => {
      setReminderResult(regenerateReminder(inv));
      setReminderLoading(false);
    }, 1200);
  };

  const handleCopyReminder = async () => {
    if (!reminderResult) return;
    const text = `Subject: ${reminderResult.subject}\n\n${reminderResult.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Reminder copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyLink = async () => {
    if (!inv) return;
    const link = `${window.location.origin}/client/${inv.clientToken}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Client link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handlePrint = () => window.print();

  const handleEmailReminder = () => {
    if (!inv || !reminderResult) return;
    const subject = encodeURIComponent(reminderResult.subject);
    const body = encodeURIComponent(reminderResult.body);
    window.open(`mailto:${inv.clientEmail}?subject=${subject}&body=${body}`);
  };

  if (!inv) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Invoice not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const overdueDays = daysOverdue(inv.dueDate);

  const timelineEvents = [
    { date: inv.createdAt, label: 'Invoice Created', icon: FileText },
    { date: inv.issueDate, label: 'Invoice Issued', icon: Calendar },
    ...(inv.status === 'overdue'
      ? [{ date: inv.dueDate, label: `Became Overdue (${overdueDays}d)`, icon: DollarSign }]
      : inv.status === 'unpaid'
      ? [{ date: inv.dueDate, label: 'Due Date', icon: Calendar }]
      : []),
    ...(inv.paymentRecord
      ? [{ date: inv.paymentRecord.paidAt, label: 'Payment Received', icon: Check }]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Invoice Document */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 print-area">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">{inv.number}</p>
            </div>
            <StatusBadge variant={inv.status} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
              <p className="font-semibold text-gray-900 dark:text-white">{inv.clientName}</p>
              <p className="text-gray-500 dark:text-gray-400">{inv.clientEmail}</p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Issue Date: </span>
                  <span className="text-gray-700 dark:text-gray-300">{formatDate(inv.issueDate)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Due Date: </span>
                  <span className="text-gray-700 dark:text-gray-300">{formatDate(inv.dueDate)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Terms: </span>
                  <span className="text-gray-700 dark:text-gray-300">{getPaymentTermsLabel(inv.paymentTerms)}</span>
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
              {inv.lineItems.map((li) => (
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
                <span className="text-gray-700 dark:text-gray-300">{formatCurrency(inv.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax ({inv.taxRate}%)</span>
                <span className="text-gray-700 dark:text-gray-300">{formatCurrency(inv.taxAmount)}</span>
              </div>
              {inv.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Discount</span>
                  <span className="text-red-600">-{formatCurrency(inv.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white text-base">{formatCurrency(inv.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {inv.notes && (
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 print:hidden">
          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
            {inv.status !== 'paid' && (
              <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Check className="w-4 h-4" />} onClick={() => setShowPaidConfirm(true)}>
                Mark as Paid
              </Button>
            )}
            {inv.status === 'overdue' && (
              <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Bell className="w-4 h-4" />} onClick={handleGenerateReminder}>
                Generate Reminder
              </Button>
            )}
            <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Download PDF
            </Button>
            <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Copy className="w-4 h-4" />} onClick={handleCopyLink}>
              Copy Client Link
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:bg-red-50" icon={<Trash2 className="w-4 h-4" />} onClick={() => setShowDeleteConfirm(true)}>
              Delete Invoice
            </Button>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Activity</h3>
            <div className="space-y-4">
              {timelineEvents.map((ev, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      <ev.icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    {idx < timelineEvents.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 dark:bg-gray-600 mt-1" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{ev.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(ev.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment info */}
          {inv.paymentRecord && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Payment Received</h3>
              <p className="text-sm text-green-800">{formatDateLong(inv.paymentRecord.paidAt)}</p>
            </div>
          )}

          {inv.status === 'overdue' && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Overdue</h3>
              <p className="text-sm text-red-800">
                {overdueDays} day{overdueDays !== 1 ? 's' : ''} past due date ({formatDateLong(inv.dueDate)})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mark as Paid confirmation */}
      <Modal open={showPaidConfirm} onClose={() => setShowPaidConfirm(false)} title="Mark as Paid?">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to mark invoice {inv.number} ({formatCurrency(inv.total)}) as paid?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowPaidConfirm(false)}>Cancel</Button>
          <Button size="sm" onClick={handleMarkPaid}>Confirm</Button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Invoice?">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          This will permanently delete invoice {inv.number}. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* AI Reminder Modal */}
      <Modal open={showReminder} onClose={() => { setShowReminder(false); setReminderResult(null); }} title="AI Payment Reminder" maxWidth="max-w-xl">
        {reminderLoading ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI is crafting your reminder...</p>
          </div>
        ) : reminderResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge variant={reminderResult.tone} />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {reminderResult.daysOverdue} day{reminderResult.daysOverdue !== 1 ? 's' : ''} overdue
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Subject</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                {reminderResult.subject}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Message</p>
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-3 whitespace-pre-line">
                {reminderResult.body}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} onClick={handleCopyReminder}>
                {copied ? 'Copied!' : 'Copy Message'}
              </Button>
              <Button variant="secondary" size="sm" icon={<Mail className="w-4 h-4" />} onClick={handleEmailReminder}>
                Open in Email
              </Button>
              <Button variant="ghost" size="sm" icon={<RotateCw className="w-4 h-4" />} onClick={handleRegenerate}>
                Regenerate
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
