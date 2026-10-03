
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Language } from '../types';
import SEO from '../components/SEO';
import { TRANSLATIONS } from '../constants';
import { Search, Briefcase, Code, PenTool, Globe, X, CheckCircle, ArrowRight } from 'lucide-react';
import { fetchPublicModuleItems, submitApplication } from '../utils/api';

const Marketplace: React.FC = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [adminGigs, setAdminGigs] = useState<any[]>([]);
  const [gigsLoading, setGigsLoading] = useState(true);
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', details: '' });
  const [inquiryState, setInquiryState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const baseCategories = [
    { name: 'Web Development', icon: Code },
    { name: 'App Development', icon: Code },
    { name: 'Digital Marketing', icon: Globe },
    { name: 'SEO Services', icon: Globe },
    { name: 'Social Media Marketing', icon: Globe },
    { name: 'Graphic Design & Branding', icon: PenTool },
    { name: 'Content Creation', icon: Briefcase },
    { name: 'AI Automation', icon: Code },
    { name: 'E-Commerce Solutions', icon: Briefcase },
    { name: 'UI/UX Design', icon: PenTool },
    { name: 'Data Entry', icon: Briefcase },
  ];
  const standardCategoryNames = baseCategories.map((category) => category.name.toLowerCase());
  const customCategories = Array.from(new Set(adminGigs.map((gig) => String(gig.category || '').trim()).filter((name) => name && !standardCategoryNames.includes(name.toLowerCase()) && name.toLowerCase() !== 'other')))
    .map((name) => ({ name, icon: Briefcase }));
  const categories = [...baseCategories, ...customCategories];

  useEffect(() => {
    fetchPublicModuleItems('marketplace')
      .then((items) => setAdminGigs(items.map((item) => ({
        id: item.id,
        title: item.payload.title,
        category: item.payload.category || item.payload.type || '',
        author: item.payload.owner || item.payload.group || 'Digital Solutions Hub',
        price: item.payload.amount ? String(item.payload.amount) : '',
        image: item.payload.image || '',
        desc: item.payload.details || 'Contact Digital Solutions Hub to discuss the service scope.',
      }))))
      .catch(() => setAdminGigs([]))
      .finally(() => setGigsLoading(false));
  }, []);

  const gigs = useMemo(() => {
    const source = adminGigs;
    const needle = query.trim().toLowerCase();
    return source.filter((gig) => {
      const matchesSearch = !needle || `${gig.title} ${gig.author} ${gig.desc} ${gig.category}`.toLowerCase().includes(needle);
      const matchesCategory = !selectedCategory || String(gig.category).trim().toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [adminGigs, query, selectedCategory]);

  const submitInquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedGig || inquiryState === 'loading') return;

    setInquiryState('loading');
    try {
      await submitApplication({
        applicationType: 'marketplace',
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        category: selectedGig.title,
        budget: selectedGig.price,
        details: [
          `Marketplace gig: ${selectedGig.title}`,
          `Seller: ${selectedGig.author}`,
          inquiryForm.details ? `Buyer note: ${inquiryForm.details}` : '',
        ].filter(Boolean).join('\n'),
      });
      setInquiryState('success');
      setInquiryForm({ name: '', email: '', phone: '', details: '' });
      setTimeout(() => {
        setSelectedGig(null);
        setInquiryState('idle');
      }, 1800);
    } catch {
      setInquiryState('error');
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-950 font-sans text-white">
      <SEO title={`${TRANSLATIONS.marketplace[lang]} | DSH`} description="Hire top talent." lang={lang} />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
           <h1 className="text-4xl font-bold mb-4">{TRANSLATIONS.find_talent[lang]}</h1>
           <p className="text-gray-400 mb-8">Hire expert freelancers for your next project.</p>
           
           <div className="max-w-2xl mx-auto relative">
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder={TRANSLATIONS.search[lang]} className="w-full bg-slate-900 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white focus:outline-none focus:border-green-500 transition-colors" />
              <button className="absolute right-2 top-2 p-2 bg-green-500 rounded-full text-black hover:bg-green-400 rtl:right-auto rtl:left-2">
                 <Search className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
           {categories.map((cat, i) => (
              <button type="button" key={i} onClick={() => setSelectedCategory((current) => current === cat.name ? '' : cat.name)} className={`bg-slate-900/50 p-6 rounded-xl border transition-all cursor-pointer text-center group ${selectedCategory === cat.name ? 'border-green-400 bg-green-500/10' : 'border-white/5 hover:border-green-500/50'}`}>
                 <cat.icon className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:text-green-400" />
                 <h3 className="font-bold text-white">{cat.name}</h3>
                 <p className="text-xs text-gray-500">{adminGigs.filter((gig) => String(gig.category).trim().toLowerCase().includes(cat.name.toLowerCase())).length} Gigs</p>
              </button>
           ))}
        </div>

        {/* Gigs */}
        <h2 className="text-2xl font-bold mb-8">{TRANSLATIONS.popular_gigs[lang]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {gigs.map((gig) => (
              <div 
                key={gig.id} 
                onClick={() => setSelectedGig(gig)}
                className="bg-slate-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all group cursor-pointer"
              >
                 <div className="h-48 overflow-hidden relative bg-slate-800 flex items-center justify-center">
                    {gig.image ? <img src={gig.image} alt={gig.title} width="400" height="256" loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <Briefcase className="w-12 h-12 text-slate-600" aria-hidden="true" />}
                 </div>
                 <div className="p-4">
                    {gig.category && <span className="inline-block mb-2 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300">{gig.category}</span>}
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-white line-clamp-2 hover:underline">{gig.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                       <span className="text-sm text-gray-400">{gig.author}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                       <div className="text-green-400 font-bold ml-auto">
                          {gig.price ? <>{TRANSLATIONS.starting_at[lang]} <span className="text-lg">{gig.price}</span></> : <span className="text-sm">Custom quote</span>}
                       </div>
                    </div>
                 </div>
              </div>
           ))}
           {!gigsLoading && gigs.length === 0 && <p className="col-span-full py-12 text-center text-gray-400">{query.trim() ? 'No services match your search.' : 'No services are currently listed. Please check back soon.'}</p>}
           {gigsLoading && <p className="col-span-full py-12 text-center text-gray-400">Loading available services...</p>}
        </div>
      </div>

      {/* Gig Modal */}
      {selectedGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
              <div className="relative h-64 bg-slate-800 flex items-center justify-center">
                 {selectedGig.image ? <img src={selectedGig.image} alt={selectedGig.title} width="800" height="320" loading="eager" decoding="async" className="w-full h-full object-cover" /> : <Briefcase className="w-16 h-16 text-slate-600" aria-hidden="true" />}
                 <button onClick={() => setSelectedGig(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 text-white z-10 rtl:right-auto rtl:left-4">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-8">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{selectedGig.title}</h2>
                        <p className="text-green-400 font-medium">{selectedGig.author}</p>
                    </div>
                    <div className="text-2xl font-bold text-white">{selectedGig.price || 'Custom quote'}</div>
                 </div>
                 
                 <p className="text-gray-300 mb-8 leading-relaxed">
                    {selectedGig.desc}
                 </p>

                 {inquiryState === 'success' ? (
                    <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-green-300 flex items-center gap-3">
                       <CheckCircle className="w-5 h-5" />
                       Inquiry sent. Our team will contact you shortly.
                    </div>
                 ) : (
                    <form onSubmit={submitInquiry} className="space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input required value={inquiryForm.name} onChange={(e) => setInquiryForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" />
                          <input required type="tel" value={inquiryForm.phone} onChange={(e) => setInquiryForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone / WhatsApp" className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" />
                       </div>
                       <input required type="email" value={inquiryForm.email} onChange={(e) => setInquiryForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email address" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" />
                       <textarea value={inquiryForm.details} onChange={(e) => setInquiryForm((prev) => ({ ...prev, details: e.target.value }))} placeholder="Project details, timeline, or questions..." className="w-full h-24 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 resize-none" />
                       {inquiryState === 'error' && <p className="text-sm text-red-300">Inquiry could not be submitted. Please try again.</p>}
                       <button disabled={inquiryState === 'loading'} type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                          {inquiryState === 'loading' ? 'Sending...' : 'Request This Service'} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                       </button>
                    </form>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
