import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  method: string;
  route: string;
  path: string;
  label: string;
  details?: string;
  status_code: number;
  created_at: string;
}

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export function useAuditLogs(params: { page: number; limit: number; adminId?: string; from?: string; to?: string }) {
  const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.adminId) qs.set('admin_id', params.adminId);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);

  return useQuery({
    queryKey: ['admin', 'audit-logs', params.page, params.limit, params.adminId, params.from, params.to] as const,
    queryFn: () => apiGet<AuditLogsResponse>(`/admin/audit-logs?${qs}`),
  });
}

export interface AdminOption {
  id: string;
  email: string;
}

export function useAuditLogAdmins() {
  return useQuery({
    queryKey: ['admin', 'audit-logs', 'admins'] as const,
    queryFn: () => apiGet<{ admins: AdminOption[] }>('/admin/audit-logs/admins').then((r) => r.admins ?? []),
  });
}
