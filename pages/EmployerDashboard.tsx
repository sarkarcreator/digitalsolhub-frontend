import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language } from '../types';
import SEO from '../components/SEO';
import { Shield, Code, CheckCircle } from 'lucide-react';

const EmployerDashboard: React.FC = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white flex items-center justify-center px-6">
      <SEO title="Employer API Access | DSH" description="Request access to the DSH employer verification API." lang={lang} />
      <div className="max-w-3xl w-full bg-slate-900/80 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_45%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Employer API Access</h1>
          <p className="text-gray-300 leading-relaxed mb-8">
            The live employer verification console is available only after DSH enables an employer API account. This page does not generate or simulate API keys locally.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
            {['Verified API access', 'Credential lookup', 'Bulk verification'].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-gray-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/${lang}/contact`} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
              Request Employer Access
            </Link>
            <Link to={`/${lang}/api-docs`} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold transition-colors">
              View API Docs
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-sm text-gray-500 flex items-center justify-center gap-2">
            <Code className="w-4 h-4" />
            Production API credentials are issued by the DSH backend, not generated in the browser.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
