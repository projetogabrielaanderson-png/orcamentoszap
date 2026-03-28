import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity } from 'lucide-react';

interface LeadActivity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

export function LeadActivityTimeline({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);

  useEffect(() => {
    supabase.from('lead_activities').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setActivities(data as unknown as LeadActivity[]);
    });
  }, [leadId]);

  if (activities.length === 0) return <p className="text-xs text-muted-foreground">Nenhuma atividade registrada</p>;

  return (
    <div className="space-y-2">
      {activities.map(a => (
        <div key={a.id} className="flex gap-2 text-xs">
          <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-2.5 w-2.5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{a.action}</p>
            {a.details && <p className="text-muted-foreground">{a.details}</p>}
            <p className="text-muted-foreground/60">{format(new Date(a.created_at), "dd/MM HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export async function logLeadActivity(leadId: string, userId: string, action: string, details = '') {
  await supabase.from('lead_activities').insert({ lead_id: leadId, user_id: userId, action, details } as any);
}
