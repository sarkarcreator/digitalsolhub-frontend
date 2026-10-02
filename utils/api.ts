import { Language } from '../types';

export type UserRole = 'student' | 'client' | 'admin' | 'partner';

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  studentId?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterPayload {
  role: Exclude<UserRole, 'admin'>;
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  student_id?: string;
  course?: string;
  industry?: string;
  project?: string;
  language?: Language;
}

export interface AdminStudentLead {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  course: string;
  status: 'invited' | 'registered' | 'disabled';
  createdAt?: string;
}

export interface AdminStudentCreatePayload {
  name: string;
  email: string;
  phone: string;
  course: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface DashboardItem {
  id: number | string;
  role: UserRole;
  category: string;
  type?: string | null;
  status?: string | null;
  payload: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPortalCourse {
  id: number | string;
  courseId: string;
  courseName: string;
  progress: number;
  totalLessons?: number;
  lessonsCompleted?: number;
  status: string;
  enrollmentDate?: string | null;
  completionDate?: string | null;
}

export interface StudentPortalCertificate {
  id: string;
  databaseId?: number | string;
  courseName: string;
  issueDate?: string | null;
  issuer?: string | null;
  certificateUrl?: string | null;
  status: string;
}

export interface StudentPortalDashboard {
  profile: Record<string, any> | null;
  courses: StudentPortalCourse[];
  certificates: StudentPortalCertificate[];
  worksheets: Array<Record<string, any>>;
  announcements: Array<Record<string, any>>;
  stats: {
    activeCourses: number;
    completedCourses: number;
    certificates: number;
    attestations: number;
  };
}

export interface ClientPortalDashboard {
  profile: Record<string, any> | null;
  projects: Array<Record<string, any>>;
  invoices: Array<Record<string, any>>;
  messages: Array<{ id: number | string; role: 'client' | 'team'; text: string; subject?: string }>;
  files: Array<Record<string, any>>;
  notifications: Array<Record<string, any>>;
  stats: {
    activeProjects: number;
    completedProjects: number;
    pendingAmount: number;
    paidAmount?: number;
    completedInvoices?: number;
  };
}

export interface PublicCertificateVerification {
  id: string;
  studentName: string;
  courseName: string;
  issueDate?: string | null;
  issuer?: string | null;
  certificateUrl?: string | null;
  status: string;
}

export interface PublicCredentialVerification extends PublicCertificateVerification {
  type?: 'badge' | 'attestation';
  payload?: Record<string, any>;
}

export interface ApplicationPayload {
  applicationType: string;
  name: string;
  email: string;
  phone: string;
  targetCountry?: string;
  category?: string;
  budget?: string;
  details?: string;
  document?: File | null;
}

export interface AdminOverview {
  students: number;
  clients: number;
  admins: number;
  courses: number;
  certificates: number;
  projects: number;
  openProjects: number;
  invoices: number;
  pendingRevenue: number;
  messages: number;
  notifications: number;
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  'https://api.digitalsolhub.com/api';

const AUTH_STORAGE_KEY = 'dsh_auth';

class ApiError extends Error {
  status?: number;
  payload?: unknown;
}

/* ---------------- AUTH STORAGE ---------------- */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthResponse;
    return parsed.token;
  } catch {
    return null;
  }
}

function persistAuth(data: AuthResponse) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAuth(): AuthResponse | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

/* ---------------- CORE REQUEST ---------------- */

async function request<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  const headers = new Headers(init.headers || {});

  headers.set('Accept', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    mode: 'cors',
  });

  const contentType = response.headers.get('content-type') || '';

  let payload: any = null;

  try {
    payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    const validationMessage =
      typeof payload === 'object' &&
      payload &&
      'errors' in payload
        ? Object.values((payload as any).errors || {})
            .flat()
            .join(' ')
        : '';

    const error = new ApiError(
      validationMessage ||
        (typeof payload === 'object' &&
        payload &&
        'message' in payload
          ? String((payload as any).message)
          : `Request failed with status ${response.status}`)
    );

    error.status = response.status;
    error.payload = payload;

    console.error('API ERROR:', {
      status: response.status,
      payload,
      path,
    });

    throw error;
  }

  return payload as T;
}

/* ---------------- AUTH ---------------- */

export async function login(
  payload: LoginPayload
): Promise<AuthResponse> {
  const safePayload: LoginPayload = {
    email: payload.email,
    password: payload.password,
    role: payload.role || 'student',
  };

  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(safePayload),
  });

  persistAuth(data);

  return data;
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  persistAuth(data);

  return data;
}

export async function forgotPassword(
  email: string
): Promise<PasswordResetResponse> {
  return request<PasswordResetResponse>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<PasswordResetResponse> {
  return request<PasswordResetResponse>(
    '/auth/reset-password',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>(
    '/user',
    {
      method: 'GET',
    },
    true
  );
}

export async function logout(): Promise<void> {
  clearAuth();

  try {
    await request(
      '/auth/logout',
      {
        method: 'POST',
      },
      true
    );
  } catch (error) {
    console.warn('Logout request failed', error);
  }
}

/* ---------------- ADMIN ---------------- */

export async function fetchAdminStudents(): Promise<AdminStudentLead[]> {
  return request<AdminStudentLead[]>(
    '/admin/students',
    {
      method: 'GET',
    },
    true
  );
}

export async function createAdminStudent(
  payload: AdminStudentCreatePayload
): Promise<AdminStudentLead> {
  return request<AdminStudentLead>(
    '/admin/students',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function updateAdminStudent(
  id: number | string,
  payload: AdminStudentCreatePayload & { status: string }
): Promise<AdminStudentLead> {
  return request<AdminStudentLead>(
    `/admin/students/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function deleteAdminStudent(id: number | string): Promise<void> {
  await request(`/admin/students/${id}`, {
    method: 'DELETE',
  }, true);
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return request<AdminOverview>('/admin/overview', {}, true);
}

export async function fetchAdminModuleItems(category: string): Promise<DashboardItem[]> {
  return request<DashboardItem[]>(`/admin/modules/${encodeURIComponent(category)}`, {}, true);
}

export async function createAdminModuleItem(
  category: string,
  payload: { title: string; amount?: string; status: string; group?: string; studentName?: string; details?: string; deadline?: string; invoiceAmount?: string; paymentMethod?: string; paymentLink?: string; bankAccountDetails?: string; paymentInstructions?: string; type?: string; image?: string; location?: string; category?: string }
): Promise<DashboardItem> {
  return request<DashboardItem>(`/admin/modules/${encodeURIComponent(category)}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateAdminModuleItem(
  category: string,
  id: number | string,
  payload: { title: string; amount?: string; status: string; group?: string; studentName?: string; details?: string; deadline?: string; invoiceAmount?: string; paymentMethod?: string; paymentLink?: string; bankAccountDetails?: string; paymentInstructions?: string; type?: string; image?: string; location?: string; category?: string }
): Promise<DashboardItem> {
  return request<DashboardItem>(`/admin/modules/${encodeURIComponent(category)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

export async function replyAdminMessage(id: number | string, payload: FormData): Promise<DashboardItem> {
  return request<DashboardItem>(`/admin/messages/${id}/reply`, {
    method: 'POST',
    body: payload,
    headers: {},
  }, true);
}

export async function deleteAdminModuleItem(category: string, id: number | string): Promise<void> {
  await request(`/admin/modules/${encodeURIComponent(category)}/${id}`, {
    method: 'DELETE',
  }, true);
}

export async function uploadAdminFile(payload: FormData): Promise<Record<string, any>> {
  return request<Record<string, any>>('/admin/files', {
    method: 'POST',
    body: payload,
    headers: {},
  }, true);
}

export async function updateAdminFile(
  id: number | string,
  payload: { name: string; description?: string; isPublic?: boolean }
): Promise<Record<string, any>> {
  return request<Record<string, any>>(`/admin/files/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

export async function deleteAdminFile(id: number | string): Promise<void> {
  await request(`/admin/files/${id}`, {
    method: 'DELETE',
  }, true);
}

/* ---------------- STUDENT PORTAL ---------------- */

export async function fetchStudentDashboard(): Promise<StudentPortalDashboard> {
  return request<StudentPortalDashboard>('/student/dashboard', {}, true);
}

export async function enrollStudentCourse(payload: {
  courseId: string;
  courseName: string;
  totalLessons?: number;
}): Promise<StudentPortalCourse> {
  return request<StudentPortalCourse>('/student/courses/enroll', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateStudentCourseProgress(
  courseId: number | string,
  progress: number
): Promise<{ course: StudentPortalCourse; certificate: StudentPortalCertificate | null; message?: string }> {
  return request<{ course: StudentPortalCourse; certificate: StudentPortalCertificate | null; message?: string }>(
    `/student/courses/${courseId}/progress`,
    {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    },
    true
  );
}

export async function sendStudentSupportMessage(payload: {
  subject?: string;
  message: string;
} | FormData): Promise<Record<string, any>> {
  return request<Record<string, any>>('/student/support/messages', {
    method: 'POST',
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    headers: payload instanceof FormData ? {} : undefined,
  }, true);
}

export async function updateStudentProfile(payload: {
  name: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}): Promise<Record<string, any>> {
  return request<Record<string, any>>('/student/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

/* ---------------- CLIENT PORTAL ---------------- */

export async function fetchClientDashboard(): Promise<ClientPortalDashboard> {
  return request<ClientPortalDashboard>('/client/dashboard', {}, true);
}

export async function createClientProject(payload: {
  title: string;
  category: string;
  details: string;
  budgetMin?: number;
  budgetMax?: number;
  paymentPreference?: string;
  deadline?: string;
}): Promise<Record<string, any>> {
  return request<Record<string, any>>('/client/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateClientProject(
  id: number | string,
  payload: {
    title: string;
    category?: string;
    details: string;
    deadline?: string;
  }
): Promise<Record<string, any>> {
  return request<Record<string, any>>(`/client/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateClientProfile(payload: {
  name: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  website?: string;
}): Promise<Record<string, any>> {
  return request<Record<string, any>>('/client/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

export async function sendClientMessage(payload: {
  subject?: string;
  message: string;
} | FormData): Promise<{ id: number | string; role: 'client' | 'team'; text: string }> {
  return request<{ id: number | string; role: 'client' | 'team'; text: string }>('/client/messages', {
    method: 'POST',
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    headers: payload instanceof FormData ? {} : undefined,
  }, true);
}

export async function uploadClientFile(payload: FormData): Promise<Record<string, any>> {
  return request<Record<string, any>>('/client/files', {
    method: 'POST',
    body: payload,
    headers: {},
  }, true);
}

export async function deleteClientProject(id: number | string): Promise<void> {
  await request(`/client/projects/${id}`, {
    method: 'DELETE',
  }, true);
}

/* ---------------- PUBLIC APPLICATIONS ---------------- */

export async function submitApplication(payload: ApplicationPayload): Promise<{ id: number | string; message: string }> {
  const formData = new FormData();
  formData.append('applicationType', payload.applicationType);
  formData.append('name', payload.name);
  formData.append('email', payload.email);
  formData.append('phone', payload.phone);
  if (payload.targetCountry) formData.append('targetCountry', payload.targetCountry);
  if (payload.category) formData.append('category', payload.category);
  if (payload.budget) formData.append('budget', payload.budget);
  if (payload.details) formData.append('details', payload.details);
  if (payload.document) formData.append('document', payload.document);

  return request<{ id: number | string; message: string }>('/applications', {
    method: 'POST',
    body: formData,
    headers: {},
  });
}

export async function fetchPublicModuleItems(category: string): Promise<DashboardItem[]> {
  return request<DashboardItem[]>(`/public/modules/${encodeURIComponent(category)}`);
}

export async function verifyPublicCertificate(id: string): Promise<PublicCertificateVerification> {
  return request<PublicCertificateVerification>(`/certificates/verify/${encodeURIComponent(id)}`);
}

export async function verifyPublicBadge(id: string): Promise<PublicCredentialVerification> {
  return request<PublicCredentialVerification>(`/badges/verify/${encodeURIComponent(id)}`);
}

export async function verifyPublicAttestation(id: string): Promise<PublicCredentialVerification> {
  return request<PublicCredentialVerification>(`/attestations/verify/${encodeURIComponent(id)}`);
}

export async function subscribeNewsletter(email: string): Promise<{ id: number | string; message: string }> {
  return request<{ id: number | string; message: string }>('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/* ---------------- AI ---------------- */

export async function sendAiChat(payload: {
  systemInstruction?: string;
  history?: Array<Record<string, any>>;
  prompt: string;
}): Promise<{ text: string }> {
  return request<{ text: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ---------------- DASHBOARD ITEMS ---------------- */

export async function fetchDashboardItems(
  role: UserRole,
  category?: string
): Promise<DashboardItem[]> {
  const params = new URLSearchParams({ role });
  if (category) params.set('category', category);
  return request<DashboardItem[]>(`/dashboard-items?${params.toString()}`, {}, true);
}

export async function createDashboardItem(payload: {
  role: UserRole;
  category: string;
  type?: string;
  status?: string;
  payload: Record<string, any>;
}): Promise<DashboardItem> {
  return request<DashboardItem>('/dashboard-items', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateDashboardItem(
  id: number | string,
  payload: Partial<Pick<DashboardItem, 'type' | 'status' | 'payload'>>
): Promise<DashboardItem> {
  return request<DashboardItem>(`/dashboard-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

export async function deleteDashboardItem(id: number | string): Promise<void> {
  await request(`/dashboard-items/${id}`, {
    method: 'DELETE',
  }, true);
}


export interface PartnerDashboardData {
  partner: any;
  stats: { activeServices:number; activeOrders:number; completedOrders:number; totalEarned:number; pendingCommission:number; availableBalance:number };
  recentOrders: any[];
}

export async function fetchPartnerDashboard(): Promise<PartnerDashboardData> {
  return request<PartnerDashboardData>('/partner/dashboard', {}, true);
}
export async function fetchPartnerProfile(): Promise<any> { return request('/partner/profile', {}, true); }
export async function updatePartnerProfile(payload:any): Promise<any> {
  return request('/partner/profile',{method:'PUT',body:JSON.stringify(payload)},true);
}
export async function fetchPartnerServices(): Promise<any[]> { return request('/partner/services',{},true); }
export async function createPartnerService(payload:any): Promise<any> { return request('/partner/services',{method:'POST',body:JSON.stringify(payload)},true); }
export async function fetchPartnerPortfolio(): Promise<any[]> { return request('/partner/portfolio',{},true); }
export async function createPartnerPortfolio(payload:any): Promise<any> { return request('/partner/portfolio',{method:'POST',body:JSON.stringify(payload)},true); }
export async function fetchPartnerOrders(): Promise<any> { return request('/partner/orders',{},true); }
export async function fetchPartnerCommissions(): Promise<any> { return request('/partner/commissions',{},true); }
export async function fetchPartnerWallet(): Promise<any> { return request('/partner/wallet',{},true); }
export async function fetchPublicPartner(slug:string): Promise<any> { return request('/partners/'+encodeURIComponent(slug)); }

export async function submitPartnerApplication(payload:any): Promise<any> {
  return request('/partner-applications',{method:'POST',body:JSON.stringify(payload)});
}
/* ---------------- PARTNER ECOSYSTEM ---------------- */

export async function fetchPartnerResources(): Promise<any[]> {
  return request<any[]>('/partner/resources', {}, true);
}

export async function fetchPartnerSocialAccounts(): Promise<any[]> {
  return request<any[]>('/partner/social-accounts', {}, true);
}

export async function savePartnerSocialAccount(payload: {
  platform: string;
  username?: string;
  display_name?: string;
  profile_url: string;
}): Promise<any> {
  return request<any>('/partner/social-accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function deletePartnerSocialAccount(id: number | string): Promise<void> {
  await request('/partner/social-accounts/' + id, { method: 'DELETE' }, true);
}

export async function fetchPartnerBusinessEmail(): Promise<any> {
  return request<any>('/partner/business-email', {}, true);
}

export async function fetchPartnerLeads(): Promise<any> {
  return request<any>('/partner/leads', {}, true);
}

export async function fetchPartnerPayoutAccounts(): Promise<any[]> {
  return request<any[]>('/partner/payout-accounts', {}, true);
}

export async function createPartnerPayoutAccount(payload: {
  method: string;
  account_name: string;
  account_details: string;
  is_default?: boolean;
}): Promise<any> {
  return request<any>('/partner/payout-accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function requestPartnerPayout(payload: {
  payout_account_id: number | string;
  amount: number;
}): Promise<any> {
  return request<any>('/partner/payout-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}
\n
export async function fetchAvailableServices(): Promise<any[]> {
  return request<any[]>('/services');
}
\n
/* ---------------- ADMIN PARTNER MANAGEMENT ---------------- */

export async function fetchAdminPartnerApplications(): Promise<any> {
  return request<any>('/admin/partner-applications', {}, true);
}

export async function updateAdminPartnerApplication(id: number | string, payload: { status: string; admin_notes?: string }): Promise<any> {
  return request<any>('/admin/partner-applications/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, true);
}

export async function approveAdminPartnerApplication(id: number | string): Promise<any> {
  return request<any>('/admin/partner-applications/' + id + '/approve', {
    method: 'POST',
  }, true);
}

export async function fetchAdminPartners(): Promise<any> {
  return request<any>('/admin/partners', {}, true);
}

export async function fetchAdminCommissions(): Promise<any> {
  return request<any>('/admin/commissions', {}, true);
}
\n