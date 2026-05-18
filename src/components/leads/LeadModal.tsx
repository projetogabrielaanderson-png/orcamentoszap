import { useState, useEffect, type ReactNode } from 'react';
import { Lead, STATUS_CONFIG, LeadStatus } from '@/types/crm';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquare, Globe, Calendar, Send, UserCheck, Tag, StickyNote, Activity, CalendarClock, MessageCircle, DollarSign, Zap, ExternalLink, SquareDashedMousePointer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { FollowUpForm } from '@/components/followups/FollowUpForm';
import { FollowUpList } from '@/components/followups/FollowUpList';
import { LeadActivityTimeline, logLeadActivity } from '@/components/leads/LeadActivityTimeline';
import { LeadNotes } from '@/components/leads/LeadNotes';
import { LeadTags } from '@/components/leads/LeadTags';
import { ClientQuickReplies } from '@/components/leads/ClientQuickReplies';
import { LeadFinancials } from '@/components/leads/LeadFinancials';

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

const detailIconClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg";

function DetailItem({
  icon,
  label,
  children,
  iconClassName = "bg-primary/10 text-primary",
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`${detailIconClass} ${iconClassName}`}>{icon}</div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const { getCategoryName, professionals, categories, updateLeadStatus, assignProfessional, user } = useCRM();
  const [showProfessionalSelect, setShowProfessionalSelect] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [followUpRefresh, setFollowUpRefresh] = useState(0);
  const [leadTags, setLeadTags] = useState<string[]>(lead.tags || []);
  const [filterCategoryId, setFilterCategoryId] = useState<string>(lead.category_id);

  const filteredPros = professionals.filter(p => {
    if (!filterCategoryId) return true;
    if (p.category_ids && p.category_ids.length > 0) {
      return p.category_ids.includes(filterCategoryId);
    }
    return p.category_id === filterCategoryId;
  });

  useEffect(() => {
    supabase.from('message_templates').select('id,name,content,is_default')
      .eq('audience', 'professional')
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
    const url = `https://wa.me/${phone}?text=${msg}`;
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
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-5xl overflow-y-auto border-border/70 bg-card p-0 shadow-2xl sm:rounded-lg">
        <div className="space-y-6 p-5 sm:p-7">
          <DialogHeader className="pr-10 sm:pr-12">
            <div className="flex items-center gap-4 text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-2xl font-extrabold sm:text-3xl">{lead.name}</DialogTitle>
                <DialogDescription className="mt-1 text-sm font-medium">Detalhes e ações do lead</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="space-y-4">
              <DetailItem icon={<Phone className="h-5 w-5" />} label="Telefone">
                <a href={`tel:${lead.phone}`} className="break-all text-primary hover:underline">{lead.phone}</a>
              </DetailItem>

              <DetailItem icon={<MessageSquare className="h-5 w-5" />} label="Origem do lead" iconClassName="bg-accent text-primary">
                <p className="whitespace-pre-line text-muted-foreground">{lead.message || 'Sem mensagem informada'}</p>
              </DetailItem>

              <DetailItem icon={<Zap className="h-5 w-5" />} label="Categoria" iconClassName="bg-success/10 text-success">
                <Badge className="border-0 bg-success/15 text-success hover:bg-success/20">{getCategoryName(lead.category_id)}</Badge>
              </DetailItem>

              {lead.origin_url && (
                <DetailItem icon={<Globe className="h-5 w-5" />} label="Site" iconClassName="bg-primary/10 text-primary">
                  <a
                    href={lead.origin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 break-all text-primary hover:underline"
                  >
                    {lead.origin_url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </DetailItem>
              )}

              <DetailItem icon={<Calendar className="h-5 w-5" />} label="Criado em" iconClassName="bg-warning/10 text-warning">
                <span className="text-muted-foreground">{format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </DetailItem>

              {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                <div className="flex flex-wrap gap-1.5 pl-[52px]">
                  {lead.utm_source && <Badge variant="secondary" className="text-[10px]">source: {lead.utm_source}</Badge>}
                  {lead.utm_medium && <Badge variant="secondary" className="text-[10px]">medium: {lead.utm_medium}</Badge>}
                  {lead.utm_campaign && <Badge variant="secondary" className="text-[10px]">campaign: {lead.utm_campaign}</Badge>}
                </div>
              )}

              <DetailItem icon={<Tag className="h-5 w-5" />} label="Tags" iconClassName="bg-primary/10 text-primary">
                <LeadTags leadId={lead.id} tags={leadTags} onUpdate={setLeadTags} />
              </DetailItem>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <SquareDashedMousePointer className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Status do lead</h3>
              </div>

              <div className="space-y-4">
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!showProfessionalSelect ? (
                  <Button onClick={() => setShowProfessionalSelect(true)} className="h-12 w-full gap-2 shadow-lg shadow-primary/20" size="lg">
                    <Send className="h-4 w-4" /> Enviar para Profissional
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {templates.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Template da mensagem</label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                          <SelectTrigger className="h-9 bg-background text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {templates.map(t => (
                              <SelectItem key={t.id} value={t.id} className="text-xs">{t.name} {t.is_default && '⭐'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Filtrar por categoria:</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={filterCategoryId === '' ? 'default' : 'outline'} className="cursor-pointer text-[11px]" onClick={() => setFilterCategoryId('')}>Todas</Badge>
                        {categories.map(cat => (
                          <Badge key={cat.id} variant={filterCategoryId === cat.id ? 'default' : 'outline'} className="cursor-pointer text-[11px]" onClick={() => setFilterCategoryId(cat.id)}>
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selecione o profissional:</p>
                      {filteredPros.length === 0 ? (
                        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">Nenhum profissional encontrado</p>
                      ) : (
                        filteredPros.map(pro => (
                          <Button key={pro.id} variant="outline" className="h-auto min-h-11 w-full justify-start gap-2 whitespace-normal text-left" onClick={() => handleSendWhatsApp(pro)}>
                            <UserCheck className="h-4 w-4" />
                            <span>{pro.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {pro.category_ids?.length
                                ? pro.category_ids.map(id => getCategoryName(id)).join(', ')
                                : getCategoryName(pro.category_id || '')}
                            </span>
                          </Button>
                        ))
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowProfessionalSelect(false)}>Cancelar</Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="client" className="space-y-4">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border bg-card p-1 shadow-sm sm:grid-cols-5">
              <TabsTrigger value="client" className="h-10 gap-2 rounded-md text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><MessageCircle className="h-3.5 w-3.5" /> Cliente</TabsTrigger>
              <TabsTrigger value="financial" className="h-10 gap-2 rounded-md text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><DollarSign className="h-3.5 w-3.5" /> Financeiro</TabsTrigger>
              <TabsTrigger value="followups" className="h-10 gap-2 rounded-md text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><CalendarClock className="h-3.5 w-3.5" /> Lembretes</TabsTrigger>
              <TabsTrigger value="notes" className="h-10 gap-2 rounded-md text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><StickyNote className="h-3.5 w-3.5" /> Notas</TabsTrigger>
              <TabsTrigger value="activity" className="h-10 gap-2 rounded-md text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><Activity className="h-3.5 w-3.5" /> Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="client" className="mt-0">
              <ClientQuickReplies lead={lead} />
            </TabsContent>
            <TabsContent value="financial" className="mt-0">
              <LeadFinancials lead={lead} />
            </TabsContent>
            <TabsContent value="followups" className="mt-0 space-y-3 rounded-lg border bg-card p-4 shadow-sm">
              <FollowUpForm leadId={lead.id} onAdded={() => setFollowUpRefresh(r => r + 1)} />
              <FollowUpList leadId={lead.id} refreshKey={followUpRefresh} />
            </TabsContent>
            <TabsContent value="notes" className="mt-0 rounded-lg border bg-card p-4 shadow-sm">
              <LeadNotes leadId={lead.id} />
            </TabsContent>
            <TabsContent value="activity" className="mt-0 rounded-lg border bg-card p-4 shadow-sm">
              <LeadActivityTimeline leadId={lead.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
