import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Tag, UserCheck } from 'lucide-react';
import { isToday, isThisMonth } from 'date-fns';

export function KPICards() {
  const { leads, professionals, categories } = useCRM();

  const leadsToday = leads.filter(l => isToday(new Date(l.created_at))).length;
  const leadsMonth = leads.filter(l => isThisMonth(new Date(l.created_at))).length;

  // Most active category
  const catCounts: Record<string, number> = {};
  leads.forEach(l => { catCounts[l.category_id] = (catCounts[l.category_id] || 0) + 1; });
  const topCatId = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCatName = categories.find(c => c.id === topCatId)?.name || '-';

  // Top professional
  const proCounts: Record<string, number> = {};
  leads.filter(l => l.professional_id).forEach(l => { proCounts[l.professional_id!] = (proCounts[l.professional_id!] || 0) + 1; });
  const topProId = Object.entries(proCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topProName = professionals.find(p => p.id === topProId)?.name || '-';

  const kpis = [
    { label: 'Leads Hoje', value: leadsToday, icon: TrendingUp, accent: 'text-primary' },
    { label: 'Leads no Mês', value: leadsMonth, icon: Users, accent: 'text-success' },
    { label: 'Categoria Top', value: topCatName, icon: Tag, accent: 'text-warning' },
    { label: 'Profissional Destaque', value: topProName, icon: UserCheck, accent: 'text-info' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map(kpi => (
        <Card key={kpi.label} className="group hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted ${kpi.accent}`}>
              <kpi.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="truncate text-xl font-bold">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
