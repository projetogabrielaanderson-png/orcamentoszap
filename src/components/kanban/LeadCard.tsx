import { Lead } from '@/types/crm';
import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, Trophy, XCircle, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isNew?: boolean;
}

const formatBRLCompact = (n: number) =>
  n >= 1000
    ? `R$ ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
    : `R$ ${n.toFixed(0)}`;

export function LeadCard({ lead, onClick, isNew }: LeadCardProps) {
  const { getCategoryName } = useCRM();

  const timeAgo = formatDistanceToNow(new Date(lead.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const displayValue = lead.closed_value ?? lead.quote_value;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isNew ? 'border-primary/30 shadow-sm animate-pulse-glow' : 'border-border'
      }`}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight">{lead.name}</h4>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {isNew && (
              <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 border-0">NOVO</Badge>
            )}
            {lead.outcome === 'won' && (
              <Badge className="bg-status-done/10 text-status-done border-0 text-[10px] px-1.5 py-0 gap-0.5">
                <Trophy className="h-2.5 w-2.5" /> Ganho
              </Badge>
            )}
            {lead.outcome === 'lost' && (
              <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 text-[10px] px-1.5 py-0 gap-0.5">
                <XCircle className="h-2.5 w-2.5" /> Perdido
              </Badge>
            )}
          </div>
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{lead.message}</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium">
            {getCategoryName(lead.category_id)}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          {typeof displayValue === 'number' && displayValue > 0 && (
            <span className="ml-auto flex items-center gap-0.5 font-semibold text-foreground">
              <DollarSign className="h-3 w-3" />
              {formatBRLCompact(displayValue)}
            </span>
          )}
        </div>
        {lead.origin_url && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/60 truncate">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{new URL(lead.origin_url).hostname}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
