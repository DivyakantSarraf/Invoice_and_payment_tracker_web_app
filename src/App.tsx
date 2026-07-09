import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import OwnerLayout from './components/layout/OwnerLayout';
import ClientLayout from './components/layout/ClientLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import ClientPortal from './pages/ClientPortal';
import ClientDirectory from './pages/ClientDirectory';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<OwnerLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoices/new" element={<CreateInvoice />} />
                <Route path="/invoices/:id" element={<InvoiceDetail />} />
                <Route path="/clients" element={<ClientDirectory />} />
              </Route>
              <Route element={<ClientLayout />}>
                <Route path="/client/:token" element={<ClientPortal />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
