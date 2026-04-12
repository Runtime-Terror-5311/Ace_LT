
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, ShieldCheck, ChevronRight, Swords, GraduationCap, Shield, Hash, Lock } from 'lucide-react';
import { UserRole } from '@/types';

interface LoginProps {
  onLogin: (email: string, password: string, regNo: string, otp?: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regNo, setRegNo] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp' | 'forgot' | 'reset'>('credentials');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
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
      await onLogin(email, password, regNo);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('OTP is required.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await onLogin(email, password, regNo, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !regNo.trim()) {
      setError('Please provide your Email and Registration Number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, regNo })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setSuccessMsg(data.message);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Error sending reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) {
      setError('OTP and New Password are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      setSuccessMsg(data.message);
      setStep('credentials');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('credentials');
    setOtp('');
    setNewPassword('');
    setError('');
    setSuccessMsg('');
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
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-start gap-3 border border-emerald-100 text-xs font-bold animate-in fade-in">
                  <ShieldCheck className="shrink-0" size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                    placeholder="your.email@nitjsr.ac.in"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </div>
              </div>

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
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                  >
                    Forgot Password?
                  </button>
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
                    Send OTP <Mail size={18} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="text-center mb-4">
                <ShieldCheck className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm text-slate-600">OTP sent to {email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter OTP</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
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
                    Verify & Login <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Back to Login
              </button>
            </form>
          ) : step === 'forgot' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="text-center mb-4">
                <Shield className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm font-bold text-slate-800">Reset your password</p>
                <p className="text-xs text-slate-500 mt-1">Enter your details to receive an OTP.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                    placeholder="your.email@nitjsr.ac.in"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full emerald-gradient text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset OTP <Mail size={18} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-start gap-3 border border-emerald-100 text-xs font-bold animate-in fade-in">
                  <ShieldCheck className="shrink-0" size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="text-center mb-4">
                <Lock className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm font-bold text-slate-800">Set New Password</p>
                <p className="text-xs text-slate-500 mt-1">Check {email} for the OTP.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter OTP</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-12 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                    placeholder="New Password"
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
                    Reset Password <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
