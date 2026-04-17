export type LeadStatus = 'new' | 'in_progress' | 'waiting' | 'done';
export type LeadOutcome = 'won' | 'lost' | null;
export type TemplateAudience = 'professional' | 'client';

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Professional {
  id: string;
  name: string;
  category_id?: string;
  category_ids?: string[];
  whatsapp: string;
  leads_count: number;
  user_id: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  message: string;
  category_id: string;
  professional_id: string | null;
  status: LeadStatus;
  origin_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  quote_value?: number | null;
  closed_value?: number | null;
  outcome?: LeadOutcome;
  lost_reason?: string | null;
}

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgClass: string; textClass: string }> = {
  new: { label: 'Novo Lead', color: 'status-new', bgClass: 'bg-status-new/10', textClass: 'text-status-new' },
  in_progress: { label: 'Em Atendimento', color: 'status-in-progress', bgClass: 'bg-status-in-progress/10', textClass: 'text-status-in-progress' },
  waiting: { label: 'Aguardando Profissional', color: 'status-waiting', bgClass: 'bg-status-waiting/10', textClass: 'text-status-waiting' },
  done: { label: 'Finalizado', color: 'status-done', bgClass: 'bg-status-done/10', textClass: 'text-status-done' },
};

export const KANBAN_COLUMNS: LeadStatus[] = ['new', 'in_progress', 'waiting'];
