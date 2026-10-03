
import { Franchise } from '../types';

const STORAGE_KEY = 'dsh_franchises';

const MOCK_FRANCHISES: Franchise[] = [[]

const initStorage = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

export const getAllFranchises = (): Franchise[] => {
  initStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_FRANCHISES;
};

export const getFranchiseById = (id: string): Franchise | undefined => {
  const list = getAllFranchises();
  return list.find(f => f.id === id);
};

export const addFranchise = (data: Partial<Franchise>): Franchise => {
  const list = getAllFranchises();
  const newFranchise: Franchise = {
    id: `ATP-${data.city?.substring(0,3).toUpperCase()}-${list.length + 100}`,
    name: data.name || 'New Institute',
    type: data.type || 'Partner',
    accreditationType: data.accreditationType || 'ATP',
    ownerName: data.ownerName || '',
    email: data.email || '',
    phone: data.phone || '',
    city: data.city || '',
    country: data.country || '',
    status: 'Pending',
    joinedDate: new Date().toISOString().split('T')[0],
    studentsCount: 0,
    revenue: 0,
    currency: data.currency || 'USD',
    commissionRate: 20, 
    walletBalance: 0,
    whiteLabel: { enabled: false },
    allowedCourses: []
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, newFranchise]));
  return newFranchise;
};

export const updateFranchiseStatus = (id: string, status: Franchise['status']): Franchise[] => {
  const list = getAllFranchises();
  const updated = list.map(f => f.id === id ? { ...f, status } : f);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateFranchiseSettings = (id: string, settings: Partial<Franchise>): Franchise[] => {
    const list = getAllFranchises();
    const updated = list.map(f => f.id === id ? { ...f, ...settings } : f);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};
