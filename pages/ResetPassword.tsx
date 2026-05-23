import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import SEO from '../components/SEO';
import { resetPassword } from '../utils/api';
import { Lock, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { lang: paramLang, token } = useParams<{ lang: string; token: string }>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!email || !password || !confirmPassword) {
      setError(TRANSLATIONS.fill_all_fields[lang]);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        email,
        token: token || '',
        password,
        password_confirmation: confirmPassword,
      });
      setStatus(result.message || 'Your password has been reset successfully.');
      setTimeout(() => navigate(`/${lang}/login`), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-950 px-4">
      <SEO title={`Reset Password | Digital Solutions Hub`} description="Reset your account password." lang={lang} />
      <div className="w-full max-w-md glass rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-gray-400 mt-2">Set a new password for your account.</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 focus:bg-slate-900 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 focus:bg-slate-900 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all ${loading ? 'opacity-70 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-600/30'}`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 space-y-3">
          <button onClick={() => navigate(`/${lang}/login`)} className="text-brand-blue hover:text-brand-neon transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
