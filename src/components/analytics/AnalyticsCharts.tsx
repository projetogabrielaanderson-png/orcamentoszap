import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import { subDays, format } from 'date-fns';
import { STATUS_CONFIG, KANBAN_COLUMNS } from '@/types/crm';

const PIE_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(142, 71%, 45%)',
  'hsl(25, 95%, 53%)',
  'hsl(280, 68%, 60%)',
  'hsl(350, 80%, 55%)',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '13px',
};

export function AnalyticsCharts() {
  const { leads, professionals, categories, getCategoryName, getProfessionalName } = useCRM();

  // Leads per day (14 days)
  const lineData = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dayStr = format(day, 'dd/MM');
    return { day: dayStr, leads: leads.filter(l => format(new Date(l.created_at), 'dd/MM') === dayStr).length };
  });

  // Leads per professional
  const barData = professionals.map(p => ({
    name: p.name.split(' ')[0],
    leads: leads.filter(l => l.professional_id === p.id).length,
  }));

  // Categories pie
  const pieData = categories.map(c => ({
    name: c.name,
    value: leads.filter(l => l.category_id === c.id).length,
  })).filter(d => d.value > 0);

  // Funnel
  const funnelData = KANBAN_COLUMNS.map(status => ({
    name: STATUS_CONFIG[status].label,
    value: leads.filter(l => l.status === status).length,
    fill: `hsl(var(--${STATUS_CONFIG[status].color}))`,
  }));

  // KPIs
  const doneLeads = leads.filter(l => l.status === 'done').length;
  const conversionRate = leads.length > 0 ? ((doneLeads / leads.length) * 100).toFixed(1) : '0';

  const origins = leads.reduce((acc, l) => {
    const src = l.utm_source || 'direct';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
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
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Leads por Dia</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Leads por Profissional</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Categorias</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Funil de Leads</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel data={funnelData} dataKey="value" nameKey="name">
                  <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" fontSize={12} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
