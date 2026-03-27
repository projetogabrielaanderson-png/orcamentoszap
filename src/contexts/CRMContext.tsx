import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lead, Professional, Category, LeadStatus } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

interface CRMContextType {
  leads: Lead[];
  professionals: Professional[];
  categories: Category[];
  user: User | null;
  loading: boolean;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  assignProfessional: (leadId: string, professionalId: string) => void;
  addProfessional: (pro: { name: string; category_id: string; whatsapp: string }) => void;
  deleteProfessional: (id: string) => void;
  getCategoryName: (id: string) => string;
  getCategoryColor: (id: string) => string;
  getProfessionalName: (id: string) => string;
  signOut: () => void;
  refreshLeads: () => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch categories (always, public read)
  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data as unknown as Category[]);
    });
  }, []);

  // Fetch data when user is available
  const refreshLeads = useCallback(() => {
    if (!user) return;
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLeads(data as unknown as Lead[]);
    });
  }, [user]);

  const refreshProfessionals = useCallback(() => {
    if (!user) return;
    supabase.from('professionals').select('*').order('name').then(({ data }) => {
      if (data) setProfessionals(data as unknown as Professional[]);
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshLeads();
      refreshProfessionals();
    } else {
      setLeads([]);
      setProfessionals([]);
    }
  }, [user, refreshLeads, refreshProfessionals]);

  // Realtime subscription for leads
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        refreshLeads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refreshLeads]);

  const updateLeadStatus = useCallback(async (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, updated_at: new Date().toISOString() } : l));
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) { toast.error('Erro ao atualizar status'); refreshLeads(); }
  }, [refreshLeads]);

  const assignProfessional = useCallback(async (leadId: string, professionalId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, professional_id: professionalId, status: 'waiting' as LeadStatus } : l));
    const { error } = await supabase.from('leads').update({ professional_id: professionalId, status: 'waiting' }).eq('id', leadId);
    if (error) { toast.error('Erro ao atribuir profissional'); refreshLeads(); }
  }, [refreshLeads]);

  const addProfessional = useCallback(async (pro: { name: string; category_id: string; whatsapp: string }) => {
    if (!user) return;
    const { data, error } = await supabase.from('professionals').insert({
      ...pro,
      user_id: user.id,
    }).select().single();
    if (error) { toast.error('Erro ao cadastrar profissional'); return; }
    if (data) setProfessionals(prev => [...prev, data as unknown as Professional]);
  }, [user]);

  const deleteProfessional = useCallback(async (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('professionals').delete().eq('id', id);
    if (error) { toast.error('Erro ao remover profissional'); refreshProfessionals(); }
  }, [refreshProfessionals]);

  const getCategoryName = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.name || 'Sem categoria';
  }, [categories]);

  const getCategoryColor = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.color || '0 0% 50%';
  }, [categories]);

  const getProfessionalName = useCallback((id: string) => {
    return professionals.find(p => p.id === id)?.name || 'Não atribuído';
  }, [professionals]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <CRMContext.Provider value={{
      leads, professionals, categories, user, loading,
      updateLeadStatus, assignProfessional, addProfessional, deleteProfessional,
      getCategoryName, getCategoryColor, getProfessionalName, signOut, refreshLeads,
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}
