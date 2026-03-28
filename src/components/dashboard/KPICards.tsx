import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Tag, UserCheck } from 'lucide-react';
import { isToday, isThisMonth, isThisWeek, subDays } from 'date-fns';

export function KPICards() {
  const { leads, professionals, categories } = useCRM();

  const leadsToday = leads.filter(l => isToday(new Date(l.created_at))).length;
  const leadsMonth = leads.filter(l => isThisMonth(new Date(l.created_at))).length;
  const leadsWeek = leads.filter(l => isThisWeek(new Date(l.created_at))).length;

  // Yesterday comparison
  const yesterday = subDays(new Date(), 1);
  const leadsYesterday = leads.filter(l => {
    const d = new Date(l.created_at);
    return d.toDateString() === yesterday.toDateString();
  }).length;
  const todayChange = leadsYesterday > 0
    ? (((leadsToday - leadsYesterday) / leadsYesterday) * 100).toFixed(0)
    : leadsToday > 0 ? '+100' : '0';

  // Conversion rate
  const doneLeads = leads.filter(l => l.status === 'done').length;
  const conversionRate = leads.length > 0 ? ((doneLeads / leads.length) * 100).toFixed(1) : '0';

  // Most active category
  const catCounts: Record<string, number> = {};
  leads.forEach(l => { catCounts[l.category_id] = (catCounts[l.category_id] || 0) + 1; });
  const topCatId = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCatName = categories.find(c => c.id === topCatId)?.name || '-';

  // Top professional
  const proCounts: Record<string, number> = {};
  leads.filter(l => l.professional_id).forEach(l => { proCounts[l.professional_id!] = (proCounts[l.professional_id!] || 0) + 1; });
  const topProId = Object.entries(proCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topProName = professionals.find(p => p.id === topProId)?.name?.split(' ')[0] || '-';
  const topProCount = topProId ? proCounts[topProId] : 0;

  const cards = [
    {
      title: 'Leads Hoje',
      value: leadsToday.toString(),
      change: `${Number(todayChange) >= 0 ? '+' : ''}${todayChange}%`,
      trend: Number(todayChange) >= 0 ? 'up' : 'down',
      description: 'Comparado com ontem',
      footer: `${leadsWeek} leads esta semana`,
    },
    {
      title: 'Leads no Mês',
      value: leadsMonth.toString(),
      change: `${leads.length} total`,
      trend: 'up' as const,
      description: 'Mês atual',
      footer: `${leads.length} leads no total`,
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      change: `${doneLeads} finalizados`,
      trend: Number(conversionRate) >= 30 ? 'up' : 'down',
      description: 'Leads finalizados',
      footer: `De ${leads.length} leads totais`,
    },
    {
      title: 'Profissional Destaque',
      value: topProName,
      change: `${topProCount} leads`,
      trend: 'up' as const,
      description: 'Maior volume',
      footer: `Categoria top: ${topCatName}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map(card => (
        <Card key={card.title} className="@container/card">
          <CardHeader className="relative">
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge
                variant="outline"
                className={`flex gap-1 rounded-lg text-xs ${
                  card.trend === 'up'
                    ? 'text-success border-success/30 bg-success/5'
                    : 'text-destructive border-destructive/30 bg-destructive/5'
                }`}
              >
                {card.trend === 'up' ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {card.change}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="flex items-center gap-1 font-medium leading-none">
              {card.description}
              {card.trend === 'up' ? (
                <TrendingUp className="size-4 text-success" />
              ) : (
                <TrendingDown className="size-4 text-destructive" />
              )}
            </div>
            <div className="text-muted-foreground">{card.footer}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
