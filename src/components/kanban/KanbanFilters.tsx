import { useCRM } from '@/contexts/CRMContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Filters {
  category: string;
  professional: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  utmSource: string;
}

interface KanbanFiltersProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

export function KanbanFilters({ filters, setFilters }: KanbanFiltersProps) {
  const { categories, professionals, leads } = useCRM();

  const utmSources = [...new Set(leads.map(l => l.utm_source).filter(Boolean))];

  const hasActiveFilters = filters.category || filters.professional || filters.search || filters.dateFrom || filters.dateTo || filters.utmSource;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Buscar por nome ou telefone..."
          className="pl-10"
        />
      </div>
      <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.professional} onValueChange={(v) => setFilters({ ...filters, professional: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Profissional" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos profissionais</SelectItem>
          {professionals.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {utmSources.length > 0 && (
        <Select value={filters.utmSource || ''} onValueChange={(v) => setFilters({ ...filters, utmSource: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Origem UTM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            {utmSources.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input type="date" value={filters.dateFrom || ''} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="w-36 h-9" />
        <span className="text-xs text-muted-foreground">até</span>
        <Input type="date" value={filters.dateTo || ''} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="w-36 h-9" />
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => setFilters({ category: '', professional: '', search: '', dateFrom: '', dateTo: '', utmSource: '' })}>
          <X className="mr-1 h-3 w-3" /> Limpar
        </Button>
      )}
    </div>
  );
}
