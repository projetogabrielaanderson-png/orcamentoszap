import { AppLayout } from '@/components/layout/AppLayout';
import { TemplatesList } from '@/components/templates/TemplatesList';

const TemplatesPage = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates de Mensagem</h1>
          <p className="text-sm text-muted-foreground">
            Personalize as mensagens enviadas para os profissionais via WhatsApp
          </p>
        </div>
        <TemplatesList />
      </div>
    </AppLayout>
  );
};

export default TemplatesPage;
