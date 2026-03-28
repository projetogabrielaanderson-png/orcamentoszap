import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormEditor, FormConfig } from '@/components/capture/FormEditor';
import { EmbedGenerator } from '@/components/capture/EmbedGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Link2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'editor' | 'embed';

const CapturePage = () => {
  const { user, categories, getCategoryName } = useCRM();
  const [configs, setConfigs] = useState<FormConfig[]>([]);
  const [view, setView] = useState<ViewMode>('list');
  const [editConfig, setEditConfig] = useState<FormConfig | null>(null);
  const [embedConfig, setEmbedConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('form_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setConfigs(data.map(d => ({
        ...d,
        custom_fields: (d.custom_fields as any) || [],
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('form_configs').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    toast.success('Formulário excluído');
    fetchConfigs();
  };

  const handleNew = () => {
    setEditConfig(null);
    setView('editor');
  };

  const handleEdit = (config: FormConfig) => {
    setEditConfig(config);
    setView('editor');
  };

  const handleEmbed = (config: FormConfig) => {
    setEmbedConfig(config);
    setView('embed');
  };

  const handleSaved = () => {
    fetchConfigs();
    setView('list');
  };

  if (view === 'editor') {
    return (
      <AppLayout>
        <FormEditor config={editConfig} onSave={handleSaved} onBack={() => setView('list')} />
      </AppLayout>
    );
  }

  if (view === 'embed' && embedConfig) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('list')}>← Voltar</Button>
            <h2 className="text-lg font-semibold">Links e Embed - {getCategoryName(embedConfig.category_id)}</h2>
          </div>
          <EmbedGenerator formConfig={embedConfig} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Captação de Leads</h1>
            <p className="text-sm text-muted-foreground">Formulários personalizados por categoria</p>
          </div>
          <Button onClick={handleNew} className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo Formulário
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : configs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum formulário criado ainda.</p>
              <Button onClick={handleNew} variant="outline" className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" /> Criar Primeiro Formulário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configs.map(config => (
              <Card key={config.id} className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: config.primary_color }} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{config.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                    </div>
                    <Badge variant={config.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {config.is_active ? <><Eye className="h-3 w-3 mr-1" /> Ativo</> : <><EyeOff className="h-3 w-3 mr-1" /> Inativo</>}
                    </Badge>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(config.category_id)}
                  </Badge>

                  {config.custom_fields.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {config.custom_fields.length} campo(s) extra(s)
                    </p>
                  )}

                  <div className="flex gap-1.5 pt-1">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(config)} className="flex-1 gap-1">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEmbed(config)} className="flex-1 gap-1">
                      <Link2 className="h-3.5 w-3.5" /> Links
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(config.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CapturePage;
