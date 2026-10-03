import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { TRANSLATIONS, SERVICE_CATEGORIES } from '../constants';
import SEO from '../components/SEO';
import ClientSidebar from '../components/ClientSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useRequireAuth } from '../utils/auth';
import { exportElementAsPdf } from '../utils/certificateExport';
import {
  createClientProject,
  deleteClientProject,
  fetchClientDashboard,
  sendClientMessage,
  updateClientProfile,
  updateClientProject,
  type ClientPortalDashboard,
} from '../utils/api';
import { 
  Bell, Search, Menu, Activity, CheckCircle, 
  Clock, CreditCard, MessageSquare, Briefcase, PlusCircle, FileText, Save, Download, ArrowLeft, ShieldCheck, FolderOpen, Calendar, Loader2, X, Printer
} from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [clientData, setClientData] = useState<ClientPortalDashboard | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageAttachment, setMessageAttachment] = useState<File | null>(null);
  const [projectForm, setProjectForm] = useState({ category: '', title: '', details: '', budgetMin: '', budgetMax: '', paymentPreference: '' });
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', companyName: '', industry: '', website: '' });
  const [editingProject, setEditingProject] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [invoiceExporting, setInvoiceExporting] = useState(false);
  const [invoiceChangeText, setInvoiceChangeText] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { authUser, loadingAuth } = useRequireAuth(lang, 'client');

  useEffect(() => {
    const isRtl = lang === Language.URDU || lang === Language.ARABIC;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.className = 'bg-slate-950 font-sans text-white';
  }, [lang]);

  useEffect(() => {
    if (!authUser) return;
    loadClientDashboard();
  }, [authUser?.id]);

  const loadClientDashboard = async () => {
    setPortalLoading(true);
    setPortalError('');
    try {
      const data = await fetchClientDashboard();
      setClientData(data);
      setProjects(data.projects);
      setMessages(data.messages);
      setProfileForm({
        name: authUser?.name || '',
        phone: authUser?.phone || '',
        companyName: data.profile?.company_name || authUser?.name || '',
        industry: data.profile?.industry || '',
        website: data.profile?.website || '',
      });
    } catch (error) {
      setPortalError(error instanceof Error ? error.message : 'Unable to load client dashboard.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const client = {
    name: authUser?.name ?? "Client",
    logo: '',
    plan: clientData?.profile?.status || "Active"
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setEditingProject(false);
    setCurrentView('project-details');
  };

  const isCompletedStatus = (status?: string) => String(status || '').toLowerCase() === 'completed';
  const isActiveStatus = (status?: string) => !['completed', 'cancelled'].includes(String(status || '').toLowerCase());
  const invoiceFileName = (invoice: any) => `${String(invoice?.id || 'DSH-invoice').replace(/[^a-z0-9-_]/gi, '-')}.pdf`;
  const formatInvoiceLabel = (value?: string) => String(value || 'service')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const invoiceProjectTitle = (invoice: any) => invoice?.projectTitle || String(invoice?.notes || '').match(/Project:\s*([^\n]+)/i)?.[1]?.trim() || 'Digital Solutions Hub Service';
  const invoiceProjectDetails = (invoice: any) => {
    if (invoice?.projectDetails) return invoice.projectDetails;
    const notes = String(invoice?.notes || '');
    const match = notes.match(/Scope \/ client request:\s*([\s\S]*?)(?:\n\s*\nPayment instructions:|$)/i);
    return (match?.[1] || 'Professional service request approved by Digital Solutions Hub.').replace(/Preferred payment method:.*$/gim, '').trim();
  };
  const invoicePaymentInstructions = (invoice: any) => {
    const raw = String(invoice?.paymentInstructions || '');
    const fallback = 'Please complete payment using the shared method and send proof in Messages.';
    if (!raw) return fallback;
    return raw
      .replace(/^Project:[\s\S]*?Payment instructions:\s*/i, '')
      .replace(/Scope \/ client request:[\s\S]*?Payment instructions:\s*/i, '')
      .trim() || fallback;
  };

  const handleInvoiceDownload = async (invoice = selectedInvoice) => {
    if (!invoice || !invoiceRef.current) return;
    setInvoiceExporting(true);
    try {
      await exportElementAsPdf(invoiceRef.current, invoiceFileName(invoice), {
        orientation: 'portrait',
        margin: 0,
      });
    } finally {
      setInvoiceExporting(false);
    }
  };

  const handleInvoicePrint = () => {
    if (!invoiceRef.current) return;
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${selectedInvoice?.id || 'Invoice'}</title>
          ${styles}
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #fff; font-family: Arial, sans-serif; }
            img { max-width: 100%; }
            @page { size: A4; margin: 12mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${invoiceRef.current.outerHTML}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const openInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setInvoiceChangeText('');
  };

  const handleInvoiceChangeRequest = async () => {
    if (!selectedInvoice || !invoiceChangeText.trim()) return;
    const sent = await sendClientMessage({
      subject: `Invoice change request: ${selectedInvoice.id}`,
      message: `Invoice change request for ${selectedInvoice.id}\n\n${invoiceChangeText.trim()}`,
    });
    setMessages((prev) => [...prev, sent]);
    setInvoiceChangeText('');
    alert('Change request sent to the DSH team.');
  };

  const renderMessageText = (text: string) => (
    <div className="space-y-2 whitespace-pre-wrap">
      {String(text || '').split(/\n+/).map((line, index) => {
        const url = line.replace(/^Attachment:\s*/i, '').trim();
        const isUrl = /^https?:\/\//i.test(url);
        const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
        if (isUrl && isImage) {
          return <a key={index} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Attachment" className="mt-2 max-h-56 rounded-xl border border-white/10 object-contain" /></a>;
        }
        if (isUrl) {
          return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block text-brand-neon underline">Open attachment</a>;
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );

  const renderContent = () => {
     switch(currentView) {
        case 'services':
           return (
             <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-bold text-white">{TRANSLATIONS.cdash_projects[lang]}</h2>
                   <button onClick={() => setCurrentView('add-project')} className="bg-brand-neon text-black px-4 py-2 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" /> {TRANSLATIONS.cdash_create_new[lang]}
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {projects.length === 0 && (
                     <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center">
                       <Briefcase className="mx-auto mb-3 h-10 w-10 text-brand-neon" />
                       <h3 className="text-xl font-bold text-white">No projects yet</h3>
                       <p className="mt-2 text-sm text-gray-400">Create your first request when you are ready.</p>
                     </div>
                   )}
                   {projects.map(service => (
                     <div 
                        key={service.id} 
                        onClick={() => handleProjectClick(service)}
                        className="glass p-6 rounded-2xl border border-white/5 hover:border-brand-neon/50 hover:bg-slate-900/80 transition-all group cursor-pointer relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-5 h-5 text-brand-neon rotate-180" />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-slate-800 rounded-xl text-brand-neon">
                              <Briefcase className="w-6 h-6" />
                           </div>
                           <span className={`px-2 py-1 text-xs rounded-full border font-bold uppercase ${
                               isActiveStatus(service.status) ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                               isCompletedStatus(service.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                               'bg-orange-500/10 text-orange-400 border-orange-500/20'
                           }`}>
                               {service.status}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-neon transition-colors">{service.title}</h3>
                        <p className="text-gray-400 text-sm mb-6">{service.category}</p>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                               <span>Completion</span>
                               <span className="text-white">{service.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ${
                                   Number(service.progress) === 100 ? 'bg-green-500 text-green-500' : 'bg-brand-neon text-brand-neon'
                               }`} style={{width: `${service.progress}%`}}></div>
                            </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           );

        case 'project-details':
            if (!selectedProject) return null;
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    {/* Navigation */}
                    <button 
                        onClick={() => setCurrentView('services')} 
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to Projects
                    </button>

                    {/* Header Card */}
                    <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-white">{selectedProject.title}</h1>
                                    <span className={`px-3 py-1 text-xs rounded-full border font-bold uppercase ${
                                        isActiveStatus(selectedProject.status) ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        isCompletedStatus(selectedProject.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    }`}>
                                        {selectedProject.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-lg">{selectedProject.category}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center min-w-[120px]">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Deadline</p>
                                    <div className="flex items-center justify-center gap-1 text-white font-bold">
                                        <Calendar className="w-4 h-4 text-brand-neon" /> {selectedProject.deadline}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <button
                                    onClick={() => setEditingProject((value) => !value)}
                                    className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:border-brand-neon/50"
                                  >
                                    {editingProject ? 'Cancel Edit' : 'Edit Project'}
                                  </button>
                                  {!isCompletedStatus(selectedProject.status) && (
                                    <button
                                      onClick={async () => {
                                        if (!confirm('Delete this project request?')) return;
                                        await deleteClientProject(selectedProject.id);
                                        setProjects((prev) => prev.filter((project) => project.id !== selectedProject.id));
                                        setSelectedProject(null);
                                        await loadClientDashboard();
                                        setCurrentView('services');
                                      }}
                                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Project Progress</span>
                                <span className="text-white font-bold">{selectedProject.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full shadow-[0_0_15px_currentColor] transition-all duration-1000 ${
                                        Number(selectedProject.progress) === 100 ? 'bg-green-500 text-green-500' : 'bg-brand-neon text-brand-neon'
                                    }`} 
                                    style={{width: `${selectedProject.progress}%`}}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Details Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {editingProject && (
                              <form
                                className="glass rounded-2xl border border-white/10 p-6 grid gap-4"
                                onSubmit={async (event) => {
                                  event.preventDefault();
                                  const updated = await updateClientProject(selectedProject.id, {
                                    title: selectedProject.title,
                                    category: selectedProject.category,
                                    details: selectedProject.description,
                                    deadline: selectedProject.deadline !== 'To be scheduled' ? selectedProject.deadline : undefined,
                                  });
                                  setSelectedProject(updated);
                                  setProjects((prev) => prev.map((project) => project.id === updated.id ? updated : project));
                                  setEditingProject(false);
                                }}
                              >
                                <input value={selectedProject.title} onChange={(event) => setSelectedProject((prev: any) => ({ ...prev, title: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="Project name" />
                                <textarea value={selectedProject.description} onChange={(event) => setSelectedProject((prev: any) => ({ ...prev, description: event.target.value }))} rows={4} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="Project details" />
                                <input value={selectedProject.deadline === 'To be scheduled' ? '' : selectedProject.deadline} onChange={(event) => setSelectedProject((prev: any) => ({ ...prev, deadline: event.target.value || 'To be scheduled' }))} type="date" className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" />
                                <button className="rounded-xl bg-brand-neon px-5 py-3 font-bold text-black">Save Project</button>
                              </form>
                            )}
                            <div className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-400" /> Description
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {selectedProject.description}
                                </p>
                            </div>

                            <div className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-orange-400" /> Next Milestone
                                </h3>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-bold">{selectedProject.nextMilestone}</p>
                                        <p className="text-xs text-gray-500">Upcoming deliverable</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Files Column */}
                        <div className="lg:col-span-1">
                            <div className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-blue-400" /> Project Files
                                </h3>
                                <div className="space-y-3">
                                    {(selectedProject.files || []).length === 0 && (
                                        <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-gray-500">No files uploaded for this project yet.</div>
                                    )}
                                    {selectedProject.files?.map((file: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-slate-800 rounded-lg text-brand-neon">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                                                </div>
                                            </div>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-brand-neon rounded-lg transition-colors">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 border border-white/10 rounded-lg text-sm font-bold text-gray-300 hover:bg-white/5 transition-all">
                                    View All Files
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'status':
            return (
                <div className="space-y-6 animate-in fade-in">
                    <h2 className="text-2xl font-bold text-white">{TRANSLATIONS.cdash_timeline[lang]}</h2>
                    <div className="glass p-8 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 rounded-full blur-3xl"></div>
                        <div className="space-y-8 relative z-10">
                            {projects.map(svc => (
                                <div key={svc.id} className="border-l-2 border-slate-800 pl-6 relative">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-950 border-2 border-brand-neon rounded-full"></div>
                                    <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                                            <p className="text-green-400 font-bold">{svc.status}</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Next Milestone</p>
                                            <p className="text-white">{svc.nextMilestone}</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Deadline</p>
                                            <p className="text-white">{svc.deadline}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && (
                                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-gray-500">Project timeline will appear after you create a request.</div>
                            )}
                        </div>
                    </div>
                </div>
            );

        case 'downloads':
           return (
             <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold text-white">{TRANSLATIONS.cdash_files[lang]}</h2>
                <div className="grid gap-4">
                   {projects.flatMap((project) => (project.files || []).map((file: any) => ({ ...file, projectTitle: project.title }))).map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-brand-neon group-hover:text-white transition-colors">
                               <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block text-white font-medium mb-1">{file.name}</span>
                                <span className="text-xs text-gray-500">{file.projectTitle} • {file.date || 'Uploaded file'}</span>
                            </div>
                         </div>
                         <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-brand-neon hover:bg-brand-neon/10 rounded-lg transition-all">
                            <Download className="w-5 h-5" />
                         </a>
                      </div>
                   ))}
                   {projects.flatMap((project) => project.files || []).length === 0 && (
                     <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-gray-500">Project files will appear here after admin uploads delivery files.</div>
                   )}
                </div>
             </div>
           );
         
         case 'payments':
            return (
               <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center mb-2">
                     <h2 className="text-2xl font-bold text-white">{TRANSLATIONS.cdash_invoices[lang]}</h2>
                     <span className="text-xs text-gray-500 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> Authorized by Sarkar Azeem (CEO)
                     </span>
                  </div>
                  
                  <div className="glass rounded-2xl overflow-hidden border border-white/5">
                     <table className="w-full text-left text-gray-400">
                        <thead className="bg-slate-900 text-gray-300 uppercase text-xs font-bold tracking-wider">
                           <tr>
                              <th className="p-5">Invoice ID</th>
                              <th className="p-5">Service</th>
                              <th className="p-5">Issue Date</th>
                              <th className="p-5">Due Date</th>
                              <th className="p-5">Amount</th>
                              <th className="p-5">Status</th>
                              <th className="p-5 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {(clientData?.invoices || []).length === 0 && (
                              <tr><td className="p-8 text-center text-gray-500" colSpan={7}>No invoices yet.</td></tr>
                           )}
                           {(clientData?.invoices || []).map((inv: any, i) => (
                              <tr key={i} className="hover:bg-white/5 transition-colors">
                                 <td className="p-5 font-bold text-white font-mono text-sm">{inv.id}</td>
                                 <td className="p-5 text-white">{inv.service}</td>
                                 <td className="p-5 text-sm">{inv.date}</td>
                                 <td className="p-5 text-sm text-brand-neon">{inv.due}</td>
                                 <td className="p-5 text-white font-bold">{inv.amount}</td>
                                 <td className="p-5"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${['Paid', 'completed'].includes(inv.status) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{inv.status}</span></td>
                                 <td className="p-5 text-right">
                                    <button onClick={() => openInvoice(inv)} className="text-xs text-brand-neon hover:text-white underline transition-colors inline-flex items-center justify-end gap-1">
                                       <FileText className="w-3 h-3" /> View
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  
                  {/* Payment Info Note */}
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-sm text-gray-400 flex items-center gap-3">
                     <CreditCard className="w-5 h-5 text-brand-neon" />
                     <p>Accepted: Bank Transfer, JazzCash/EasyPaisa, Cards, Crypto. Please upload payment proof in Messages.</p>
                  </div>
               </div>
            );

         case 'messages':
            return (
               <div className="h-[calc(100vh-140px)] flex flex-col glass rounded-2xl overflow-hidden animate-in fade-in border border-white/5">
                  <div className="p-4 border-b border-white/10 bg-slate-900/50 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">PM</div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Project Manager</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                     {messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.role === 'client' ? 'flex-row-reverse' : ''}`}>
                           <div className={`${message.role === 'client' ? 'bg-brand-neon text-black rounded-tr-none font-medium shadow-lg shadow-brand-neon/20' : 'bg-slate-800 text-gray-300 rounded-tl-none border border-white/5'} p-3 rounded-2xl text-sm max-w-[80%]`}>
                              {renderMessageText(message.text)}
                           </div>
                        </div>
                     ))}
                  </div>
                  <form onSubmit={async (event) => {
                    event.preventDefault();
                    if (!messageText.trim() && !messageAttachment) return;
                    const payload = new FormData();
                    payload.append('message', messageText.trim());
                    if (messageAttachment) payload.append('attachment', messageAttachment);
                    const sent = await sendClientMessage(payload);
                    setMessages((prev) => [...prev, sent]);
                    setMessageText('');
                    setMessageAttachment(null);
                  }} className="p-4 border-t border-white/10 bg-slate-900/50 flex gap-2">
                     <label className="cursor-pointer rounded-xl border border-white/10 px-3 py-3 text-xs font-bold text-gray-300 hover:border-brand-neon/50">
                        {messageAttachment ? 'Attached' : 'Image'}
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => setMessageAttachment(event.target.files?.[0] || null)} />
                     </label>
                     <input value={messageText} onChange={(event) => setMessageText(event.target.value)} type="text" placeholder={TRANSLATIONS.send_message[lang]} className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-all" />
                     <button className="p-3 bg-brand-neon text-black rounded-xl hover:bg-cyan-400 transition-colors shadow-lg shadow-brand-neon/20">
                        <MessageSquare className="w-5 h-5" />
                     </button>
                  </form>
               </div>
            );

         case 'add-project':
            return (
               <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
                  <button onClick={() => setCurrentView('services')} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-2">
                     <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Back to Services
                  </button>
                  <h2 className="text-2xl font-bold text-white">{TRANSLATIONS.cdash_create_new[lang]}</h2>
                  <form onSubmit={async (event) => {
                    event.preventDefault();
                    const nextProject = await createClientProject({
                      title: projectForm.title,
                      category: SERVICE_CATEGORIES.find((category) => category.id === projectForm.category)?.title[lang] || 'Service Request',
                      details: projectForm.details,
                      budgetMin: Number(projectForm.budgetMin || 0),
                      budgetMax: Number(projectForm.budgetMax || 0),
                      paymentPreference: projectForm.paymentPreference,
                    });
                    setProjects([nextProject, ...projects]);
                    setClientData((prev) => prev ? { ...prev, projects: [nextProject, ...prev.projects] } : prev);
                    setProjectForm({ category: '', title: '', details: '', budgetMin: '', budgetMax: '', paymentPreference: '' });
                    setCurrentView('services');
                  }} className="glass p-8 rounded-2xl space-y-6 border border-white/10">
                     <div>
                        <label className="block text-sm text-gray-400 mb-2">{TRANSLATIONS.form_category[lang]}</label>
                        <select required value={projectForm.category} onChange={(event) => setProjectForm((prev) => ({ ...prev, category: event.target.value }))} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-colors relative z-10">
                           <option value="">Select Service</option>
                           {SERVICE_CATEGORIES.map(c => (
                              <option key={c.id} value={c.id}>{c.title[lang]}</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                        <input required value={projectForm.title} onChange={(event) => setProjectForm((prev) => ({ ...prev, title: event.target.value }))} type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="e.g. Corporate Website Redesign" />
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-2">{TRANSLATIONS.form_details[lang]}</label>
                        <textarea required value={projectForm.details} onChange={(event) => setProjectForm((prev) => ({ ...prev, details: event.target.value }))} rows={4} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="Describe your project requirements..."></textarea>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm text-gray-400 mb-2">Minimum Budget (USD)</label>
                           <input value={projectForm.budgetMin} onChange={(event) => setProjectForm((prev) => ({ ...prev, budgetMin: event.target.value }))} type="number" min="0" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="250" />
                        </div>
                        <div>
                           <label className="block text-sm text-gray-400 mb-2">Maximum Budget (USD)</label>
                           <input value={projectForm.budgetMax} onChange={(event) => setProjectForm((prev) => ({ ...prev, budgetMax: event.target.value }))} type="number" min="0" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="500" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm text-gray-400 mb-2">Preferred Payment Method</label>
                        <select value={projectForm.paymentPreference} onChange={(event) => setProjectForm((prev) => ({ ...prev, paymentPreference: event.target.value }))} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-colors">
                          <option value="">Select payment option</option>
                          <option>Bank Transfer</option>
                          <option>JazzCash / EasyPaisa</option>
                          <option>Card</option>
                          <option>Crypto</option>
                        </select>
                     </div>
                     <button className="w-full py-3 bg-brand-neon text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all">
                        Submit Request
                     </button>
                  </form>
               </div>
            );

         case 'profile':
            return (
               <div className="max-w-2xl space-y-6 animate-in fade-in">
                  <h2 className="text-2xl font-bold text-white">Profile</h2>
                  <form
                    className="glass rounded-2xl border border-white/10 p-6 grid gap-4"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const updated = await updateClientProfile(profileForm);
                      setClientData((prev) => prev ? { ...prev, profile: updated } : prev);
                      alert('Profile updated successfully.');
                    }}
                  >
                    <input value={profileForm.name} onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="Your name" />
                    <input value={authUser?.email || ''} disabled className="rounded-xl border border-white/10 bg-slate-900 p-3 text-gray-400" />
                    <input value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="Phone" />
                    <input value={profileForm.companyName} onChange={(event) => setProfileForm((prev) => ({ ...prev, companyName: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="Company / brand name" />
                    <input value={profileForm.industry} onChange={(event) => setProfileForm((prev) => ({ ...prev, industry: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="Industry" />
                    <input value={profileForm.website} onChange={(event) => setProfileForm((prev) => ({ ...prev, website: event.target.value }))} className="rounded-xl border border-white/10 bg-slate-950 p-3 text-white" placeholder="https://example.com" />
                    <button className="rounded-xl bg-brand-neon px-5 py-3 font-bold text-black">Save Profile</button>
                  </form>
               </div>
            );

         default: 
            return (
               <div className="space-y-8 animate-in fade-in">
                  <div className="rounded-3xl bg-gradient-to-r from-purple-900 to-slate-900 p-8 border border-white/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
                     <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">{TRANSLATIONS.dash_welcome[lang]}</h1>
                        <p className="text-purple-200">You have {clientData?.stats.activeProjects ?? projects.filter((project) => isActiveStatus(project.status)).length} active projects and {(clientData?.invoices || []).filter((invoice: any) => !isCompletedStatus(invoice.status)).length} pending invoices.</p>
                     </div>
                  </div>

                  {portalError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{portalError}</div>}
                  {portalLoading && <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-gray-400">Loading live client data...</div>}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {[
                        { label: TRANSLATIONS.cdash_active_orders[lang], val: String(clientData?.stats.activeProjects ?? projects.filter((project) => isActiveStatus(project.status)).length).padStart(2, '0'), icon: Activity, color: "text-brand-neon" },
                        { label: TRANSLATIONS.cdash_pending_pay[lang], val: `$${Number(clientData?.stats.pendingAmount || 0).toLocaleString()}`, icon: Clock, color: "text-orange-400" },
                        { label: TRANSLATIONS.cdash_completed_proj[lang], val: String(clientData?.stats.completedProjects ?? projects.filter((project) => isCompletedStatus(project.status)).length).padStart(2, '0'), icon: CheckCircle, color: "text-green-400" }
                     ].map((stat, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border border-white/5">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-slate-800 rounded-xl">
                                 <stat.icon className={`w-6 h-6 ${stat.color}`} />
                              </div>
                           </div>
                           <h3 className="text-3xl font-bold text-white mb-1">{stat.val}</h3>
                           <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                     ))}
                  </div>
               </div>
            );
     }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white selection:bg-brand-neon/30">
      <SEO 
        title={`${TRANSLATIONS.dashboard[lang]} | Client Portal`} 
        description="Manage your services, ads, and payments." 
        lang={lang} 
      />

      <ClientSidebar 
        lang={lang} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {/* Main Content */}
      <div className="lg:pl-72 lg:rtl:pl-0 lg:rtl:pr-72 transition-all duration-300">
        
        {/* Header - Dark & Glass */}
        <header className="sticky top-0 z-30 h-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center relative group">
              <Search className="absolute left-3 w-4 h-4 text-gray-500 rtl:right-3 rtl:left-auto group-focus-within:text-brand-neon transition-colors" />
              <input 
                type="text" 
                placeholder={TRANSLATIONS.search[lang]} 
                className="bg-slate-950 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-neon/50 w-80 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} />
            <button 
              onClick={() => setCurrentView('messages')}
              className="relative p-2 text-gray-400 hover:text-brand-neon transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-neon rounded-full shadow-[0_0_8px_#00f3ff]"></span>
            </button>
            <div 
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-3 pl-4 border-l border-white/10 rtl:pl-0 rtl:pr-4 rtl:border-l-0 rtl:border-r cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src={client.logo} alt="Profile" className="w-9 h-9 rounded-lg border border-white/10 object-cover" />
              <div className="hidden md:block text-sm">
                <p className="font-bold text-white leading-none mb-1">{client.name}</p>
                <p className="text-[10px] text-brand-neon uppercase tracking-widest font-semibold">{client.plan}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-8 space-y-8">
          {renderContent()}
        </main>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            <div className="w-full rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
              <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Invoice Preview</h3>
                  <p className="text-xs text-gray-400">{selectedInvoice.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleInvoiceDownload(selectedInvoice)}
                    disabled={invoiceExporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-neon px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
                  >
                    {invoiceExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download PDF
                  </button>
                  <button
                    onClick={handleInvoicePrint}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:border-brand-neon/50"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="rounded-xl bg-slate-800 p-2 text-white hover:bg-slate-700"
                    aria-label="Close invoice preview"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 p-4 lg:grid-cols-[1fr,320px]">
                <div className="overflow-auto rounded-xl bg-white p-3">
                  <div ref={invoiceRef} className="mx-auto min-h-[1123px] w-[794px] bg-white p-10 text-slate-950">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-8">
                      <div className="flex items-center gap-4">
                        <img src="/brand/Final%20Logo%20(1).webp" alt="Digital Solutions Hub" width="512" height="768" className="h-16 w-16 object-contain" loading="eager" decoding="async" />
                        <div>
                          <h1 className="text-2xl font-black tracking-wide">Digital Solutions Hub</h1>
                          <p className="text-sm text-slate-500">Where Innovation Finds Direction</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black uppercase tracking-wide text-slate-900">Invoice</p>
                        <p className="mt-2 font-mono text-sm text-slate-500">{selectedInvoice.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-8">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Billed To</p>
                        <h2 className="mt-2 text-xl font-bold">{client.name}</h2>
                        <p className="text-sm text-slate-500">{authUser?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm"><span className="font-bold">Issue Date:</span> {selectedInvoice.date || '-'}</p>
                        <p className="text-sm"><span className="font-bold">Due Date:</span> {selectedInvoice.due || '-'}</p>
                        <p className="text-sm"><span className="font-bold">Status:</span> {String(selectedInvoice.status || '').toUpperCase()}</p>
                      </div>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-left text-xs uppercase tracking-widest text-white">
                          <th className="p-4">Description</th>
                          <th className="p-4">Type</th>
                          <th className="p-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-4">
                            <p className="font-bold">{invoiceProjectTitle(selectedInvoice)}</p>
                            <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{invoiceProjectDetails(selectedInvoice)}</p>
                            {selectedInvoice.referenceId && <p className="mt-1 text-xs text-slate-500">Reference: {selectedInvoice.referenceId}</p>}
                          </td>
                          <td className="p-4 text-slate-600">{formatInvoiceLabel(selectedInvoice.projectType || selectedInvoice.service)}</td>
                          <td className="p-4 text-right font-bold">{selectedInvoice.amount}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-8 flex justify-end">
                      <div className="w-72 rounded-xl bg-slate-50 p-5">
                        <div className="flex justify-between text-sm text-slate-500">
                          <span>Subtotal</span>
                          <span>{selectedInvoice.amount}</span>
                        </div>
                        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-xl font-black">
                          <span>Total</span>
                          <span>{selectedInvoice.amount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
                      <p className="font-bold text-slate-700">Payment Instructions</p>
                      <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-700">{invoicePaymentInstructions(selectedInvoice)}</div>
                      {selectedInvoice.paymentLink && (
                        <p className="mt-3">
                          <span className="font-bold text-slate-700">Payment Link: </span>
                          <a href={selectedInvoice.paymentLink} className="text-cyan-700 underline">{selectedInvoice.paymentLink}</a>
                        </p>
                      )}
                      {selectedInvoice.bankAccountDetails && (
                        <div className="mt-3">
                          <p className="font-bold text-slate-700">Bank Account</p>
                          <p className="whitespace-pre-wrap">{selectedInvoice.bankAccountDetails}</p>
                        </div>
                      )}
                      <p className="mt-3">Please send payment proof from the client messages section after payment.</p>
                      <p className="mt-6 text-xs">Authorized by Sarkar Azeem, CEO. This invoice was generated from the Digital Solutions Hub client portal.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                    <h4 className="font-bold text-white">Request a Change</h4>
                    <p className="mt-1 text-sm text-gray-400">Agar amount, service details, ya due date mein issue hai to yahan message bhej dein.</p>
                    <textarea
                      value={invoiceChangeText}
                      onChange={(event) => setInvoiceChangeText(event.target.value)}
                      rows={5}
                      className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white focus:border-brand-neon focus:outline-none"
                      placeholder="Write what needs to be corrected..."
                    />
                    <button
                      onClick={handleInvoiceChangeRequest}
                      disabled={!invoiceChangeText.trim()}
                      className="mt-3 w-full rounded-xl bg-brand-neon px-4 py-3 font-bold text-black disabled:opacity-50"
                    >
                      Send Change Request
                    </button>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-gray-400">
                    <p className="font-bold text-white">Invoice Status</p>
                    <p className="mt-2">Current status: <span className="font-bold uppercase text-brand-neon">{selectedInvoice.status}</span></p>
                    <p className="mt-2">Admin can update payment status after confirming your payment proof.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
