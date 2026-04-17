import { AppLayout } from '@/components/layout/AppLayout';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { SalesFunnel } from '@/components/analytics/SalesFunnel';
import { useCRM } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const AnalyticsPage = () => {
  const { leads, categories, professionals, getCategoryName, getProfessionalName } = useCRM();
  const [exportCategory, setExportCategory] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');

  const getFilteredLeads = () => {
    return leads.filter(l => {
      if (exportCategory && l.category_id !== exportCategory) return false;
      if (exportStatus && l.status !== exportStatus) return false;
      if (exportFrom && l.created_at < exportFrom) return false;
      if (exportTo && l.created_at > exportTo + 'T23:59:59') return false;
      return true;
    });
  };

  const exportCSV = () => {
    const filtered = getFilteredLeads();
    if (filtered.length === 0) { toast.error('Nenhum lead encontrado com esses filtros'); return; }
    const headers = ['Nome', 'Telefone', 'Mensagem', 'Categoria', 'Profissional', 'Status', 'Origem', 'UTM Source', 'Data'];
    const rows = filtered.map(l => [
      l.name, l.phone, `"${l.message.replace(/"/g, '""')}"`,
      getCategoryName(l.category_id),
      l.professional_id ? getProfessionalName(l.professional_id) : '',
      l.status, l.origin_url, l.utm_source,
      format(new Date(l.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} leads exportados!`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análises</h1>
          <p className="text-sm text-muted-foreground">Dashboards e métricas dos seus leads</p>
        </div>
        <AnalyticsCharts />

        <SalesFunnel />

        {/* Export */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Exportar Leads</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground">Categoria</label>
              <Select value={exportCategory} onValueChange={v => setExportCategory(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 mt-1"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={exportStatus} onValueChange={v => setExportStatus(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="in_progress">Em Atendimento</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="done">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">De</label>
              <Input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} className="w-36 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Até</label>
              <Input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} className="w-36 mt-1" />
            </div>
            <Button onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
