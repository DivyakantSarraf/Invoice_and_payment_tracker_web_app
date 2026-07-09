import type { Invoice, ReminderResult, ReminderTone } from '../types';
import { formatCurrency, formatDateLong, daysOverdue } from './format';

function getTone(days: number): ReminderTone {
  if (days <= 7) return 'gentle';
  if (days <= 14) return 'friendly';
  return 'urgent';
}

const GENTLE_CLOSINGS = [
  'I understand things can slip through — just wanted to make sure this was on your radar.',
  'No rush, just a friendly nudge to keep things on track.',
  'I know you\'re busy, so just a quick heads-up on this one.',
];

const FRIENDLY_CLOSINGS = [
  'I\'d appreciate it if you could look into this at your earliest convenience.',
  'Please let me know if you need any additional information to process this payment.',
  'I\'m happy to discuss payment arrangements if needed — just let me know.',
];

const URGENT_CLOSINGS = [
  'This invoice is now significantly past due. I\'d appreciate your immediate attention to this matter.',
  'Please prioritize this payment at your earliest opportunity. If there are any issues, I\'d like to resolve them promptly.',
  'As this is well past the due date, I\'d like to settle this matter soon. Please reach out if there are any concerns.',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateReminder(invoice: Invoice): ReminderResult {
  const overdue = daysOverdue(invoice.dueDate);
  const tone = getTone(overdue);

  const closings = {
    gentle: GENTLE_CLOSINGS,
    friendly: FRIENDLY_CLOSINGS,
    urgent: URGENT_CLOSINGS,
  };

  const closing = pickRandom(closings[tone]);

  const tonePrefixes: Record<ReminderTone, string> = {
    gentle: 'Just a gentle reminder',
    friendly: 'Friendly reminder',
    urgent: 'Important notice',
  };

  const subject = `${
    tone === 'urgent' ? 'URGENT: ' : ''
  }Invoice ${invoice.number} Payment Reminder — ${formatCurrency(invoice.total)}`;

  const body = `Hi ${invoice.clientName},

${tonePrefixes[tone]} that Invoice #${invoice.number} for ${formatCurrency(invoice.total)} was due on ${formatDateLong(invoice.dueDate)} and is now ${overdue} day${overdue !== 1 ? 's' : ''} overdue.

${closing}

Thank you!`;

  return { tone, subject, body, daysOverdue: overdue };
}

export function regenerateReminder(invoice: Invoice): ReminderResult {
  return generateReminder(invoice);
}
