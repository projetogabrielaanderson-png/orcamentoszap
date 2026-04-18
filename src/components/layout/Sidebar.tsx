import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Globe,
  BarChart3,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/finalized', label: 'Finalizados', icon: CheckCircle2 },
  { href: '/professionals', label: 'Profissionais', icon: Users },
  { href: '/capture', label: 'Captação', icon: Globe },
  { href: '/templates', label: 'Templates', icon: MessageSquareText },
  { href: '/analytics', label: 'Análises', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

interface AppSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ mobile = false, onNavigate }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isCollapsed = !mobile && collapsed;

  const containerClass = mobile
    ? 'flex h-full w-full flex-col bg-sidebar'
    : cn(
        'fixed left-0 top-0 z-40 hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60'
      );

  return (
    <aside className={containerClass}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
            CRM ZAP
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </aside>
  );
}
