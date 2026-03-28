import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/contexts/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CalendarClock, Plus } from 'lucide-react';

interface FollowUpFormProps {
  leadId: string;
  onAdded: () => void;
}

export function FollowUpForm({ leadId, onAdded }: FollowUpFormProps) {
  const { user } = useCRM();
  const [note, setNote] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || !scheduledAt) return;
    setSaving(true);
    const { error } = await supabase.from('follow_ups').insert({
      user_id: user.id,
      lead_id: leadId,
      note,
      scheduled_at: new Date(scheduledAt).toISOString(),
    } as any);
    setSaving(false);
    if (error) toast.error('Erro ao criar lembrete');
    else {
      toast.success('Lembrete agendado!');
      setNote('');
      setScheduledAt('');
      onAdded();
    }
  };

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-xs font-medium flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Novo lembrete</p>
      <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="h-8 text-xs" />
      <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Nota do lembrete..." className="min-h-[60px] text-xs" />
      <Button size="sm" onClick={handleSubmit} disabled={saving || !scheduledAt} className="gap-1 h-7 text-xs">
        <Plus className="h-3 w-3" /> Agendar
      </Button>
    </div>
  );
}
