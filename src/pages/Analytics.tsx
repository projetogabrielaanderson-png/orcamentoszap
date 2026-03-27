import { AppLayout } from '@/components/layout/AppLayout';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';

const AnalyticsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análises</h1>
          <p className="text-sm text-muted-foreground">Dashboards e métricas dos seus leads</p>
        </div>
        <AnalyticsCharts />
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
