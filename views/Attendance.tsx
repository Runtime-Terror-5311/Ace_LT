
import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Instagram, Download, X, Award, Zap, History, UserCheck, ShieldCheck, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { User, UserRole } from '@/types';
import { MOCK_USERS } from '@/mockData';

interface AttendanceRecord {
  id: string;
  date: string;
  presentCount: number;
  totalCount: number;
  supervisors: string[];
  submittedAt: string;
}

const Attendance: React.FC<{ user: User }> = ({ user }) => {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [selectedForPost, setSelectedForPost] = useState<any>(null);
  const [activeView, setActiveView] = useState<'mark' | 'register'>('mark');
  
  // Persistent history (simulated with localStorage)
  // Updated mock dates to be well in the past to avoid "today" conflicts
  const [history, setHistory] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ace_attendance_history');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'h1', date: '2024-01-10', presentCount: 22, totalCount: 24, supervisors: ['Mike Ross', 'Roger Federer'], submittedAt: '2024-01-10T18:00:00Z' },
      { id: 'h2', date: '2024-01-12', presentCount: 24, totalCount: 24, supervisors: ['Roger Federer'], submittedAt: '2024-01-12T18:30:00Z' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('ace_attendance_history', JSON.stringify(history));
  }, [history]);

  const todayStr = new Date().toISOString().split('T')[0];
  const isAlreadySubmitted = useMemo(() => history.some(h => h.date === todayStr), [history, todayStr]);

  // Only 1st years (Freshmen) can have attendance marked
  const freshmen = useMemo(() => MOCK_USERS.filter(u => u.currentYear === 1), []);
  
  const supervisors = useMemo(() => 
    MOCK_USERS.filter(u => u.currentYear === 2).map(s => s.name), 
  []);

  const toggleAttendance = (id: string, status: boolean) => {
    // We allow toggling in the UI for the demo/current session 
    // even if isAlreadySubmitted is true, but we'll prevent the final Submit click
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const submitAttendance = () => {
    if (isAlreadySubmitted) {
      alert("Attendance for today has already been submitted and verified.");
      return;
    }

    const presentCount = Object.values(attendance).filter(v => v === true).length;
    const newRecord: AttendanceRecord = {
      id: `h${Date.now()}`,
      date: todayStr,
      presentCount,
      totalCount: freshmen.length,
      supervisors: supervisors,
      submittedAt: new Date().toISOString()
    };
    
    setHistory([newRecord, ...history]);
    alert(`Attendance for ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} submitted successfully!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Team Presence</h2>
          <p className="text-sm text-slate-500 font-medium">Daily session log for first-year members.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.25rem] border border-slate-200 shadow-sm h-fit">
          <button 
            onClick={() => setActiveView('mark')}
            className={`px-8 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'mark' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
          >
            Mark Session
          </button>
          <button 
            onClick={() => setActiveView('register')}
            className={`px-8 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
          >
            Attendance Register
          </button>
        </div>
      </div>

      {activeView === 'mark' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck size={18} className="text-slate-400" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Active Supervisors (2nd Years)</h3>
              </div>
              <div className="space-y-4">
                {supervisors.map((name, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-110 ${i === 0 ? 'bg-emerald-100 text-emerald-700' : i === 1 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-50 text-emerald-600'}`}>
                      {name.charAt(0)}
                    </div>
                    <span className="text-[15px] font-bold text-slate-800 tracking-tight">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="emerald-gradient p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Zap size={18} fill="currentColor" className="text-yellow-300" />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Freshmen Spotlight</h3>
                </div>
                <div className="space-y-2">
                   {freshmen.slice(0, 1).map(f => (
                     <div 
                       key={f.id}
                       className="w-full flex items-center justify-between p-5 bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/20 transition-all"
                     >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden flex items-center justify-center font-bold text-sm shadow-inner">
                            {f.avatar ? <img src={f.avatar} className="w-full h-full object-cover" /> : f.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm mb-0.5 tracking-tight">{f.name}</p>
                            <p className="opacity-60 font-bold text-[10px] tracking-widest">{f.regNo}</p>
                          </div>
                       </div>
                       <Instagram size={20} className="opacity-60" />
                     </div>
                   ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-50 transition-colors">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Practice Session</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                      {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
               </div>
               
               {!isAlreadySubmitted ? (
                 <button 
                   onClick={submitAttendance}
                   className="bg-emerald-500 text-white px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200/50 hover:bg-emerald-600 hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
                 >
                   <ClipboardCheck size={20} /> Submit Session
                 </button>
               ) : (
                 <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <CheckCircle size={18} /> Recorded
                 </div>
               )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Roster Management</h3>
              <div className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {freshmen.length} Candidates
              </div>
            </div>

            <div className="divide-y divide-slate-50 flex-1 overflow-y-auto custom-scrollbar">
               {freshmen.map((p) => (
                 <div key={p.id} className={`p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group ${isAlreadySubmitted ? 'opacity-80' : ''}`}>
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-bold text-xl overflow-hidden border-2 transition-all ${attendance[p.id] === true ? 'border-emerald-500' : attendance[p.id] === false ? 'border-red-500' : 'border-slate-100'}`}>
                         {p.avatar ? (
                           <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
                         ) : (
                           <span className="text-slate-400">{p.name.charAt(0)}</span>
                         )}
                       </div>
                       <div>
                         <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">{p.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black">{p.regNo}</span> 
                           <span className="opacity-50">•</span>
                           <span>ENTRY 2024 SESSION</span>
                         </p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => toggleAttendance(p.id, true)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${attendance[p.id] === true ? 'bg-emerald-600 text-white scale-105 shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                       >
                         <div className={`p-1 rounded-full ${attendance[p.id] === true ? 'bg-white/20' : 'bg-slate-200'}`}>
                           <CheckCircle2 size={16} />
                         </div>
                         PRESENT
                       </button>
                       <button 
                        onClick={() => toggleAttendance(p.id, false)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${attendance[p.id] === false ? 'bg-red-500 text-white scale-105 shadow-red-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500'}`}
                       >
                         <div className={`p-1 rounded-full ${attendance[p.id] === false ? 'bg-white/20' : 'bg-slate-200'}`}>
                           <XCircle size={16} />
                         </div>
                         ABSENT
                       </button>
                    </div>
                 </div>
               ))}
               {freshmen.length === 0 && (
                 <div className="p-32 text-center">
                   <UserCheck size={64} className="text-slate-100 mx-auto mb-6" />
                   <p className="text-slate-400 font-black text-xl uppercase tracking-tight">No active freshmen in registry</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <History size={24} className="text-emerald-600" /> Attendance Register (Official Log)
            </h3>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100">Historical Roster</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                <tr>
                  <th className="px-12 py-6">Session Date</th>
                  <th className="px-12 py-6">Presence Ratio</th>
                  <th className="px-12 py-6">Supervised By</th>
                  <th className="px-12 py-6">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-12 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-base">
                          {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Practice Day #{record.id.slice(-3)}</span>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-700 font-black text-base">{record.presentCount}/{record.totalCount} Present</span>
                          <span className="text-xs font-bold text-slate-400">({Math.round((record.presentCount / record.totalCount) * 100)}%)</span>
                        </div>
                        <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${(record.presentCount / record.totalCount) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex -space-x-3">
                        {record.supervisors.map((s, idx) => (
                          <div 
                            key={idx} 
                            title={s}
                            className="w-10 h-10 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 shadow-sm uppercase"
                          >
                            {s.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-2xl border border-emerald-100 w-fit">
                        <CheckCircle size={14} /> Verified Official
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
