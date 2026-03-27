import { Category, Professional, Lead } from '@/types/crm';

export const mockCategories: Category[] = [
  { id: '1', name: 'Encanador', color: '217 91% 60%', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Eletricista', color: '45 93% 47%', created_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Pintor', color: '142 71% 45%', created_at: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'Pedreiro', color: '25 95% 53%', created_at: '2024-01-01T00:00:00Z' },
  { id: '5', name: 'Marceneiro', color: '280 68% 60%', created_at: '2024-01-01T00:00:00Z' },
];

export const mockProfessionals: Professional[] = [
  { id: '1', name: 'Carlos Silva', category_id: '1', whatsapp: '5511999990001', leads_count: 12, user_id: 'u1', created_at: '2024-01-15T00:00:00Z' },
  { id: '2', name: 'João Santos', category_id: '2', whatsapp: '5511999990002', leads_count: 8, user_id: 'u1', created_at: '2024-02-01T00:00:00Z' },
  { id: '3', name: 'Maria Oliveira', category_id: '3', whatsapp: '5511999990003', leads_count: 15, user_id: 'u1', created_at: '2024-02-10T00:00:00Z' },
  { id: '4', name: 'Pedro Costa', category_id: '4', whatsapp: '5511999990004', leads_count: 6, user_id: 'u1', created_at: '2024-03-01T00:00:00Z' },
  { id: '5', name: 'Ana Ferreira', category_id: '1', whatsapp: '5511999990005', leads_count: 10, user_id: 'u1', created_at: '2024-03-15T00:00:00Z' },
];

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const d = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const mockLeads: Lead[] = [
  { id: 'l1', name: 'Roberto Almeida', phone: '5511988881111', message: 'Preciso de um encanador urgente, cano estourou na cozinha', category_id: '1', professional_id: null, status: 'new', origin_url: 'https://meusite.com/servicos', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'emergencia', user_id: 'u1', created_at: h(0.1), updated_at: h(0.1) },
  { id: 'l2', name: 'Fernanda Lima', phone: '5511988882222', message: 'Quero pintar meu apartamento de 3 quartos', category_id: '3', professional_id: null, status: 'new', origin_url: 'https://meusite.com', utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'promo', user_id: 'u1', created_at: h(0.5), updated_at: h(0.5) },
  { id: 'l3', name: 'Marcos Ribeiro', phone: '5511988883333', message: 'Instalação elétrica completa em casa nova', category_id: '2', professional_id: '2', status: 'in_progress', origin_url: 'https://meusite.com/eletricista', utm_source: 'google', utm_medium: 'organic', utm_campaign: '', user_id: 'u1', created_at: h(3), updated_at: h(1) },
  { id: 'l4', name: 'Patrícia Souza', phone: '5511988884444', message: 'Reforma do banheiro, preciso de pedreiro', category_id: '4', professional_id: '4', status: 'waiting', origin_url: 'https://meusite.com/reformas', utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'reformas2024', user_id: 'u1', created_at: h(8), updated_at: h(2) },
  { id: 'l5', name: 'Lucas Mendes', phone: '5511988885555', message: 'Armário planejado para quarto', category_id: '5', professional_id: null, status: 'new', origin_url: 'https://meusite.com', utm_source: 'direct', utm_medium: '', utm_campaign: '', user_id: 'u1', created_at: h(1), updated_at: h(1) },
  { id: 'l6', name: 'Juliana Pereira', phone: '5511988886666', message: 'Troca de torneira e reparo no vaso', category_id: '1', professional_id: '1', status: 'done', origin_url: 'https://meusite.com/servicos', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'emergencia', user_id: 'u1', created_at: d(1), updated_at: h(5) },
  { id: 'l7', name: 'Ricardo Gomes', phone: '5511988887777', message: 'Preciso trocar a fiação do escritório', category_id: '2', professional_id: '2', status: 'done', origin_url: 'https://meusite.com/eletricista', utm_source: 'google', utm_medium: 'organic', utm_campaign: '', user_id: 'u1', created_at: d(2), updated_at: d(1) },
  { id: 'l8', name: 'Camila Nunes', phone: '5511988888888', message: 'Pintura externa da fachada', category_id: '3', professional_id: '3', status: 'in_progress', origin_url: 'https://meusite.com', utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'fachada', user_id: 'u1', created_at: h(6), updated_at: h(4) },
  { id: 'l9', name: 'André Barbosa', phone: '5511988889999', message: 'Construção de muro de arrimo', category_id: '4', professional_id: null, status: 'new', origin_url: 'https://meusite.com/reformas', utm_source: 'facebook', utm_medium: 'social', utm_campaign: '', user_id: 'u1', created_at: h(2), updated_at: h(2) },
  { id: 'l10', name: 'Beatriz Castro', phone: '5511988880000', message: 'Mesa de jantar sob medida', category_id: '5', professional_id: null, status: 'waiting', origin_url: 'https://meusite.com', utm_source: 'direct', utm_medium: '', utm_campaign: '', user_id: 'u1', created_at: d(1), updated_at: h(12) },
];
