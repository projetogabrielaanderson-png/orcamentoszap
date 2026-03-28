import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface LeadTagsProps {
  leadId: string;
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

export function LeadTags({ leadId, tags, onUpdate }: LeadTagsProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = async () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    const { error } = await supabase.from('leads').update({ tags: updated } as any).eq('id', leadId);
    if (error) toast.error('Erro ao adicionar tag');
    else { onUpdate(updated); setNewTag(''); }
  };

  const removeTag = async (tag: string) => {
    const updated = tags.filter(t => t !== tag);
    await supabase.from('leads').update({ tags: updated } as any).eq('id', leadId);
    onUpdate(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-1">
        <Input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Nova tag..." className="h-7 text-xs flex-1" />
        <Button size="sm" variant="outline" onClick={addTag} disabled={!newTag.trim()} className="h-7 px-2">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
