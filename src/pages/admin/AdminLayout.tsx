import { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, ClipboardList, LayoutDashboard, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface TabDef {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const TABS: TabDef[] = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/orders',   label: 'Pedidos',   icon: ClipboardList },
];

interface AdminPageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container max-w-6xl pt-24 pb-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Admin identity strip */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium uppercase tracking-wide">Panel</span>
            <span className="text-neutral-300">·</span>
            <span className="truncate">{user?.email}</span>
            <Badge variant="secondary" className="ml-1 bg-brand/10 text-brand border-0 capitalize">
              admin
            </Badge>
          </div>
        </div>

        {/* Sub-nav tabs */}
        <nav
          className="flex items-center gap-1 mb-8 border-b border-neutral-200"
          aria-label="Secciones del panel"
        >
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 px-4 py-3 -mb-px text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-brand text-brand'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Routed page */}
        <Outlet key={location.pathname} />
      </div>
    </div>
  );
}
