
import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2, Camera, User, Hash, Phone, Send, X, ShieldCheck, Loader } from 'lucide-react';
import { User as UserType, Alumni, UserRole } from '@/types';
import ImageUpload from '@/components/ImageUpload';

interface AlumniManagerProps {
  user: UserType;
  alumni: Alumni[];
  setAlumni: React.Dispatch<React.SetStateAction<Alumni[]>>;
}

const AlumniManager: React.FC<AlumniManagerProps> = ({ user, alumni, setAlumni }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAlumnus, setNewAlumnus] = useState({
    name: '',
    regNo: '',
    contact: '',
    imageUrl: '',
    batch: new Date().getFullYear().toString()
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumnus.name || !newAlumnus.imageUrl) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('ace_token');
      const response = await fetch('/api/alumni', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAlumnus)
      });

      if (response.ok) {
        const savedAlum = await response.json();
        setAlumni(prev => [savedAlum, ...prev]);
        setIsModalOpen(false);
        setNewAlumnus({ name: '', regNo: '', contact: '', imageUrl: '', batch: new Date().getFullYear().toString() });
      } else {
        alert('Failed to save alumni');
      }
    } catch (err) {
      console.error('Error saving alumni:', err);
      alert('Error saving alumni');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAlumnus = async (id: string) => {
    if (window.confirm('Do you want to remove this alumni?')) {
      try {
        const token = localStorage.getItem('ace_token');
        const response = await fetch(`/api/alumni/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setAlumni(prev => prev.filter(a => a.id !== id));
        } else {
          alert('Failed to delete alumni');
        }
      } catch (err) {
        console.error('Error deleting alumni:', err);
        alert('Error deleting alumni');
      }
    }
  };

  const isLeadership = user.role === UserRole.CAPTAIN || user.role === UserRole.VICE_CAPTAIN || user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Alumni Treasury</h2>
          <p className="text-slate-500 text-sm font-medium">Manage records of the pioneers who built AceLawn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-emerald-700 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={14} /> Add Alumni
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {alumni.map((alum) => (
          <div key={alum.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all relative">
            {/* Delete button positioned precisely as in the screenshot */}
            {isLeadership && (
              <button 
                onClick={() => removeAlumnus(alum.id)}
                className="absolute top-8 right-8 p-2.5 text-slate-200 hover:text-red-500 transition-all bg-slate-50/50 hover:bg-red-50 rounded-xl z-20"
                title="Remove Alumni"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="p-8 flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-50 shrink-0 shadow-sm bg-slate-50">
                 {alum.imageUrl ? (
                   <img src={alum.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={alum.name} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200">
                     <User size={32} />
                   </div>
                 )}
              </div>
              <div className="flex-1 pr-10">
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 tracking-tight text-xl leading-none capitalize">{alum.name}</h3>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Batch of {alum.batch}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{alum.regNo}</p>
                </div>
                
                {isLeadership && (
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Phone size={14} className="text-emerald-500" />
                    <span className="tabular-nums tracking-tight">{alum.contact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {alumni.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <GraduationCap size={48} className="text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No alumni records found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 border border-emerald-50">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mb-8 text-center">
              <div className="w-14 h-14 emerald-gradient rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg mx-auto">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Enroll Alumnus</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Archiving the legacy of AceLawn</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <input 
                    required 
                    placeholder="e.g. Siddharth Sharma"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-12 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newAlumnus.name}
                    onChange={(e) => setNewAlumnus({...newAlumnus, name: e.target.value})}
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reg No</label>
                  <div className="relative">
                    <input 
                      required 
                      placeholder="2016UG..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-12 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newAlumnus.regNo}
                      onChange={(e) => setNewAlumnus({...newAlumnus, regNo: e.target.value})}
                    />
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Graduation Batch</label>
                  <input 
                    required 
                    type="number"
                    placeholder="2020"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newAlumnus.batch}
                    onChange={(e) => setNewAlumnus({...newAlumnus, batch: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative">
                  <input 
                    required 
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-12 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newAlumnus.contact}
                    onChange={(e) => setNewAlumnus({...newAlumnus, contact: e.target.value})}
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Photo</label>
                <ImageUpload
                  onUploadComplete={(url) => setNewAlumnus({...newAlumnus, imageUrl: url})}
                  label=""
                  folder="alumni"
                  currentImage={newAlumnus.imageUrl}
                />
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-emerald-700">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-black uppercase leading-relaxed">
                  Confidential: Contact info is restricted to leadership portal. Public home screen displays only name, batch, and registration ID.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-5 emerald-gradient text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Send size={18} /> Save Alumnus Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniManager;
