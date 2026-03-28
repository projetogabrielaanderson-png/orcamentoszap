import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCRM } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, StickyNote, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export function LeadNotes({ leadId }: { leadId: string }) {
  const { user } = useCRM();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchNotes = () => {
    supabase.from('lead_notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setNotes(data as unknown as Note[]);
    });
  };

  useEffect(() => { fetchNotes(); }, [leadId]);

  const handleAdd = async () => {
    if (!user || !newNote.trim()) return;
    setAdding(true);
    await supabase.from('lead_notes').insert({ lead_id: leadId, user_id: user.id, content: newNote.trim() } as any);
    setAdding(false);
    setNewNote('');
    fetchNotes();
    toast.success('Nota adicionada');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('lead_notes').delete().eq('id', id);
    fetchNotes();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Adicionar nota..." className="min-h-[50px] text-xs flex-1" />
        <Button size="sm" onClick={handleAdd} disabled={adding || !newNote.trim()} className="h-8 gap-1 self-end">
          <Plus className="h-3 w-3" /> Nota
        </Button>
      </div>
      {notes.map(n => (
        <div key={n.id} className="flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs">
          <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p>{n.content}</p>
            <p className="text-muted-foreground/60 mt-0.5">{format(new Date(n.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-destructive" onClick={() => handleDelete(n.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      {notes.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma nota</p>}
    </div>
  );
}
