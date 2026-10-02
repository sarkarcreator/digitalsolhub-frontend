import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Users, Wallet, RefreshCw, XCircle, Trash2, Mail, ShieldCheck, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';
import {
  fetchAdminPartnerApplications, updateAdminPartnerApplication, approveAdminPartnerApplication,
  fetchAdminPartners, fetchAdminCommissions, updateAdminPartnerOnboarding,
  provisionAdminPartnerBusinessEmail, deleteAdminPartner, fetchAdminPartnerChangeRequests,
  reviewAdminPartnerChangeRequest
} from '../utils/api';

const items = [
  ['profile','Profile'],['portfolio','Portfolio'],['services','Services'],['social','Social profile'],
  ['business_email','DSH business email'],['payout_account','Payout account']
];

const AdminPartnerManagement: React.FC = () => {
  const [tab,setTab]=useState<'applications'|'partners'|'changes'|'commissions'>('applications');
  const [applications,setApplications]=useState<any>({data:[]});
  const [partners,setPartners]=useState<any>({data:[]});
  const [commissions,setCommissions]=useState<any>({data:[]});
  const [changes,setChanges]=useState<any>({data:[]});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<string|number|null>(null);
  const [message,setMessage]=useState('');
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [email,setEmail]=useState<Record<string,string>>({});

  const load=async()=>{
    setLoading(true); setMessage('');
    try{
      const [a,p,c,ch]=await Promise.all([
        fetchAdminPartnerApplications(),fetchAdminPartners(),fetchAdminCommissions(),fetchAdminPartnerChangeRequests()
      ]);
      setApplications(a);setPartners(p);setCommissions(c);setChanges(ch);
    }catch(e:any){setMessage(e?.message||'Unable to load partner management.')}
    finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);

  const approve=async(id:any)=>{
    setBusy('app-'+id);setMessage('');
    try{await approveAdminPartnerApplication(id);setMessage('Partner application approved and partner account created.');await load();}
    catch(e:any){setMessage(e?.message||'Approval failed.')} finally{setBusy(null)}
  };

  const setStatus=async(id:any,status:string)=>{
    setBusy('app-'+id);setMessage('');
    try{await updateAdminPartnerApplication(id,{status});await load();}
    catch(e:any){setMessage(e?.message||'Unable to update application.')} finally{setBusy(null)}
  };

  const reviewOnboarding=async(partnerId:any,item:string,status:string)=>{
    const key=partnerId+'-'+item; setBusy(key); setMessage('');
    try{
      await updateAdminPartnerOnboarding(partnerId,item,{status,admin_notes:notes[key]||undefined});
      setMessage('Partner onboarding status updated.'); await load();
    }catch(e:any){setMessage(e?.message||'Unable to update onboarding status.')} finally{setBusy(null)}
  };

  const provisionEmail=async(partner:any)=>{
    const value=email[String(partner.id)] || partner.business_email?.email_address || '';
    if(!value) return setMessage('Enter the partner business email first.');
    setBusy('email-'+partner.id);setMessage('');
    try{
      await provisionAdminPartnerBusinessEmail(partner.id,{email_address:value,mailbox_provider:'Hostinger',status:'active'});
      setMessage('Business email marked active for the partner.'); await load();
    }catch(e:any){setMessage(e?.message||'Unable to provision business email.')} finally{setBusy(null)}
  };

  const removePartner=async(partner:any)=>{
    if(!window.confirm('Delete this partner completely? Their partner profile, wallet, onboarding records and partner-owned data will be removed.')) return;
    setBusy('delete-'+partner.id);setMessage('');
    try{await deleteAdminPartner(partner.id);setMessage('Partner deleted successfully.');await load();}
    catch(e:any){setMessage(e?.message||'Unable to delete partner.')} finally{setBusy(null)}
  };

  const reviewChange=async(id:any,status:'approved'|'rejected')=>{
    setBusy('change-'+id);setMessage('');
    try{await reviewAdminPartnerChangeRequest(id,{status});setMessage('Change request reviewed.');await load();}
    catch(e:any){setMessage(e?.message||'Unable to review change request.')} finally{setBusy(null)}
  };

  if(loading)return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading partner management...</div>;

  return <div className="min-h-screen bg-slate-100 text-slate-900 p-5 md:p-8">
    <SEO title="DSH Partner Management" description="Review and manage DSH partner applications, onboarding approvals, change requests, business email and commissions."/>
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div><div className="text-xs uppercase tracking-widest text-amber-600 font-black">Digital Solutions Hub</div><h1 className="text-3xl font-black mt-1">Partner Management</h1><p className="text-slate-500 mt-2">Control the complete partner lifecycle: approval, onboarding, changes, business email and removal.</p></div>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-white border font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Refresh</button>
      </div>
      {message&&<div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">{message}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white border rounded-2xl p-2 mb-6">
        <button onClick={()=>setTab('applications')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='applications'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Applications ({applications.total||0})</button>
        <button onClick={()=>setTab('partners')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='partners'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Partners ({partners.total||0})</button>
        <button onClick={()=>setTab('changes')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='changes'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Change Requests ({changes.total||0})</button>
        <button onClick={()=>setTab('commissions')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='commissions'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Commissions ({commissions.total||0})</button>
      </div>

      {tab==='applications'&&<div className="space-y-4">
        {(applications.data||[]).length===0?<div className="bg-white rounded-2xl border p-10 text-center text-slate-500">No partner applications yet.</div>:
        applications.data.map((a:any)=><div key={a.id} className="bg-white rounded-2xl border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex-1"><div className="flex items-center gap-3"><h2 className="text-xl font-black">{a.full_name}</h2><span className="text-xs px-2 py-1 rounded-full bg-slate-100 font-bold">{a.status}</span></div>
              <p className="text-sm text-slate-500 mt-1">{a.email} {a.phone&&'· '+a.phone} {a.city&&'· '+a.city+', '+a.country}</p>
              <p className="mt-4 text-sm whitespace-pre-line">{a.bio||'No bio provided.'}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">{a.experience_years!=null&&<span className="px-2 py-1 bg-slate-100 rounded">Experience: {a.experience_years} years</span>}<span className="px-2 py-1 bg-slate-100 rounded">Availability: {a.availability||'Not specified'}</span>{(a.skills||[]).map((s:any)=><span key={s.id} className="px-2 py-1 bg-amber-50 rounded">{s.skill?.name||s.skill_name||'Skill'}</span>)}</div>
            </div>
            <div className="flex flex-wrap gap-2 lg:w-64">
              <button disabled={busy==='app-'+a.id||a.status==='approved'} onClick={()=>approve(a.id)} className="flex-1 min-w-[130px] px-4 py-2 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 className="w-4 h-4"/>{busy==='app-'+a.id?'Working...':'Approve'}</button>
              {a.status!=='rejected'&&a.status!=='approved'&&<button disabled={busy==='app-'+a.id} onClick={()=>setStatus(a.id,'screening')} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"><Clock3 className="w-4 h-4 inline mr-1"/>Screening</button>}
              {a.status!=='rejected'&&a.status!=='approved'&&<button disabled={busy==='app-'+a.id} onClick={()=>setStatus(a.id,'rejected')} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold"><XCircle className="w-4 h-4 inline mr-1"/>Reject</button>}
            </div>
          </div>
        </div>)}
      </div>}

      {tab==='partners'&&<div className="space-y-5">
        {(partners.data||[]).length===0?<div className="bg-white rounded-2xl border p-10 text-center text-slate-500">No active partners.</div>:
        (partners.data||[]).map((p:any)=><div key={p.id} className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-5 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div><div className="flex items-center gap-3"><h2 className="text-xl font-black">{p.display_name}</h2><span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">{p.status}</span><span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{p.verification_status}</span></div><p className="text-sm text-slate-500 mt-1">{p.partner_code} · {p.user?.email}</p></div>
            <button onClick={()=>removePartner(p)} disabled={busy==='delete-'+p.id} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold flex items-center gap-2"><Trash2 className="w-4 h-4"/>{busy==='delete-'+p.id?'Deleting...':'Delete Partner'}</button>
          </div>

          <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(([key,label])=>{const item=p.onboarding?.[key]||{}; const busyKey=p.id+'-'+key; return <div key={key} className="rounded-2xl border p-4 bg-slate-50">
              <div className="flex items-start justify-between gap-3"><div><div className="font-black">{label}</div><div className="text-xs text-slate-500 mt-1">{item.has_data?'Partner has submitted data':'No data submitted yet'}</div></div><span className={'text-xs font-black px-2 py-1 rounded-full '+(item.status==='approved'?'bg-green-100 text-green-700':item.status==='revision_required'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700')}>{String(item.status||'pending').replace('_',' ')}</span></div>
              {item.admin_notes&&<div className="mt-3 text-xs bg-white rounded-xl p-3 border">{item.admin_notes}</div>}
              <textarea value={notes[busyKey]||''} onChange={e=>setNotes({...notes,[busyKey]:e.target.value})} placeholder="Admin note (optional)" className="mt-3 w-full rounded-xl border bg-white p-2 text-sm" rows={2}/>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button onClick={()=>reviewOnboarding(p.id,key,'approved')} className="rounded-lg bg-green-600 text-white py-2 text-xs font-bold">Approve</button>
                <button onClick={()=>reviewOnboarding(p.id,key,'revision_required')} className="rounded-lg bg-amber-500 text-white py-2 text-xs font-bold">Changes</button>
                <button onClick={()=>reviewOnboarding(p.id,key,'rejected')} className="rounded-lg bg-red-600 text-white py-2 text-xs font-bold">Reject</button>
              </div>
            </div>})}
          </div>

          <div className="p-5 border-t bg-slate-50">
            <div className="flex items-center gap-2 font-black mb-3"><Mail className="w-5 h-5"/>Business Email Provisioning</div>
            <div className="flex flex-col md:flex-row gap-2">
              <input value={email[String(p.id)] ?? p.business_email?.email_address ?? ''} onChange={e=>setEmail({...email,[String(p.id)]:e.target.value})} placeholder="partner@digitalsolhub.com" className="flex-1 rounded-xl border bg-white px-4 py-3"/>
              <button onClick={()=>provisionEmail(p)} disabled={busy==='email-'+p.id} className="rounded-xl bg-slate-950 text-white px-5 py-3 font-bold">{busy==='email-'+p.id?'Saving...':'Activate Email'}</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">This records the mailbox, provider, quota/status and makes it visible in the partner portal. Actual mailbox creation remains a Hostinger mailbox operation.</p>
          </div>
        </div>)}
      </div>}

      {tab==='changes'&&<div className="space-y-4">
        {(changes.data||[]).length===0?<div className="bg-white rounded-2xl border p-10 text-center text-slate-500">No partner change requests.</div>:
        (changes.data||[]).map((c:any)=><div key={c.id} className="bg-white rounded-2xl border p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div><div className="font-black text-lg">{c.display_name} <span className="text-xs text-slate-500">({c.partner_code})</span></div><div className="text-xs text-amber-700 font-bold uppercase mt-1">{c.item_type.replace('_',' ')}</div><p className="mt-3 text-sm">{c.message}</p><p className="text-xs text-slate-500 mt-2">{c.email}</p></div>
          <div className="flex gap-2"><button onClick={()=>reviewChange(c.id,'approved')} className="rounded-xl bg-green-600 text-white px-4 py-2 font-bold">Approve Request</button><button onClick={()=>reviewChange(c.id,'rejected')} className="rounded-xl border border-red-200 text-red-600 px-4 py-2 font-bold">Reject</button></div></div>
        </div>)}
      </div>}

      {tab==='commissions'&&<div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b font-bold flex items-center gap-2"><Wallet className="w-5 h-5"/>Commission Ledger</div>
        <div className="divide-y">{(commissions.data||[]).map((c:any)=><div key={c.id} className="p-5 grid md:grid-cols-5 gap-3 text-sm"><span>Order #{c.order_id}</span><span>Partner: {c.partner?.display_name||c.partner_id}</span><span>Gross: {c.currency} {c.gross_amount}</span><span>Partner: {c.currency} {c.partner_amount}</span><b>{c.status}</b></div>)}</div>
      </div>}
    </div>
  </div>;
};

export default AdminPartnerManagement;
