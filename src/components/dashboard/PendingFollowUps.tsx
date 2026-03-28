import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Check, AlertTriangle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface FollowUpWithLead {
  id: string;
  note: string;
  scheduled_at: string;
  completed: boolean;
  lead_id: string;
  lead_name?: string;
}

export function PendingFollowUps() {
  const { user, leads } = useCRM();
  const [items, setItems] = useState<FollowUpWithLead[]>([]);

  const fetchFollowUps = () => {
    if (!user) return;
    supabase.from('follow_ups').select('*').eq('completed', false).order('scheduled_at').then(({ data }) => {
      if (data) {
        const mapped = (data as unknown as FollowUpWithLead[]).map(fu => ({
          ...fu,
          lead_name: leads.find(l => l.id === fu.lead_id)?.name || 'Lead',
        }));
        setItems(mapped);
      }
    });
  };

  useEffect(() => { fetchFollowUps(); }, [user, leads]);

  const handleComplete = async (id: string) => {
    await supabase.from('follow_ups').update({ completed: true, completed_at: new Date().toISOString() } as any).eq('id', id);
    fetchFollowUps();
  };

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4" /> Lembretes Pendentes
          <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.slice(0, 5).map(item => {
          const overdue = isPast(new Date(item.scheduled_at));
          const today = isToday(new Date(item.scheduled_at));
          return (
            <div key={item.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${overdue ? 'border-destructive/30 bg-destructive/5' : today ? 'border-warning/30 bg-warning/5' : ''}`}>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleComplete(item.id)}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.lead_name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.note || 'Sem nota'}</p>
              </div>
              <div className="text-xs text-right shrink-0">
                <p className={overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {format(new Date(item.scheduled_at), "dd/MM HH:mm", { locale: ptBR })}
                </p>
                {overdue && <Badge variant="destructive" className="text-[9px] h-4 px-1 mt-0.5">Atrasado</Badge>}
              </div>
            </div>
          );
        })}
        {items.length > 5 && <p className="text-xs text-muted-foreground text-center">+{items.length - 5} mais</p>}
      </CardContent>
    </Card>
  );
}
