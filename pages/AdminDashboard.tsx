import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Language, Lead, LeadStatus, Franchise, BlockchainNetwork, CertificateData, AttestationRecord } from '../types';
import { TRANSLATIONS } from '../constants';
import SEO from '../components/SEO';
import AdminSidebar from '../components/AdminSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useRequireAuth } from '../utils/auth';
import { getAllCertificates, updateCertificateStatus, attachBlockchainRecord } from '../utils/certificateManager';
import { getAllLeads, updateLeadStatus } from '../utils/crmManager';
import { getAllFranchises, updateFranchiseStatus } from '../utils/franchiseManager';
import { getAllAttestations, updateAttestationStatus } from '../utils/attestationManager';
import { mintCertificateOnChain } from '../utils/blockchainManager';
import {
  createAdminModuleItem,
  createAdminStudent,
  deleteAdminFile,
  deleteAdminStudent,
  deleteAdminModuleItem,
  fetchAdminModuleItems,
  fetchAdminOverview,
  fetchAdminStudents,
  replyAdminMessage,
  updateAdminModuleItem,
  updateAdminStudent,
  updateAdminFile,
  uploadAdminFile,
  type AdminOverview,
  type AdminStudentLead,
  type DashboardItem,
} from '../utils/api';
import { 
  Menu, Users, Briefcase, DollarSign, 
  CheckCircle, XCircle, Clock, ShieldOff, Award, Shield,
  Globe, BarChart3, Target, GitBranch, TrendingUp, Laptop, Loader2, Link as LinkIcon, Database, Presentation, ChevronLeft, ChevronRight, AlertTriangle, FileBadge, MessageSquare, Mail, User, FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  const navigate = useNavigate();
  const { authUser, loadingAuth } = useRequireAuth(lang, 'admin');
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  
  // Data States
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [attestations, setAttestations] = useState<AttestationRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [students, setStudents] = useState<AdminStudentLead[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'Web Development',
    status: 'invited'
  });
  const [editingStudentId, setEditingStudentId] = useState<number | string | null>(null);
  const [moduleItems, setModuleItems] = useState<Record<string, DashboardItem[]>>({});
  const [moduleLoading, setModuleLoading] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [moduleForm, setModuleForm] = useState({ title: '', amount: '', status: 'active', group: '', type: '', details: '', image: '', location: '', category: '' });
  const [editingModuleItem, setEditingModuleItem] = useState<DashboardItem | null>(null);
  const [adminReplyAttachment, setAdminReplyAttachment] = useState<File | null>(null);
  const [editingFile, setEditingFile] = useState<any | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  
  // Blockchain State
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('Polygon');

  const loadStudents = async () => {
  setStudentsLoading(true);
  setStudentsError('');

  try {
    const data = await fetchAdminStudents();
    setStudents(data);
  } catch (error) {
    setStudentsError(
      error instanceof Error
        ? error.message
        : 'Unable to load student records.'
    );
  } finally {
    setStudentsLoading(false);
  }
};
  // --- Actions ---

  const handleCertAction = (id: string, action: 'approve' | 'reject' | 'revoke') => {
    let newStatus: 'Pending' | 'Approved' | 'Revoked' = 'Pending';
    if (action === 'approve') newStatus = 'Approved';
    if (action === 'revoke') newStatus = 'Revoked';
    
    const updated = updateCertificateStatus(id, newStatus);
    setCertificates(updated);
  };

  const handleAttestationAction = (id: string, action: 'approve' | 'reject') => {
      const updated = updateAttestationStatus(id, action === 'approve' ? 'Issued' : 'Rejected', 'Sarkar Azeem');
      setAttestations(updated);
  };

  const handleMintCertificate = async (cert: CertificateData) => {
    if (cert.status !== 'Approved') return;
    setMintingId(cert.id);
    
    try {
      const record = await mintCertificateOnChain(cert, selectedNetwork);
      const updatedList = attachBlockchainRecord(cert.id, record);
      setCertificates(updatedList);
    } catch (error) {
      alert('Minting failed. Please try again.');
    } finally {
      setMintingId(null);
    }
  };

  const handleStudentFieldChange = (field: keyof typeof studentForm, value: string) => {
    setStudentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    setStudentsError('');

    try {
      const created = await createAdminStudent(studentForm);
      setStudents((prev) => [created, ...prev]);
      setStudentForm({
        name: '',
        email: '',
        phone: '',
        course: 'Web Development',
        status: 'invited'
      });
    } catch (error) {
      setStudentsError(error instanceof Error ? error.message : 'Unable to create student ID.');
    }
  };

  const loadOverview = async () => {
    try {
      setOverview(await fetchAdminOverview());
    } catch (error) {
      setModuleError(error instanceof Error ? error.message : 'Unable to load admin overview.');
    }
  };

  const moduleLabels: Record<string, string> = {
    deck: 'Investor Pitch Deck',
    financials: 'Financial Projections',
    franchises: 'Franchise Network',
    crm: 'CRM & Sales',
    requests: 'Services',
    clients: 'Clients',
    courses: 'Courses',
    payments: 'Invoices',
    cms: 'Content & CMS',
    marketplace: 'Marketplace',
    jobs: 'Jobs',
    'service-catalog': 'Website Services',
    proposals: 'Proposals',
    team: 'Team & Roles',
    reports: 'Reports',
    messages: 'Messages',
    settings: 'Settings',
    'activity-logs': 'Activity Logs',
    'api-logs': 'API Logs',
    'login-attempts': 'Login Attempts',
    analytics: 'User Analytics',
    'system-events': 'System Events',
  };

  const loadModuleItems = async (category: string) => {
    setModuleLoading(category);
    setModuleError('');
    try {
      const data = await fetchAdminModuleItems(category);
      setModuleItems((prev) => ({ ...prev, [category]: data }));
    } catch (error) {
      setModuleError(error instanceof Error ? error.message : 'Unable to load records.');
    } finally {
      setModuleLoading('');
    }
  };

  const handleCreateModuleItem = async (event: React.FormEvent, category: string) => {
    event.preventDefault();
    setModuleError('');
    try {
      const created = await createAdminModuleItem(category, {
        title: moduleForm.title,
        amount: moduleForm.amount,
        status: moduleForm.status,
        group: moduleForm.group,
        type: moduleForm.type,
        details: moduleForm.details,
        image: moduleForm.image,
        location: moduleForm.location,
        category: moduleForm.category,
      });
      setModuleItems((prev) => ({ ...prev, [category]: [created, ...(prev[category] || [])] }));
      setModuleForm({ title: '', amount: '', status: 'active', group: '', type: '', details: '', image: '', location: '', category: '' });
    } catch (error) {
      setModuleError(error instanceof Error ? error.message : 'Unable to save record.');
    }
  };

  const handleDeleteModuleItem = async (category: string, id: number | string) => {
    await deleteAdminModuleItem(category, id);
    setModuleItems((prev) => ({ ...prev, [category]: (prev[category] || []).filter((item) => item.id !== id) }));
  };

  const handleSaveStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    setStudentsError('');
    try {
      if (editingStudentId) {
        const updated = await updateAdminStudent(editingStudentId, studentForm);
        setStudents((prev) => prev.map((student) => student.id === updated.id ? updated : student));
      } else {
        const created = await createAdminStudent(studentForm);
        setStudents((prev) => [created, ...prev]);
      }
      setEditingStudentId(null);
      setStudentForm({ name: '', email: '', phone: '', course: 'Web Development', status: 'invited' });
    } catch (error) {
      setStudentsError(error instanceof Error ? error.message : 'Unable to save student.');
    }
  };

  const handleEditStudent = (student: AdminStudentLead) => {
    setEditingStudentId(student.id);
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      status: student.status,
    });
  };

  const handleDeleteStudent = async (id: number | string) => {
    if (!confirm('Delete this student completely? This will remove the student login, token, profile, courses, certificates, messages, and onboarding record.')) return;
    await deleteAdminStudent(id);
    setStudents((prev) => prev.filter((student) => student.id !== id));
  };

  const startStudentFromApplication = (item: DashboardItem) => {
    setStudentForm({
      name: item.payload.owner || item.payload.name || '',
      email: item.payload.email || item.payload.amount || '',
      phone: item.payload.phone || '',
      course: item.payload.applicationLabel || 'Web Development',
      status: 'invited',
    });
    setEditingStudentId(null);
    setCurrentView('students');
  };

  const handleUpdateModuleItem = async (event: React.FormEvent, category: string) => {
    event.preventDefault();
    if (!editingModuleItem) return;
    if (category === 'messages') {
      const payload = new FormData();
      payload.append('title', editingModuleItem.payload.title || '');
      payload.append('details', editingModuleItem.payload.details || '');
      if (adminReplyAttachment) payload.append('attachment', adminReplyAttachment);
      const updated = await replyAdminMessage(editingModuleItem.id, payload);
      setModuleItems((prev) => ({
        ...prev,
        [category]: (prev[category] || []).map((item) => item.id === updated.id ? updated : item),
      }));
      setEditingModuleItem(null);
      setAdminReplyAttachment(null);
      return;
    }

    const updated = await updateAdminModuleItem(category, editingModuleItem.id, {
      title: editingModuleItem.payload.title || '',
      amount: editingModuleItem.payload.amount || '',
      status: editingModuleItem.status || 'active',
      group: editingModuleItem.payload.group || 'general',
      studentName: editingModuleItem.payload.studentName || editingModuleItem.payload.owner || '',
      details: editingModuleItem.payload.details || '',
      deadline: editingModuleItem.payload.deadline || '',
      invoiceAmount: editingModuleItem.payload.invoiceAmount || '',
      paymentMethod: editingModuleItem.payload.paymentMethod || '',
      paymentLink: editingModuleItem.payload.paymentLink || '',
      bankAccountDetails: editingModuleItem.payload.bankAccountDetails || '',
      paymentInstructions: editingModuleItem.payload.paymentInstructions || '',
      type: editingModuleItem.payload.type || '',
      image: editingModuleItem.payload.image || '',
      location: editingModuleItem.payload.location || '',
      category: editingModuleItem.payload.category || '',
    });
    setModuleItems((prev) => ({
      ...prev,
      [category]: (prev[category] || []).map((item) => item.id === updated.id ? updated : item),
    }));
    setEditingModuleItem(null);
  };

  const renderRichText = (text: string) => (
    <div className="space-y-2 whitespace-pre-wrap">
      {String(text || '').split(/\n+/).map((line, index) => {
        const url = line.replace(/^Attachment:\s*/i, '').trim();
        const isUrl = /^https?:\/\//i.test(url);
        const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
        if (isUrl && isImage) {
          return <a key={index} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Attachment" className="mt-2 max-h-64 rounded-xl border border-white/10 object-contain" /></a>;
        }
        if (isUrl) {
          return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block text-brand-neon underline">Open attachment</a>;
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );

  const formatServiceName = (value?: string) => String(value || '-')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const handleAdminFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    purpose: 'project-file' | 'worksheet',
    targetId?: number | string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setModuleError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', purpose);
      if (purpose === 'project-file' && targetId) formData.append('projectId', String(targetId));
      if (purpose === 'worksheet' && targetId) formData.append('studentUserId', String(targetId));
      if (purpose === 'worksheet') formData.append('isPublic', 'false');
      await uploadAdminFile(formData);
      await loadModuleItems(currentView);
      alert('File uploaded successfully.');
    } catch (error) {
      setModuleError(error instanceof Error ? error.message : 'Unable to upload file.');
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const handleUpdateFile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingFile) return;
    await updateAdminFile(editingFile.id, {
      name: editingFile.name,
      description: editingFile.description || '',
      isPublic: Boolean(editingFile.isPublic),
    });
    setEditingFile(null);
    await loadModuleItems(currentView);
  };

  const handleDeleteFile = async (fileId: number | string) => {
    if (!confirm('Delete this uploaded file?')) return;
    await deleteAdminFile(fileId);
    await loadModuleItems(currentView);
  };

  useEffect(() => {
    const isRtl = lang === Language.URDU || lang === Language.ARABIC;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.className = 'bg-slate-950 font-sans text-white';
    
    setCertificates(getAllCertificates());
    setAttestations([]);
    setLeads(getAllLeads());
    setFranchises(getAllFranchises());
    loadStudents();
    loadOverview();
  }, [lang]);

  useEffect(() => {
    if (
      currentView !== 'overview' &&
      currentView !== 'students' &&
      !moduleItems[currentView]
    ) {
      loadModuleItems(currentView);
    }
  }, [currentView]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const renderStudentsView = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-6">
        <form onSubmit={handleSaveStudent} className="glass rounded-2xl border border-white/10 p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{editingStudentId ? 'Edit Student' : 'Create Student ID'}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Admin pehle real student ka record banayega. Student baad mein isi generated ID se signup karega.
            </p>
          </div>

          {studentsError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {studentsError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Student Name</label>
            <input
              value={studentForm.name}
              onChange={(e) => handleStudentFieldChange('name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:border-brand-neon/50"
              placeholder="Ali Ahmed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={studentForm.email}
              onChange={(e) => handleStudentFieldChange('email', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:border-brand-neon/50"
              placeholder="student@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Phone</label>
            <input
              value={studentForm.phone}
              onChange={(e) => handleStudentFieldChange('phone', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:border-brand-neon/50"
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Course</label>
            <select
              value={studentForm.course}
              onChange={(e) => handleStudentFieldChange('course', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:border-brand-neon/50 relative z-10"
            >
              <option>Web Development</option>
              <option>Digital Marketing</option>
              <option>SEO</option>
              <option>Graphic Design</option>
              <option>AI Tools</option>
            </select>
          </div>

          {editingStudentId && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Status</label>
              <select
                value={studentForm.status}
                onChange={(e) => handleStudentFieldChange('status', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:outline-none focus:border-brand-neon/50 relative z-10"
              >
                <option value="invited">Invited</option>
                <option value="registered">Registered</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white transition hover:opacity-90"
          >
            {editingStudentId ? 'Save Student' : 'Generate Student ID'}
          </button>
          {editingStudentId && (
            <button type="button" onClick={() => { setEditingStudentId(null); setStudentForm({ name: '', email: '', phone: '', course: 'Web Development', status: 'invited' }); }} className="w-full rounded-xl border border-white/10 px-4 py-3 font-bold text-white">
              Cancel Edit
            </button>
          )}
        </form>

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Student Onboarding Queue</h3>
              <p className="text-sm text-gray-400">Only admin-created IDs should be allowed to register.</p>
            </div>
            <button
              onClick={loadStudents}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white hover:border-brand-neon/50"
            >
              Refresh
            </button>
          </div>

          {studentsLoading ? (
            <div className="p-10 flex items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading students...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-900/70 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-gray-500" colSpan={5}>
                        No backend student records yet.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="border-t border-white/5">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-cyan-300">{student.studentId}</td>
                        <td className="px-6 py-4">{student.course}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-gray-300">
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => handleEditStudent(student)} className="text-cyan-300 hover:text-cyan-200">Edit</button>
                          <button onClick={() => handleDeleteStudent(student.id)} className="text-red-300 hover:text-red-200">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAttestationsView = () => (
      <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileBadge className="w-6 h-6 text-brand-neon"/> Official Attestation Requests</h2>
          <div className="glass rounded-xl overflow-hidden border border-white/5">
              <table className="w-full text-left text-gray-400">
                  <thead className="bg-slate-900 text-xs uppercase font-bold text-gray-300">
                      <tr>
                          <th className="p-4">Request ID</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {attestations.length === 0 ? (
                          <tr>
                              <td className="p-6 text-gray-500" colSpan={6}>No official attestation requests yet.</td>
                          </tr>
                      ) : attestations.map(att => (
                          <tr key={att.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono text-xs">{att.id}</td>
                              <td className="p-4 text-white font-bold">{att.studentName}</td>
                              <td className="p-4">{att.type}</td>
                              <td className="p-4">{att.requestDate}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      att.status === 'Issued' ? 'bg-blue-500/20 text-blue-400' :
                                      att.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'
                                  }`}>
                                      {att.status}
                                  </span>
                              </td>
                              <td className="p-4 text-right flex items-center justify-end gap-2">
                                  <button onClick={() => handleAttestationAction(att.id, 'approve')} className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20" title="Issue / Re-issue Seal">
                                      <Award className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleAttestationAction(att.id, 'reject')} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20" title="Reject / Revoke">
                                      <XCircle className="w-4 h-4" />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderOverview = () => {
    const stats = [
      { label: 'Students', value: overview?.students ?? students.length, icon: Users },
      { label: 'Clients', value: overview?.clients ?? 0, icon: Briefcase },
      { label: 'Certificates', value: overview?.certificates ?? certificates.length, icon: Award },
      { label: 'Open Projects', value: overview?.openProjects ?? 0, icon: Target },
    ];

    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl border border-white/10 p-5">
              <stat.icon className="w-6 h-6 text-brand-neon mb-4" />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Operational Snapshot</h2>
              <p className="text-gray-400">Live counts are loaded from the production MySQL schema.</p>
            </div>
            <button onClick={loadOverview} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:border-brand-neon/50">
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMessagesView = () => {
    const items = moduleItems.messages || [];
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Messages</h2>
            <p className="text-sm text-gray-400">Client aur student messages ko sender, role, subject aur reply area ke sath manage karein.</p>
          </div>
          <button onClick={() => loadModuleItems('messages')} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:border-brand-neon/50">Refresh</button>
        </div>
        {moduleLoading === 'messages' && <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-gray-400">Loading messages...</div>}
        <div className="grid gap-4">
          {items.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-500">No messages yet.</div>}
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${item.status === 'unread' ? 'bg-cyan-500/10 text-brand-neon' : 'bg-slate-800 text-gray-400'}`}>{item.status}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-gray-300">{item.payload.senderRole || 'user'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.payload.title || 'Message'}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-400"><User className="h-4 w-4" /> {item.payload.senderName || item.payload.owner || 'Unknown sender'}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500"><Mail className="h-3.5 w-3.5" /> {item.payload.senderEmail || 'No email'}</p>
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-relaxed text-gray-200">{renderRichText(item.payload.details || item.payload.amount)}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setEditingModuleItem(item)} className="rounded-xl bg-brand-neon px-4 py-2 text-sm font-bold text-black">Reply</button>
                  <button onClick={() => handleDeleteModuleItem('messages', item.id)} className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {editingModuleItem && (
          <form onSubmit={(event) => handleUpdateModuleItem(event, 'messages')} className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-cyan-500/30 bg-slate-950 p-5 shadow-2xl">
            <h3 className="mb-3 font-bold text-white">Reply to {editingModuleItem.payload.senderName || editingModuleItem.payload.owner}</h3>
            <input value={editingModuleItem.payload.title || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, title: event.target.value } } : prev)} className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white" placeholder="Subject" />
            <textarea value={editingModuleItem.payload.details || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, details: event.target.value } } : prev)} rows={4} className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white" placeholder="Type admin reply here..." />
            <label className="mt-3 inline-flex cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-gray-300 hover:border-brand-neon/50">
              {adminReplyAttachment ? `Attached: ${adminReplyAttachment.name}` : 'Attach screenshot / file'}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => setAdminReplyAttachment(event.target.files?.[0] || null)} />
            </label>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingModuleItem(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white">Cancel</button>
              <button className="rounded-xl bg-brand-neon px-4 py-2 text-sm font-bold text-black">Send Reply</button>
            </div>
          </form>
        )}
      </div>
    );
  };

  const renderReportsView = () => {
    const items = moduleItems.reports || [];
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Reports</h2>
            <p className="text-sm text-gray-400">Course approvals, pending project follow-ups, aur operational alerts yahan show honge.</p>
          </div>
          <button onClick={() => loadModuleItems('reports')} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:border-brand-neon/50">Refresh</button>
        </div>
        <div className="grid gap-4">
          {items.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-500">No pending reports right now.</div>}
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase text-amber-300">{item.status}</span>
                  <h3 className="mt-3 text-lg font-bold text-white">{item.payload.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{item.payload.details}</p>
                  <p className="mt-2 text-xs text-gray-500">Owner: {item.payload.owner || 'Unknown'} • Value: {item.payload.amount || '-'}</p>
                </div>
                <button onClick={() => { setCurrentView(item.payload.sourceModule || 'overview'); loadModuleItems(item.payload.sourceModule || 'overview'); }} className="rounded-xl bg-brand-neon px-4 py-2 text-sm font-bold text-black">
                  Open {item.payload.sourceModule || 'Module'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFileManager = (files: any[] = []) => {
    if (!files.length) return null;
    return (
      <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-left">
        {files.map((file) => (
          <div key={file.id} className="flex flex-col gap-2 rounded-lg bg-slate-900/80 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 truncate text-sm font-bold text-white hover:text-brand-neon">
                <FileText className="h-4 w-4 shrink-0" /> {file.name}
              </a>
              <p className="text-xs text-gray-500">{file.type} • {file.date || 'Uploaded file'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingFile(file)} className="text-xs font-bold text-cyan-300">Edit</button>
              <button onClick={() => handleDeleteFile(file.id)} className="text-xs font-bold text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGenericModule = (category: string) => {
    const title = moduleLabels[category] || category;
    const items = moduleItems[category] || [];
    const isPublicContentModule = ['marketplace', 'jobs', 'service-catalog', 'cms'].includes(category);
    const isOperationalLogModule = ['activity-logs', 'api-logs', 'login-attempts', 'analytics', 'system-events'].includes(category);

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400">
              {category === 'settings'
                ? 'Manage live website settings, course prices, labels, and configurable values.'
                : isOperationalLogModule
                  ? 'Read-only live operational records from production MySQL, including IP, status, and request details.'
                  : category === 'certifications'
                  ? 'Review and correct issued certificate names, IDs, and statuses.'
                  : 'Create, track, search, edit, and delete live admin records for this module.'}
            </p>
          </div>
          <button onClick={() => loadModuleItems(category)} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:border-brand-neon/50">
            Refresh
          </button>
        </div>

        {moduleError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{moduleError}</div>}

        {category !== 'certifications' && category !== 'requests' && !isOperationalLogModule && (
        <form onSubmit={(event) => handleCreateModuleItem(event, category)} className="glass rounded-2xl border border-white/10 p-5 grid grid-cols-1 lg:grid-cols-[1fr,180px,160px,auto] gap-3">
          <input required value={moduleForm.title} onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder={category === 'settings' ? 'Setting key, e.g. course.web.price' : category === 'payments' ? 'Invoice details, e.g. SEO monthly fee' : category === 'jobs' ? 'Job title' : category === 'marketplace' ? 'Gig title' : category === 'service-catalog' ? 'Service title' : `${title} title`} />
          <input value={moduleForm.amount} onChange={(event) => setModuleForm((prev) => ({ ...prev, amount: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder={category === 'settings' ? 'Setting value' : category === 'payments' ? 'Invoice amount' : category === 'jobs' ? 'Salary' : category === 'marketplace' ? 'Starting price' : category === 'service-catalog' ? 'Price / short value' : 'Value / amount'} />
          <select value={moduleForm.status} onChange={(event) => setModuleForm((prev) => ({ ...prev, status: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
            <option value="active">Active</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button className="rounded-xl bg-brand-neon px-5 py-3 font-bold text-black">Save</button>
          {isPublicContentModule && (
            <>
              <input value={moduleForm.group} onChange={(event) => setModuleForm((prev) => ({ ...prev, group: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder={category === 'jobs' ? 'Company / agency name' : category === 'marketplace' ? 'Seller name' : 'Owner / group'} />
              <input value={moduleForm.type} onChange={(event) => setModuleForm((prev) => ({ ...prev, type: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder={category === 'jobs' ? 'Full-time / Remote / Contract' : 'Type'} />
              <input value={moduleForm.location} onChange={(event) => setModuleForm((prev) => ({ ...prev, location: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder={category === 'jobs' ? 'Country / city / remote' : 'Category'} />
              <input value={moduleForm.image} onChange={(event) => setModuleForm((prev) => ({ ...prev, image: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder="Image URL optional" />
              <textarea value={moduleForm.details} onChange={(event) => setModuleForm((prev) => ({ ...prev, details: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder="Description / details shown on website" rows={3} />
            </>
          )}
        </form>
        )}

        {editingModuleItem && (
          <form onSubmit={(event) => handleUpdateModuleItem(event, category)} className="glass rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 grid grid-cols-1 lg:grid-cols-[1fr,180px,160px,auto] gap-3">
            {category === 'requests' && (
              <div className="lg:col-span-4 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500">Client</p>
                    <p className="mt-1 text-sm font-semibold text-white">{editingModuleItem.payload.owner || 'Unknown client'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500">Requested Service</p>
                    <p className="mt-1 text-sm font-semibold text-brand-neon">{formatServiceName(editingModuleItem.payload.category || editingModuleItem.payload.projectType)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500">Client Budget</p>
                    <p className="mt-1 text-sm font-semibold text-white">{editingModuleItem.payload.amount || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
            {category === 'certifications' && (
              <input value={editingModuleItem.payload.studentName || editingModuleItem.payload.owner || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, studentName: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-4" placeholder="Student name" />
            )}
            {(category === 'requests' || category === 'messages' || category === 'payments' || isPublicContentModule) && (
              <textarea value={editingModuleItem.payload.details || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, details: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-4" placeholder={category === 'messages' ? 'Type admin reply here...' : category === 'payments' ? 'Invoice details / scope of work' : isPublicContentModule ? 'Website description / details' : 'Project details / admin notes'} rows={3} />
            )}
            {isPublicContentModule && (
              <>
                <input value={editingModuleItem.payload.group || editingModuleItem.payload.owner || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, group: event.target.value, owner: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder={category === 'jobs' ? 'Company / agency name' : category === 'marketplace' ? 'Seller name' : 'Owner / group'} />
                <input value={editingModuleItem.payload.type || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, type: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder={category === 'jobs' ? 'Full-time / Remote / Contract' : 'Type'} />
                <input value={editingModuleItem.payload.location || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, location: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder={category === 'jobs' ? 'Country / city / remote' : 'Category'} />
                <input value={editingModuleItem.payload.image || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, image: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-4" placeholder="Image URL optional" />
              </>
            )}
            {category === 'requests' && (
              <>
                <input type="date" value={editingModuleItem.payload.deadline || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, deadline: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" />
                <input type="number" min="0" step="0.01" value={editingModuleItem.payload.invoiceAmount || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, invoiceAmount: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder="Admin quote / invoice amount, e.g. 500" />
                <select value={editingModuleItem.payload.paymentMethod || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, paymentMethod: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                  <option value="">Payment method</option>
                  <option value="payment-link">Payment Link</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="crypto">Crypto / Binance</option>
                  <option value="other">Other</option>
                </select>
                <input value={editingModuleItem.payload.paymentLink || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, paymentLink: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-3" placeholder="Payment link, e.g. Stripe/PayPal/checkout URL" />
                <textarea value={editingModuleItem.payload.bankAccountDetails || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, bankAccountDetails: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder="Bank account details: bank name, account title, account/IBAN, JazzCash/EasyPaisa if needed" rows={3} />
                <textarea value={editingModuleItem.payload.paymentInstructions || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, paymentInstructions: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white lg:col-span-2" placeholder="Extra payment instructions / crypto wallet / notes for client" rows={3} />
              </>
            )}
            <input required value={editingModuleItem.payload.title || ''} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, title: event.target.value } } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder="Title / key" />
            <input value={editingModuleItem.payload.amount || ''} readOnly={category === 'requests'} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, payload: { ...prev.payload, amount: event.target.value } } : prev)} className={`rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white ${category === 'requests' ? 'cursor-not-allowed text-gray-400' : ''}`} placeholder={category === 'requests' ? 'Client budget' : 'Value / certificate ID'} />
            <select value={editingModuleItem.status || 'active'} onChange={(event) => setEditingModuleItem((prev) => prev ? { ...prev, status: event.target.value } : prev)} className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="assigned">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="revoked">Revoked</option>
              <option value="editable">Editable</option>
              <option value="locked">Locked</option>
            </select>
            <div className="flex gap-2">
              <button className="rounded-xl bg-brand-neon px-5 py-3 font-bold text-black">Update</button>
              <button type="button" onClick={() => setEditingModuleItem(null)} className="rounded-xl border border-white/10 px-5 py-3 font-bold text-white">Cancel</button>
            </div>
          </form>
        )}

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {moduleLoading === category ? (
            <div className="p-10 flex justify-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-900 text-xs uppercase text-gray-500">
                  <tr><th className="px-5 py-4">Title</th><th className="px-5 py-4">Value</th><th className="px-5 py-4">Owner / Group</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-gray-500">No records yet.</td></tr>
                  ) : items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5 align-top">
                      <td className="px-5 py-4 font-semibold text-white">
                        {item.payload.title || 'Untitled'}
                        {category === 'requests' && (
                          <div className="mt-2 space-y-1 text-xs text-gray-400">
                            <div>Service: <span className="text-brand-neon">{formatServiceName(item.payload.category || item.payload.projectType)}</span></div>
                            <div>Client budget: <span className="text-white">{item.payload.amount || '-'}</span></div>
                            {item.payload.invoiceAmount && <div>Admin quote: <span className="text-emerald-300">USD {Number(item.payload.invoiceAmount).toFixed(2)}</span></div>}
                            {item.payload.paymentMethod && <div>Payment method: <span className="text-white">{String(item.payload.paymentMethod).replace('-', ' ')}</span></div>}
                            {item.payload.paymentLink && <div>Payment link: <a href={item.payload.paymentLink} target="_blank" rel="noopener noreferrer" className="text-brand-neon underline">Open link</a></div>}
                            {item.payload.bankAccountDetails && <div className="max-w-xl whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/60 p-2 text-gray-300">Bank account: {item.payload.bankAccountDetails}</div>}
                            <div className="max-w-xl whitespace-pre-wrap text-gray-500">{item.payload.details || 'No project details.'}</div>
                            {item.payload.paymentInstructions && <div className="max-w-xl whitespace-pre-wrap rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-emerald-200">Payment instructions: {item.payload.paymentInstructions}</div>}
                          </div>
                        )}
                        {category === 'crm' && item.payload.applicationType && (
                          <div className="mt-2 space-y-1 text-xs text-gray-400">
                            <div>Applied for: <span className="text-brand-neon">{item.payload.applicationLabel || item.payload.applicationType}</span></div>
                            <div>Email: <span className="text-white">{item.payload.email || item.payload.amount || '-'}</span></div>
                            <div>Phone: <span className="text-white">{item.payload.phone || '-'}</span></div>
                            {item.payload.targetCountry && <div>Country: <span className="text-white">{item.payload.targetCountry}</span></div>}
                            {item.payload.documentUrl && <a href={item.payload.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-brand-neon underline">Open document</a>}
                            <div className="max-w-xl whitespace-pre-wrap text-gray-500">{item.payload.details || ''}</div>
                            <button onClick={() => startStudentFromApplication(item)} className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20">
                              Create Student ID
                            </button>
                          </div>
                        )}
                        {isOperationalLogModule && (
                          <div className="mt-2 space-y-1 text-xs text-gray-400">
                            {item.payload.ipAddress && <div>IP: <span className="text-white">{item.payload.ipAddress}</span></div>}
                            {item.payload.details && <div className="max-w-xl whitespace-pre-wrap text-gray-500">{item.payload.details}</div>}
                            {item.payload.userAgent && <div className="max-w-xl truncate text-gray-600" title={item.payload.userAgent}>UA: {item.payload.userAgent}</div>}
                          </div>
                        )}
                        {(category === 'requests' || category === 'courses') && renderFileManager(item.payload.files || [])}
                      </td>
                      <td className="px-5 py-4">{item.payload.amount || '-'}</td>
                      <td className="px-5 py-4">{item.payload.owner || item.payload.group || '-'}</td>
                      <td className="px-5 py-4"><span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase">{item.status}</span></td>
                      <td className="px-5 py-4 text-right space-x-3">
                        {!isOperationalLogModule && <button onClick={() => setEditingModuleItem(item)} className="text-cyan-300 hover:text-cyan-200">Edit</button>}
                        {category === 'requests' && (
                          <label className={`cursor-pointer text-blue-300 hover:text-blue-200 ${uploadingFile ? 'opacity-50' : ''}`}>
                            Upload File
                            <input disabled={uploadingFile} type="file" className="hidden" onChange={(event) => handleAdminFileUpload(event, 'project-file', item.id)} />
                          </label>
                        )}
                        {category === 'courses' && item.payload.studentUserId && (
                          <label className={`cursor-pointer text-blue-300 hover:text-blue-200 ${uploadingFile ? 'opacity-50' : ''}`}>
                            Worksheet
                            <input disabled={uploadingFile} type="file" className="hidden" onChange={(event) => handleAdminFileUpload(event, 'worksheet', item.payload.studentUserId)} />
                          </label>
                        )}
                        {!isOperationalLogModule && <button onClick={() => handleDeleteModuleItem(category, item.id)} className="text-red-300 hover:text-red-200">Delete</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(currentView) {
      case 'messages': return renderMessagesView();
      case 'reports': return renderReportsView();
      case 'certifications': return (
        <div className="space-y-8">
            {renderGenericModule('certifications')}
            {renderAttestationsView()}
        </div>
      );
      case 'overview': return renderOverview();
      case 'students': return renderStudentsView();
      default: return renderGenericModule(currentView);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-neon/30">
      <SEO 
        title="Admin Dashboard | Digital Solutions Hub" 
        description="Super Admin Control Panel" 
        lang={lang} 
      />

      <AdminSidebar 
        lang={lang} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <div className="lg:pl-72 transition-all duration-300">
         <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white"><Menu className="w-6 h-6" /></button>
               <h1 className="text-xl font-bold text-white capitalize hidden sm:block">{currentView.replace('-', ' ')}</h1>
            </div>
            <div className="flex items-center gap-4">
               <LanguageSwitcher currentLang={lang} />
               <div className="w-10 h-10 rounded-full bg-brand-neon/20 flex items-center justify-center border border-brand-neon/50 text-brand-neon font-bold">
                  SA
               </div>
            </div>
         </header>

         <main className="p-8">
            {renderContent()}
         </main>
      </div>

      {editingFile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <form onSubmit={handleUpdateFile} className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Edit Uploaded File</h3>
            <p className="mt-1 text-sm text-gray-400">Filename aur description update karein. File content replace karna ho to purani delete karke new upload karein.</p>
            <input value={editingFile.name || ''} onChange={(event) => setEditingFile((prev: any) => ({ ...prev, name: event.target.value }))} className="mt-5 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white" placeholder="File name" required />
            <textarea value={editingFile.description || ''} onChange={(event) => setEditingFile((prev: any) => ({ ...prev, description: event.target.value }))} rows={3} className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white" placeholder="Description" />
            <label className="mt-3 flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={Boolean(editingFile.isPublic)} onChange={(event) => setEditingFile((prev: any) => ({ ...prev, isPublic: event.target.checked }))} />
              Public worksheet/file
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingFile(null)} className="rounded-xl border border-white/10 px-4 py-2 font-bold text-white">Cancel</button>
              <button className="rounded-xl bg-brand-neon px-4 py-2 font-bold text-black">Save File</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
