export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysOverdue(dueDate: string): number {
  const days = daysUntilDue(dueDate);
  return days < 0 ? Math.abs(days) : 0;
}

export function getPaymentTermsLabel(terms: string): string {
  const labels: Record<string, string> = {
    'due-on-receipt': 'Due on Receipt',
    'net-15': 'Net 15',
    'net-30': 'Net 30',
    'net-60': 'Net 60',
  };
  return labels[terms] ?? terms;
}

export function getDueDateFromTerms(terms: string): string {
  const days: Record<string, number> = {
    'due-on-receipt': 0,
    'net-15': 15,
    'net-30': 30,
    'net-60': 60,
  };
  const d = new Date();
  d.setDate(d.getDate() + (days[terms] ?? 30));
  return d.toISOString().split('T')[0];
}
