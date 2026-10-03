import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TRANSLATIONS, SERVICE_CATEGORIES, PRICING_PACKAGES, PAYMENT_METHODS, PAYMENT_TERMS } from '../constants';
import { Language } from '../types';
import SEO from '../components/SEO';
import { fetchPublicModuleItems, submitApplication } from '../utils/api';
import { ArrowRight, Check, Send, Sparkles, Monitor, Globe, Megaphone, Video, Cpu, Layers, DollarSign, Coins, Loader2, Landmark, Smartphone, CreditCard, Bitcoin, AlertTriangle, FileText, ShoppingCart, Palette } from 'lucide-react';

const Services: React.FC = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  
  const [formVisible, setFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminServices, setAdminServices] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    budget: '$100 - $500',
    details: ''
  });

  // Pricing States
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'onetime'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');

  useEffect(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone.includes('Karachi') || timeZone.includes('Islamabad') || timeZone.includes('Pakistan')) {
        setCurrency('PKR');
      }
    } catch (e) {
      console.log('Timezone detection failed, defaulting to USD');
    }
  }, []);

  useEffect(() => {
    fetchPublicModuleItems('service-catalog')
      .then((items) => setAdminServices(items))
      .catch(() => setAdminServices([]));
  }, []);

  // Icon mapping
  const icons: { [key: string]: any } = {
    'web-dev': Monitor,
    'seo': Globe,
    'marketing': Megaphone,
    'social': Video, // Changed to video for social monetization
    'monetization': Coins,
    'graphic-design': Layers,
    'ai-solutions': Cpu,
    'content-creation': FileText,
    'ecommerce-solutions': ShoppingCart,
    'ui-ux-design': Palette,
    'other': Sparkles
  };

  const paymentIcons: { [key: string]: any } = {
    'Landmark': Landmark,
    'Smartphone': Smartphone,
    'CreditCard': CreditCard,
    'Globe': Globe,
    'Bitcoin': Bitcoin
  };

  const serviceProfiles: Record<string, { tagline: string; points: string[] }> = {
    'web-development': { tagline: 'Build a digital foundation your business can grow on.', points: ['Business websites & portals', 'Responsive, fast experiences', 'Custom functionality'] },
    'app-development': { tagline: 'Turn your idea into an app people can actually use.', points: ['Web & mobile applications', 'Dashboards & customer portals', 'Scalable architecture'] },
    'digital-marketing': { tagline: 'Turn digital attention into meaningful business opportunities.', points: ['Campaign strategy', 'Lead generation', 'Conversion-focused growth'] },
    'seo-services': { tagline: 'Help the right customers discover your business.', points: ['Technical & on-page SEO', 'Keyword & content strategy', 'Search visibility improvement'] },
    'social-media-marketing': { tagline: 'Build a social presence that earns attention and trust.', points: ['Social media strategy', 'Content planning', 'Audience-focused campaigns'] },
    'graphic-design-branding': { tagline: 'Make your business recognizable before you say a word.', points: ['Logo & brand identity', 'Marketing creatives', 'Consistent visual direction'] },
    'content-creation': { tagline: 'Turn ideas into content people want to watch, read and share.', points: ['Creative content planning', 'Copy & visual content', 'Brand storytelling'] },
    'ai-automation': { tagline: 'Automate repetitive work so your business can focus on growth.', points: ['AI agents & assistants', 'Workflow automation', 'Lead & support automation'] },
    'ecommerce-solutions': { tagline: 'Build an online store designed to sell, manage and grow.', points: ['Shopify & WooCommerce', 'Products, orders & payments', 'Conversion-focused shopping'] },
    'ui-ux-design': { tagline: 'Design digital experiences that feel simple, modern and effortless.', points: ['Website & app UI/UX', 'User journeys', 'Modern design systems'] },
  };

  const handleRequest = (catId: string = '') => {
    if (catId) setSelectedCategory(catId);
    setFormVisible(true);
    setTimeout(() => {
      document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await submitApplication({
        applicationType: 'service',
        name: formData.name,
        email: formData.email,
        phone: formData.whatsapp,
        category: selectedCategory,
        budget: formData.budget,
        details: formData.details,
      });
      setSubmitted(true);
      } catch (err) {
        alert('Unable to submit your request right now. Please try again.');
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-950 overflow-x-hidden">
      <SEO 
        title={`${TRANSLATIONS.services[lang]} | Digital Solutions Hub`} 
        description={TRANSLATIONS.svc_hero_sub[lang]} 
        lang={lang} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <section className="relative text-center py-14 md:py-20 mb-16 md:mb-20 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-neon/10 rounded-full blur-[110px] pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <span className="inline-flex px-4 py-2 rounded-full border border-brand-neon/30 bg-brand-neon/10 text-brand-neon text-xs font-bold uppercase tracking-[0.2em] mb-6">Digital Solutions Hub</span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">Your Vision. Our Technology.<br /><span className="text-brand-neon">Built to Grow.</span></h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">We help businesses build digital products, reach the right audience, automate repetitive work and create a stronger online presence.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8"><button onClick={() => handleRequest()} className="px-7 py-3.5 bg-brand-neon text-black font-bold rounded-xl hover:bg-cyan-400 transition-all">Start Your Project <ArrowRight className="inline w-4 h-4 ml-2" /></button><Link to={'/' + lang + '/contact'} className="px-7 py-3.5 border border-white/15 text-white font-bold rounded-xl hover:bg-white/5 transition-all">Talk to Our Team</Link></div>
          </div>
        </section>
        <section className="mb-10"><p className="text-brand-neon font-bold uppercase tracking-widest text-sm mb-3">What We Do</p><h2 className="text-3xl md:text-5xl font-black text-white mb-4">Everything you need to move your business forward.</h2><p className="text-gray-400 text-lg max-w-3xl">From your first website to advanced automation, DSH brings technology, creativity and growth together in one place.</p></section>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 relative z-10">
          {adminServices.map((item: any, index: number) => { const id=String(item.id); const slug=String(item.payload?.slug || item.payload?.category || id); const p=serviceProfiles[slug] || {tagline:String(item.payload?.details || 'Professional digital solutions built around your goals.'),points:String(item.payload?.details || '').split(/\n+/).filter(Boolean).slice(0,3)}; const Icon=icons[item.payload?.icon || item.payload?.type || slug] || Sparkles; const title=String(item.payload?.title || 'DSH Service'); const image=item.payload?.image || ''; return <article key={id} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 hover:border-brand-neon/40 transition-all"><div>{image ? <img src={image} alt={title} className="h-48 w-full object-cover" loading={index<3?'eager':'lazy'} decoding="async" /> : <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center"><Icon className="w-16 h-16 text-brand-neon/60" /></div>}</div><div className="p-7"><div className="w-11 h-11 rounded-xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center mb-5"><Icon className="w-5 h-5 text-brand-neon" /></div><Link to={'/' + lang + '/services/' + id}><h3 className="text-2xl font-bold text-white mb-3 hover:text-brand-neon transition-colors">{title}</h3></Link><p className="text-brand-neon/90 font-medium text-sm leading-relaxed mb-5">{p.tagline}</p><ul className="space-y-2.5 mb-7">{p.points.map((point:string,i:number)=><li key={i} className="flex gap-2.5 text-sm text-gray-400"><Check className="w-4 h-4 text-brand-neon shrink-0 mt-0.5" />{point}</li>)}</ul><div className="flex gap-3"><button onClick={()=>handleRequest(id)} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-brand-neon hover:text-black transition-all">{TRANSLATIONS.svc_req_btn[lang]}</button><Link to={'/' + lang + '/services/' + id} className="px-4 py-3 bg-slate-800 rounded-xl text-gray-300 hover:text-white transition-colors"><ArrowRight className="w-5 h-5 rtl:rotate-180" /></Link></div></div></article>; })}
        </div>
        {adminServices.length===0 && <div className="mb-24 rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center"><Sparkles className="w-10 h-10 text-brand-neon mx-auto mb-4" /><h3 className="text-2xl font-bold text-white mb-2">Our services are being updated.</h3><p className="text-gray-400">Please check back shortly or contact our team to discuss your requirements.</p></div>}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-10"><p className="text-brand-neon font-bold uppercase tracking-widest text-sm mb-3">Our Approach</p><h2 className="text-3xl font-black text-white mb-4">Don't just keep up. Build what comes next.</h2><p className="text-gray-400 leading-relaxed mb-6">Your business needs the right digital tools, clear direction and a team that can turn ideas into execution.</p>{['Understand your goals','Build the right solution','Launch with purpose','Improve and scale'].map((x,i)=><div key={x} className="flex items-center gap-4 mb-4"><span className="w-9 h-9 rounded-full bg-brand-neon text-black font-black flex items-center justify-center">{i+1}</span><span className="text-white font-semibold">{x}</span></div>)}</div><div className="rounded-3xl border border-brand-neon/20 bg-brand-neon/5 p-8 md:p-10 flex flex-col justify-center"><Sparkles className="w-10 h-10 text-brand-neon mb-5" /><h2 className="text-3xl font-black text-white mb-4">Your next level can start with one project.</h2><p className="text-gray-300 leading-relaxed mb-7">Start with the challenge in front of you. DSH can help turn it into a practical digital plan and move it toward execution.</p><button onClick={()=>handleRequest()} className="self-start px-7 py-3.5 bg-brand-neon text-black font-bold rounded-xl hover:bg-cyan-400 transition-all">Discuss Your Project <ArrowRight className="inline w-4 h-4 ml-2" /></button></div></section>

        {/* How It Works */}
        <section className="mb-24">
           <h2 className="text-3xl font-bold text-white mb-12 text-center">{TRANSLATIONS.how_it_works[lang]}</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                 { step: "01", title: TRANSLATIONS.hiw_req[lang], icon: Check },
                 { step: "02", title: TRANSLATIONS.hiw_prop[lang], icon: Check },
                 { step: "03", title: TRANSLATIONS.hiw_pay[lang], icon: Check },
                 { step: "04", title: TRANSLATIONS.hiw_deliver[lang], icon: Check },
              ].map((step, i) => (
                 <div key={i} className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-900 border-2 border-brand-neon rounded-full flex items-center justify-center text-xl font-bold text-white mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] z-10">
                       {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                 </div>
              ))}
           </div>
           <div className="text-center mt-12">
              <button onClick={() => handleRequest()} className="px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-neon text-black font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all">
                 {TRANSLATIONS.get_consult[lang]}
              </button>
           </div>
        </section>

        {/* Pricing & Packages Section */}
        <div className="mb-24 relative z-10">
           <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{TRANSLATIONS.pricing_title[lang]}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{TRANSLATIONS.pricing_sub[lang]}</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                 {/* Currency Toggle */}
                 <div className="bg-slate-900 border border-white/10 rounded-lg p-1 flex items-center">
                    <button onClick={() => setCurrency('USD')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currency === 'USD' ? 'bg-brand-blue text-white' : 'text-gray-400 hover:text-white'}`}>USD</button>
                    <button onClick={() => setCurrency('PKR')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currency === 'PKR' ? 'bg-brand-blue text-white' : 'text-gray-400 hover:text-white'}`}>PKR</button>
                 </div>
                 
                 {/* Billing Toggle */}
                 <div className="bg-slate-900 border border-white/10 rounded-lg p-1 flex items-center">
                    <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-brand-neon text-black' : 'text-gray-400 hover:text-white'}`}>{TRANSLATIONS.monthly[lang]}</button>
                    <button onClick={() => setBillingCycle('onetime')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${billingCycle === 'onetime' ? 'bg-brand-neon text-black' : 'text-gray-400 hover:text-white'}`}>{TRANSLATIONS.one_time[lang]}</button>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
              {PRICING_PACKAGES.map((pkg, idx) => {
                 let priceDisplay = '';
                 if (pkg.price === 'custom') {
                    priceDisplay = TRANSLATIONS.custom_price[lang] || 'Custom';
                 } else {
                    const amount = (pkg.price as any)[currency][billingCycle];
                    const symbol = currency === 'USD' ? '$' : 'Rs ';
                    priceDisplay = `${symbol}${amount}`;
                 }

                 return (
                   <div key={pkg.id} className={`relative rounded-2xl p-8 transition-all duration-300 ${pkg.popular ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-brand-neon shadow-[0_0_30px_rgba(0,243,255,0.15)] transform md:-translate-y-4' : 'bg-slate-900/50 border border-white/10 hover:border-brand-blue/50'}`}>
                      {pkg.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-neon text-black text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">{TRANSLATIONS.most_popular[lang]}</div>}
                      <h3 className="text-xl font-bold text-white mb-2">{pkg.name[lang]}</h3>
                      <div className="text-3xl font-bold text-white mb-6">
                         {priceDisplay}
                         {pkg.price !== 'custom' && billingCycle === 'monthly' && <span className="text-base font-normal text-gray-500">/mo</span>}
                      </div>
                      <div className="space-y-4 mb-8">
                         {pkg.features[lang]?.map((feat: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-gray-400">
                               <Check className={`w-5 h-5 shrink-0 ${pkg.popular ? 'text-brand-neon' : 'text-brand-blue'}`} />
                               <span className="text-sm">{feat}</span>
                            </div>
                         ))}
                      </div>
                      <button onClick={() => handleRequest(pkg.id === 'business' ? '' : 'web-dev')} className={`w-full py-3 rounded-xl font-bold transition-all ${pkg.popular ? 'bg-brand-neon text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-white hover:bg-white hover:text-black border border-white/10'}`}>
                         {TRANSLATIONS[pkg.buttonKey as keyof typeof TRANSLATIONS]?.[lang]}
                      </button>
                   </div>
                 );
              })}
           </div>
        </div>

        {/* Request Form Section */}
        <div id="service-form" className={`transition-all duration-700 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-10'}`}>
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
              {submitted ? (
                <div className="text-center py-12 relative z-10">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
                    <Check className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">{TRANSLATIONS.form_success[lang]}</h2>
                  <p className="text-gray-400 text-lg mb-8">{TRANSLATIONS.form_success_msg[lang]}</p>
                  <button onClick={() => { setSubmitted(false); setFormVisible(false); }} className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors">
                     {TRANSLATIONS.home[lang]}
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="text-center mb-10">
                     <h2 className="text-3xl font-bold text-white mb-2">{TRANSLATIONS.svc_quote_btn[lang]}</h2>
                     <p className="text-gray-400">{TRANSLATIONS.svc_expert_btn[lang]}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-400 mb-2">{TRANSLATIONS.form_category[lang]}</label>
                       <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors relative z-10">
                         <option value="">Select a Category</option>
                         {(adminServices.length ? adminServices.map((item) => ({ id: String(item.id), title: { [lang]: item.payload.title } })) : SERVICE_CATEGORIES).map((c: any) => (
                           <option key={c.id} value={c.id}>{c.title[lang]}</option>
                         ))}
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2">{TRANSLATIONS.form_name[lang]}</label>
                       <input name="name" value={formData.name} onChange={handleInputChange} required type="text" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="Enter full name" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2">{TRANSLATIONS.form_email[lang]}</label>
                       <input name="email" value={formData.email} onChange={handleInputChange} required type="email" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="email@example.com" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2">{TRANSLATIONS.form_whatsapp[lang]}</label>
                       <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} required type="tel" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="Enter WhatsApp number" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2">{TRANSLATIONS.form_budget[lang]}</label>
                       <select name="budget" value={formData.budget} onChange={handleInputChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors relative z-10">
                          <option>$100 - $500</option>
                          <option>$500 - $1,000</option>
                          <option>$1,000 - $5,000</option>
                          <option>$5,000+</option>
                       </select>
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-400 mb-2">{TRANSLATIONS.form_details[lang]}</label>
                       <textarea name="details" value={formData.details} onChange={handleInputChange} required rows={4} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-neon transition-colors" placeholder="Tell us about your project..."></textarea>
                     </div>
                     <div className="md:col-span-2">
                       <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-neon text-black font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all flex items-center justify-center gap-2">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{TRANSLATIONS.form_submit[lang]} <Send className="w-5 h-5 rtl:rotate-180" /></>}
                       </button>
                     </div>
                  </form>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Services;
