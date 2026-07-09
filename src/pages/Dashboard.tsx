import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  Check,
  Trash2,
  Bell,
  Eye,
  X,
} from 'lucide-react';
import { getInvoices, getStats, markAsPaid, bulkMarkAsPaid, bulkDelete, deleteInvoice, searchInvoices } from '../data/mockStore';
import StatusBadge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate, daysUntilDue, daysOverdue } from '../utils/format';
import { useToast } from '../hooks/useToast';
import type { Invoice, InvoiceStatus } from '../types';

type FilterTab = 'all' | InvoiceStatus;
type SortKey = 'dueDate' | 'amount' | 'clientName' | 'status';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('dueDate');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkBar, setShowBulkBar] = useState(false);

  const stats = useMemo(() => getStats(), [filter]);
  const invoices = useMemo(() => {
    let list = searchQuery ? searchInvoices(searchQuery) : getInvoices();
    if (filter !== 'all') list = list.filter((i) => i.status === filter);

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'amount':
          return b.total - a.total;
        case 'clientName':
          return a.clientName.localeCompare(b.clientName);
        case 'status': {
          const order: Record<InvoiceStatus, number> = { overdue: 0, unpaid: 1, paid: 2 };
          return order[a.status] - order[b.status];
        }
        default:
          return 0;
      }
    });
  }, [filter, searchQuery, sortBy]);

  const filteredCounts = useMemo(() => {
    const all = getInvoices();
    return {
      all: all.length,
      unpaid: all.filter((i) => i.status === 'unpaid').length,
      paid: all.filter((i) => i.status === 'paid').length,
      overdue: all.filter((i) => i.status === 'overdue').length,
    };
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setShowBulkBar(next.size > 0);
  };

  const toggleSelectAll = () => {
    if (selected.size === invoices.length) {
      setSelected(new Set());
      setShowBulkBar(false);
    } else {
      setSelected(new Set(invoices.map((i) => i.id)));
      setShowBulkBar(true);
    }
  };

  const handleBulkPaid = () => {
    const count = bulkMarkAsPaid([...selected]);
    toast.success(`${count} invoice${count !== 1 ? 's' : ''} marked as paid`);
    setSelected(new Set());
    setShowBulkBar(false);
  };

  const handleBulkDelete = () => {
    const count = bulkDelete([...selected]);
    toast.info(`${count} invoice${count !== 1 ? 's' : ''} deleted`);
    setSelected(new Set());
    setShowBulkBar(false);
  };

  const handleQuickPaid = (id: string) => {
    markAsPaid(id);
    toast.success('Invoice marked as paid');
  };

  const handleQuickDelete = (id: string) => {
    deleteInvoice(id);
    toast.info('Invoice deleted');
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
    { label: 'Total Paid', value: formatCurrency(stats.totalPaid), icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
    { label: 'Total Unpaid', value: formatCurrency(stats.totalUnpaid), icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
    { label: 'Overdue', value: String(stats.overdueCount), icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/new')}>
          New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
                  ({filteredCounts[tab.key as keyof typeof filteredCounts]})
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="amount">Amount</option>
              <option value="clientName">Client Name</option>
              <option value="status">Status</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Select all */}
          {invoices.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selected.size === invoices.length && invoices.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Select All
            </label>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-3 mb-4 flex items-center gap-3 animate-slide-up print:hidden">
          <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" icon={<Check className="w-3.5 h-3.5" />} onClick={handleBulkPaid}>
            Mark Paid
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleBulkDelete}>
            Delete
          </Button>
          <button
            onClick={() => { setSelected(new Set()); setShowBulkBar(false); }}
            className="p-1 text-primary-600 dark:text-primary-400 hover:text-primary-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invoice grid */}
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description={searchQuery ? 'Try adjusting your search query' : 'Create your first invoice to get started'}
          action={
            !searchQuery && (
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/invoices/new')}>
                New Invoice
              </Button>
            )
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv, idx) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              index={idx}
              selected={selected.has(inv.id)}
              onToggleSelect={() => toggleSelect(inv.id)}
              onView={() => navigate(`/invoices/${inv.id}`)}
              onQuickPaid={() => handleQuickPaid(inv.id)}
              onQuickDelete={() => handleQuickDelete(inv.id)}
              onGenerateReminder={() => navigate(`/invoices/${inv.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface InvoiceCardProps {
  invoice: Invoice;
  index: number;
  selected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onQuickPaid: () => void;
  onQuickDelete: () => void;
  onGenerateReminder: () => void;
}

function InvoiceCard({
  invoice: inv,
  index,
  selected,
  onToggleSelect,
  onView,
  onQuickPaid,
  onQuickDelete,
  onGenerateReminder,
}: InvoiceCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const dueInfo = inv.status === 'paid'
    ? 'Paid'
    : inv.status === 'overdue'
    ? `${daysOverdue(inv.dueDate)}d overdue`
    : `${daysUntilDue(inv.dueDate)}d remaining`;

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up ${
        selected ? 'border-primary-400 ring-1 ring-primary-200 dark:ring-primary-700' : 'border-gray-100 dark:border-gray-700'
      }`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      <div className="p-4">
        {/* Top row: checkbox + menu */}
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{inv.number}</span>
          </label>
          <div className="relative print:hidden">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-modal border border-gray-100 dark:border-gray-700 py-1 text-sm animate-fade-in">
                  <button
                    onClick={(e) => { e.stopPropagation(); onView(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  {inv.status !== 'paid' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onQuickPaid(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Check className="w-4 h-4" /> Mark as Paid
                    </button>
                  )}
                  {inv.status === 'overdue' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onGenerateReminder(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    >
                      <Bell className="w-4 h-4" /> Send Reminder
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onQuickDelete(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Client name */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">{inv.clientName}</h3>

        {/* Amount */}
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-3">{formatCurrency(inv.total)}</p>

        {/* Due date & status */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Due {formatDate(inv.dueDate)}
            <span className={`ml-2 ${
              inv.status === 'overdue' ? 'text-red-500 font-medium' : inv.status === 'unpaid' ? 'text-amber-600' : 'text-green-600'
            }`}>
              {dueInfo}
            </span>
          </div>
          <StatusBadge variant={inv.status} />
        </div>
      </div>

      {/* Clickable overlay */}
      <button
        onClick={onView}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="View invoice"
      />
    </div>
  );
}
