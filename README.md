# InvoiceFlow — Invoice & Payment Tracker with Client Portal

A modern, full-stack invoice management web app built for freelancers and small businesses who are tired of tracking payments in Excel and sending invoices over WhatsApp. Create invoices, share a secure client portal link, track payment status, and let AI write your payment reminders for you.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-e7u3zmvx)

---

## About

This project was built during a **vibe coding hackathon event** — a competition where participants build a working web app prototype in 2.5 hours using AI-assisted development tools, with no manual coding required. The problem statement given was:

> *"I send invoices over WhatsApp as PDFs and track payments in Excel. It's embarrassing and I keep losing track. I want a proper tool where I can create invoices, and my clients can log in and view what they owe me — and see when they've paid."*

InvoiceFlow was built entirely through natural-language prompts in **Bolt.new**, following the must-have requirements: invoice creation with line items, status tracking (Unpaid/Paid/Overdue), a shareable client portal, and an AI feature that generates polite payment reminder messages for overdue invoices.

The result is a fully working, production-styled prototype demonstrating how far AI-assisted "vibe coding" can take a non-trivial business application in a very short timeframe.

---

## Features

### Owner Dashboard
- Real-time stats: total revenue, total paid, total unpaid, overdue count
- Filterable invoice list (All / Unpaid / Paid / Overdue) with live counts
- Search invoices by client name, invoice number, or email
- Sort by due date, amount, client name, or status
- Bulk actions — select multiple invoices to mark as paid or delete at once
- Quick actions per invoice via dropdown menu (view, mark paid, send reminder, delete)

### Invoice Creation
- Dynamic line items — add or remove rows on the fly
- Auto-calculated subtotal, tax, discount, and grand total
- Configurable payment terms (Due on Receipt, Net 15, Net 30, Net 60) with auto due-date calculation
- Live invoice preview before submission
- Auto-generated sequential invoice numbers (INV-001, INV-002...)
- Instantly generates a unique shareable client portal link on creation

### Invoice Detail Page
- Clean, professional, print-ready invoice layout
- Activity timeline (created, issued, due/overdue, paid)
- Mark as Paid with confirmation dialog
- Generate AI Reminder (overdue invoices only)
- Copy client portal link, download as PDF (via browser print), delete invoice

### Client Portal
- Public, token-based link — no login required for clients
- Each client sees only their own invoices
- Expandable invoice cards with full line-item breakdown
- Read-only — clients cannot edit or delete anything
- Print-friendly invoice view

### Client Directory
- Auto-aggregated list of all clients derived from invoice data
- Per-client stats: invoice count, total invoiced, total paid, outstanding balance
- One-click copy of each client's portal link
- Search clients by name or email

### AI-Powered Payment Reminders
- Generates a polite, ready-to-send reminder message for any overdue invoice
- Tone automatically adjusts based on days overdue:
  - **Gentle** (1–7 days overdue)
  - **Friendly** (8–14 days overdue)
  - **Urgent** (15+ days overdue)
- One-click regenerate for a different message variation
- Copy to clipboard or open directly in the client's email app

### Other
- Light/dark mode toggle, persisted across sessions
- Toast notifications for all key actions
- Owner authentication (demo credentials, localStorage-based session)
- Fully responsive across desktop, tablet, and mobile
- Print stylesheet that hides navigation/buttons for clean PDF export

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Data layer | In-browser mock store (localStorage-backed) |
| Optional backend | Supabase client included (not yet wired up) |

No backend server is required to run this project — all data is generated and persisted client-side via `localStorage`, making it fully self-contained for demo purposes.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Type-check

```bash
npm run typecheck
```

---

## Demo Credentials

To access the owner dashboard, log in with:

```
Email:    admin@invoiceflow.com
Password: admin123
```

The client portal requires no login — every invoice automatically generates a shareable link in the format `/client/[token]`, viewable from the Client Directory or right after creating an invoice.

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # OwnerLayout (sidebar nav), ClientLayout
│   └── ui/             # Reusable Button, Input, Modal, Badge, EmptyState
├── data/
│   └── mockStore.ts    # In-memory + localStorage data layer, CRUD operations
├── hooks/
│   ├── useAuth.tsx      # Owner authentication context
│   ├── useTheme.tsx     # Dark/light mode context
│   └── useToast.tsx     # Toast notification system
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── Dashboard.tsx
│   ├── CreateInvoice.tsx
│   ├── InvoiceDetail.tsx
│   ├── ClientPortal.tsx
│   └── ClientDirectory.tsx
├── types/
│   └── index.ts         # Invoice, Client, LineItem, ReminderResult types
├── utils/
│   ├── format.ts        # Currency, date, and due-date helpers
│   └── reminder.ts       # AI reminder generation logic
└── App.tsx               # Route definitions
```

---

## How the AI Reminder Works

The `generateReminder` function in `src/utils/reminder.ts` calculates how many days an invoice is overdue, selects an appropriate tone (gentle, friendly, or urgent), and assembles a personalized message using the client's name, invoice number, amount, and due date — combined with a randomly selected closing line appropriate to that tone. The result is a ready-to-send, WhatsApp- or email-friendly message generated without any manual writing required from the owner.

---

## Known Limitations

- Data is stored in `localStorage`, so it is scoped to a single browser and will reset if storage is cleared. A Supabase or other backend integration would be needed for true multi-device persistence.
- Authentication is a single hardcoded demo account, intended for prototype/demo purposes only.
- The AI reminder generator uses template-based logic rather than a live LLM API call, by design, for offline-reliable demo behavior.

---

## License

This project was built as a hackathon prototype and is provided as-is for demonstration purposes.
