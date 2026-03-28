import { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MessageCircle } from 'lucide-react';
import { ProfessionalForm } from './ProfessionalForm';
import { toast } from 'sonner';

export function ProfessionalsTable() {
  const { professionals, categories, leads, getCategoryName, deleteProfessional } = useCRM();
  const [showForm, setShowForm] = useState(false);

  const getLeadsCount = (proId: string) => leads.filter(l => l.professional_id === proId).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-center">Leads Recebidos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.map(pro => (
              <TableRow key={pro.id} className="group">
                <TableCell className="font-medium">{pro.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getCategoryName(pro.category_id)}</Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://wa.me/${pro.whatsapp.replace(/\D/g, '').startsWith('55') ? pro.whatsapp.replace(/\D/g, '') : '55' + pro.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {pro.whatsapp}
                  </a>
                </TableCell>
                <TableCell className="text-center font-semibold">{getLeadsCount(pro.id)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => {
                      deleteProfessional(pro.id);
                      toast.success(`${pro.name} removido`);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {showForm && <ProfessionalForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
