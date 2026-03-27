import { useCRM } from '@/contexts/CRMContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Filters {
  category: string;
  professional: string;
  search: string;
}

interface KanbanFiltersProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

export function KanbanFilters({ filters, setFilters }: KanbanFiltersProps) {
  const { categories, professionals } = useCRM();

  const hasActiveFilters = filters.category || filters.professional || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Buscar leads..."
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
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => setFilters({ category: '', professional: '', search: '' })}>
          <X className="mr-1 h-3 w-3" /> Limpar
        </Button>
      )}
    </div>
  );
}
