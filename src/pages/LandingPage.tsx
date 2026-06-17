import { useNavigate } from 'react-router-dom';
import { FileText, Send, BarChart3, Users, ArrowRight, Quote, Moon, Sun } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';

const features = [
  {
    icon: Send,
    title: 'Send Professional Invoices',
    desc: 'Create polished invoices in seconds with auto-calculated totals, taxes, and discounts.',
  },
  {
    icon: BarChart3,
    title: 'Track Payments at a Glance',
    desc: 'Know exactly what\'s paid, pending, or overdue with real-time status tracking.',
  },
  {
    icon: Users,
    title: 'Client Portal Access',
    desc: 'Give clients a self-service portal to view their invoices anytime, no login needed.',
  },
  {
    icon: FileText,
    title: 'AI-Powered Reminders',
    desc: 'Generate polite, tone-appropriate payment reminders with one click.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    quote: 'I used to dread chasing payments. Now I just click "Generate Reminder" and the AI writes the perfect follow-up.',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Agency Owner',
    quote: 'The client portal alone saved me hours every week. Clients check their own invoices instead of emailing me.',
  },
  {
    name: 'Emily Park',
    role: 'Consultant',
    quote: 'Finally stopped using spreadsheets. The dashboard tells me everything I need at a glance.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">InvoiceFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Now in public beta
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Stop tracking invoices{' '}
            <span className="text-primary-600 dark:text-primary-400">in Excel</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            A smarter way to create, track, and collect on invoices. Give your clients a portal,
            let AI chase overdue payments, and always know where your money stands.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')} icon={<ArrowRight className="w-5 h-5" />}>
              Get Started — It's Free
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              View Demo Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Everything you need to get paid</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              No more spreadsheets, no more awkward follow-ups. InvoiceFlow handles it all.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              ['1,200+', 'Invoices Tracked'],
              ['₹2Cr+', 'Payments Received'],
              ['350+', 'Happy Freelancers'],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-bold text-white">{num}</p>
                <p className="text-sm text-primary-200 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Loved by freelancers & agencies</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
              >
                <Quote className="w-6 h-6 text-primary-300 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{t.quote}</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ready to get paid faster?</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            Start tracking invoices in under a minute. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/login')} icon={<ArrowRight className="w-5 h-5" />}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">InvoiceFlow</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">2024 InvoiceFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
