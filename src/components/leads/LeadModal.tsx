import { useState, useEffect } from 'react';
import { Lead, STATUS_CONFIG, LeadStatus } from '@/types/crm';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquare, Globe, Calendar, Send, UserCheck, Tag, StickyNote, Activity, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { FollowUpForm } from '@/components/followups/FollowUpForm';
import { FollowUpList } from '@/components/followups/FollowUpList';
import { LeadActivityTimeline, logLeadActivity } from '@/components/leads/LeadActivityTimeline';
import { LeadNotes } from '@/components/leads/LeadNotes';
import { LeadTags } from '@/components/leads/LeadTags';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

function formatPhoneWithCountry(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
}

function applyTemplate(content: string, pro: { name: string }, lead: Lead, categoryName: string) {
  return content
    .replace(/\{\{profissional\}\}/g, pro.name)
    .replace(/\{\{lead_nome\}\}/g, lead.name)
    .replace(/\{\{lead_telefone\}\}/g, formatPhoneWithCountry(lead.phone))
    .replace(/\{\{lead_mensagem\}\}/g, lead.message)
    .replace(/\{\{categoria\}\}/g, categoryName);
}

const FALLBACK_TEMPLATE = `Olá {{profissional}}! Temos um novo lead para você:\n\n◆ Nome: {{lead_nome}}\n◆ Telefone: {{lead_telefone}}\n◆ Mensagem: {{lead_mensagem}}\n◆ Categoria: {{categoria}}`;

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const { getCategoryName, professionals, updateLeadStatus, assignProfessional, user } = useCRM();
  const [showProfessionalSelect, setShowProfessionalSelect] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [followUpRefresh, setFollowUpRefresh] = useState(0);
  const [leadTags, setLeadTags] = useState<string[]>(lead.tags || []);

  const relevantPros = professionals.filter(p => p.category_id === lead.category_id);

  useEffect(() => {
    supabase.from('message_templates').select('id,name,content,is_default')
      .order('is_default', { ascending: false })
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const tpls = data as unknown as MessageTemplate[];
          setTemplates(tpls);
          const def = tpls.find(t => t.is_default) || tpls[0];
          setSelectedTemplateId(def.id);
        }
      });
  }, []);

  const getMessageContent = (pro: { name: string }) => {
    const tpl = templates.find(t => t.id === selectedTemplateId);
    const content = tpl?.content || FALLBACK_TEMPLATE;
    return applyTemplate(content, pro, lead, getCategoryName(lead.category_id));
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`;
  };

  const handleSendWhatsApp = (pro: typeof professionals[0]) => {
    const msg = encodeURIComponent(getMessageContent(pro));
    const phone = formatPhone(pro.whatsapp);
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${phone}?text=${msg}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${msg}`;
    window.open(url, '_blank');
    assignProfessional(lead.id, pro.id);
    if (user) logLeadActivity(lead.id, user.id, 'Encaminhado para profissional', pro.name);
    toast.success(`Lead encaminhado para ${pro.name}!`);
    onClose();
  };

  const handleStatusChange = (status: string) => {
    updateLeadStatus(lead.id, status as LeadStatus);
    if (user) logLeadActivity(lead.id, user.id, 'Status alterado', STATUS_CONFIG[status as LeadStatus].label);
    toast.success(`Status atualizado para "${STATUS_CONFIG[status as LeadStatus].label}"`);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.name}</DialogTitle>
          <DialogDescription>Detalhes e ações do lead</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Info */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="font-medium text-primary hover:underline">{lead.phone}</a>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">{lead.message}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{getCategoryName(lead.category_id)}</Badge>
              </div>
              {lead.origin_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{lead.origin_url}</span>
                </div>
              )}
              {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                <div className="flex flex-wrap gap-1.5">
                  {lead.utm_source && <Badge variant="secondary" className="text-[10px]">source: {lead.utm_source}</Badge>}
                  {lead.utm_medium && <Badge variant="secondary" className="text-[10px]">medium: {lead.utm_medium}</Badge>}
                  {lead.utm_campaign && <Badge variant="secondary" className="text-[10px]">campaign: {lead.utm_campaign}</Badge>}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Tags</p>
              <LeadTags leadId={lead.id} tags={leadTags} onUpdate={setLeadTags} />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select value={lead.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!showProfessionalSelect ? (
              <Button onClick={() => setShowProfessionalSelect(true)} className="w-full gap-2" size="lg">
                <Send className="h-4 w-4" /> Enviar para Profissional
              </Button>
            ) : (
              <div className="space-y-2">
                {templates.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Template da mensagem</label>
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">{t.name} {t.is_default && '⭐'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <p className="text-sm font-medium">Selecione o profissional:</p>
                {relevantPros.length === 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">Nenhum profissional nesta categoria</p>
                    {professionals.map(pro => (
                      <Button key={pro.id} variant="outline" className="w-full justify-start gap-2" onClick={() => handleSendWhatsApp(pro)}>
                        <UserCheck className="h-4 w-4" /> {pro.name}
                        <span className="ml-auto text-xs text-muted-foreground">{getCategoryName(pro.category_id)}</span>
                      </Button>
                    ))}
                  </>
                ) : (
                  relevantPros.map(pro => (
                    <Button key={pro.id} variant="outline" className="w-full justify-start gap-2" onClick={() => handleSendWhatsApp(pro)}>
                      <UserCheck className="h-4 w-4" /> {pro.name}
                    </Button>
                  ))
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowProfessionalSelect(false)}>Cancelar</Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Follow-ups, Notes, Activity */}
        <Tabs defaultValue="followups" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followups" className="gap-1 text-xs"><CalendarClock className="h-3.5 w-3.5" /> Lembretes</TabsTrigger>
            <TabsTrigger value="notes" className="gap-1 text-xs"><StickyNote className="h-3.5 w-3.5" /> Notas</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1 text-xs"><Activity className="h-3.5 w-3.5" /> Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="followups" className="space-y-3 mt-3">
            <FollowUpForm leadId={lead.id} onAdded={() => setFollowUpRefresh(r => r + 1)} />
            <FollowUpList leadId={lead.id} refreshKey={followUpRefresh} />
          </TabsContent>
          <TabsContent value="notes" className="mt-3">
            <LeadNotes leadId={lead.id} />
          </TabsContent>
          <TabsContent value="activity" className="mt-3">
            <LeadActivityTimeline leadId={lead.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
