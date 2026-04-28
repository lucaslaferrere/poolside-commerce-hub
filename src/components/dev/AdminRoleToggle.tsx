// Archivo: src/components/dev/AdminRoleToggle.tsx
// Solo para DESARROLLO - testing del admin panel

import { Button } from '@/components/ui/button';
import { useAuth, type User } from '@/context/AuthContext';
import { useState } from 'react';

/**
 * ⚠️ SOLO PARA DESARROLLO
 * Este componente te permite cambiar tu role a 'admin' para testing
 * Elimina este archivo antes de ir a producción
 */
export function AdminRoleToggle() {
  const { user, setSession } = useAuth();
  const [isDevMode] = useState(() => {
    // Solo mostrar en desarrollo o si user@admin.local
    return process.env.NODE_ENV === 'development' || user?.email === 'user@admin.local';
  });

  if (!isDevMode || !user) return null;

  const handleToggleAdmin = () => {
    const newRole: User['role'] = user.role === 'admin' ? 'client' : 'admin';
    const updatedUser: User = { ...user, role: newRole };

    // Actualiza localStorage y state
    const token = localStorage.getItem('auth_token');
    if (token) {
      setSession(token, updatedUser);
    }

    console.log(`✅ Role cambiado a: ${newRole}`);
    console.log('Updated user:', updatedUser);
  };

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-warning text-warning-foreground rounded-md text-xs z-40">


      <Button
        size="sm"
        variant="outline"
        onClick={handleToggleAdmin}
        className="text-xs"
      >
        Toggle Admin Role
      </Button>

    </div>
  );
}

