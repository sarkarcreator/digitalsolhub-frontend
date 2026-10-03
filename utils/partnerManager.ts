
import { Partner } from '../types';

const STORAGE_KEY = 'dsh_partners';

const initStorage = () => {
  // Partner records are server-managed. Do not seed fake/demo partners in the browser.
  return;
};

export const getAllPartners = (): Partner[] => {
  initStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getPartnerBySlug = (slug: string): Partner | undefined => {
  const partners = getAllPartners();
  return partners.find(p => p.slug === slug);
};

export const getPartnerById = (id: string): Partner | undefined => {
  const partners = getAllPartners();
  return partners.find(p => p.id === id);
};

export const registerPartner = (data: Partial<Partner>): Partner => {
  const partners = getAllPartners();
  const newPartner: Partner = {
    id: `PARTNER-${Date.now()}`,
    slug: data.slug || `partner-${Date.now()}`,
    name: data.name || 'New Institute',
    tagline: data.tagline || '',
    logo: data.logo || '',
    brandColor: data.brandColor || '#3b82f6',
    email: data.email || '',
    phone: data.phone || '',
    website: data.website || '',
    status: 'Pending',
    plan: 'Starter',
    createdAt: new Date().toISOString().split('T')[0],
    settings: {
      enableBlockchain: false,
      enableAttestation: false
    },
    stats: {
      certificatesIssued: 0,
      students: 0
    }
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...partners, newPartner]));
  return newPartner;
};

export const updatePartner = (id: string, updates: Partial<Partner>): Partner | null => {
  const partners = getAllPartners();
  const idx = partners.findIndex(p => p.id === id);
  if (idx === -1) return null;
  
  const updatedPartner = { ...partners[idx], ...updates };
  partners[idx] = updatedPartner;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  return updatedPartner;
};
