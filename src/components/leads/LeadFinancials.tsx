import { useState, useEffect } from 'react';
import { Lead, LeadOutcome } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/contexts/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trophy, XCircle, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { logLeadActivity } from '@/components/leads/LeadActivityTimeline';

interface LeadFinancialsProps {
  lead: Lead;
  onUpdated?: () => void;
}

const formatBRL = (n: number | null | undefined) =>
  typeof n === 'number'
    ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—';

export function LeadFinancials({ lead, onUpdated }: LeadFinancialsProps) {
  const { user, refreshLeads } = useCRM();
  const [quote, setQuote] = useState<string>(lead.quote_value?.toString() ?? '');
  const [closed, setClosed] = useState<string>(lead.closed_value?.toString() ?? '');
  const [outcome, setOutcome] = useState<LeadOutcome>(lead.outcome ?? null);
  const [lostReason, setLostReason] = useState<string>(lead.lost_reason ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuote(lead.quote_value?.toString() ?? '');
    setClosed(lead.closed_value?.toString() ?? '');
    setOutcome(lead.outcome ?? null);
    setLostReason(lead.lost_reason ?? '');
  }, [lead.id, lead.quote_value, lead.closed_value, lead.outcome, lead.lost_reason]);

  const parseNum = (s: string): number | null => {
    if (!s.trim()) return null;
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const persist = async (
    payload: Partial<Pick<Lead, 'quote_value' | 'closed_value' | 'outcome' | 'lost_reason' | 'status'>>,
    activity?: { action: string; details: string }
  ) => {
    setSaving(true);
    const { error } = await supabase.from('leads').update(payload).eq('id', lead.id);
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return false; }
    if (activity && user) await logLeadActivity(lead.id, user.id, activity.action, activity.details);
    refreshLeads();
    onUpdated?.();
    return true;
  };

  const handleSaveValues = async () => {
    const ok = await persist({
      quote_value: parseNum(quote),
      closed_value: parseNum(closed),
    }, { action: 'Valores atualizados', details: `Orçamento: ${formatBRL(parseNum(quote))} • Fechado: ${formatBRL(parseNum(closed))}` });
    if (ok) toast.success('Valores atualizados');
  };

  const handleMarkWon = async () => {
    const closedNum = parseNum(closed) ?? parseNum(quote);
    const ok = await persist({
      outcome: 'won',
      status: 'done',
      closed_value: closedNum,
      lost_reason: null,
    }, { action: 'Lead ganho 🏆', details: closedNum ? `Valor fechado: ${formatBRL(closedNum)}` : 'Sem valor informado' });
    if (ok) {
      setOutcome('won');
      setLostReason('');
      toast.success('Lead marcado como ganho!');
    }
  };

  const handleMarkLost = async () => {
    if (!lostReason.trim()) {
      toast.error('Informe o motivo da perda');
      return;
    }
    const ok = await persist({
      outcome: 'lost',
      status: 'done',
      closed_value: null,
      lost_reason: lostReason.trim(),
    }, { action: 'Lead perdido', details: lostReason.trim() });
    if (ok) {
      setOutcome('lost');
      toast.success('Lead marcado como perdido');
    }
  };

  const handleReset = async () => {
    const ok = await persist({
      outcome: null,
      lost_reason: null,
    }, { action: 'Resultado revertido', details: 'Outcome removido' });
    if (ok) {
      setOutcome(null);
      setLostReason('');
      toast.success('Resultado revertido');
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" /> Pipeline financeiro
        </h4>
        {outcome === 'won' && (
          <Badge className="bg-status-done/10 text-status-done border-status-done/30 gap-1">
            <Trophy className="h-3 w-3" /> Ganho
          </Badge>
        )}
        {outcome === 'lost' && (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 gap-1">
            <XCircle className="h-3 w-3" /> Perdido
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Valor orçamento (R$)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={quote}
            onChange={e => setQuote(e.target.value)}
            placeholder="0,00"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Valor fechado (R$)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={closed}
            onChange={e => setClosed(e.target.value)}
            placeholder="0,00"
            disabled={outcome === 'lost'}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={handleSaveValues}
        disabled={saving}
      >
        <Save className="h-3.5 w-3.5" /> Salvar valores
      </Button>

      {outcome === 'lost' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Motivo da perda</Label>
          <Textarea
            value={lostReason}
            onChange={e => setLostReason(e.target.value)}
            placeholder="Ex: Preço acima do orçamento do cliente"
            className="min-h-[60px] text-sm"
          />
        </div>
      )}

      {outcome !== 'won' && outcome !== 'lost' && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Motivo da perda (caso necessário)</Label>
            <Textarea
              value={lostReason}
              onChange={e => setLostReason(e.target.value)}
              placeholder="Preencha apenas para marcar como perdido"
              className="min-h-[60px] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-1.5 bg-status-done hover:bg-status-done/90 text-white"
              onClick={handleMarkWon}
              disabled={saving}
            >
              <Trophy className="h-3.5 w-3.5" /> Marcar como ganho
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleMarkLost}
              disabled={saving}
            >
              <XCircle className="h-3.5 w-3.5" /> Marcar como perdido
            </Button>
          </div>
        </div>
      )}

      {(outcome === 'won' || outcome === 'lost') && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reverter resultado
        </Button>
      )}
    </div>
  );
}
