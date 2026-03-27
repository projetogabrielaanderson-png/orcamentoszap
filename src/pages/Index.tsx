import { AppLayout } from '@/components/layout/AppLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { AlertBanners } from '@/components/dashboard/AlertBanners';
import { QuickCharts } from '@/components/dashboard/QuickCharts';

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral dos seus leads e profissionais</p>
        </div>
        <AlertBanners />
        <KPICards />
        <QuickCharts />
      </div>
    </AppLayout>
  );
};

export default Index;
