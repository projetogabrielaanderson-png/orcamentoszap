import { useCRM } from '@/contexts/CRMContext';
import { AlertTriangle, TrendingUp, UserX } from 'lucide-react';

export function AlertBanners() {
  const { leads, professionals, categories } = useCRM();

  const alerts: { icon: any; text: string; type: 'warning' | 'info' }[] = [];

  // Category with no leads today
  const todayCats = new Set(leads.filter(l => {
    const d = new Date(l.created_at);
    return d.toDateString() === new Date().toDateString();
  }).map(l => l.category_id));
  const idleCats = categories.filter(c => !todayCats.has(c.id));
  if (idleCats.length > 0) {
    alerts.push({ icon: AlertTriangle, text: `${idleCats.map(c => c.name).join(', ')} sem leads hoje`, type: 'warning' });
  }

  // Professionals with no leads
  const prosWithLeads = new Set(leads.map(l => l.professional_id).filter(Boolean));
  const idlePros = professionals.filter(p => !prosWithLeads.has(p.id));
  if (idlePros.length > 0) {
    alerts.push({ icon: UserX, text: `${idlePros.map(p => p.name).join(', ')} sem leads atribuídos`, type: 'info' });
  }

  // Lead spike
  const newLeads = leads.filter(l => l.status === 'new').length;
  if (newLeads >= 5) {
    alerts.push({ icon: TrendingUp, text: `Pico de leads! ${newLeads} leads novos aguardando`, type: 'warning' });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
            alert.type === 'warning'
              ? 'border-warning/30 bg-warning/5 text-warning'
              : 'border-info/30 bg-info/5 text-info'
          }`}
        >
          <alert.icon className="h-4 w-4 shrink-0" />
          {alert.text}
        </div>
      ))}
    </div>
  );
}
