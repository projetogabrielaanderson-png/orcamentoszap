import { useEffect, useState } from 'react';
import { Lead } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logLeadActivity } from '@/components/leads/LeadActivityTimeline';

interface ClientQuickRepliesProps {
  lead: Lead;
  onSent?: () => void;
}

interface ClientTemplate {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

interface CompanySettings {
  company_name: string;
}

const FALLBACK = `Olá {{lead_primeiro_nome}}, tudo bem? 👋\n\nRecebi sua solicitação de {{categoria}} e já estou dando seguimento no seu pedido. Em breve um de nossos profissionais entrará em contato com você.\n\nPosso te ajudar com mais alguma informação?`;

function applyClientTemplate(content: string, lead: Lead, categoryName: string, companyName: string) {
  const firstName = lead.name.trim().split(' ')[0];
  return content
    .replace(/\{\{lead_nome\}\}/g, lead.name)
    .replace(/\{\{lead_primeiro_nome\}\}/g, firstName)
    .replace(/\{\{categoria\}\}/g, categoryName)
    .replace(/\{\{empresa\}\}/g, companyName || 'nossa equipe');
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export function ClientQuickReplies({ lead, onSent }: ClientQuickRepliesProps) {
  const { user, getCategoryName } = useCRM();
  const [templates, setTemplates] = useState<ClientTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('message_templates')
      .select('id,name,content,is_default')
      .eq('audience', 'client')
      .order('is_default', { ascending: false })
      .order('name')
      .then(({ data }) => {
        if (data) setTemplates(data as unknown as ClientTemplate[]);
      });

    supabase
      .from('user_settings')
      .select('company_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCompanyName((data as CompanySettings).company_name || '');
      });
  }, [user]);

  // Build initial message when templates/company load
  useEffect(() => {
    const tpl = templates.find(t => t.id === selectedId);
    const def = templates.find(t => t.is_default) || templates[0];
    const source = tpl?.content || def?.content || FALLBACK;
    if (!selectedId && def) setSelectedId(def.id);
    setMessage(applyClientTemplate(source, lead, getCategoryName(lead.category_id), companyName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, selectedId, companyName, lead.id]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const tpl = templates.find(t => t.id === id);
    if (tpl) {
      setMessage(applyClientTemplate(tpl.content, lead, getCategoryName(lead.category_id), companyName));
    }
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Mensagem vazia');
      return;
    }
    const phone = formatPhone(lead.phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    if (user) logLeadActivity(lead.id, user.id, 'Mensagem enviada ao cliente', message.slice(0, 100));
    toast.success('Abrindo WhatsApp do cliente...');
    onSent?.();
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">Resposta rápida ao cliente</h4>
      </div>

      {templates.length > 0 ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Template</label>
          <Select value={selectedId} onValueChange={handleSelect}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Escolha um template" /></SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id} className="text-sm">
                  {t.name} {t.is_default && '⭐'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Nenhum template para cliente cadastrado. Você pode editar a mensagem abaixo ou criar templates em <strong>Templates → Para Cliente</strong>.
        </p>
      )}

      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="min-h-[140px] text-sm"
        placeholder="Mensagem ao cliente..."
      />

      <Button
        onClick={handleSend}
        className="w-full gap-2 bg-status-done hover:bg-status-done/90 text-white"
      >
        <MessageCircle className="h-4 w-4" /> Enviar via WhatsApp
      </Button>
    </div>
  );
}
