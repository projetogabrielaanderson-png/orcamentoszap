import { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MessageCircle, Edit } from 'lucide-react';
import { ProfessionalForm } from './ProfessionalForm';
import { toast } from 'sonner';
import { Professional } from '@/types/crm';

export function ProfessionalsTable() {
  const { professionals, categories, leads, getCategoryName, deleteProfessional } = useCRM();
  const [showForm, setShowForm] = useState(false);
  const [editingPro, setEditingPro] = useState<Professional | null>(null);

  const getLeadsCount = (proId: string) => leads.filter(l => l.professional_id === proId).length;

  const handleEdit = (pro: Professional) => {
    setEditingPro(pro);
    setShowForm(true);
  };

  const handleClose = () => {
    setEditingPro(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-center">Leads Recebidos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.map(pro => {
              const catIds = pro.category_ids?.length ? pro.category_ids : (pro.category_id ? [pro.category_id] : []);
              return (
              <TableRow key={pro.id} className="group">
                <TableCell className="font-medium">{pro.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {catIds.map(id => (
                      <Badge key={id} variant="outline" className="text-xs">{getCategoryName(id)}</Badge>
                    ))}
                    {catIds.length === 0 && <span className="text-muted-foreground text-sm">Sem categoria</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://wa.me/${pro.whatsapp.replace(/\D/g, '').startsWith('55') ? pro.whatsapp.replace(/\D/g, '') : '55' + pro.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {pro.whatsapp}
                  </a>
                </TableCell>
                <TableCell className="text-center font-semibold">{getLeadsCount(pro.id)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => handleEdit(pro)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        deleteProfessional(pro.id);
                        toast.success(`${pro.name} removido`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      <Button
        onClick={() => { setEditingPro(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showForm && <ProfessionalForm onClose={handleClose} professional={editingPro || undefined} />}
    </div>
  );
}
