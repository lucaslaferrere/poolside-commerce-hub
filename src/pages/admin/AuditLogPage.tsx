import { useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/admin/TablePagination';
import { useAuditLogs, useAuditLogAdmins } from '@/hooks/useAuditLogs';
import { AdminPageHeader } from './AdminLayout';

const LIMIT = 30;
const ALL_ADMINS = 'all';

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [adminId, setAdminId] = useState(ALL_ADMINS);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: admins = [] } = useAuditLogAdmins();
  const { data, isLoading, isError, refetch, isFetching } = useAuditLogs({
    page,
    limit: LIMIT,
    adminId: adminId === ALL_ADMINS ? undefined : adminId,
    from: from || undefined,
    to: to || undefined,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const resetToFirstPage = () => setPage(1);

  return (
    <>
      <AdminPageHeader
        title="Actividad de administradores"
        description="Quién hizo qué cambio y cuándo."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      {isError && (
        <div className="flex items-center justify-between p-4 mb-6 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-sm text-danger font-medium">No se pudo cargar la actividad.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Select value={adminId} onValueChange={(v) => { setAdminId(v); resetToFirstPage(); }}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Todos los administradores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ADMINS}>Todos los administradores</SelectItem>
            {admins.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); resetToFirstPage(); }}
          className="w-full sm:w-[160px]"
          aria-label="Desde"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); resetToFirstPage(); }}
          className="w-full sm:w-[160px]"
          aria-label="Hasta"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sin actividad registrada todavía.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detalle</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {logs.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 font-medium">{entry.admin_email || '—'}</td>
                  <td className="px-4 py-3">{entry.label}</td>
                  <td className="px-4 py-3 max-w-[320px] text-xs text-muted-foreground">
                    {entry.details || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant="outline"
                      className={
                        entry.status_code < 300
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          : 'border-danger/30 text-danger bg-danger/5'
                      }
                    >
                      {entry.status_code}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isError && total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <span className="text-sm text-neutral-500 tabular-nums">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
          </span>
          <TablePagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
