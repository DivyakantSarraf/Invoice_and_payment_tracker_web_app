import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { getClients } from '../data/mockStore';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/format';
import { useToast } from '../hooks/useToast';

export default function ClientDirectory() {
  const navigate = useNavigate();
  const toast = useToast();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const clients = getClients().filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = async (token: string) => {
    const link = `${window.location.origin}/client/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success('Client portal link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">No clients found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.token}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {client.name.charAt(0)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Invoices</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.invoiceCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Paid</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(client.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Outstanding</p>
                  <p className="text-sm font-semibold text-amber-600">{formatCurrency(client.outstanding)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  icon={
                    copiedToken === client.token ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                  onClick={() => handleCopyLink(client.token)}
                >
                  {copiedToken === client.token ? 'Copied!' : 'Portal Link'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/client/${client.token}`)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
