import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

const KanbanPage = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus leads visualmente</p>
        </div>
        <KanbanBoard />
      </div>
    </AppLayout>
  );
};

export default KanbanPage;
