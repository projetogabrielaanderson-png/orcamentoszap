import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface FollowUp {
  id: string;
  note: string;
  scheduled_at: string;
  completed: boolean;
  completed_at: string | null;
}

interface FollowUpListProps {
  leadId: string;
  refreshKey: number;
}

export function FollowUpList({ leadId, refreshKey }: FollowUpListProps) {
  const [items, setItems] = useState<FollowUp[]>([]);

  const fetch = () => {
    supabase.from('follow_ups').select('*').eq('lead_id', leadId).order('scheduled_at').then(({ data }) => {
      if (data) setItems(data as unknown as FollowUp[]);
    });
  };

  useEffect(() => { fetch(); }, [leadId, refreshKey]);

  const toggleComplete = async (id: string, completed: boolean) => {
    await supabase.from('follow_ups').update({
      completed: !completed,
      completed_at: !completed ? new Date().toISOString() : null,
    } as any).eq('id', id);
    fetch();
  };

  const remove = async (id: string) => {
    await supabase.from('follow_ups').delete().eq('id', id);
    toast.success('Lembrete removido');
    fetch();
  };

  if (items.length === 0) return <p className="text-xs text-muted-foreground">Nenhum lembrete agendado</p>;

  return (
    <div className="space-y-1.5">
      {items.map(item => {
        const overdue = !item.completed && isPast(new Date(item.scheduled_at));
        return (
          <div key={item.id} className={`flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs ${item.completed ? 'opacity-50' : overdue ? 'border-destructive/40 bg-destructive/5' : ''}`}>
            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 mt-0.5" onClick={() => toggleComplete(item.id, item.completed)}>
              <Check className={`h-3 w-3 ${item.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
            </Button>
            <div className="flex-1 min-w-0">
              <p className={item.completed ? 'line-through' : ''}>{item.note || 'Sem nota'}</p>
              <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {format(new Date(item.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                {overdue && <Badge variant="destructive" className="text-[9px] h-4 px-1">Atrasado</Badge>}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-destructive" onClick={() => remove(item.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
