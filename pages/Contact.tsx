
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import SEO from '../components/SEO';
import { ADMIN_WHATSAPP } from '../utils/notifications';
import { Phone, User, Globe, Mail, MapPin } from 'lucide-react';
import { submitApplication } from '../utils/api';

const Contact: React.FC = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = paramLang === Language.URDU ? Language.URDU : Language.ENGLISH;
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: 'Consultation', details: '' });
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitState === 'loading') return;

    setSubmitState('loading');
    try {
      await submitApplication({
        applicationType: 'consult',
        name: form.name,
        email: form.email,
        phone: form.phone,
        category: form.category,
        details: form.details,
      });
      setSubmitState('success');
      setForm({ name: '', email: '', phone: '', category: 'Consultation', details: '' });
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-950">
      <SEO 
        title={`${TRANSLATIONS.contact[lang]} | Digital Solutions Hub`} 
        description="Contact our CEO and Support Team." 
        lang={lang} 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{TRANSLATIONS.contact[lang]}</h1>
          <div className="h-1 w-20 bg-brand-neon mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Direct Contact Card */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-2xl font-bold text-white mb-8 relative z-10">{lang === Language.ENGLISH ? 'Direct Support' : 'Ø¨Ø±Ø§Û Ø±Ø§Ø³Øª Ø±Ø§Ø¨Ø·Û'}</h2>
              
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                       <Phone className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm text-gray-400">WhatsApp / Phone</p>
                       <a href={`https://wa.me/${ADMIN_WHATSAPP}`} className="text-xl font-bold text-white hover:text-green-400 transition-colors" target="_blank" rel="noopener noreferrer">
                          +1 917 695 7737
                       </a>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-neon/20 flex items-center justify-center text-brand-neon">
                       <User className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm text-gray-400">CEO</p>
                       <p className="text-xl font-bold text-white">Sarkar Azeem</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                       <Globe className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm text-gray-400">Website</p>
                       <p className="text-xl font-bold text-white">Digital Solutions Hub</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* General Info Card */}
           <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8">{lang === Language.ENGLISH ? 'Other Inquiries' : 'Ø¯ÛŒÚ¯Ø± Ù…Ø¹Ù„ÙˆÙ…Ø§Øª'}</h2>
              
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400">
                       <Mail className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm text-gray-400">Email</p>
                       <p className="text-lg text-white">support@digitalsolhub.com</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gray-400">
                       <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm text-gray-400">Location</p>
                       <p className="text-lg text-white">Islamabad, Pakistan</p>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                 <p className="text-gray-400 text-sm">
                    {lang === Language.ENGLISH ? 'Office Hours: Mon-Sat, 9am - 6pm' : 'Ø¯ÙØªØ±ÛŒ Ø§ÙˆÙ‚Ø§Øª: Ù¾ÛŒØ± ØªØ§ ÛÙØªÛØŒ ØµØ¨Ø­ 9 Ø³Û’ Ø´Ø§Ù… 6 Ø¨Ø¬Û’ ØªÚ©'}
                 </p>
              </div>
           </div>

        </div>

        <div className="mt-10 bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Send a Project or Consultation Request</h2>
          <p className="text-gray-400 text-sm mb-6">Use this form for services, admissions, partnerships, or support. It goes directly into the DSH inquiry queue.</p>

          {submitState === 'success' ? (
            <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-5 text-green-300">
              Request received. Our team will contact you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone / WhatsApp</label>
                  <input required type="tel" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Inquiry Type</label>
                  <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    <option>Consultation</option>
                    <option>Website Development</option>
                    <option>SEO / Marketing</option>
                    <option>Academy Admission</option>
                    <option>Franchise / Partnership</option>
                    <option>Support</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                <textarea required value={form.details} onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))} className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none" />
              </div>
              {submitState === 'error' && <p className="text-sm text-red-300">Request could not be submitted. Please try again or use WhatsApp.</p>}
              <button type="submit" disabled={submitState === 'loading'} className="w-full md:w-auto px-8 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-60 transition-colors">
                {submitState === 'loading' ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
