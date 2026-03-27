import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Lead, Professional, Category, LeadStatus } from '@/types/crm';
import { mockLeads, mockProfessionals, mockCategories } from '@/data/mockData';

interface CRMState {
  leads: Lead[];
  professionals: Professional[];
  categories: Category[];
}

type CRMAction =
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'UPDATE_LEAD'; payload: Partial<Lead> & { id: string } }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'SET_PROFESSIONALS'; payload: Professional[] }
  | { type: 'ADD_PROFESSIONAL'; payload: Professional }
  | { type: 'DELETE_PROFESSIONAL'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] };

interface CRMContextType extends CRMState {
  dispatch: React.Dispatch<CRMAction>;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  assignProfessional: (leadId: string, professionalId: string) => void;
  addProfessional: (pro: Omit<Professional, 'id' | 'leads_count' | 'user_id' | 'created_at'>) => void;
  deleteProfessional: (id: string) => void;
  getCategoryName: (id: string) => string;
  getCategoryColor: (id: string) => string;
  getProfessionalName: (id: string) => string;
}

function crmReducer(state: CRMState, action: CRMAction): CRMState {
  switch (action.type) {
    case 'SET_LEADS':
      return { ...state, leads: action.payload };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(l =>
          l.id === action.payload.id ? { ...l, ...action.payload, updated_at: new Date().toISOString() } : l
        ),
      };
    case 'ADD_LEAD':
      return { ...state, leads: [action.payload, ...state.leads] };
    case 'SET_PROFESSIONALS':
      return { ...state, professionals: action.payload };
    case 'ADD_PROFESSIONAL':
      return { ...state, professionals: [...state.professionals, action.payload] };
    case 'DELETE_PROFESSIONAL':
      return { ...state, professionals: state.professionals.filter(p => p.id !== action.payload) };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    default:
      return state;
  }
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(crmReducer, {
    leads: [],
    professionals: [],
    categories: [],
  });

  useEffect(() => {
    // Load from localStorage or use mock data
    const savedLeads = localStorage.getItem('crm_leads');
    const savedPros = localStorage.getItem('crm_professionals');
    const savedCats = localStorage.getItem('crm_categories');

    dispatch({ type: 'SET_LEADS', payload: savedLeads ? JSON.parse(savedLeads) : mockLeads });
    dispatch({ type: 'SET_PROFESSIONALS', payload: savedPros ? JSON.parse(savedPros) : mockProfessionals });
    dispatch({ type: 'SET_CATEGORIES', payload: savedCats ? JSON.parse(savedCats) : mockCategories });
  }, []);

  useEffect(() => {
    if (state.leads.length) localStorage.setItem('crm_leads', JSON.stringify(state.leads));
  }, [state.leads]);
  useEffect(() => {
    if (state.professionals.length) localStorage.setItem('crm_professionals', JSON.stringify(state.professionals));
  }, [state.professionals]);
  useEffect(() => {
    if (state.categories.length) localStorage.setItem('crm_categories', JSON.stringify(state.categories));
  }, [state.categories]);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    dispatch({ type: 'UPDATE_LEAD', payload: { id, status } });
  }, []);

  const assignProfessional = useCallback((leadId: string, professionalId: string) => {
    dispatch({ type: 'UPDATE_LEAD', payload: { id: leadId, professional_id: professionalId, status: 'waiting' } });
  }, []);

  const addProfessional = useCallback((pro: Omit<Professional, 'id' | 'leads_count' | 'user_id' | 'created_at'>) => {
    const newPro: Professional = {
      ...pro,
      id: crypto.randomUUID(),
      leads_count: 0,
      user_id: 'u1',
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROFESSIONAL', payload: newPro });
  }, []);

  const deleteProfessional = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROFESSIONAL', payload: id });
  }, []);

  const getCategoryName = useCallback((id: string) => {
    return state.categories.find(c => c.id === id)?.name || 'Sem categoria';
  }, [state.categories]);

  const getCategoryColor = useCallback((id: string) => {
    return state.categories.find(c => c.id === id)?.color || '0 0% 50%';
  }, [state.categories]);

  const getProfessionalName = useCallback((id: string) => {
    return state.professionals.find(p => p.id === id)?.name || 'Não atribuído';
  }, [state.professionals]);

  return (
    <CRMContext.Provider value={{
      ...state, dispatch,
      updateLeadStatus, assignProfessional, addProfessional, deleteProfessional,
      getCategoryName, getCategoryColor, getProfessionalName,
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
