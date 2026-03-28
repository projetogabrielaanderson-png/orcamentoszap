import { useMemo, useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { subDays, format } from 'date-fns';

export function QuickCharts() {
  const { leads, professionals } = useCRM();
  const [timeRange, setTimeRange] = useState('7d');

  const areaData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(new Date(), days - 1 - i);
      const dayStr = format(day, 'dd/MM');
      const count = leads.filter(l => format(new Date(l.created_at), 'dd/MM') === dayStr).length;
      return { day: dayStr, leads: count };
    });
  }, [leads, timeRange]);

  const areaConfig: ChartConfig = {
    leads: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  };

  const barData = professionals.map(p => ({
    name: p.name.split(' ')[0],
    leads: leads.filter(l => l.professional_id === p.id).length,
  })).sort((a, b) => b.leads - a.leads).slice(0, 6);

  const barConfig: ChartConfig = {
    leads: { label: 'Leads', color: 'hsl(var(--chart-1))' },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Interactive Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Leads por Dia</CardTitle>
            <CardDescription>Evolução de captação de leads</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant="outline"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="7d" className="h-8 px-3 text-xs">7 dias</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-3 text-xs">30 dias</ToggleGroupItem>
            <ToggleGroupItem value="90d" className="h-8 px-3 text-xs">90 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 sm:hidden" aria-label="Período">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={areaConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={areaData} accessibilityLayer>
              <defs>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                fontSize={11}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="natural"
                dataKey="leads"
                stroke="var(--color-leads)"
                fill="url(#fillLeads)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Leads por Profissional</CardTitle>
          <CardDescription>Top profissionais por volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[220px] w-full">
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
    </div>
  );
}
