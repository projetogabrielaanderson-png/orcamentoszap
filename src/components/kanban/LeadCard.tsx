import { Lead } from '@/types/crm';
import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isNew?: boolean;
}

export function LeadCard({ lead, onClick, isNew }: LeadCardProps) {
  const { getCategoryName } = useCRM();

  const timeAgo = formatDistanceToNow(new Date(lead.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

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
          {isNew && (
            <Badge className="shrink-0 bg-primary/10 text-primary text-[10px] px-1.5 py-0 border-0">
              NOVO
            </Badge>
          )}
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
