import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, ShieldPlus, User as UserIcon, UserPlus, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'client';
  created_at: string;
}

const ROLE_META: Record<AdminUser['role'], { label: string; className: string }> = {
  superadmin: { label: 'Superadmin', className: 'bg-violet-600 text-white hover:bg-violet-600' },
  admin: { label: 'Administrador', className: 'bg-primary' },
  client: { label: 'Cliente', className: '' },
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const isSuperadmin = me?.role === 'superadmin';
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [demoteTarget, setDemoteTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

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

  const clientsCount = users.filter((u) => u.role === 'client').length;
  const adminsCount = users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  const invite = useMutation({
    mutationFn: () => apiPost('/admin/users/invite-admin', { email: inviteEmail.trim() }),
    onSuccess: () => {
      invalidate();
      toast.success('Invitación enviada', { description: `${inviteEmail} recibió un mail para definir su contraseña.` });
      setInviteOpen(false);
      setInviteEmail('');
    },
    onError: (e: Error) => {
      const detail = e instanceof ApiError ? e.detail : e.message;
      toast.error('No se pudo invitar', { description: detail });
    },
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'client' }) =>
      apiPatch(`/admin/users/${id}/role`, { role }),
    onSuccess: (_, { role }) => {
      invalidate();
      toast.success(role === 'admin' ? 'Ahora es administrador' : 'Ya no es administrador');
      setDemoteTarget(null);
    },
    onError: (e: Error) => {
      const detail = e instanceof ApiError ? e.detail : e.message;
      toast.error('No se pudo cambiar el rol', { description: detail });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/users/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario eliminado');
      setDeleteTarget(null);
    },
    onError: (e: Error) => {
      const detail = e instanceof ApiError ? e.detail : e.message;
      toast.error('No se pudo eliminar', { description: detail });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">Personas registradas en la tienda.</p>
        </div>
        {isSuperadmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invitar admin
          </Button>
        )}
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
                {isSuperadmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filtered.map((u) => {
                const meta = ROLE_META[u.role];
                const isSelf = u.id === me?.id;
                // No se puede actuar sobre uno mismo, ni sobre otro superadmin
                // (eso es manual/seed) — el backend ya lo bloquea, acá lo reflejamos.
                const canManage = isSuperadmin && !isSelf && u.role !== 'superadmin';
                return (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {u.email} {isSelf && <span className="text-xs text-muted-foreground">(vos)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'client' ? 'secondary' : 'default'} className={cn(meta.className)}>
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleString('es-AR') : '—'}
                    </td>
                    {isSuperadmin && (
                      <td className="px-4 py-3">
                        {canManage && (
                          <div className="flex items-center justify-end gap-1">
                            {u.role === 'client' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => changeRole.mutate({ id: u.id, role: 'admin' })}
                                disabled={changeRole.isPending}
                              >
                                <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
                                Hacer admin
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setDemoteTarget(u)}>
                                <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
                                Quitar admin
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-danger hover:bg-danger/10"
                              onClick={() => setDeleteTarget(u)}
                              aria-label={`Eliminar ${u.email}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invitar admin */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldPlus className="h-4 w-4 text-primary" />
              Invitar administrador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Le mandamos un mail para que defina su propia contraseña. Si ya tiene cuenta como cliente, se lo promueve.
            </p>
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => invite.mutate()}
              disabled={!inviteEmail.trim() || invite.isPending}
            >
              {invite.isPending ? 'Invitando...' : 'Invitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quitar admin */}
      <AlertDialog open={!!demoteTarget} onOpenChange={(o) => !o && setDemoteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar rol de administrador</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{demoteTarget?.email}</strong> va a pasar a ser cliente y pierde el acceso al panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => demoteTarget && changeRole.mutate({ id: demoteTarget.id, role: 'client' })}
              disabled={changeRole.isPending}
            >
              {changeRole.isPending ? 'Aplicando...' : 'Quitar admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Eliminar usuario */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-danger" />
              Eliminar usuario
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminás a <strong>{deleteTarget?.email}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}
              disabled={remove.isPending}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {remove.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
