import { useCRM } from '@/contexts/CRMContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Calendar, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.professional ? 1 : 0) +
    (filters.utmSource ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);
  const hasActiveFilters = activeCount > 0 || !!filters.search;

  const clearAll = () => setFilters({ category: '', professional: '', search: '', dateFrom: '', dateTo: '', utmSource: '' });

  const advancedFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={filters.category || 'all'} onValueChange={(v) => setFilters({ ...filters, category: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Profissional</Label>
        <Select value={filters.professional || 'all'} onValueChange={(v) => setFilters({ ...filters, professional: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos profissionais</SelectItem>
            {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {utmSources.length > 0 && (
        <div className="space-y-2">
          <Label>Origem UTM</Label>
          <Select value={filters.utmSource || 'all'} onValueChange={(v) => setFilters({ ...filters, utmSource: v === 'all' ? '' : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas origens</SelectItem>
              {utmSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Período</Label>
        <div className="flex items-center gap-2">
          <Input type="date" value={filters.dateFrom || ''} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="flex-1" />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" value={filters.dateTo || ''} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="flex-1" />
        </div>
      </div>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
          <X className="mr-1 h-3 w-3" /> Limpar todos
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
      <div className="flex items-center gap-2 md:flex-1 md:max-w-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Buscar por nome ou telefone..."
            className="pl-10 h-9"
          />
        </div>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0 relative h-9 w-9" aria-label="Filtros">
              <SlidersHorizontal className="h-4 w-4" />
              {activeCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {advancedFields}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop inline filters */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
        <Select value={filters.category || 'all'} onValueChange={(v) => setFilters({ ...filters, category: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.professional || 'all'} onValueChange={(v) => setFilters({ ...filters, professional: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos profissionais</SelectItem>
            {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {utmSources.length > 0 && (
          <Select value={filters.utmSource || 'all'} onValueChange={(v) => setFilters({ ...filters, utmSource: v === 'all' ? '' : v })}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Origem UTM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas origens</SelectItem>
              {utmSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="mr-1 h-3 w-3" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
