import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RootLayout } from '@/components/layout/RootLayout';
import Index from './pages/Index.tsx';
import NotFound from './pages/NotFound.tsx';
import Register from './pages/Register.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import TiendaPage from './pages/TiendaPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminProducts from './pages/admin/Products.tsx';
import AdminOrdersPage from './pages/admin/OrdersPage.tsx';
import AdminKitsPage from './pages/admin/Kits.tsx';
import WarrantyPage from './pages/WarrantyPage.tsx';
import KitDetailPage from './pages/KitDetailPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import TransferInstructionsPage from './pages/TransferInstructionsPage.tsx';

function PageViewTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/admin')) {
      trackPageView(pathname);
    }
  }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageViewTracker />
          <RootLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="kits" element={<AdminKitsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
              </Route>

              <Route path="/tienda" element={<TiendaPage />} />
              <Route path="/tienda/:id" element={<ProductDetailPage />} />
              <Route path="/kits/:id" element={<KitDetailPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/garantia" element={<WarrantyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/transferencia/:orderId" element={<TransferInstructionsPage />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RootLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
