import { useCRM } from '@/contexts/CRMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, XCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function SalesFunnel() {
  const { leads } = useCRM();

  const total = leads.length;
  const inProgress = leads.filter(l => l.status === 'in_progress' || l.status === 'waiting').length;
  const quoted = leads.filter(l => (Number(l.quote_value) || 0) > 0).length;
  const won = leads.filter(l => l.outcome === 'won');
  const lost = leads.filter(l => l.outcome === 'lost');

  const wonRevenue = won.reduce((s, l) => s + (Number(l.closed_value) || 0), 0);
  const lostValue = lost.reduce((s, l) => s + (Number(l.quote_value) || 0), 0);
  const ticketAvg = won.length > 0 ? wonRevenue / won.length : 0;
  const winRate = won.length + lost.length > 0
    ? ((won.length / (won.length + lost.length)) * 100).toFixed(1)
    : '0';

  const stages = [
    { label: 'Total de Leads', count: total, pct: 100, color: 'bg-primary', icon: <TrendingUp className="h-4 w-4" /> },
    { label: 'Em Atendimento', count: inProgress, pct: total > 0 ? (inProgress / total) * 100 : 0, color: 'bg-status-in-progress', icon: <Clock className="h-4 w-4" /> },
    { label: 'Orçamento Enviado', count: quoted, pct: total > 0 ? (quoted / total) * 100 : 0, color: 'bg-status-waiting', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Ganhos', count: won.length, pct: total > 0 ? (won.length / total) * 100 : 0, color: 'bg-status-done', icon: <Trophy className="h-4 w-4" /> },
    { label: 'Perdidos', count: lost.length, pct: total > 0 ? (lost.length / total) * 100 : 0, color: 'bg-destructive', icon: <XCircle className="h-4 w-4" /> },
  ];

  // Lost reasons summary
  const lostReasonCount: Record<string, number> = {};
  lost.forEach(l => {
    const r = (l.lost_reason || 'Sem motivo informado').trim();
    lostReasonCount[r] = (lostReasonCount[r] || 0) + 1;
  });
  const topReasons = Object.entries(lostReasonCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Funil de Vendas
          </CardTitle>
          <CardDescription>Conversão por etapa do pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stages.map(s => (
            <div key={s.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {s.icon} {s.label}
                </span>
                <span className="font-semibold tabular-nums">
                  {s.count} <span className="text-xs text-muted-foreground">({s.pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo Financeiro</CardTitle>
          <CardDescription>Performance de vendas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Receita fechada</p>
              <p className="text-xl font-bold text-status-done">{formatBRL(wonRevenue)}</p>
            </div>
            <Trophy className="h-8 w-8 text-status-done/30" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Taxa de conversão</p>
              <p className="text-xl font-bold">{winRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary/30" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Ticket médio</p>
              <p className="text-xl font-bold">{formatBRL(ticketAvg)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary/30" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Valor perdido</p>
              <p className="text-xl font-bold text-destructive">{formatBRL(lostValue)}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive/30" />
          </div>
        </CardContent>
      </Card>

      {topReasons.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" /> Top motivos de perda
            </CardTitle>
            <CardDescription>Principais razões pelas quais leads não fecharam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topReasons.map(([reason, count]) => {
                const pct = (count / lost.length) * 100;
                return (
                  <div key={reason} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground line-clamp-1">{reason}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-destructive/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
