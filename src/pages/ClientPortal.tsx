import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { getClientInvoices, getClientByToken } from '../data/mockStore';
import StatusBadge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate, getPaymentTermsLabel, daysOverdue, daysUntilDue } from '../utils/format';

export default function ClientPortal() {
  const { token } = useParams<{ token: string }>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const client = token ? getClientByToken(token) : undefined;
  const invoices = token ? getClientInvoices(token) : [];

  if (!client) {
    return (
      <div className="px-4 sm:px-6 py-12 text-center">
        <EmptyState
          title="Invoice not found"
          description="This link may be invalid or has expired. Please contact the sender for an updated link."
        />
      </div>
    );
  }

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.total, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {client.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client.email}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Outstanding</p>
          <p className="text-lg font-bold text-amber-600">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Paid</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Invoices</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{invoices.length}</p>
        </div>
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet" description="Your invoices will appear here once they are created." />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const isExpanded = expandedId === inv.id;
            const dueInfo = inv.status === 'paid'
              ? 'Paid'
              : inv.status === 'overdue'
              ? `${daysOverdue(inv.dueDate)}d overdue`
              : `${daysUntilDue(inv.dueDate)}d remaining`;

            return (
              <div
                key={inv.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card overflow-hidden transition-all duration-200"
              >
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(inv.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{inv.number}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due {formatDate(inv.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(inv.total)}</p>
                      <p className={`text-xs ${
                        inv.status === 'overdue' ? 'text-red-500' : inv.status === 'unpaid' ? 'text-amber-600' : 'text-green-600'
                      }`}>{dueInfo}</p>
                    </div>
                    <StatusBadge variant={inv.status} />
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">Issue Date:</span>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{formatDate(inv.issueDate)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">Terms:</span>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{getPaymentTermsLabel(inv.paymentTerms)}</span>
                      </div>
                    </div>

                    <table className="w-full text-sm mb-4">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Description</th>
                          <th className="text-right py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 w-12">Qty</th>
                          <th className="text-right py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">Price</th>
                          <th className="text-right py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.lineItems.map((li) => (
                          <tr key={li.id} className="border-b border-gray-50 dark:border-gray-700">
                            <td className="py-1.5 text-gray-700 dark:text-gray-300">{li.description}</td>
                            <td className="py-1.5 text-right text-gray-600 dark:text-gray-300">{li.quantity}</td>
                            <td className="py-1.5 text-right text-gray-600 dark:text-gray-300">{formatCurrency(li.unitPrice)}</td>
                            <td className="py-1.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(li.quantity * li.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end mb-4">
                      <div className="w-52 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(inv.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Tax ({inv.taxRate}%)</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(inv.taxAmount)}</span>
                        </div>
                        {inv.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Discount</span>
                            <span className="text-red-600">-{formatCurrency(inv.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-1 font-semibold text-gray-900 dark:text-white">
                          <span>Total</span>
                          <span>{formatCurrency(inv.total)}</span>
                        </div>
                      </div>
                    </div>

                    {inv.notes && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Notes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{inv.notes}</p>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end print:hidden">
                      <Button variant="ghost" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>
                        Print
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
