
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, ShieldCheck, ChevronRight, Swords, GraduationCap, Shield, Hash, Lock } from 'lucide-react';
import { UserRole } from '@/types';

interface LoginProps {
  onLogin: (email: string, password: string, regNo?: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [regNo, setRegNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) {
      setError('Registration Number is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password (Phone Number) is required.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await onLogin('', password, regNo);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid registration number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 emerald-gradient rounded-2xl shadow-lg mb-6 text-white rotate-3 hover:rotate-0 transition-transform">
              <Swords size={32} />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Portal Entry</h2>
           <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-widest">Team Management System</p>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-xs font-bold animate-in fade-in">
                <AlertCircle className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                  placeholder="e.g. 2023UGEE018"
                />
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password (Phone Number)</label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full emerald-gradient text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Dashboard <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Removed Register Now link as requested */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
