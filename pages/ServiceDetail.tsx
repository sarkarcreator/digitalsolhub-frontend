
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../constants';
import { fetchPublicModuleItems } from '../utils/api';
import { Language } from '../types';
import SEO from '../components/SEO';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Clock, HelpCircle, Send, Star, Zap } from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const { lang: paramLang, id } = useParams<{ lang: string; id: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [dbService, setDbService] = React.useState<any | null>(null);
  const [loadingService, setLoadingService] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    setLoadingService(true);
    fetchPublicModuleItems('service-catalog')
      .then((items) => {
        if (!active) return;
        const match = items.find((item) => String(item.id) === String(id) || String(item.payload?.slug || item.payload?.category) === String(id));
        setDbService(match || null);
      })
      .catch(() => {
        if (active) setDbService(null);
      })
      .finally(() => {
        if (active) setLoadingService(false);
      });
    return () => { active = false; };
  }, [id]);

  const service = dbService ? {
    id: String(dbService.id),
    title: {
      [Language.ENGLISH]: dbService.payload?.title || 'Service',
      [Language.URDU]: dbService.payload?.title || 'سروس',
      [Language.ARABIC]: dbService.payload?.title || 'خدمة',
      [Language.RUSSIAN]: dbService.payload?.title || 'Услуга',
    },
    details: {
      tagline: {
        [Language.ENGLISH]: 'Digital Solutions Hub Service',
        [Language.URDU]: 'ڈیجیٹل سلوشنز ہب سروس',
        [Language.ARABIC]: 'خدمة ديجيتال سوليوشنز هب',
        [Language.RUSSIAN]: 'Сервис Digital Solutions Hub',
      },
      metaDesc: {
        [Language.ENGLISH]: dbService.payload?.details || '',
        [Language.URDU]: dbService.payload?.details || '',
        [Language.ARABIC]: dbService.payload?.details || '',
        [Language.RUSSIAN]: dbService.payload?.details || '',
      },
      benefits: [],
      process: [],
      faqs: [],
    },
    image: dbService.payload?.image || null,
  } : null;

  const profile = dbService ? (() => {
    const key = String(dbService.payload?.slug || dbService.payload?.category || id).toLowerCase();
    const profiles: Record<string, any> = {
      'web-development': { tagline: 'Build a digital foundation your business can grow on.', benefits: ['Professional business websites built around your goals.','Responsive experiences designed for desktop and mobile.','Performance, structure and usability considered from the start.'], process: ['Understand your business and website goals.','Plan the structure, pages and required functionality.','Build, test and refine the website.','Launch and support the finished solution.'], faqs: [['Can you build a custom website?', 'Yes. The website can be planned around your business, audience and required features.'],['Will it work on mobile devices?', 'Yes. Responsive layouts are part of the development approach.']] },
      'app-development': { tagline: 'Turn your idea into an app people can actually use.', benefits: ['Custom web or mobile applications for real business needs.','Customer portals, dashboards and workflow tools.','Scalable foundations that can evolve with your business.'], process: ['Define the app idea, users and workflows.','Design the experience and technical structure.','Develop and test the application.','Launch, monitor and improve.'], faqs: [['Can you develop a business app?', 'Yes. We can plan applications around specific business workflows and customer needs.'],['Can an existing system be connected?', 'Where the required APIs and access are available, integrations can be planned as part of the project.']] },
      'digital-marketing': { tagline: 'Turn digital attention into meaningful business opportunities.', benefits: ['Campaign strategy based on your goals and audience.','Lead-generation and conversion-focused planning.','Clear digital activities aligned with your brand.'], process: ['Understand your offer and target audience.','Create a practical marketing roadmap.','Launch campaigns and content activities.','Review performance and optimize.'], faqs: [['Is digital marketing only about paid ads?', 'No. It can combine strategy, content, social, SEO and paid campaigns depending on the goal.'],['Can you work with an existing brand?', 'Yes. Existing positioning and assets can be incorporated into the strategy.']] },
      'seo-services': { tagline: 'Help the right customers discover your business in search.', benefits: ['Technical and on-page SEO improvements.','Keyword and content direction based on your market.','Search visibility work focused on sustainable growth.'], process: ['Audit the current website and search presence.','Identify opportunities and priorities.','Implement and optimize SEO improvements.','Monitor visibility and refine the strategy.'], faqs: [['How long does SEO take?', 'SEO is an ongoing process; timelines depend on the website, competition and starting position.'],['Do you guarantee a specific Google position?', 'No responsible SEO service can guarantee a specific ranking. The focus is on improving technical quality, relevance and visibility.']] },
      'social-media-marketing': { tagline: 'Build a social presence that earns attention and trust.', benefits: ['Platform-focused social media planning.','Content calendars and creative direction.','Audience-focused campaigns and engagement strategy.'], process: ['Review your brand and audience.','Plan content themes and platform activities.','Create, publish and manage content.','Review results and improve the plan.'], faqs: [['Which platforms can you manage?', 'The right platforms are selected around your audience and business goals.'],['Can you create the content too?', 'Yes. Social media management can include content planning and creative production.']] },
      'graphic-design-branding': { tagline: 'Make your business recognizable before you say a word.', benefits: ['Professional logo and visual identity development.','Marketing and social media creative design.','Consistent visual direction across digital touchpoints.'], process: ['Understand your brand and audience.','Develop visual directions and concepts.','Refine the selected direction.','Prepare usable final assets.'], faqs: [['Can you redesign an existing brand?', 'Yes. A refresh or complete identity redesign can be planned according to the project scope.'],['Do you provide digital marketing creatives?', 'Yes. Creative assets can be prepared for websites, social media and campaigns.']] },
      'content-creation': { tagline: 'Turn your ideas into content people want to read, watch and share.', benefits: ['Content planning around your business goals.','Creative copy and digital content production.','Brand storytelling designed for your audience.'], process: ['Define audience, message and content goals.','Create themes and a content plan.','Produce and review content.','Publish and learn from audience response.'], faqs: [['Can content be created for social media?', 'Yes. Content can be structured for the platforms and audience you target.'],['Can you follow an existing brand voice?', 'Yes. Existing guidelines and preferred communication style can be incorporated.']] },
      'ai-automation': { tagline: 'Automate repetitive work so your business can focus on what matters.', benefits: ['AI agents and business assistants.','Automated workflows for repetitive tasks.','Lead, support and operational automation opportunities.'], process: ['Identify repetitive work and business bottlenecks.','Select practical AI and automation opportunities.','Build and connect the workflow.','Test, monitor and improve the automation.'], faqs: [['What can AI automation handle?', 'Potential use cases include lead handling, customer support, repetitive workflows and internal assistance.'],['Will automation replace my team?', 'The goal is generally to reduce repetitive work and help people focus on higher-value tasks.']] },
      'ecommerce-solutions': { tagline: 'Build an online store designed to sell, manage and grow.', benefits: ['Shopify, WooCommerce or custom e-commerce solutions.','Product, order and payment workflow planning.','Customer-friendly shopping experiences.'], process: ['Understand products, customers and sales workflow.','Plan store structure and purchasing journey.','Build, configure and test the store.','Launch and optimize the shopping experience.'], faqs: [['Can you build a Shopify store?', 'Yes. Shopify is one of the e-commerce platforms that can be used depending on the project requirements.'],['Can existing products be migrated?', 'Migration can be planned when the source data is available in a usable format.']] },
      'ui-ux-design': { tagline: 'Design digital experiences that feel simple, modern and effortless.', benefits: ['User journeys and interface planning.','Modern website and app UI design.','Design systems that keep experiences consistent.'], process: ['Understand users, goals and product requirements.','Map journeys and information structure.','Design key screens and interactions.','Refine the experience for implementation.'], faqs: [['Do you design both websites and apps?', 'Yes. UI/UX work can cover websites, web applications and mobile applications.'],['Can you redesign an existing interface?', 'Yes. Existing usability and visual issues can be reviewed before redesigning the experience.']] }
    };
    return profiles[key] || { tagline: 'Professional digital solutions built around your business goals.', benefits: String(dbService.payload?.details || '').split(/\n+/).filter(Boolean).slice(0,4), process: ['Understand your requirements.','Plan the right solution.','Build and review the result.','Launch and improve.'], faqs: [['How do we start?', 'Tell us about your goals and requirements and our team can discuss the right approach with you.']] };
  })() : null;

  if (loadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-gray-400"><Clock className="w-5 h-5 animate-spin" /> Loading service...</div>
      </div>
    );
  }

  if (!service || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h2 className="text-3xl font-bold mb-4">{lang === Language.ENGLISH ? 'Service Not Found' : 'سروس نہیں ملی'}</h2>
        <Link to={`/${lang}/services`} className="px-6 py-2 bg-brand-neon text-black rounded font-bold hover:bg-cyan-400">
          {TRANSLATIONS.back_services[lang]}
        </Link>
      </div>
    );
  }

  const serviceTitle = service.title[lang] || service.title[Language.ENGLISH];
  const description = service.details.metaDesc[lang] || service.details.metaDesc[Language.ENGLISH];
  const tagline = profile.tagline;

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceTitle,
    "provider": {
      "@type": "Organization",
      "name": "Digital Solutions Hub",
      "url": "https://digitalsolhub.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Global"
    },
    "description": description,
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-950 text-white">
      <SEO 
        title={`${serviceTitle} | Digital Solutions Hub`} 
        description={description || ''} 
        lang={lang} 
        schema={serviceSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
           <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {TRANSLATIONS.back_services[lang]}
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-white/10 mb-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon/5 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="relative z-10">
              {(service as any).image && <img src={(service as any).image} alt={serviceTitle} className="mb-8 h-56 w-full max-w-3xl rounded-2xl object-cover border border-white/10" />}
              <span className="inline-block px-3 py-1 rounded-full bg-brand-neon/10 text-brand-neon text-sm font-bold mb-4 border border-brand-neon/20">
                 {tagline}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">{serviceTitle}</h1>
              <p className="text-xl text-gray-400 max-w-2xl">{description}</p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                 <Link to={`/${lang}/contact`} className="px-8 py-3 bg-brand-neon text-black font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
                    {TRANSLATIONS.get_consult[lang]}
                 </Link>
                 <button onClick={() => document.getElementById('benefits')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-3 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all">
                    {TRANSLATIONS.view_details[lang]}
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-12">
              
              {/* Benefits */}
              <section id="benefits">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-brand-neon" /> {TRANSLATIONS.key_benefits[lang]}
                 </h2>
                 <div className="grid gap-4">
                    {profile.benefits.map((benefit: any, i: number) => (
                       <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                          <div className="mt-1">
                             <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                             <h3 className="font-bold text-lg text-white mb-1">{typeof benefit === 'string' ? benefit : benefit.title?.[lang]}</h3>
                             {typeof benefit !== 'string' && <p className="text-gray-400 text-sm">{benefit.desc?.[lang]}</p>}
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

              {/* Process */}
              <section>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-brand-neon" /> {TRANSLATIONS.our_process[lang]}
                 </h2>
                 <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pl-8 py-2">
                    {profile.process.map((step: any, i: number) => (
                       <div key={i} className="relative">
                          <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-brand-neon flex items-center justify-center text-xs font-bold text-white">
                             {i + 1}
                          </div>
                          <h3 className="font-bold text-lg text-white mb-2">{typeof step === 'string' ? step : step.title?.[lang]}</h3>
                          {typeof step !== 'string' && <p className="text-gray-400">{step.desc?.[lang]}</p>}
                       </div>
                    ))}
                 </div>
              </section>

              {/* FAQs */}
              <section>
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-brand-neon" /> {TRANSLATIONS.freq_asked[lang]}
                 </h2>
                 <div className="space-y-4">
                    {profile.faqs.map((faq: any, i: number) => (
                       <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/30">
                          <button 
                             onClick={() => setOpenFaq(openFaq === i ? null : i)}
                             className="w-full flex items-center justify-between p-4 text-left font-bold text-white hover:bg-white/5 transition-colors"
                          >
                             {Array.isArray(faq) ? faq[0] : faq.question?.[lang]}
                             {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                          </button>
                          {openFaq === i && (
                             <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 mt-2">
                                {Array.isArray(faq) ? faq[1] : faq.answer?.[lang]}
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
              </section>

           </div>

           {/* Sidebar */}
           <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                 
                 <div className="bg-gradient-to-br from-brand-blue to-purple-900 rounded-2xl p-6 shadow-xl border border-white/10 text-center">
                    <Zap className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">{TRANSLATIONS.ready_start[lang]}</h3>
                    <p className="text-white/80 mb-6 text-sm">Transform your business with our expert solutions today.</p>
                    <Link to={`/${lang}/contact`} className="block w-full py-3 bg-white text-brand-blue font-bold rounded-xl hover:bg-gray-100 transition-colors">
                       {TRANSLATIONS.book_consult[lang]}
                    </Link>
                 </div>

                 <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
                    <h4 className="font-bold text-white mb-4">Why Choose Us?</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-neon" /> Expert Team</li>
                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-neon" /> 24/7 Support</li>
                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-neon" /> Proven Results</li>
                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-neon" /> Global Standards</li>
                    </ul>
                 </div>

              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
