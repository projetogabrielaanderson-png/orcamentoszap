import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Star, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateForm } from './TemplateForm';

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_default: boolean;
  audience: 'professional' | 'client';
  created_at: string;
  updated_at: string;
}

const VARIABLES_HELP_PROFESSIONAL = [
  { var: '{{profissional}}', desc: 'Nome do profissional' },
  { var: '{{lead_nome}}', desc: 'Nome do lead' },
  { var: '{{lead_telefone}}', desc: 'Telefone do lead' },
  { var: '{{lead_mensagem}}', desc: 'Mensagem do lead' },
  { var: '{{categoria}}', desc: 'Categoria do serviço' },
];

const VARIABLES_HELP_CLIENT = [
  { var: '{{lead_nome}}', desc: 'Nome do cliente' },
  { var: '{{lead_primeiro_nome}}', desc: 'Primeiro nome do cliente' },
  { var: '{{categoria}}', desc: 'Categoria solicitada' },
  { var: '{{empresa}}', desc: 'Nome da sua empresa' },
];

export function TemplatesList() {
  const { user } = useCRM();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name');
    if (data) setTemplates(data as unknown as MessageTemplate[]);
  }, [user]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('message_templates').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir template'); return; }
    toast.success('Template excluído');
    fetchTemplates();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    // Remove default from all
    await supabase.from('message_templates').update({ is_default: false }).eq('user_id', user.id);
    // Set new default
    await supabase.from('message_templates').update({ is_default: true }).eq('id', id);
    toast.success('Template padrão atualizado');
    fetchTemplates();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditing(null);
    fetchTemplates();
  };

  return (
    <div className="space-y-6">
      {/* Variables reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Variáveis disponíveis</CardTitle>
          <CardDescription>Use estas variáveis no conteúdo do template — elas serão substituídas automaticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {VARIABLES_HELP.map(v => (
              <button
                key={v.var}
                onClick={() => { navigator.clipboard.writeText(v.var); toast.success(`${v.var} copiado!`); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-mono transition-colors hover:bg-muted"
              >
                <Copy className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold text-foreground">{v.var}</span>
                <span className="text-muted-foreground">— {v.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <Card key={t.id} className="group relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{t.name}</CardTitle>
                {t.is_default && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                    <Star className="mr-1 h-3 w-3" /> Padrão
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs font-mono text-muted-foreground leading-relaxed">
                {t.content}
              </pre>
              <div className="flex items-center gap-1">
                {!t.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => handleSetDefault(t.id)} className="text-xs gap-1">
                    <Star className="h-3.5 w-3.5" /> Definir padrão
                  </Button>
                )}
                <div className="ml-auto flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setShowForm(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">Nenhum template criado ainda</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Criar primeiro template
          </Button>
        </div>
      )}

      <Button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showForm && <TemplateForm template={editing} onClose={handleFormClose} />}
    </div>
  );
}
