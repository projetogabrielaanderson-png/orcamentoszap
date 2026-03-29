import { useState, useEffect } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Professional } from '@/types/crm';

interface ProfessionalFormProps {
  onClose: () => void;
  professional?: Professional;
}

export function ProfessionalForm({ onClose, professional }: ProfessionalFormProps) {
  const { categories, addProfessional, updateProfessional } = useCRM();
  const [name, setName] = useState(professional?.name || '');
  const [categoryIds, setCategoryIds] = useState<string[]>(
    professional?.category_ids || (professional?.category_id ? [professional.category_id] : [])
  );
  const [whatsapp, setWhatsapp] = useState(professional?.whatsapp || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || categoryIds.length === 0 || !whatsapp.trim()) {
      toast.error('Preencha o nome, número e escolha ao menos uma categoria');
      return;
    }
    
    const profData = { 
      name: name.trim(), 
      category_ids: categoryIds, 
      category_id: categoryIds[0], // fallback compatibility 
      whatsapp: whatsapp.trim() 
    };

    if (professional) {
      updateProfessional(professional.id, profData);
      toast.success(`${name} atualizado com sucesso!`);
    } else {
      addProfessional(profData);
      toast.success(`${name} cadastrado com sucesso!`);
    }
    onClose();
  };

  const toggleCategory = (id: string) => {
    setCategoryIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{professional ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-2">
            <Label>Categorias</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 border rounded-md p-3 max-h-48 overflow-y-auto">
              {categories.map(c => (
                <div key={c.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cat-${c.id}`} 
                    checked={categoryIds.includes(c.id)}
                    onCheckedChange={() => toggleCategory(c.id)}
                  />
                  <Label htmlFor={`cat-${c.id}`} className="font-normal cursor-pointer leading-tight text-sm">
                    {c.name}
                  </Label>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-2 text-sm text-muted-foreground">Nenhuma categoria encontrada.</div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999990000" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{professional ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
