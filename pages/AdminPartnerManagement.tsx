import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Users, Wallet, RefreshCw, XCircle } from 'lucide-react';
import SEO from '../components/SEO';
import {
  fetchAdminPartnerApplications, updateAdminPartnerApplication,
  approveAdminPartnerApplication, fetchAdminPartners, fetchAdminCommissions
} from '../utils/api';

const AdminPartnerManagement: React.FC = () => {
  const [tab,setTab]=useState<'applications'|'partners'|'commissions'>('applications');
  const [applications,setApplications]=useState<any>({data:[]});
  const [partners,setPartners]=useState<any>({data:[]});
  const [commissions,setCommissions]=useState<any>({data:[]});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<number|string|null>(null);
  const [message,setMessage]=useState('');

  const load=async()=>{
    setLoading(true);
    try{
      const [a,p,c]=await Promise.all([fetchAdminPartnerApplications(),fetchAdminPartners(),fetchAdminCommissions()]);
      setApplications(a);setPartners(p);setCommissions(c);
    }catch(e:any){setMessage(e?.message||'Unable to load partner management.')}
    finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);

  const approve=async(id:any)=>{
    setBusy(id);setMessage('');
    try{await approveAdminPartnerApplication(id);setMessage('Partner application approved and partner account created.');await load();}
    catch(e:any){setMessage(e?.message||'Approval failed.')}
    finally{setBusy(null)}
  };

  const setStatus=async(id:any,status:string)=>{
    setBusy(id);setMessage('');
    try{await updateAdminPartnerApplication(id,{status});await load();}
    catch(e:any){setMessage(e?.message||'Unable to update application.')}
    finally{setBusy(null)}
  };

  if(loading)return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading partner management...</div>;

  return <div className="min-h-screen bg-slate-100 text-slate-900 p-5 md:p-8">
    <SEO title="DSH Partner Management" description="Review and manage DSH partner applications, partners and commissions."/>
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div><div className="text-xs uppercase tracking-widest text-amber-600 font-black">Digital Solutions Hub</div><h1 className="text-3xl font-black mt-1">Partner Management</h1><p className="text-slate-500 mt-2">Review applicants, approve partners and monitor the commission ecosystem.</p></div>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-white border font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Refresh</button>
      </div>
      {message&&<div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">{message}</div>}
      <div className="grid grid-cols-3 gap-2 bg-white border rounded-2xl p-2 mb-6">
        <button onClick={()=>setTab('applications')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='applications'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Applications ({applications.total||0})</button>
        <button onClick={()=>setTab('partners')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='partners'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Partners ({partners.total||0})</button>
        <button onClick={()=>setTab('commissions')} className={'rounded-xl px-4 py-3 font-bold '+(tab==='commissions'?'bg-slate-950 text-white':'hover:bg-slate-100')}>Commissions ({commissions.total||0})</button>
      </div>

      {tab==='applications'&&<div className="space-y-4">
        {(applications.data||[]).length===0?<div className="bg-white rounded-2xl border p-10 text-center text-slate-500">No partner applications yet.</div>:
        applications.data.map((a:any)=><div key={a.id} className="bg-white rounded-2xl border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3"><h2 className="text-xl font-black">{a.full_name}</h2><span className="text-xs px-2 py-1 rounded-full bg-slate-100 font-bold">{a.status}</span></div>
              <p className="text-sm text-slate-500 mt-1">{a.email} {a.phone&&'· '+a.phone} {a.city&&'· '+a.city+', '+a.country}</p>
              <p className="mt-4 text-sm whitespace-pre-line">{a.bio||'No bio provided.'}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">{a.experience_years!=null&&<span className="px-2 py-1 bg-slate-100 rounded">Experience: {a.experience_years} years</span>}<span className="px-2 py-1 bg-slate-100 rounded">Availability: {a.availability||'Not specified'}</span>{(a.skills||[]).map((s:any)=><span key={s.id} className="px-2 py-1 bg-amber-50 rounded">{s.skill?.name||s.skill_name||'Skill'}</span>)}</div>
            </div>
            <div className="flex flex-wrap gap-2 lg:w-64">
              <button disabled={busy===a.id||a.status==='approved'} onClick={()=>approve(a.id)} className="flex-1 min-w-[130px] px-4 py-2 rounded-xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 className="w-4 h-4"/>{busy===a.id?'Working...':'Approve'}</button>
              {a.status!=='rejected'&&a.status!=='approved'&&<button disabled={busy===a.id} onClick={()=>setStatus(a.id,'screening')} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"><Clock3 className="w-4 h-4 inline mr-1"/>Screening</button>}
              {a.status!=='rejected'&&a.status!=='approved'&&<button disabled={busy===a.id} onClick={()=>setStatus(a.id,'rejected')} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold"><XCircle className="w-4 h-4 inline mr-1"/>Reject</button>}
            </div>
          </div>
        </div>)}
      </div>}

      {tab==='partners'&&<div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b font-bold flex items-center gap-2"><Users className="w-5 h-5"/>Approved DSH Partners</div>
        <div className="divide-y">{(partners.data||[]).map((p:any)=><div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><b>{p.display_name}</b><p className="text-sm text-slate-500">{p.partner_code} · {p.city||'Location not set'} · {p.user?.email}</p></div><div className="text-sm"><span className="font-bold text-green-600">{p.status}</span> · {p.verification_status}</div></div>)}</div>
      </div>}

      {tab==='commissions'&&<div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b font-bold flex items-center gap-2"><Wallet className="w-5 h-5"/>Commission Ledger</div>
        <div className="divide-y">{(commissions.data||[]).map((c:any)=><div key={c.id} className="p-5 grid md:grid-cols-5 gap-3 text-sm"><span>Order #{c.order_id}</span><span>Partner: {c.partner?.display_name||c.partner_id}</span><span>Gross: {c.currency} {c.gross_amount}</span><span>Partner: {c.currency} {c.partner_amount}</span><b>{c.status}</b></div>)}</div>
      </div>}
    </div>
  </div>;
};

export default AdminPartnerManagement;
