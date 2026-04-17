import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/contexts/CRMContext';
import { Lead, STATUS_CONFIG } from '@/types/crm';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Phone, Calendar, Tag, User, CheckCircle2, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LeadModal } from '@/components/leads/LeadModal';

export default function FinalizedPage() {
  const { leads, categories, professionals, getCategoryName, getProfessionalName } = useCRM();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [professionalFilter, setProfessionalFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const finalizedLeads = useMemo(() => {
    return leads.filter(l => l.status === 'done');
  }, [leads]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    finalizedLeads.forEach(l => l.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [finalizedLeads]);

  // Professionals who have finalized leads
  const relevantPros = useMemo(() => {
    const proIds = new Set(finalizedLeads.map(l => l.professional_id).filter(Boolean));
    return professionals.filter(p => proIds.has(p.id));
  }, [finalizedLeads, professionals]);

  const filtered = useMemo(() => {
    let result = finalizedLeads;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.message.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(l => l.category_id === categoryFilter);
    }

    if (professionalFilter !== 'all') {
      result = result.filter(l => l.professional_id === professionalFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter(l => new Date(l.updated_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      result = result.filter(l => new Date(l.updated_at) <= to);
    }

    if (tagFilter) {
      result = result.filter(l => l.tags?.includes(tagFilter));
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'category') cmp = getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id));
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [finalizedLeads, search, categoryFilter, professionalFilter, dateFrom, dateTo, tagFilter, sortBy, sortDir, getCategoryName]);

  const hasActiveFilters = search || categoryFilter !== 'all' || professionalFilter !== 'all' || dateFrom || dateTo || tagFilter;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setProfessionalFilter('all');
    setDateFrom('');
    setDateTo('');
    setTagFilter('');
  };

  // Category stats
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    finalizedLeads.forEach(l => {
      map[l.category_id] = (map[l.category_id] || 0) + 1;
    });
    return map;
  }, [finalizedLeads]);

  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Mensagem', 'Categoria', 'Profissional', 'Resultado', 'Valor Orçamento', 'Valor Fechado', 'Motivo Perda', 'Finalizado em', 'Tags'];
    const rows = filtered.map(l => [
      l.name,
      l.phone,
      l.message.replace(/"/g, '""'),
      getCategoryName(l.category_id),
      l.professional_id ? getProfessionalName(l.professional_id) : '-',
      l.outcome === 'won' ? 'Ganho' : l.outcome === 'lost' ? 'Perdido' : '-',
      l.quote_value != null ? Number(l.quote_value).toFixed(2).replace('.', ',') : '',
      l.closed_value != null ? Number(l.closed_value).toFixed(2).replace('.', ',') : '',
      (l.lost_reason || '').replace(/"/g, '""'),
      format(new Date(l.updated_at), 'dd/MM/yyyy HH:mm'),
      (l.tags || []).join(', '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-finalizados-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-7 w-7 text-status-done" />
              Leads Finalizados
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {finalizedLeads.length} lead{finalizedLeads.length !== 1 && 's'} finalizado{finalizedLeads.length !== 1 && 's'} no total
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Category stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map(cat => (
            <Card
              key={cat.id}
              className={`cursor-pointer transition-all hover:shadow-md ${categoryFilter === cat.id ? 'ring-2 ring-primary shadow-md' : ''}`}
              onClick={() => setCategoryFilter(prev => prev === cat.id ? 'all' : cat.id)}
            >
              <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                <span className="text-2xl font-bold text-foreground">{categoryStats[cat.id] || 0}</span>
                <span className="text-[11px] font-medium text-muted-foreground truncate w-full">{cat.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Filtros</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1 text-xs" onClick={clearFilters}>
                  <X className="h-3 w-3" /> Limpar
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Professional */}
              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos profissionais</SelectItem>
                  {relevantPros.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date from */}
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="De" />

              {/* Date to */}
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="Até" />
            </div>

            {/* Tags filter */}
            {allTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
                  <Tag className="h-3 w-3" /> Tags:
                </span>
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={tagFilter === tag ? 'default' : 'outline'}
                    className="cursor-pointer text-[11px]"
                    onClick={() => setTagFilter(prev => prev === tag ? '' : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sort controls */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Ordenar por:</span>
          {(['date', 'name', 'category'] as const).map(s => (
            <Button
              key={s}
              variant={sortBy === s ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                if (sortBy === s) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                else { setSortBy(s); setSortDir(s === 'date' ? 'desc' : 'asc'); }
              }}
            >
              {s === 'date' ? 'Data' : s === 'name' ? 'Nome' : 'Categoria'}
              {sortBy === s && (sortDir === 'asc' ? ' ↑' : ' ↓')}
            </Button>
          ))}
          <span className="ml-auto font-medium text-foreground">{filtered.length} resultado{filtered.length !== 1 && 's'}</span>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {hasActiveFilters ? 'Nenhum lead encontrado com os filtros aplicados' : 'Nenhum lead finalizado ainda'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="hidden md:table-cell">Profissional</TableHead>
                      <TableHead className="hidden lg:table-cell">Tags</TableHead>
                      <TableHead>Finalizado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(lead => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-done/10">
                              <User className="h-4 w-4 text-status-done" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{lead.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate sm:hidden">{lead.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {lead.phone}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">
                            {getCategoryName(lead.category_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {lead.professional_id ? getProfessionalName(lead.professional_id) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(lead.tags || []).slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                            {(lead.tags || []).length > 3 && (
                              <Badge variant="secondary" className="text-[10px]">+{lead.tags.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(lead.updated_at), "dd/MM/yy", { locale: ptBR })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead detail modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </AppLayout>
  );
}
