import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from 'lucide-react';
import { FormPreview } from './FormPreview';

export interface CustomField {
  label: string;
  type: 'text' | 'email' | 'url' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface FormConfig {
  id?: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  primary_color: string;
  bg_color: string;
  logo_url: string;
  custom_fields: CustomField[];
  is_active: boolean;
  whatsapp_number: string;
}

interface FormEditorProps {
  config?: FormConfig | null;
  onSave: () => void;
  onBack: () => void;
}

const defaultConfig: Omit<FormConfig, 'user_id' | 'category_id'> = {
  title: 'Solicite um Orçamento',
  description: 'Preencha seus dados e entraremos em contato',
  primary_color: '#3b82f6',
  bg_color: '#eef2ff',
  logo_url: '',
  custom_fields: [],
  is_active: true,
  whatsapp_number: '',
};

export function FormEditor({ config, onSave, onBack }: FormEditorProps) {
  const { user, categories } = useCRM();
  const [form, setForm] = useState<FormConfig>({
    ...defaultConfig,
    user_id: user?.id || '',
    category_id: '',
    ...config,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) setForm({ ...defaultConfig, user_id: user?.id || '', category_id: '', ...config });
  }, [config, user]);

  const update = (partial: Partial<FormConfig>) => setForm(prev => ({ ...prev, ...partial }));

  const addField = () => {
    update({ custom_fields: [...form.custom_fields, { label: '', type: 'text', required: false }] });
  };

  const updateField = (index: number, field: Partial<CustomField>) => {
    const fields = [...form.custom_fields];
    fields[index] = { ...fields[index], ...field };
    update({ custom_fields: fields });
  };

  const removeField = (index: number) => {
    update({ custom_fields: form.custom_fields.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!form.category_id) { toast.error('Selecione uma categoria'); return; }
    if (!form.title.trim()) { toast.error('Título é obrigatório'); return; }
    setSaving(true);
    try {
      const payload = {
        user_id: user!.id,
        category_id: form.category_id,
        title: form.title.trim(),
        description: form.description.trim(),
        primary_color: form.primary_color,
        bg_color: form.bg_color,
        logo_url: form.logo_url.trim(),
        custom_fields: JSON.parse(JSON.stringify(form.custom_fields.filter(f => f.label.trim()))),
        is_active: form.is_active,
        whatsapp_number: form.whatsapp_number.replace(/\D/g, ''),
      };

      if (form.id) {
        const { error } = await supabase.from('form_configs').update(payload).eq('id', form.id);
        if (error) throw error;
        toast.success('Formulário atualizado!');
      } else {
        const { error } = await supabase.from('form_configs').insert(payload);
        if (error) throw error;
        toast.success('Formulário criado!');
      }
      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold">{form.id ? 'Editar Formulário' : 'Novo Formulário'}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Configuração Geral</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category_id} onValueChange={v => update({ category_id: v })} disabled={!!form.id}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={e => update({ title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => update({ description: e.target.value })} rows={2} />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.primary_color} onChange={e => update({ primary_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <Input value={form.primary_color} onChange={e => update({ primary_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.bg_color} onChange={e => update({ bg_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <Input value={form.bg_color} onChange={e => update({ bg_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL do Logo (opcional)</Label>
                <Input value={form.logo_url} onChange={e => update({ logo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp do Profissional *</Label>
                <Input value={form.whatsapp_number} onChange={e => update({ whatsapp_number: e.target.value })} placeholder="5544999990000" />
                <p className="text-xs text-muted-foreground">Número para onde o lead será redirecionado após enviar o formulário</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => update({ is_active: v })} />
                <Label>Formulário ativo</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Campos Personalizados</CardTitle>
                <Button variant="outline" size="sm" onClick={addField} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Nome e telefone são incluídos automaticamente</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.custom_fields.map((field, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                  <GripVertical className="h-4 w-4 mt-2.5 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Nome do campo"
                      value={field.label}
                      onChange={e => updateField(i, { label: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <Select value={field.type} onValueChange={v => updateField(i, { type: v as CustomField['type'] })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="textarea">Texto Longo</SelectItem>
                          <SelectItem value="select">Seleção</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Switch checked={field.required} onCheckedChange={v => updateField(i, { required: v })} />
                        <span className="text-xs text-muted-foreground">Obrigatório</span>
                      </div>
                    </div>
                    {field.type === 'select' && (
                      <Input
                        placeholder="Opções separadas por vírgula (ex: Opção 1, Opção 2)"
                        value={field.options?.join(', ') || ''}
                        onChange={e => updateField(i, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      />
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeField(i)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.custom_fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum campo extra adicionado</p>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar Formulário'}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4">
          <FormPreview config={form} categoryName={categories.find(c => c.id === form.category_id)?.name || 'Categoria'} />
        </div>
      </div>
    </div>
  );
}
