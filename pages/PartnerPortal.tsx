import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserRound, BriefcaseBusiness, FolderKanban, Wallet, Percent,
  LogOut, Loader2, Save, Plus, ExternalLink, BookOpen, Share2, Mail, Users,
  ShieldCheck, CheckCircle2, Trash2
} from 'lucide-react';
import SEO from '../components/SEO';
import {
  fetchPartnerDashboard, fetchPartnerServices, fetchPartnerCommissions, fetchPartnerWallet,
  fetchPartnerPortfolio, createPartnerPortfolio, updatePartnerProfile, logout,
  fetchPartnerResources, fetchPartnerSocialAccounts, savePartnerSocialAccount,
  deletePartnerSocialAccount, fetchPartnerBusinessEmail, fetchPartnerLeads,
  fetchPartnerPayoutAccounts, createPartnerPayoutAccount, requestPartnerPayout,
  fetchAvailableServices, createPartnerService, deletePartnerService, deletePartnerPortfolio, requestPartnerBusinessEmail, requestPartnerChange, requestPartnerDeletion
} from '../utils/api';

const PartnerPortal: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>();
  const [services, setServices] = useState<any[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any>();
  const [wallet, setWallet] = useState<any>();
  const [resources, setResources] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [businessEmail, setBusinessEmail] = useState<any>();
  const [leads, setLeads] = useState<any>();
  const [payoutAccounts, setPayoutAccounts] = useState<any[]>([]);
  const [view, setView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [portfolioForm, setPortfolioForm] = useState({title:'',description:'',project_url:'',category:''});
  const [serviceForm, setServiceForm] = useState({service_id:'',title:'',description:'',pricing_type:'quote',starting_price:'',currency:'USD',delivery_days:''});
  const [socialForm, setSocialForm] = useState({platform:'LinkedIn',username:'',display_name:'',profile_url:''});
  const [payoutForm, setPayoutForm] = useState({method:'Bank Transfer',account_name:'',account_details:'',is_default:true});
  const [payoutAmount, setPayoutAmount] = useState('');
  const [message, setMessage] = useState('');
  const [resourceModal, setResourceModal] = useState<any>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File|null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d,s,c,w,p,r,so,e,l,pa,sc,o] = await Promise.all([
        fetchPartnerDashboard(),
        fetchPartnerServices().catch(() => []),
        fetchPartnerCommissions().catch(() => ({data:[]})),
        fetchPartnerWallet().catch(() => ({wallet:null,transactions:{data:[]}})),
        fetchPartnerPortfolio().catch(() => []),
        fetchPartnerResources().catch(() => []),
        fetchPartnerSocialAccounts().catch(() => []),
        fetchPartnerBusinessEmail().catch(() => null),
        fetchPartnerLeads().catch(() => ({data:[]})),
        fetchPartnerPayoutAccounts().catch(() => []),
        fetchAvailableServices().catch(() => []),
        fetchPartnerOnboarding().catch(() => ({}))
      ]);
      setData(d); setServices(s); setCommissions(c); setWallet(w); setPortfolio(p);
      setResources(r); setSocials(so); setBusinessEmail(e); setLeads(l); setPayoutAccounts(pa); setServiceCatalog(sc);
      setProfile(d.partner || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><Loader2 className="animate-spin mr-2"/>Loading your DSH partner workspace...</div>;
  if (!data?.partner) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Partner profile not found.</div>;

  const p = data.partner;
  const nav: any[] = [
    ['overview','Overview',LayoutDashboard],
    ['profile','Profile & Portfolio',UserRound],
    ['services','Services',BriefcaseBusiness],
    ['leads','Leads & Projects',Users],
    ['commissions','Commissions',Percent],
    ['wallet','Wallet & Payouts',Wallet],
    ['resources','DSH Resources',BookOpen],
    ['social','Social Profiles',Share2],
    ['business-email','Business Email',Mail],
  ];

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200';
  const selectClass = 'w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200';
  const resourceUrl = (r:any) => r.action_url || (r.id === 'ai-tools' ? '/en/tools' : '/en/contact');
  const openResource = (r:any) => { if (r.id === 'delivery-checklist') { setResourceModal(r); return; } const url = resourceUrl(r); if (url.startsWith('mailto:')) window.location.href = url; else window.open(url, '_blank', 'noopener,noreferrer'); };

  const requestDeletion = async (target:string,targetId?:any) => {
    const reason=window.prompt('Why do you want to remove this? This action requires DSH admin approval:');
    if(!reason) return;
    setSaving(true); setMessage('');
    try { await requestPartnerDeletion(target,reason,targetId); setMessage('Deletion request submitted. DSH admin approval is required.'); }
    catch(e:any){setMessage(e?.message||'Unable to submit deletion request.')} finally{setSaving(false)}
  };

  const saveProfile = async () => {
    setSaving(true); setMessage('');
    try {
      const form = new FormData();
      Object.entries(profile).forEach(([key,value]) => {
        if (value !== undefined && value !== null) form.append(key, String(value));
      });
      if (profilePhotoFile) form.append('profile_photo', profilePhotoFile);
      const x = await updatePartnerProfile(form);
      setProfile(x); setData({...data,partner:x}); setProfilePhotoFile(null);
      setMessage('Profile updated successfully.');
      await load();
    } catch (e:any) { setMessage(e?.message || 'Unable to save profile.'); }
    finally { setSaving(false); }
  };

  const addPortfolio = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { await createPartnerPortfolio(portfolioForm); setPortfolio(await fetchPartnerPortfolio()); setPortfolioForm({title:'',description:'',project_url:'',category:''}); setMessage('Portfolio project added.'); }
    catch (e:any) { setMessage(e?.message || 'Unable to add portfolio project.'); }
    finally { setSaving(false); }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try {
      await createPartnerService({...serviceForm, service_id:Number(serviceForm.service_id), starting_price:serviceForm.starting_price ? Number(serviceForm.starting_price) : null, delivery_days:serviceForm.delivery_days ? Number(serviceForm.delivery_days) : null});
      setServices(await fetchPartnerServices());
      setServiceForm({service_id:'',title:'',description:'',pricing_type:'quote',starting_price:'',currency:'USD',delivery_days:''});
      setMessage('Service added to your profile.');
    } catch (e:any) { setMessage(e?.message || 'Unable to add service.'); }
    finally { setSaving(false); }
  };

  const addSocial = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { await savePartnerSocialAccount(socialForm); setSocials(await fetchPartnerSocialAccounts()); setSocialForm({platform:'LinkedIn',username:'',display_name:'',profile_url:''}); setMessage('Social profile connected.'); }
    catch (e:any) { setMessage(e?.message || 'Unable to connect social profile.'); }
    finally { setSaving(false); }
  };

  const requestEmail = async () => {
    setSaving(true); setMessage('');
    try { const e = await requestPartnerBusinessEmail(); setBusinessEmail(e); setMessage('Business email request submitted to DSH admin.'); }
    catch (e:any) { setMessage(e?.message || 'Unable to request business email.'); }
    finally { setSaving(false); }
  };

  const requestChangeFor = async (item: string) => {
    const text = window.prompt('Describe the change or support you need from DSH:');
    if (!text) return;
    setSaving(true); setMessage('');
    try { await requestPartnerChange(item, text); setMessage('Your request has been sent to DSH admin.'); await load(); }
    catch (e:any) { setMessage(e?.message || 'Unable to submit request.'); }
    finally { setSaving(false); }
  };

  const addPayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try { await createPartnerPayoutAccount(payoutForm); setPayoutAccounts(await fetchPartnerPayoutAccounts()); setPayoutForm({method:'Bank Transfer',account_name:'',account_details:'',is_default:true}); setMessage('Payout account submitted for verification.'); }
    catch (e:any) { setMessage(e?.message || 'Unable to add payout account.'); }
    finally { setSaving(false); }
  };

  const submitPayout = async () => {
    if (!payoutAccounts[0] || !payoutAmount) return;
    setSaving(true); setMessage('');
    try { await requestPartnerPayout({payout_account_id:payoutAccounts[0].id,amount:Number(payoutAmount)}); setPayoutAmount(''); setMessage('Payout request submitted to DSH.'); }
    catch (e:any) { setMessage(e?.message || 'Unable to request payout.'); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-slate-100 text-slate-900 flex">
    <SEO title="DSH Partner Portal" description="Your complete Digital Solutions Hub partner workspace."/>
    <aside className="w-72 bg-slate-950 text-white fixed inset-y-0 left-0 z-20 hidden lg:flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="text-xl font-black">DSH <span className="text-amber-400">PARTNER</span></div>
        <p className="text-xs text-slate-400 mt-1">{p.partner_code} · <span className="text-green-400">Verified</span></p>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">{nav.map(([k,l,I]) =>
        <button key={k} onClick={()=>{setView(k);setMessage('')}} className={'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm '+(view===k?'bg-amber-400 text-slate-950 font-bold':'text-slate-300 hover:bg-white/5')}>
          <I className="w-5 h-5"/>{l}
        </button>)}</nav>
      <div className="p-4 border-t border-white/10">
        <Link to={'/p/'+p.slug} target="_blank" className="flex items-center gap-2 text-sm text-slate-300 mb-4"><ExternalLink className="w-4 h-4"/>Public profile</Link>
        <button onClick={async()=>{await logout();navigate('/en/login')}} className="flex items-center gap-2 text-sm text-red-300"><LogOut className="w-4 h-4"/>Sign out</button>
      </div>
    </aside>

    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-950 border-b border-white/10 px-3 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="font-black text-white whitespace-nowrap">DSH <span className="text-amber-400">PARTNER</span></div>
        <select aria-label="Partner section" value={view} onChange={e=>{setView(e.target.value);setMessage('')}} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-slate-900 text-white px-3 py-2 text-sm">
          {nav.map(([k,l])=><option key={k} value={k}>{l}</option>)}
        </select>
      </div>
    </div>

    <main className="flex-1 lg:ml-72 p-5 pt-20 md:p-8 lg:pt-8">
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div><p className="text-sm text-slate-500">Digital Solutions Hub · Partner Ecosystem</p><h1 className="text-3xl font-black mt-1">{nav.find(x=>x[0]===view)?.[1]}</h1></div>
        <div className="text-sm text-slate-500">Welcome, <b className="text-slate-900">{p.display_name}</b></div>
      </header>

      {message && <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">{message}</div>}

      {view==='overview' && <div className="space-y-6">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[['Active Services',data.stats.activeServices],['Active Orders',data.stats.activeOrders],['Total Earned','$'+Number(data.stats.totalEarned).toFixed(2)],['Available Balance','$'+Number(data.stats.availableBalance).toFixed(2)]].map(x=><div key={String(x[0])} className="bg-white rounded-2xl border p-5"><p className="text-xs uppercase text-slate-500">{x[0]}</p><p className="text-2xl font-black mt-2">{x[1]}</p></div>)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-amber-600 font-black">Partner Profile</p><h2 className="font-black text-2xl mt-1">Complete your profile</h2><p className="text-sm text-slate-500 mt-2">Add your verified identity details and professional information so clients can see a complete DSH partner profile.</p></div><div className="text-2xl font-black text-amber-600">{Math.round(([p.legal_name,p.cnic,p.date_of_birth,p.father_name,p.real_phone,p.whatsapp_number,p.profile_photo].filter(Boolean).length/7)*100)}%</div></div>
            <div className="mt-5 h-2.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-amber-400 transition-all" style={{width:(Math.round(([p.legal_name,p.cnic,p.date_of_birth,p.father_name,p.real_phone,p.whatsapp_number,p.profile_photo].filter(Boolean).length/7)*100))+'%'}}/></div>
            <button type="button" onClick={()=>setView('profile')} className="mt-5 rounded-xl bg-slate-950 text-white px-5 py-3 font-bold">{Math.round(([p.legal_name,p.cnic,p.date_of_birth,p.father_name,p.real_phone,p.whatsapp_number,p.profile_photo].filter(Boolean).length/7)*100)===100?'Review profile':'Complete your profile'} →</button>
          </div>
          <div className="bg-slate-950 text-white rounded-2xl p-6">
            <ShieldCheck className="w-8 h-8 text-amber-400"/>
            <h2 className="font-bold text-lg mt-3">What DSH provides</h2>
            <p className="text-slate-400 text-sm mt-2">Leads, client billing, commission tracking, professional profile, resources, business identity and payout support — all in one workspace.</p>
            <button onClick={()=>setView('resources')} className="mt-5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold">Explore resources</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-6"><h2 className="font-bold mb-4">Recent orders</h2><div className="space-y-3">{(data.recentOrders||[]).map((o:any)=><div key={o.id} className="border rounded-xl p-4 flex flex-wrap justify-between gap-2"><b>{o.order_number}</b><span>{o.currency} {o.total}</span><span>{o.status}</span></div>)}</div></div>
      </div>}

      {view==='profile' && <div className="space-y-6">
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div><h2 className="font-bold text-lg">Update your profile</h2><p className="text-sm text-slate-500 mt-1">Keep your professional information updated. Identity details are required for DSH verification.</p></div>
            <div className="text-right"><div className="text-3xl font-black text-amber-600">{[profile.legal_name,profile.cnic,profile.date_of_birth,profile.father_name,profile.real_phone,profile.whatsapp_number,profile.profile_photo].filter(Boolean).length===7?'100':'0'}%</div><div className="text-xs text-slate-500">Profile completeness</div></div>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-amber-400 transition-all" style={{width:((([profile.legal_name,profile.cnic,profile.date_of_birth,profile.father_name,profile.real_phone,profile.whatsapp_number,profile.profile_photo].filter(Boolean).length)/7)*100)+'%'}}/></div>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold">Real name (as on CNIC)<input required value={profile.legal_name||''} onChange={e=>setProfile({...profile,legal_name:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Pak ID Card / CNIC<input required placeholder="35202-1234567-1" value={profile.cnic||''} onChange={e=>setProfile({...profile,cnic:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Date of birth<input required type="date" value={profile.date_of_birth||''} onChange={e=>setProfile({...profile,date_of_birth:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Father name<input required value={profile.father_name||''} onChange={e=>setProfile({...profile,father_name:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Real phone number<input required type="tel" value={profile.real_phone||''} onChange={e=>setProfile({...profile,real_phone:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">WhatsApp number<input required type="tel" value={profile.whatsapp_number||''} onChange={e=>setProfile({...profile,whatsapp_number:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Display name<input value={profile.display_name||''} onChange={e=>setProfile({...profile,display_name:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Professional title<input value={profile.professional_title||''} onChange={e=>setProfile({...profile,professional_title:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold md:col-span-2">Profile picture
              <div className="mt-2 flex flex-col sm:flex-row items-center gap-4">
                {profile.profile_photo ? <img src={String(profile.profile_photo).startsWith('http') ? profile.profile_photo : (((import.meta as any).env?.VITE_API_BASE_URL || 'https://api.digitalsolhub.com/api').replace('/api','') + '/storage/' + profile.profile_photo)} className="w-20 h-20 rounded-full object-cover border-2 border-amber-300" /> : <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">No photo</div>}
                <input required={!profile.profile_photo} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setProfilePhotoFile(e.target.files?.[0]||null)} className="flex-1 text-sm"/>
              </div>
            </label>
            <label className="text-sm font-semibold">Country<input value={profile.country||''} onChange={e=>setProfile({...profile,country:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">City<input value={profile.city||''} onChange={e=>setProfile({...profile,city:e.target.value})} className={inputClass}/></label>
            <label className="text-sm font-semibold">Timezone<input value={profile.timezone||''} onChange={e=>setProfile({...profile,timezone:e.target.value})} className={inputClass}/></label>
            <label className="md:col-span-2 text-sm font-semibold">Bio<textarea value={profile.bio||''} onChange={e=>setProfile({...profile,bio:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3 h-32"/></label>
          </div>
          <button type="button" onClick={saveProfile} disabled={saving} className="mt-5 px-5 py-3 rounded-xl bg-slate-950 text-white font-bold flex items-center gap-2"><Save className="w-4 h-4"/>{saving?'Saving...':'Save profile'}</button><button type="button" onClick={()=>requestDeletion('profile')} disabled={saving} className="mt-3 md:ml-3 px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold inline-flex items-center gap-2"><Trash2 className="w-4 h-4"/>Request profile deletion</button>
        </div>
        <div className="bg-white rounded-2xl border p-6"><div className="flex justify-between items-center"><div><h2 className="font-bold text-lg">Portfolio</h2><p className="text-sm text-slate-500">Show clients what you can deliver.</p></div></div>
          <form onSubmit={addPortfolio} className="grid md:grid-cols-2 gap-3 mt-5"><input required placeholder="Project title" value={portfolioForm.title} onChange={e=>setPortfolioForm({...portfolioForm,title:e.target.value})} className={inputClass}/><input placeholder="Category" value={portfolioForm.category} onChange={e=>setPortfolioForm({...portfolioForm,category:e.target.value})} className={inputClass}/><input placeholder="Project URL" value={portfolioForm.project_url} onChange={e=>setPortfolioForm({...portfolioForm,project_url:e.target.value})} className={inputClass}/><textarea required placeholder="Short project description" value={portfolioForm.description} onChange={e=>setPortfolioForm({...portfolioForm,description:e.target.value})} className={inputClass}/><button className="md:col-span-2 px-5 py-3 rounded-xl bg-amber-400 font-bold flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Add project</button></form>
          <div className="grid md:grid-cols-3 gap-4 mt-6">{portfolio.map((x:any)=><div key={x.id} className="border rounded-xl p-4"><div className="flex justify-between gap-2"><div className="text-xs text-amber-600">{x.category||'Project'}</div><button type="button" onClick={()=>{if(window.confirm('Delete this portfolio item?')){deletePartnerPortfolio(x.id).then(async()=>{setPortfolio(await fetchPartnerPortfolio());setMessage('Portfolio item deleted.');}).catch((e:any)=>setMessage(e?.message||'Unable to delete portfolio item.'));}}} className="text-red-500" title="Delete portfolio item"><Trash2 className="w-4 h-4"/></button></div><b>{x.title}</b><p className="text-sm text-slate-500 mt-2">{x.description}</p></div>)}</div>
        </div>
      </div>}

      {view==='services' && <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-lg">Your services</h2><p className="text-sm text-slate-500 mt-1">Publish the services you want DSH clients to see.</p>
        <form onSubmit={addService} className="grid md:grid-cols-2 gap-3 mt-5">
          <select required value={serviceForm.service_id} onChange={e=>setServiceForm({...serviceForm,service_id:e.target.value})} className={inputClass}><option value="">Select DSH service</option>{serviceCatalog.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <input required placeholder="Your service title" value={serviceForm.title} onChange={e=>setServiceForm({...serviceForm,title:e.target.value})} className={inputClass}/>
          <textarea placeholder="Description" value={serviceForm.description} onChange={e=>setServiceForm({...serviceForm,description:e.target.value})} className={inputClass+' md:col-span-2'}/>
          <select value={serviceForm.pricing_type} onChange={e=>setServiceForm({...serviceForm,pricing_type:e.target.value})} className={inputClass}><option value="quote">Quote</option><option value="fixed">Fixed price</option><option value="starting_at">Starting at</option></select>
          <input type="number" min="0" placeholder="Starting price" value={serviceForm.starting_price} onChange={e=>setServiceForm({...serviceForm,starting_price:e.target.value})} className={inputClass}/>
          <input type="number" min="1" placeholder="Delivery days" value={serviceForm.delivery_days} onChange={e=>setServiceForm({...serviceForm,delivery_days:e.target.value})} className={inputClass}/>
          <button className="px-5 py-3 rounded-xl bg-slate-950 text-white font-bold flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Add service</button>
        </form>
        <div className="mt-6 space-y-3">{services.map((s:any)=><div key={s.id} className="border rounded-xl p-4 flex justify-between gap-4"><div><b>{s.title}</b><p className="text-sm text-slate-500">{s.description}</p></div><div className="flex items-center gap-3"><span className="text-sm font-bold">{s.starting_price ? s.currency+' '+s.starting_price : 'Quote'}</span><button type="button" onClick={async()=>{if(!window.confirm('Delete this service?'))return;try{await deletePartnerService(s.id);setServices(await fetchPartnerServices());setMessage('Service deleted.')}catch(e:any){setMessage(e?.message||'Unable to delete service.')}}} className="text-red-500" title="Delete service"><Trash2 className="w-4 h-4"/></button></div></div>)}</div>
      </div>}

      {view==='leads' && <div className="space-y-6"><div className="bg-white rounded-2xl border p-6"><h2 className="font-bold text-lg">Assigned leads</h2><p className="text-sm text-slate-500 mt-1">DSH can route qualified client opportunities to you.</p><div className="mt-5 space-y-3">{(leads?.data||[]).length ? leads.data.map((l:any)=><div key={l.id} className="border rounded-xl p-4"><div className="flex justify-between gap-3"><b>{l.name}</b><span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{l.status}</span></div><p className="text-sm text-slate-500 mt-1">{l.email} {l.phone&&'· '+l.phone}</p><p className="mt-2 text-sm">{l.message||'No message provided.'}</p></div>) : <div className="text-sm text-slate-500 py-8 text-center">No leads assigned yet. Keep your services and profile complete.</div>}</div></div></div>}

      {view==='commissions' && <div className="bg-white rounded-2xl border p-6"><h2 className="font-bold text-lg">Commission ledger</h2><p className="text-sm text-slate-500 mt-1 mb-5">Each order has an admin-approved commission snapshot.</p><div className="space-y-3">{(commissions?.data||[]).map((c:any)=><div key={c.id} className="border rounded-xl p-4 grid sm:grid-cols-4 gap-2 text-sm"><span>Order #{c.order_id}</span><span>Gross {c.currency} {c.gross_amount}</span><span>Partner {c.currency} {c.partner_amount}</span><b>{c.status}</b></div>)}</div></div>}

      {view==='wallet' && <div className="space-y-6"><div className="grid md:grid-cols-3 gap-4">{[['Pending',wallet?.wallet?.pending_balance],['Available',wallet?.wallet?.available_balance],['Paid',wallet?.wallet?.paid_balance]].map(x=><div key={String(x[0])} className="bg-white rounded-2xl border p-5"><p className="text-xs text-slate-500">{x[0]}</p><p className="text-2xl font-black mt-2">$ {Number(x[1]||0).toFixed(2)}</p></div>)}</div>
        <div className="bg-white rounded-2xl border p-6"><h2 className="font-bold">Payout setup</h2><form onSubmit={addPayoutAccount} className="grid md:grid-cols-2 gap-3 mt-5"><select value={payoutForm.method} onChange={e=>setPayoutForm({...payoutForm,method:e.target.value})} className={inputClass}><option>Bank Transfer</option><option>Payoneer</option><option>Wise</option><option>PayPal</option></select><input required placeholder="Account name" value={payoutForm.account_name} onChange={e=>setPayoutForm({...payoutForm,account_name:e.target.value})} className={inputClass}/><textarea required placeholder="Account details" value={payoutForm.account_details} onChange={e=>setPayoutForm({...payoutForm,account_details:e.target.value})} className={inputClass+' md:col-span-2'}/><button className="px-5 py-3 rounded-xl bg-slate-950 text-white font-bold">Add payout account</button></form>
          <div className="mt-5 space-y-2">{payoutAccounts.map((a:any)=><div key={a.id} className="border rounded-xl p-4 flex justify-between items-center"><span>{a.method} · {a.account_name}</span><div className="flex items-center gap-3"><span className={a.is_verified?'text-green-600':'text-amber-600'}>{a.is_verified?'Verified':'Pending verification'}</span><button type="button" onClick={()=>requestDeletion('payout_account',a.id)} className="text-red-500" title="Request payout account deletion"><Trash2 className="w-4 h-4"/></button></div></div>)}</div>
          <div className="mt-6 border-t pt-5 flex flex-col md:flex-row gap-3"><input type="number" min="1" placeholder="Amount to request" value={payoutAmount} onChange={e=>setPayoutAmount(e.target.value)} className={inputClass}/><button onClick={submitPayout} disabled={saving||!payoutAccounts.length} className="px-5 py-3 rounded-xl bg-amber-400 font-bold">Request payout</button></div>
        </div>
      </div>}

      {view==='resources' && <div>
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-black text-lg text-slate-900">DSH Partner Resources</h2>
          <p className="text-sm text-slate-700 mt-1">Practical tools, sales material, delivery guidance and support for your DSH partner work.</p>
        </div>
        {resources.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{resources.map((r:any)=>
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[210px]">
            <div className="text-xs uppercase tracking-wider text-amber-700 font-bold">{r.type}</div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">{r.title}</h2>
            <p className="text-sm text-slate-600 mt-2 flex-1">{r.description}</p>
            <button type="button" onClick={()=>openResource(r)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400">{r.action || 'Open resource'} <span aria-hidden="true">→</span></button>
          </div>
        )}</div> : <div className="bg-white rounded-2xl border p-8 text-center text-slate-600">No resources are available right now. Please try again later.</div>}
      </div>}

      {view==='social' && <div className="space-y-5"><div className="bg-white rounded-2xl border p-6"><h2 className="font-bold text-lg">Social profiles</h2><p className="text-sm text-slate-500 mt-1">Connect public profiles so clients can verify your professional presence.</p><form onSubmit={addSocial} className="grid md:grid-cols-2 gap-3 mt-5"><select value={socialForm.platform} onChange={e=>setSocialForm({...socialForm,platform:e.target.value})} className={inputClass}><option>LinkedIn</option><option>Facebook</option><option>Instagram</option><option>YouTube</option><option>TikTok</option><option>GitHub</option></select><input placeholder="Username" value={socialForm.username} onChange={e=>setSocialForm({...socialForm,username:e.target.value})} className={inputClass}/><input placeholder="Display name" value={socialForm.display_name} onChange={e=>setSocialForm({...socialForm,display_name:e.target.value})} className={inputClass}/><input required placeholder="Profile URL" value={socialForm.profile_url} onChange={e=>setSocialForm({...socialForm,profile_url:e.target.value})} className={inputClass}/><button className="md:col-span-2 px-5 py-3 rounded-xl bg-slate-950 text-white font-bold">Connect profile</button></form></div><div className="space-y-2">{socials.map((s:any)=><div key={s.id} className="bg-white rounded-xl border p-4 flex justify-between items-center"><a href={s.profile_url} target="_blank" rel="noreferrer" className="font-semibold text-cyan-700">{s.platform} · {s.username||s.display_name||s.profile_url}</a><button onClick={async()=>{await deletePartnerSocialAccount(s.id);setSocials(await fetchPartnerSocialAccounts())}} className="text-red-500"><Trash2 className="w-4 h-4"/></button></div>)}</div></div>}

      {resourceModal && <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg rounded-2xl bg-white text-slate-900 shadow-2xl">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between"><div><div className="text-xs uppercase font-bold text-amber-700">{resourceModal.type}</div><h2 className="text-xl font-black mt-1">{resourceModal.title}</h2></div><button type="button" onClick={()=>setResourceModal(null)} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100" aria-label="Close">✕</button></div>
          <div className="p-6"><p className="text-sm text-slate-600">{resourceModal.description}</p>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border p-4"><b>1. Discovery</b><p className="mt-1">Confirm scope, goals, deliverables and client requirements before starting.</p></div>
              <div className="rounded-xl border p-4"><b>2. Delivery</b><p className="mt-1">Share progress, keep files organized and follow the agreed delivery timeline.</p></div>
              <div className="rounded-xl border p-4"><b>3. Revisions</b><p className="mt-1">Track requested changes clearly and confirm approval before final handover.</p></div>
              <div className="rounded-xl border p-4"><b>4. Handover</b><p className="mt-1">Deliver final files, credentials or documentation securely and close the project.</p></div>
            </div>
            <button type="button" onClick={()=>window.print()} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Print checklist</button>
          </div>
        </div>
      </div>}

      {view==='business-email' && <div className="bg-white rounded-2xl border p-6 max-w-3xl"><Mail className="w-10 h-10 text-amber-500"/><h2 className="font-bold text-xl mt-3">DSH Business Email</h2><p className="text-sm text-slate-500 mt-2">Your professional DSH mailbox is managed by DSH. Once provisioned, use it for client communication and professional identity.</p><div className="mt-6 rounded-2xl bg-slate-950 text-white p-6"><div className="text-xs uppercase text-slate-400">Mailbox status</div><div className="text-2xl font-black mt-2">{businessEmail?.email_address||'Not provisioned yet'}</div><div className="text-sm text-slate-400 mt-2">{businessEmail?.status||'Pending DSH setup'}</div>{businessEmail?.mailbox_provider&&<div className="text-xs text-slate-500 mt-1">Provider: {businessEmail.mailbox_provider}</div>}</div><div className="flex gap-3 mt-4"><button onClick={requestEmail} disabled={saving} className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950">Request Business Email</button>{businessEmail&&<button type="button" onClick={()=>requestDeletion('business_email')} className="rounded-xl border border-red-200 text-red-600 px-4 py-2 font-bold flex items-center gap-2"><Trash2 className="w-4 h-4"/>Request deletion</button>}<button onClick={()=>requestChangeFor('business_email')} className="rounded-xl border px-4 py-2 font-bold">Request Change</button></div><p className="text-xs text-slate-500 mt-4">Mailbox credentials are never shown inside this portal.</p></div>}
    </main>
  </div>;
};

export default PartnerPortal;
