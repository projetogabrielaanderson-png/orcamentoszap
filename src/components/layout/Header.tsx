import { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Bell, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import { useLeadNotifications } from '@/hooks/useLeadNotifications';

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const { leads, signOut, user } = useCRM();
  useLeadNotifications();
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof leads>([]);
  const [showResults, setShowResults] = useState(false);
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md" ref={searchRef}>
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

      <div className="flex items-center gap-2">
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
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
        <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
