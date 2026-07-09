import type { InvoiceStatus } from '../../types';

type BadgeVariant = InvoiceStatus | 'gentle' | 'friendly' | 'urgent';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  unpaid: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  overdue: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  gentle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  friendly: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  urgent: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
};

const labels: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
};

export default function StatusBadge({ variant, children, className = '' }: BadgeProps) {
  const display = children ?? labels[variant as InvoiceStatus] ?? variant;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${variantStyles[variant]} ${className}`}
    >
      {display}
    </span>
  );
}
