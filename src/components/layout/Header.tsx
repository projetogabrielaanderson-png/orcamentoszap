import { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Bell, LogOut, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import { useLeadNotifications } from '@/hooks/useLeadNotifications';

interface AppHeaderProps {
  onOpenMenu?: () => void;
}

export function AppHeader({ onOpenMenu }: AppHeaderProps) {
  const [dark, setDark] = useState(false);
  const { leads, signOut, user } = useCRM();
  useLeadNotifications();
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof leads>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(leads.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q)).slice(0, 8));
  }, [searchQuery, leads]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between gap-2 border-b border-border bg-card/80 px-3 md:px-6 backdrop-blur-sm">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop search */}
      <div className="hidden md:block relative w-full max-w-md" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar leads por nome ou telefone..."
          className="pl-10 bg-background/50"
        />
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.map(l => (
              <div key={l.id} className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer text-sm" onClick={() => { setShowResults(false); setSearchQuery(''); }}>
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.phone}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{l.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: title spacer */}
      <div className="md:hidden flex-1 min-w-0">
        {!mobileSearchOpen && (
          <span className="text-base font-semibold tracking-tight">CRM ZAP</span>
        )}
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute inset-x-0 top-0 h-14 bg-card flex items-center gap-2 px-3 border-b z-40" ref={searchRef}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
              placeholder="Buscar leads..."
              className="pl-10 h-9"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map(l => (
                  <div key={l.id} className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer text-sm" onClick={() => { setShowResults(false); setSearchQuery(''); setMobileSearchOpen(false); }}>
                    <div>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.phone}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{l.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative" title="Notificações">
          <Bell className="h-5 w-5" />
          {newLeadsCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
              {newLeadsCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(!dark)}
          title={dark ? 'Modo claro' : 'Modo escuro'}
          className="hidden sm:inline-flex"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
        <div className="ml-1 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shrink-0">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
