
import { Lead, LeadStatus, Language } from '../types';

const STORAGE_KEY = 'dsh_crm_leads';

const MOCK_LEADS: Lead[] = []

const initStorage = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

export const getAllLeads = (): Lead[] => {
  initStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_LEADS;
};

export const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'lastContact' | 'notes'>): Lead => {
  const leads = getAllLeads();
  const newLead: Lead = {
    ...lead,
    id: `L-${100 + leads.length + 1}`,
    createdAt: new Date().toISOString().split('T')[0],
    lastContact: new Date().toISOString().split('T')[0],
    notes: [],
    probability: 50 // Default
  };
  const updatedLeads = [newLead, ...leads];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  return newLead;
};

export const updateLeadStatus = (id: string, status: LeadStatus): Lead[] => {
  const leads = getAllLeads();
  const updatedLeads = leads.map(l => l.id === id ? { ...l, status, lastContact: new Date().toISOString().split('T')[0] } : l);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  return updatedLeads;
};

export const addLeadNote = (id: string, note: string): Lead[] => {
  const leads = getAllLeads();
  const updatedLeads = leads.map(l => l.id === id ? { ...l, notes: [...l.notes, note] } : l);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  return updatedLeads;
};

export const PIPELINE_STAGES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
