import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Shield, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiGet<{ users: AdminUser[] }>('/admin/users?limit=500').then((r) => r.users ?? []),
  });

  const users = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, search]);

  const clientsCount = users.filter((u) => u.role !== 'admin').length;
  const adminsCount  = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">Personas registradas en la tienda.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total registrados" value={users.length} icon={Users} />
        <StatCard label="Clientes" value={clientsCount} icon={UserIcon} />
        <StatCard label="Administradores" value={adminsCount} icon={Shield} />
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <Input
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay usuarios para mostrar.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha de registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={u.role === 'admin' ? 'default' : 'secondary'}
                      className={cn(u.role === 'admin' ? 'bg-primary' : '')}
                    >
                      {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleString('es-AR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 flex items-center gap-3">
      <span className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
