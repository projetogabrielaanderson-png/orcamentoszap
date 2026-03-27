import { AppLayout } from '@/components/layout/AppLayout';
import { EmbedGenerator } from '@/components/capture/EmbedGenerator';

const CapturePage = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Captação de Leads</h1>
          <p className="text-sm text-muted-foreground">Gere formulários e links para captar leads do seu site</p>
        </div>
        <EmbedGenerator />
      </div>
    </AppLayout>
  );
};

export default CapturePage;
