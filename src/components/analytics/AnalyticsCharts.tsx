import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { subDays, format } from 'date-fns';
import { STATUS_CONFIG, KANBAN_COLUMNS } from '@/types/crm';

export function AnalyticsCharts() {
  const { leads, professionals, categories } = useCRM();

  // Leads per day (14 days)
  const lineData = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dayStr = format(day, 'dd/MM');
    return { day: dayStr, leads: leads.filter(l => format(new Date(l.created_at), 'dd/MM') === dayStr).length };
  });

  const lineConfig: ChartConfig = {
    leads: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  };

  // Leads per professional
  const barData = professionals.map(p => ({
    name: p.name.split(' ')[0],
    leads: leads.filter(l => l.professional_id === p.id).length,
  }));

  const barConfig: ChartConfig = {
    leads: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  };

  // Categories pie
  const pieData = categories
    .map((c, i) => ({
      category: c.id,
      name: c.name,
      value: leads.filter(l => l.category_id === c.id).length,
      fill: `var(--color-cat${i})`,
    }))
    .filter(d => d.value > 0);

  const pieConfig: ChartConfig = {
    value: { label: 'Leads' },
    ...Object.fromEntries(
      categories.map((c, i) => [
        `cat${i}`,
        { label: c.name, color: `hsl(var(--chart-${(i % 6) + 1}))` },
      ])
    ),
  };

  // Funnel
  const funnelData = KANBAN_COLUMNS.map(status => ({
    name: STATUS_CONFIG[status].label,
    value: leads.filter(l => l.status === status).length,
    fill: `hsl(var(--${STATUS_CONFIG[status].color}))`,
  }));

  const funnelConfig: ChartConfig = {
    value: { label: 'Leads' },
    ...Object.fromEntries(
      KANBAN_COLUMNS.map(status => [
        status,
        { label: STATUS_CONFIG[status].label, color: `hsl(var(--${STATUS_CONFIG[status].color}))` },
      ])
    ),
  };

  // Origins pie
  const origins = leads.reduce((acc, l) => {
    const src = l.utm_source || 'direct';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const originData = Object.entries(origins)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      origin: name,
      value,
      fill: `var(--color-origin${i})`,
    }));

  const originConfig: ChartConfig = {
    value: { label: 'Leads' },
    ...Object.fromEntries(
      originData.map((d, i) => [
        `origin${i}`,
        { label: d.origin, color: `hsl(var(--chart-${(i % 6) + 1}))` },
      ])
    ),
  };

  // KPIs
  const doneLeads = leads.filter(l => l.status === 'done').length;
  const conversionRate = leads.length > 0 ? ((doneLeads / leads.length) * 100).toFixed(1) : '0';
  const topOrigin = Object.entries(origins).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="mt-1 text-3xl font-bold text-success">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total de Leads</p>
            <p className="mt-1 text-3xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Origem Principal</p>
            <p className="mt-1 text-3xl font-bold text-primary">{topOrigin?.[0] || '-'}</p>
            <p className="text-xs text-muted-foreground">{topOrigin?.[1] || 0} leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line chart */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads por Dia</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={lineConfig} className="h-[260px] w-full">
              <LineChart data={lineData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="leads" strokeWidth={2.5} dot={{ r: 3 }} stroke="var(--color-leads)" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads por Profissional</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={barConfig} className="h-[260px] w-full">
              <BarChart data={barData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="var(--color-leads)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie chart - Categorias */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base">Categorias</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={pieData} dataKey="value" nameKey="name" />
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie chart - Origens */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-base">Origens</CardTitle>
            <CardDescription>De onde vêm seus leads</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={originConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="origin" hideLabel />} />
                <Pie data={originData} dataKey="value" nameKey="origin" />
                <ChartLegend
                  content={<ChartLegendContent nameKey="origin" />}
                  className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Funil de Leads</CardTitle>
            <CardDescription>Progresso por etapa</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={funnelConfig} className="h-[260px] w-full">
              <FunnelChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Funnel data={funnelData} dataKey="value" nameKey="name">
                  <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" fontSize={12} />
                </Funnel>
              </FunnelChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
