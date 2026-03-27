import { useState } from 'react';
import { Lead, STATUS_CONFIG, LeadStatus } from '@/types/crm';
import { useCRM } from '@/contexts/CRMContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MessageSquare, Globe, Calendar, Send, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const { getCategoryName, professionals, categories, updateLeadStatus, assignProfessional } = useCRM();
  const [showProfessionalSelect, setShowProfessionalSelect] = useState(false);

  const relevantPros = professionals.filter(p => p.category_id === lead.category_id);

  const handleSendWhatsApp = (pro: typeof professionals[0]) => {
    const msg = encodeURIComponent(
      `Olá ${pro.name}! Temos um novo lead para você:\n\n` +
      `👤 Nome: ${lead.name}\n` +
      `📱 Telefone: ${lead.phone}\n` +
      `💬 Mensagem: ${lead.message}\n` +
      `📂 Categoria: ${getCategoryName(lead.category_id)}`
    );
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${pro.whatsapp}?text=${msg}`
      : `https://web.whatsapp.com/send?phone=${pro.whatsapp}&text=${msg}`;
    window.open(url, '_blank');
    assignProfessional(lead.id, pro.id);
    toast.success(`Lead encaminhado para ${pro.name}!`);
    onClose();
  };

  const handleStatusChange = (status: string) => {
    updateLeadStatus(lead.id, status as LeadStatus);
    toast.success(`Status atualizado para "${STATUS_CONFIG[status as LeadStatus].label}"`);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Info */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="font-medium text-primary hover:underline">
                  {lead.phone}
                </a>
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
                <Send className="h-4 w-4" />
                Enviar para Profissional
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selecione o profissional:</p>
                {relevantPros.length === 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">Nenhum profissional nesta categoria</p>
                    {professionals.map(pro => (
                      <Button
                        key={pro.id}
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => handleSendWhatsApp(pro)}
                      >
                        <UserCheck className="h-4 w-4" />
                        {pro.name}
                        <span className="ml-auto text-xs text-muted-foreground">{getCategoryName(pro.category_id)}</span>
                      </Button>
                    ))}
                  </>
                ) : (
                  relevantPros.map(pro => (
                    <Button
                      key={pro.id}
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleSendWhatsApp(pro)}
                    >
                      <UserCheck className="h-4 w-4" />
                      {pro.name}
                    </Button>
                  ))
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowProfessionalSelect(false)}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
