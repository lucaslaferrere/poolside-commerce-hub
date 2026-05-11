import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import WarrantyPage from './pages/WarrantyPage.tsx';

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              </Route>

              <Route path="/tienda" element={<TiendaPage />} />
              <Route path="/tienda/:id" element={<ProductDetailPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/garantia" element={<WarrantyPage />} />

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
