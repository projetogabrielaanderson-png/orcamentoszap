import { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { MessageTemplate } from './TemplatesList';

interface TemplateFormProps {
  template: MessageTemplate | null;
  onClose: () => void;
}

const DEFAULT_CONTENT = `Olá {{profissional}}! Temos um novo lead para você:

◆ Nome: {{lead_nome}}
◆ Telefone: {{lead_telefone}}
◆ Mensagem: {{lead_mensagem}}
◆ Categoria: {{categoria}}`;

export function TemplateForm({ template, onClose }: TemplateFormProps) {
  const { user } = useCRM();
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || DEFAULT_CONTENT);
  const [isDefault, setIsDefault] = useState(template?.is_default || false);
  const [saving, setSaving] = useState(false);

  const isEditing = !!template;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (!user) return;

    setSaving(true);

    // If setting as default, unset others first
    if (isDefault) {
      await supabase.from('message_templates').update({ is_default: false }).eq('user_id', user.id);
    }

    if (isEditing) {
      const { error } = await supabase
        .from('message_templates')
        .update({ name: name.trim(), content: content.trim(), is_default: isDefault })
        .eq('id', template.id);
      if (error) { toast.error('Erro ao atualizar template'); setSaving(false); return; }
      toast.success('Template atualizado!');
    } else {
      const { error } = await supabase
        .from('message_templates')
        .insert({ name: name.trim(), content: content.trim(), is_default: isDefault, user_id: user.id });
      if (error) { toast.error('Erro ao criar template'); setSaving(false); return; }
      toast.success('Template criado!');
    }

    setSaving(false);
    onClose();
  };

  const insertVariable = (variable: string) => {
    setContent(prev => prev + variable);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Template' : 'Novo Template'}</DialogTitle>
          <DialogDescription>Configure o modelo de mensagem enviada via WhatsApp</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do template</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Mensagem padrão" />
          </div>

          <div className="space-y-2">
            <Label>Conteúdo da mensagem</Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Digite a mensagem..."
              className="min-h-[160px] font-mono text-sm"
            />
            <div className="flex flex-wrap gap-1">
              {['{{profissional}}', '{{lead_nome}}', '{{lead_telefone}}', '{{lead_mensagem}}', '{{categoria}}'].map(v => (
                <Button key={v} type="button" variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => insertVariable(v)}>
                  + {v}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            <Label className="cursor-pointer" onClick={() => setIsDefault(!isDefault)}>Definir como template padrão</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
