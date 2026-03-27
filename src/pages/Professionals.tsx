import { AppLayout } from '@/components/layout/AppLayout';
import { ProfessionalsTable } from '@/components/professionals/ProfessionalsTable';

const ProfessionalsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus profissionais parceiros</p>
        </div>
        <ProfessionalsTable />
      </div>
    </AppLayout>
  );
};

export default ProfessionalsPage;
