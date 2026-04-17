import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Trophy } from 'lucide-react';
import { isToday, isThisMonth, isThisWeek, subDays } from 'date-fns';

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function KPICards() {
  const { leads } = useCRM();

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

  // Pipeline financeiro
  const wonLeads = leads.filter(l => l.outcome === 'won');
  const lostLeads = leads.filter(l => l.outcome === 'lost');
  const decided = wonLeads.length + lostLeads.length;
  const winRate = decided > 0 ? ((wonLeads.length / decided) * 100).toFixed(1) : '0';

  const wonRevenue = wonLeads.reduce((sum, l) => sum + (Number(l.closed_value) || 0), 0);
  const wonRevenueMonth = wonLeads
    .filter(l => isThisMonth(new Date(l.updated_at)))
    .reduce((sum, l) => sum + (Number(l.closed_value) || 0), 0);

  const ticketAvg = wonLeads.length > 0 ? wonRevenue / wonLeads.length : 0;

  // Pipeline em aberto (orçamentos enviados sem decisão)
  const openPipeline = leads
    .filter(l => l.outcome == null && (Number(l.quote_value) || 0) > 0)
    .reduce((sum, l) => sum + (Number(l.quote_value) || 0), 0);

  const cards = [
    {
      title: 'Leads Hoje',
      value: leadsToday.toString(),
      change: `${Number(todayChange) >= 0 ? '+' : ''}${todayChange}%`,
      trend: Number(todayChange) >= 0 ? 'up' : 'down',
      description: 'Comparado com ontem',
      footer: `${leadsWeek} esta semana • ${leadsMonth} no mês`,
      icon: null,
    },
    {
      title: 'Receita Fechada',
      value: formatBRL(wonRevenue),
      change: `${wonLeads.length} ganhos`,
      trend: 'up' as const,
      description: 'Total acumulado',
      footer: `${formatBRL(wonRevenueMonth)} este mês`,
      icon: <Trophy className="h-3 w-3" />,
    },
    {
      title: 'Taxa de Conversão',
      value: `${winRate}%`,
      change: `${wonLeads.length}/${decided}`,
      trend: Number(winRate) >= 30 ? 'up' : 'down',
      description: 'Ganhos vs decididos',
      footer: `${lostLeads.length} perdidos • ${leads.length - decided} em aberto`,
      icon: null,
    },
    {
      title: 'Ticket Médio',
      value: formatBRL(ticketAvg),
      change: `${formatBRL(openPipeline)}`,
      trend: 'up' as const,
      description: 'Por venda fechada',
      footer: `Pipeline em aberto: ${formatBRL(openPipeline)}`,
      icon: <DollarSign className="h-3 w-3" />,
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
                {card.icon ?? (card.trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />)}
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
