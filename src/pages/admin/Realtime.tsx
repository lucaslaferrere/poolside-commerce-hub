import { useRealtimeStats } from '@/hooks/useRealtimeStats';
import { RealtimeDashboard } from '@/components/admin/realtime/RealtimeDashboard';
import { AdminPageHeader } from './AdminLayout';

export default function AdminRealtimePage() {
  const { data } = useRealtimeStats();

  return (
    <>
      <AdminPageHeader title="Tiempo real" description="Actividad del sitio en vivo." />
      {!data ? (
        <p className="text-sm text-muted-foreground">Cargando datos en tiempo real…</p>
      ) : (
        <RealtimeDashboard data={data} />
      )}
    </>
  );
}
