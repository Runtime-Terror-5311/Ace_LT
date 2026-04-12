
import React, { useState, useMemo, useEffect } from 'react';
import { IndianRupee, Download, TrendingUp, AlertTriangle, QrCode, CreditCard, Send, CheckCircle2, Clock, Mail, ShieldCheck, ExternalLink, Image as ImageIcon, Plus, Minus, History, Users, School, Building2, UserCircle2, ArrowUpRight, ArrowDownRight, MessageSquareText, ListFilter, UserCheck, UserX } from 'lucide-react';
import { User, UserRole, Contribution, FinancialLog } from '@/types';

const CONTRIBUTION_AMOUNT = 100;

const Financials: React.FC<{ user: User; members: User[] }> = ({ user, members }) => {
  const [payments, setPayments] = useState<Record<string, Contribution>>(() => {
    const saved = localStorage.getItem('ace_payments');
    return saved ? JSON.parse(saved) : {};
  });

  const [externalLogs, setExternalLogs] = useState<FinancialLog[]>(() => {
    const saved = localStorage.getItem('ace_financial_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', authorId: 'u1', authorName: 'Admin John', type: 'credit', source: 'Alumni', amount: 5000, reason: 'Donation from Batch of 2015 for Urja prep', timestamp: '2024-05-10T10:00:00Z' },
      { id: '2', authorId: 'u5', authorName: 'Arjun Mehta', type: 'debit', source: 'College', amount: 3200, reason: 'New Wilson nets for Court 1 & 2', timestamp: '2024-05-12T14:30:00Z' }
    ];
  });

  const [qrCode, setQrCode] = useState<string | null>(localStorage.getItem('ace_team_qr'));
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusView, setStatusView] = useState<'paid' | 'due'>('paid');

  // Modification Form State
  const [modForm, setModForm] = useState({
    type: 'credit' as 'credit' | 'debit',
    source: 'Alumni' as 'Alumni' | 'College' | 'Other',
    amount: '',
    reason: ''
  });

  const [isRequestingAuth, setIsRequestingAuth] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const currentDay = new Date().getDate();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const isAfter15th = currentDay > 15;
  const isLeadership = user.role === UserRole.CAPTAIN || user.role === UserRole.VICE_CAPTAIN || user.role === UserRole.ADMIN;

  useEffect(() => {
    localStorage.setItem('ace_payments', JSON.stringify(payments));
    localStorage.setItem('ace_financial_logs', JSON.stringify(externalLogs));
  }, [payments, externalLogs]);

  const stats = useMemo(() => {
    const memberPaidCount = (Object.values(payments) as Contribution[]).filter(p => p.paid && p.month === currentMonth).length;
    const unpaidCount = members.length - memberPaidCount;
    const memberCollected = memberPaidCount * CONTRIBUTION_AMOUNT;
    
    // External Fund Summation
    const alumniTotal = externalLogs.filter(l => l.source === 'Alumni').reduce((acc, l) => l.type === 'credit' ? acc + l.amount : acc - l.amount, 0);
    const collegeTotal = externalLogs.filter(l => l.source === 'College').reduce((acc, l) => l.type === 'credit' ? acc + l.amount : acc - l.amount, 0);
    const otherTotal = externalLogs.filter(l => l.source === 'Other').reduce((acc, l) => l.type === 'credit' ? acc + l.amount : acc - l.amount, 0);

    const startingFund = 10000; // Team base fund
    const totalBalance = startingFund + memberCollected + alumniTotal + collegeTotal + otherTotal;
    
    return {
      totalFund: totalBalance,
      paidRatio: Math.round((memberPaidCount / members.length) * 100) || 0,
      defaulters: unpaidCount,
      alumniFund: alumniTotal,
      collegeFund: collegeTotal,
      paidMembers: members.filter(m => payments[m.id]?.paid && payments[m.id]?.month === currentMonth),
      dueMembers: members.filter(m => !payments[m.id]?.paid || payments[m.id]?.month !== currentMonth)
    };
  }, [payments, externalLogs, currentMonth]);

  const handleExternalMod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modForm.amount || !modForm.reason.trim()) return;

    const newLog: FinancialLog = {
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      type: modForm.type,
      source: modForm.source as any,
      amount: parseFloat(modForm.amount),
      reason: modForm.reason,
      timestamp: new Date().toISOString()
    };

    setExternalLogs([newLog, ...externalLogs]);
    setIsManageModalOpen(false);
    setModForm({ type: 'credit', source: 'Alumni', amount: '', reason: '' });
    
    alert(`Success: ${newLog.type.toUpperCase()} of ₹${newLog.amount} from ${newLog.source} recorded. All port holders have been notified.`);
  };

  const handleMockPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newPayment: Contribution = {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        paid: true,
        paidAt: new Date().toISOString(),
        transactionId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      setPayments(prev => ({ ...prev, [user.id]: newPayment }));
      setIsProcessing(false);
      setIsPayModalOpen(false);
    }, 1500);
  };

  const handleRequestAuth = () => {
    setIsRequestingAuth(true);
    setTimeout(() => {
      setIsRequestingAuth(false);
      setHasRequested(true);
    }, 1000);
  };

  const isUserPaid = payments[user.id]?.paid && payments[user.id]?.month === currentMonth;

  if (!isLeadership) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Financial Treasury</h2>
            <p className="text-slate-500 text-sm font-medium">Consolidated team funds and payment status.</p>
          </div>
          <button 
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest active:scale-95"
          >
            <CreditCard size={16} /> Member Payment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 emerald-gradient opacity-20" />
            <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
               <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Access Restricted</h3>
              <p className="text-[13px] font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">Full financial analytics, audit logs, and treasury controls are only available to leadership roles.</p>
            </div>
            
            {hasRequested ? (
              <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-emerald-100 shadow-sm animate-in zoom-in-95">
                <CheckCircle2 size={18} /> Request Sent to Captain
              </div>
            ) : (
              <button 
                onClick={handleRequestAuth}
                disabled={isRequestingAuth}
                className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 shadow-2xl transition-all flex items-center gap-3 active:scale-95 group/btn"
              >
                {isRequestingAuth ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Request Authorization 
                    <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            )}
            
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">Governance Protocol v4.2</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-fit">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Team UPI Merchant</h4>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-6 mb-8">
                <div className="w-48 h-48 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {qrCode ? (
                    <img src={qrCode} className="w-full h-full object-contain p-4" alt="QR" />
                  ) : (
                    <div className="text-center p-6 text-slate-200">
                      <QrCode size={48} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No QR Active</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Beneficiary: AceLawn Team</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Verified Merchant Profile
                  </p>
                </div>
              </div>

              <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 border ${isUserPaid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                {isUserPaid ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">My Status</p>
                  <p className="text-sm font-bold">{isUserPaid ? 'Confirmed Paid' : `Payment Due: ₹${CONTRIBUTION_AMOUNT}`}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsPayModalOpen(true)}
                className={`w-full py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${isUserPaid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                <CreditCard size={16} /> {isUserPaid ? 'Payment Confirmed' : 'Individual Member Pay'}
              </button>
            </div>

            <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                 <ShieldCheck size={18} />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Policy</h4>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                   <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                   <p className="text-[11px] font-bold text-slate-600 leading-normal">Every treasury modification requires a mandatory justification for the audit trail.</p>
                </li>
                <li className="flex gap-3 items-start">
                   <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                   <p className="text-[11px] font-bold text-slate-600 leading-normal">All port holders receive digital receipts for cross-verification of funds.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Razorpay Mock Modal */}
        {isPayModalOpen && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="bg-blue-600 p-8 text-white">
                  <div className="flex justify-between items-start mb-10">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">RA</div>
                       <span className="font-bold tracking-tight uppercase text-xs">Razorpay</span>
                     </div>
                     <button onClick={() => setIsPayModalOpen(false)} className="text-white/60 hover:text-white transition-colors"><XCircleIcon size={20} /></button>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">AceLawn Tennis Club</p>
                     <p className="text-3xl font-black">₹{CONTRIBUTION_AMOUNT}.00</p>
                  </div>
               </div>
               
               <div className="p-8 space-y-6 text-center">
                  <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">Redirecting to secure merchant environment for student contribution.</p>
                  <button 
                    disabled={isProcessing}
                    onClick={handleMockPayment}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Pay ₹{CONTRIBUTION_AMOUNT}.00</>}
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encrypted via Razorpay SSL</p>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 15th Day Notification Service */}
      {isAfter15th && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
               <Mail size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Notification Service Active</p>
               <p className="text-sm font-bold text-slate-800">It's Day {currentDay}. Automated payment reminders are now live.</p>
             </div>
           </div>
           {isLeadership && (
             <button className="bg-amber-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 shadow-sm transition-all flex items-center gap-2">
               <Send size={14} /> Send Reminders
             </button>
           )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Financial Treasury</h2>
          <p className="text-slate-500 text-sm font-medium">Consolidated team funds, alumni contributions, and audit logs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest active:scale-95"
          >
            <CreditCard size={16} /> Member Payment
          </button>
          {isLeadership && (
            <button 
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest active:scale-95"
            >
              <Plus size={16} /> Modify Treasury
            </button>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consolidated Balance</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">₹{stats.totalFund.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumni Donations</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{stats.alumniFund.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <School size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College Grants</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{stats.collegeFund.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[1.5rem] shadow-xl text-white relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Collection Progress</p>
              <p className="text-2xl font-black">{stats.paidRatio}% Collected</p>
              <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats.paidRatio}%` }} />
              </div>
           </div>
           <TrendingUp className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:rotate-12 transition-transform" size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Treasury Audit Trail */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
               <History className="text-emerald-600" size={20} />
               <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Treasury Audit Log</h3>
            </div>
            <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
              Leadership Verified Entries
            </span>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {externalLogs.map((log) => (
              <div key={log.id} className="p-6 border-b border-slate-50 hover:bg-slate-50/50 transition-all flex items-start gap-4">
                 <div className={`p-3 rounded-2xl shrink-0 ${log.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {log.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">
                            {log.type === 'credit' ? 'Fund Credit' : 'Fund Expenditure'} 
                            <span className="mx-2 text-slate-200">|</span>
                            <span className="text-emerald-600">₹{log.amount.toLocaleString()}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-400 uppercase rounded-md">{log.source}</span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center justify-end gap-1.5">
                            <UserCircle2 size={12} /> {log.authorName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Port Holder</p>
                       </div>
                    </div>
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-start gap-3 mt-3">
                       <MessageSquareText size={14} className="text-slate-400 mt-0.5" />
                       <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">"{log.reason}"</p>
                    </div>
                 </div>
              </div>
            ))}
            {externalLogs.length === 0 && (
              <div className="p-32 text-center text-slate-300">
                 <History size={64} className="mx-auto mb-4 opacity-20" />
                 <p className="font-bold">No external modifications logged yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* QR & Policy Panel */}
        <div className="lg:col-span-4 space-y-6">
           {/* Team Merchant QR */}
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-fit">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Team UPI Merchant</h4>
                {isLeadership && (
                  <label className="cursor-pointer text-emerald-600 hover:text-emerald-700 transition-colors">
                    <ImageIcon size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setQrCode(reader.result as string);
                          localStorage.setItem('ace_team_qr', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-6 mb-8">
                <div className="w-48 h-48 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {qrCode ? (
                    <img src={qrCode} className="w-full h-full object-contain p-4" alt="QR" />
                  ) : (
                    <div className="text-center p-6 text-slate-200">
                      <QrCode size={48} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No QR Active</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Beneficiary: AceLawn Team</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Verified Merchant Profile
                  </p>
                </div>
              </div>

              {/* Personal Payment Status Badge for Members */}
              {!isLeadership && (
                <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 border ${isUserPaid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                  {isUserPaid ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">My Status</p>
                    <p className="text-sm font-bold">{isUserPaid ? 'Confirmed Paid' : `Payment Due: ₹${CONTRIBUTION_AMOUNT}`}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setIsPayModalOpen(true)}
                className={`w-full py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${isUserPaid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                <CreditCard size={16} /> {isUserPaid ? 'Payment Confirmed' : 'Individual Member Pay'}
              </button>

              {/* Captain's View: Payment Status List */}
              {isLeadership && (
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status Tracker</h5>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button 
                        onClick={() => setStatusView('paid')}
                        className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${statusView === 'paid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        Paid ({stats.paidMembers.length})
                      </button>
                      <button 
                        onClick={() => setStatusView('due')}
                        className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${statusView === 'due' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                      >
                        Due ({stats.dueMembers.length})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {(statusView === 'paid' ? stats.paidMembers : stats.dueMembers).map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100 group hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${statusView === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{m.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{m.regNo}</p>
                          </div>
                        </div>
                        {statusView === 'paid' ? (
                          <UserCheck size={14} className="text-emerald-500" />
                        ) : (
                          <UserX size={14} className="text-slate-300" />
                        )}
                      </div>
                    ))}
                    {(statusView === 'paid' ? stats.paidMembers : stats.dueMembers).length === 0 && (
                      <div className="text-center py-6">
                        <AlertTriangle size={24} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-[9px] font-bold text-slate-300 uppercase">No records found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
           </div>

           {/* Financial Policy */}
           <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                 <ShieldCheck size={18} />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Policy</h4>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                   <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                   <p className="text-[11px] font-bold text-slate-600 leading-normal">Every treasury modification requires a mandatory justification for the audit trail.</p>
                </li>
                <li className="flex gap-3 items-start">
                   <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                   <p className="text-[11px] font-bold text-slate-600 leading-normal">All port holders receive digital receipts for cross-verification of funds.</p>
                </li>
              </ul>
           </div>
        </div>
      </div>

      {/* Modify Treasury Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsManageModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-colors">
               <Minus size={20} />
            </button>
            
            <div className="mb-8">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                 <Building2 size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Treasury Modification</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Port Holder Tool</p>
            </div>

            <form onSubmit={handleExternalMod} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entry Type</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                       <button type="button" onClick={() => setModForm({...modForm, type: 'credit'})} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${modForm.type === 'credit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}><Plus size={14} /> Credit</button>
                       <button type="button" onClick={() => setModForm({...modForm, type: 'debit'})} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${modForm.type === 'debit' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}><Minus size={14} /> Debit</button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fund Source</label>
                    <select value={modForm.source} onChange={(e) => setModForm({...modForm, source: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer">
                       <option value="Alumni">Alumni Contribution</option>
                       <option value="College">College Administration</option>
                       <option value="Other">Miscellaneous Fund</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (INR)</label>
                 <div className="relative">
                    <input type="number" required placeholder="0.00" value={modForm.amount} onChange={(e) => setModForm({...modForm, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-12 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modification Justification (Mandatory)</label>
                 <textarea required placeholder="Specify why this entry is being made (e.g. +2000 from alumni XYZ, -5000 bought rackets)" value={modForm.reason} onChange={(e) => setModForm({...modForm, reason: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all min-h-[120px] resize-none" />
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                 <ShieldCheck className="text-blue-600 mt-0.5" size={18} />
                 <p className="text-[10px] font-black text-blue-700 uppercase leading-relaxed">Submitting this entry will sync the records and notify all other port holders.</p>
              </div>

              <button type="submit" className="w-full py-5 emerald-gradient text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl hover:opacity-95 active:scale-95 transition-all">Sync & Record Transaction</button>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Mock Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="bg-blue-600 p-8 text-white">
                <div className="flex justify-between items-start mb-10">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner">RA</div>
                     <span className="font-bold tracking-tight uppercase text-xs">Razorpay</span>
                   </div>
                   <button onClick={() => setIsPayModalOpen(false)} className="text-white/60 hover:text-white transition-colors"><XCircleIcon size={20} /></button>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">AceLawn Tennis Club</p>
                   <p className="text-3xl font-black">₹{CONTRIBUTION_AMOUNT}.00</p>
                </div>
             </div>
             
             <div className="p-8 space-y-6 text-center">
                <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">Redirecting to secure merchant environment for student contribution.</p>
                <button 
                  disabled={isProcessing}
                  onClick={handleMockPayment}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Pay ₹{CONTRIBUTION_AMOUNT}.00</>}
                </button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encrypted via Razorpay SSL</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon fix
const XCircleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

export default Financials;
