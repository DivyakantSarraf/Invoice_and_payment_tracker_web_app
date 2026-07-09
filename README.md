# InvoiceFlow

A modern invoice and payment tracking application for freelancers and agencies. Create professional invoices in Indian Rupees (INR), share a self-service client portal, track payment status in real-time, and generate AI-powered payment reminders for overdue invoices — all from a clean, responsive dashboard with full dark mode support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Dark Mode](#dark-mode)
- [Currency & Tax](#currency--tax)
- [Data Persistence](#data-persistence)
- [Invoice Lifecycle](#invoice-lifecycle)
- [AI Payment Reminders](#ai-payment-reminders)
- [Client Portal](#client-portal)
- [Print / PDF Export](#print--pdf-export)
- [Component Reference](#component-reference)
- [Utility Functions](#utility-functions)

---

## Features

### Owner Dashboard
- **Stats overview** — Total Revenue, Total Paid, Total Unpaid, and Overdue count at a glance
- **Filter tabs** — Switch between All, Unpaid, Paid, and Overdue invoice views with live counts
- **Search** — Real-time search across client name, invoice number, and email
- **Sort** — Sort by Due Date, Amount, Client Name, or Status
- **Invoice cards** — Each card shows client name, amount, due date, days remaining/overdue, and status badge
- **Quick actions** — Per-card dropdown to Mark as Paid, Send Reminder, or Delete
- **Bulk actions** — Select multiple invoices to bulk mark as paid or bulk delete
- **Overdue auto-detection** — Statuses are automatically updated to Overdue when the due date passes

### Invoice Creation
- Client name and email fields
- Payment terms selector (Due on Receipt, Net 15, Net 30, Net 60) that auto-sets the due date
- Dynamic line items with Description, Quantity, Unit Price, and auto-calculated Amount
- GST tax rate input (defaults to 18%)
- Discount field in INR
- Auto-calculated subtotal, tax, discount, and grand total
- Notes / payment terms text field
- **Live preview mode** — toggle between edit and a formatted invoice preview before creating
- Success modal with a shareable client portal link and one-click copy

### Invoice Detail
- Full printable invoice layout with line items table
- Sidebar with actions: Mark as Paid, Generate AI Reminder, Download PDF, Copy Client Link, Delete
- Activity timeline showing created, issued, due, and paid events
- Confirmation dialogs for destructive actions
- Payment record showing date when invoice was marked paid

### Client Portal
- Shareable link per client (no login required for clients)
- Summary cards: Total Outstanding, Total Paid, Invoice Count
- Collapsible invoice list with full line-item breakdown
- Status badges and due date countdown per invoice
- Print button per invoice

### Client Directory
- Grid of all clients with their stats (invoices, paid, outstanding)
- Search/filter by name or email
- One-click copy of the client's portal link
- View button to open the portal as the client

### AI Payment Reminders
- Available on any overdue invoice
- Three tone levels based on days overdue:
  - **Gentle** (1–7 days) — soft, non-pushy reminder
  - **Friendly** (8–14 days) — polite but direct
  - **Urgent** (15+ days) — firm, professional urgency
- Animated loading state while the reminder is "generated"
- Displays subject line and full email body
- Actions: Copy Message, Open in Email (mailto link), Regenerate (randomizes wording)

### Admin Login
- Dedicated `/login` page with email/password authentication
- Password show/hide toggle
- Session persists in `localStorage` across page reloads
- Sign Out button in the sidebar clears the session and redirects to login
- Demo credentials shown on the login page for easy access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 (JIT) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Data | localStorage (no backend required) |
| Fonts | Inter (Google Fonts) |

---

## Project Structure

```
src/
├── App.tsx                        # Root router + provider tree
├── index.css                      # Global styles, print CSS, dark mode overrides
│
├── components/
│   ├── layout/
│   │   ├── OwnerLayout.tsx        # Admin sidebar + mobile header
│   │   └── ClientLayout.tsx       # Client-facing header + footer
│   └── ui/
│       ├── Badge.tsx              # Status badge (paid / unpaid / overdue / reminder tone)
│       ├── Button.tsx             # Primary, Secondary, Ghost, Danger variants
│       ├── EmptyState.tsx         # Centered empty state with icon + action
│       ├── Input.tsx              # Input, TextArea, and Select with labels + error states
│       └── Modal.tsx              # Accessible overlay modal with backdrop + ESC close
│
├── data/
│   └── mockStore.ts               # localStorage CRUD — invoices, clients, stats, search
│
├── hooks/
│   ├── useAuth.tsx                # Auth context (login / logout / session)
│   ├── useTheme.tsx               # Dark mode context (toggle + persist to localStorage)
│   └── useToast.tsx               # Toast notification context (success / error / info)
│
├── pages/
│   ├── LandingPage.tsx            # Marketing landing page
│   ├── LoginPage.tsx              # Admin login form
│   ├── Dashboard.tsx              # Invoice list with filters, search, sort, bulk actions
│   ├── CreateInvoice.tsx          # Invoice creation form + live preview
│   ├── InvoiceDetail.tsx          # Printable invoice + sidebar actions + AI reminder
│   ├── ClientPortal.tsx           # Client-facing invoice view (token-based)
│   └── ClientDirectory.tsx        # Client list with stats + portal links
│
├── types/
│   └── index.ts                   # TypeScript types (Invoice, LineItem, Client, etc.)
│
└── utils/
    ├── format.ts                  # Currency (INR), date formatters, payment term helpers
    └── reminder.ts                # AI reminder generator (tone selection + email copy)
```

---

## Pages & Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | `LandingPage` | Public |
| `/login` | `LoginPage` | Public |
| `/dashboard` | `Dashboard` | Admin |
| `/invoices/new` | `CreateInvoice` | Admin |
| `/invoices/:id` | `InvoiceDetail` | Admin |
| `/clients` | `ClientDirectory` | Admin |
| `/client/:token` | `ClientPortal` | Public (client link) |

Admin routes are wrapped in `OwnerLayout` (sidebar navigation). Client routes use `ClientLayout` (simple header + footer).

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd invoiceflow

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory. Preview the production build:

```bash
npm run preview
```

### Type Check

```bash
npm run build   # includes tsc via vite build
```

---

## Authentication

Authentication is handled entirely client-side using `localStorage`.

**Demo credentials:**
```
Email:    admin@invoiceflow.com
Password: admin123
```

The `useAuth` hook exposes:
- `authenticated` — boolean session state
- `login(email, password)` — validates credentials, sets session
- `logout()` — clears session, redirects to `/login`

> **Note:** This is demo authentication only. For production use, integrate with a real auth provider (e.g., Supabase Auth, Firebase, Auth0).

---

## Dark Mode

Dark mode is toggled via the `useTheme` hook and persists to `localStorage` under the key `invoiceFlowTheme`.

- Applies the `dark` class to `<html>` which enables Tailwind's `dark:` variant throughout
- Defaults to the OS preference on first visit (`prefers-color-scheme: dark`)
- Toggle buttons appear in:
  - Landing page nav bar (top right)
  - Admin sidebar (desktop)
  - Admin mobile header
  - Client portal header
  - Login page header

---

## Currency & Tax

All monetary values are displayed in **Indian Rupees (INR)** using the `en-IN` locale:

```ts
new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
}).format(amount)
// → ₹4,55,480.00
```

- Default tax rate for new invoices: **18% GST**
- Tax is calculated as: `subtotal × (taxRate / 100)`
- Grand total: `subtotal + taxAmount − discount`

---

## Data Persistence

All data is stored in `localStorage` under the key `invoiceTrackerStore`. No backend or database is required.

### Store version

A store version key (`invoiceTrackerVersion`) ensures stale data from previous app versions is replaced with fresh seed data. The current version is `2`.

### Seed Data

On first load (or when the store version changes), 6 seed invoices are loaded:

| # | Client | Status | Amount |
|---|--------|--------|--------|
| INV-001 | Acme Corp | Paid | ₹4,55,480 |
| INV-002 | Globex Inc | Paid | ₹9,04,000 |
| INV-003 | Wayne Enterprises | Unpaid | ₹4,60,200 |
| INV-004 | Stark Industries | Unpaid | ₹6,75,300 |
| INV-005 | Umbrella Corp | Overdue | ₹7,43,400 |
| INV-006 | Cyberdyne Systems | Overdue | ₹15,47,500 |

### Available Store Functions

```ts
getInvoices()                   // All invoices, newest first
getInvoiceById(id)              // Single invoice by ID
getClientInvoices(token)        // All invoices for a client token
getClientByToken(token)         // Client name + email for a token
getStats()                      // { totalRevenue, totalPaid, totalUnpaid, overdueCount, totalInvoices }
getClients()                    // Aggregated client stats
addInvoice(data)                // Create and persist a new invoice
markAsPaid(id)                  // Mark invoice as paid with timestamp
deleteInvoice(id)               // Remove a single invoice
bulkMarkAsPaid(ids[])           // Mark multiple invoices as paid
bulkDelete(ids[])               // Delete multiple invoices
searchInvoices(query)           // Search by client name, number, or email
```

---

## Invoice Lifecycle

```
Created (unpaid)
    ↓
Due date passes → auto-updated to Overdue
    ↓
Admin clicks "Mark as Paid" → status = paid, paymentRecord.paidAt set
```

Statuses are re-evaluated every time `updateStatuses()` runs (on app load and `getStats()` calls).

---

## AI Payment Reminders

The reminder generator (`src/utils/reminder.ts`) produces tone-appropriate email copy based on how many days overdue an invoice is:

| Days Overdue | Tone | Prefix |
|-------------|------|--------|
| 1–7 | Gentle | "Just a gentle reminder" |
| 8–14 | Friendly | "Friendly reminder" |
| 15+ | Urgent | "URGENT:" in subject |

Each tone has a pool of 3 closing sentences; one is selected randomly on each generate/regenerate. The output includes:
- `subject` — full email subject line
- `body` — multi-line email body with client name, invoice number, amount, and due date
- `tone` — `'gentle' | 'friendly' | 'urgent'`
- `daysOverdue` — number of days past the due date

---

## Client Portal

Each client gets a unique 8-character token generated when their first invoice is created. Subsequent invoices for the same client (matched by name, case-insensitive) reuse the same token.

The shareable URL format:
```
https://yourdomain.com/client/<token>
```

The portal is read-only — clients can view all their invoices, expand for line-item details, and print. No login required.

---

## Print / PDF Export

Clicking **Download PDF** or the print button triggers `window.print()`. The CSS in `index.css` hides all navigation, sidebars, action buttons, and modals during printing, leaving only the invoice document visible on a white background — even in dark mode.

---

## Component Reference

### `<Button>`
```tsx
<Button variant="primary | secondary | ghost | danger" size="sm | md | lg" loading={false} icon={<Icon />}>
  Label
</Button>
```

### `<StatusBadge>`
```tsx
<StatusBadge variant="paid | unpaid | overdue | gentle | friendly | urgent" />
```

### `<Modal>`
```tsx
<Modal open={boolean} onClose={fn} title="Optional title" maxWidth="max-w-lg">
  {children}
</Modal>
```

### `<Input>`, `<TextArea>`, `<Select>`
```tsx
<Input label="Label" error="Error message" placeholder="..." value={v} onChange={fn} />
<TextArea label="Notes" rows={4} value={v} onChange={fn} />
<Select label="Terms" options={[{ value: 'net-30', label: 'Net 30' }]} value={v} onChange={fn} />
```

### `<EmptyState>`
```tsx
<EmptyState icon={<Icon />} title="No results" description="..." action={<Button>Action</Button>} />
```

---

## Utility Functions

### `src/utils/format.ts`

| Function | Description |
|----------|-------------|
| `formatCurrency(amount)` | Formats a number as INR (e.g. `₹4,55,480.00`) |
| `formatDate(dateStr)` | Short date format (e.g. `Jun 17, 2026`) |
| `formatDateLong(dateStr)` | Long format (e.g. `June 17, 2026`) |
| `daysUntilDue(dueDate)` | Positive = days remaining, negative = days overdue |
| `daysOverdue(dueDate)` | Returns 0 if not overdue, else days past due |
| `getPaymentTermsLabel(terms)` | `'net-30'` → `'Net 30'` |
| `getDueDateFromTerms(terms)` | Returns ISO date string N days from today |

### `src/utils/reminder.ts`

| Function | Description |
|----------|-------------|
| `generateReminder(invoice)` | Generates a tone-appropriate reminder email |
| `regenerateReminder(invoice)` | Same as generate but randomizes closing sentence |

---

## License

MIT
