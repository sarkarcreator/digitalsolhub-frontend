import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import SEO from '../components/SEO';
import { forgotPassword } from '../utils/api';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('');
    setError('');

    if (!email) {
      setError(TRANSLATIONS.fill_all_fields[lang]);
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setStatus(result.message || 'If that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-950 px-4">
      <SEO title={`Forgot Password | Digital Solutions Hub`} description="Reset your password." lang={lang} />
      <div className="w-full max-w-md glass rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
          <p className="text-sm text-gray-400 mt-2">Enter your email and we will send you a password reset link.</p>
        </div>

        {status && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {status}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 focus:bg-slate-900 transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all ${loading ? 'opacity-70 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-600/30'}`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 space-y-3">
          <button onClick={() => navigate(`/${lang}/login`)} className="text-brand-blue hover:text-brand-neon transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </button>
          <p>
            Remembered your password?{' '}
            <Link to={`/${lang}/login`} className="text-brand-blue hover:text-brand-neon">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
