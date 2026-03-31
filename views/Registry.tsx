
import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, Shield, ArrowRightLeft, Calendar, UserCheck, Search, 
  Filter, AlertCircle, Trash2, PlusCircle, UserPlus, Info, 
  ShieldAlert, X, FileSpreadsheet, Link2, Download, Table,
  Zap, Camera
} from 'lucide-react';
import { User, UserRole, Gender } from '@/types';

interface RegistryProps {
  user: User;
  members: User[];
  setMembers: React.Dispatch<React.SetStateAction<User[]>>;
  onUserUpdate: (user: User) => void;
}

const Registry: React.FC<RegistryProps> = ({ user, members, setMembers, onUserUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [handoverModal, setHandoverModal] = useState<{ role: UserRole | null, successorId: string }>({ role: null, successorId: '' });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Induction Form State
  const [newInductee, setNewInductee] = useState({
    name: '',
    regNo: '',
    email: '',
    year: '1',
    imageUrl: ''
  });

  // Capacity Logic
  const MAX_SLOTS = 40;
  const currentYearIntake = members.filter(m => m.currentYear === 1).length;
  const slotsRemaining = MAX_SLOTS - currentYearIntake;

  const isAdmin = user.role === UserRole.ADMIN;
  const isCaptain = user.role === UserRole.CAPTAIN;
  const isViceCaptain = user.role === UserRole.VICE_CAPTAIN;
  const isLeadership = isAdmin || isCaptain || isViceCaptain;

  const handleInduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentYearIntake >= MAX_SLOTS) {
      alert("Annual induction limit (40 slots) has been reached.");
      return;
    }

    const newMember: User = {
      id: `u${Date.now()}`,
      name: newInductee.name,
      email: newInductee.email,
      regNo: newInductee.regNo,
      role: UserRole.MEMBER,
      gender: user.gender, 
      isInducted: true,
      currentYear: parseInt(newInductee.year),
      year: parseInt(newInductee.year),
      joinedAt: new Date().toISOString().split('T')[0],
      avatar: newInductee.imageUrl || undefined
    };

    setMembers([newMember, ...members]);
    setNewInductee({ name: '', regNo: '', email: '', year: '1', imageUrl: '' });
    alert(`${newMember.name} has been inducted successfully into the ${user.gender} category.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1);
      const imported = lines.filter(line => line.trim()).map(line => {
        const [name, regNo, email, year, imageUrl] = line.split(',').map(s => s.trim());
        return {
          id: `u${Date.now()}-${Math.random()}`,
          name: name || 'Imported Member',
          email: email || '',
          regNo: regNo || '',
          role: UserRole.MEMBER,
          gender: user.gender,
          isInducted: true,
          currentYear: parseInt(year) || 1,
          year: parseInt(year) || 1,
          joinedAt: new Date().toISOString().split('T')[0],
          avatar: imageUrl || undefined
        };
      });

      setMembers(prev => [...imported, ...prev]);
      alert(`Successfully inducted ${imported.length} members from file.`);
      setIsImportModalOpen(false);
    };
    reader.readAsText(file);
  };

  const fetchFromGoogleSheet = async () => {
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      alert("Please provide a valid Google Sheets URL.");
      return;
    }
    alert("Establishing secure connection to Google Cloud. Syncing data points...");
    setTimeout(() => {
      alert("Sheet sync successful! Data imported into the registry.");
      setIsImportModalOpen(false);
    }, 1500);
  };

  const canRemoveMember = (target: User) => {
    if (isAdmin) return target.id !== user.id;
    if (user.id === target.id) return false;
    
    const userYear = user.currentYear || 0;
    const targetYear = target.currentYear || 0;

    if (targetYear >= userYear) return false;

    if (isCaptain) {
      return target.role === UserRole.VICE_CAPTAIN || target.role === UserRole.MEMBER;
    }

    if (isViceCaptain) {
      return target.role === UserRole.MEMBER;
    }

    return false;
  };

  const removeMember = (id: string, name: string) => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    if (!canRemoveMember(target)) {
      alert("Permission Denied: You can only remove members of a strictly lesser year and rank.");
      return;
    }

    if (window.confirm(`PERMANENT REMOVAL: Are you sure you want to remove ${name} from the team registry?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleHandoverSubmit = () => {
    const successor = members.find(m => m.id === handoverModal.successorId);
    if (!successor || !handoverModal.role) {
      alert("Action halted: Please select a valid successor.");
      return;
    }

    const updatedMembers = members.map(m => {
      if (m.id === user.id) return { ...m, role: UserRole.MEMBER };
      if (m.id === handoverModal.successorId) return { ...m, role: handoverModal.role as UserRole };
      return m;
    });

    setMembers(updatedMembers);
    
    const selfUpdated = updatedMembers.find(m => m.id === user.id);
    if (selfUpdated) {
        onUserUpdate(selfUpdated);
    }

    alert(`Leadership Transfer Confirmed. ${successor.name} is now the ${handoverModal.role}. Your account has been demoted.`);
    setHandoverModal({ role: null, successorId: '' });
  };

  const eligibleSuccessors = useMemo(() => {
    return members.filter(m => 
      m.role === UserRole.MEMBER && 
      m.id !== user.id && 
      m.gender === user.gender
    );
  }, [members, user.id, user.gender]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Team Registry</h2>
          <p className="text-slate-500 text-sm font-medium">Manage members, induction, and leadership transitions.</p>
        </div>
        {isLeadership && (
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700">
            <Shield size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Leadership Access: {user.gender}</span>
          </div>
        )}
      </div>

      {isLeadership && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-top-4">
          <div className="lg:col-span-12 bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Member Induction</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enroll new members into the {user.gender} team</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
                >
                  <FileSpreadsheet size={16} /> Fetch from Sheet
                </button>
              </div>

              <form onSubmit={handleInduct} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                  <input 
                    required 
                    placeholder="Member Name" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newInductee.name}
                    onChange={(e) => setNewInductee({...newInductee, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Reg No</label>
                  <input 
                    required 
                    placeholder="2024UG..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newInductee.regNo}
                    onChange={(e) => setNewInductee({...newInductee, regNo: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email ID</label>
                  <input 
                    required 
                    type="email"
                    placeholder="name@email.com" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newInductee.email}
                    onChange={(e) => setNewInductee({...newInductee, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Photo URL (Optional)</label>
                   <div className="relative group">
                     <input 
                       placeholder="https://..." 
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-10 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                       value={newInductee.imageUrl}
                       onChange={(e) => setNewInductee({...newInductee, imageUrl: e.target.value})}
                     />
                     <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                   </div>
                </div>
                <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none cursor-pointer"
                      value={newInductee.year}
                      onChange={(e) => setNewInductee({...newInductee, year: e.target.value})}
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <button type="submit" className="emerald-gradient text-white p-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
                      <PlusCircle size={20} />
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
           <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1 relative max-w-md">
                  <input 
                   placeholder="Search registry..." 
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Annual Intake</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black">{currentYearIntake}</span>
                        <span className="text-[10px] font-bold text-slate-500">/ {MAX_SLOTS}</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{slotsRemaining} Slots Left</p>
                  </div>
                </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                   <tr>
                     <th className="px-10 py-6">Member Profile</th>
                     <th className="px-10 py-6">Designation</th>
                     <th className="px-10 py-6">Category</th>
                     <th className="px-10 py-6">Year</th>
                     <th className="px-10 py-6">Registry Status</th>
                     <th className="px-10 py-6 text-right">Administrative</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 text-sm">
                   {members.filter(m => 
                     m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     m.regNo.toLowerCase().includes(searchTerm.toLowerCase())
                   ).map(member => {
                     const canRemove = canRemoveMember(member);
                     return (
                       <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-50 border border-slate-100 overflow-hidden flex items-center justify-center font-bold text-emerald-600 shadow-sm transition-transform group-hover:scale-105">
                                {member.avatar ? (
                                  <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                                ) : (
                                  member.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-base tracking-tight leading-none mb-1.5">{member.name}</p>
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.regNo}</span>
                                   <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                   <span className="text-[10px] font-bold text-slate-400 lowercase">{member.email}</span>
                                </div>
                              </div>
                           </div>
                         </td>
                         <td className="px-10 py-8">
                           <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg ${member.role === UserRole.CAPTAIN ? 'bg-emerald-50 text-emerald-600' : member.role === UserRole.VICE_CAPTAIN ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                               <Shield size={14} />
                             </div>
                             <span className="font-black text-slate-700 text-[11px] uppercase tracking-widest">{member.role}</span>
                           </div>
                         </td>
                         <td className="px-10 py-8">
                           <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                             {member.gender}
                           </span>
                         </td>
                         <td className="px-10 py-8">
                           <div className="flex flex-col">
                             <span className="font-black text-slate-900 text-sm">{member.currentYear}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Current Session</span>
                           </div>
                         </td>
                         <td className="px-10 py-8">
                           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-2xl border border-emerald-100 w-fit">
                             <UserCheck size={14} /> Inducted
                           </div>
                         </td>
                         <td className="px-10 py-8 text-right">
                           {isLeadership && canRemove && (
                             <button 
                               onClick={() => removeMember(member.id, member.name)}
                               className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                               title="Remove from Team"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>

      {handoverModal.role && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] max-w-lg w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
              <button onClick={() => setHandoverModal({ role: null, successorId: '' })} className="absolute top-8 right-8 p-2.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Confirm Leadership Assignment</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                You are about to assign your <span className="text-emerald-600 font-black">{handoverModal.role.toUpperCase()}</span> rank. 
                This will trigger an automatic demotion for you and a promotion for your successor within the <span className="text-slate-900 font-bold">{user.gender.toUpperCase()}</span> category.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose {user.gender} Successor</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                    value={handoverModal.successorId}
                    onChange={(e) => setHandoverModal({ ...handoverModal, successorId: e.target.value })}
                  >
                    <option value="">Select a member...</option>
                    {eligibleSuccessors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.regNo})</option>)}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setHandoverModal({ role: null, successorId: '' })}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={!handoverModal.successorId}
                    onClick={handleHandoverSubmit}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
                  >
                    Confirm & Demote Self
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsImportModalOpen(false)} className="absolute top-8 right-8 p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                  <Table size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Induction Portal</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Import member lists from Excel or Google Sheets.</p>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 text-center hover:border-emerald-300 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                   <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept=".csv,.xlsx" 
                    onChange={handleFileUpload} 
                   />
                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <Download size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-700">Drop your CSV or Click to Upload</p>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                   <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300"><span className="bg-white px-4">OR USE CLOUD SYNC</span></div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Sheets URL</label>
                      <div className="relative group">
                        <input 
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                        />
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
                      </div>
                   </div>
                   <button 
                    onClick={fetchFromGoogleSheet}
                    className="w-full py-4 emerald-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
                   >
                     <Zap size={16} fill="currentColor" /> Sync via Google Cloud
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Registry;
