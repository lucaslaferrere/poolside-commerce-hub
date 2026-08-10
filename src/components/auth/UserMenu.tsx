import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ShoppingBag, LayoutDashboard, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from './LoginModal';
import { cn } from '@/lib/utils';

interface Props {
  scrolled: boolean;
}

export function UserMenu({ scrolled }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { openAuth?: boolean })?.openAuth) {
      setLoginOpen(true);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const iconClass = cn(
    scrolled ? '' : 'text-white hover:bg-white/10 hover:text-white',
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLoginOpen(true)}
          aria-label="Iniciar sesión"
          className={iconClass}
        >
          <User className="h-5 w-5" />
        </Button>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menú de usuario"
          className={cn('relative', iconClass)}
        >
          <UserCircle2 className="h-5 w-5" />
          <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-secondary border-2 border-background" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal pb-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
            Sesión iniciada como
          </p>
          <p className="text-sm font-semibold truncate">{user?.email}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{user?.role}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate('/orders')}>
          <ShoppingBag className="h-4 w-4" />
          Mis Pedidos
        </DropdownMenuItem>

        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <LayoutDashboard className="h-4 w-4" />
            Panel Admin
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
