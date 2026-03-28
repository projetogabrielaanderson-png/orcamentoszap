import { AppLayout } from '@/components/layout/AppLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { AlertBanners } from '@/components/dashboard/AlertBanners';
import { QuickCharts } from '@/components/dashboard/QuickCharts';
import { PendingFollowUps } from '@/components/dashboard/PendingFollowUps';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 @container/main">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão geral dos seus leads e profissionais</p>
          </div>
        </div>
        <AlertBanners />
        <KPICards />
        <PendingFollowUps />
        <QuickCharts />
      </div>
    </AppLayout>
  );
};

export default Index;
