
import React, { useState } from 'react';
import { Trophy, Plus, Trash2, Camera, Calendar, FileText, Send, X, ShieldCheck, Loader } from 'lucide-react';
import { User, Achievement } from '@/types';
import ImageUpload from '@/components/ImageUpload';

interface AchievementsManagerProps {
  user: User;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

const AchievementsManager: React.FC<AchievementsManagerProps> = ({ user, achievements, setAchievements }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAch, setNewAch] = useState({
    title: '',
    description: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAch.title || !newAch.imageUrl) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('ace_token');
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newAch.title,
          description: newAch.description,
          imageUrl: newAch.imageUrl,
          date: newAch.date
        })
      });

      if (response.ok) {
        const savedAch = await response.json();
        setAchievements(prev => [savedAch, ...prev]);
        setIsModalOpen(false);
        setNewAch({ title: '', description: '', imageUrl: '', date: new Date().toISOString().split('T')[0] });
      } else {
        alert('Failed to save achievement');
      }
    } catch (err) {
      console.error('Error saving achievement:', err);
      alert('Error saving achievement');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAchievement = async (id: string) => {
    if (window.confirm('Delete this achievement? It will be removed from the home screen slideshow.')) {
      try {
        const token = localStorage.getItem('ace_token');
        const response = await fetch(`/api/achievements/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setAchievements(prev => prev.filter(a => a.id !== id));
        } else {
          alert('Failed to delete achievement');
        }
      } catch (err) {
        console.error('Error deleting achievement:', err);
        alert('Error deleting achievement');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Hall of Fame Manager</h2>
          <p className="text-slate-500 text-sm font-medium">Curate the winning moments shown on the public portal.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-emerald-700 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={14} /> New Achievement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div key={ach.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all">
            <div className="h-48 relative overflow-hidden">
               <img src={ach.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={ach.title} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
               <button 
                 onClick={() => removeAchievement(ach.id)}
                 className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={16} />
               </button>
               <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{new Date(ach.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
               </div>
            </div>
            <div className="p-6">
              <h3 className="font-black text-slate-900 tracking-tight text-lg mb-2">{ach.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{ach.description}</p>
            </div>
          </div>
        ))}
        {achievements.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <Trophy size={48} className="text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No achievements recorded yet. Add your first winning moment!</p>
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
            
            <div className="mb-8">
              <div className="w-12 h-12 emerald-gradient rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                <Trophy size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Record Victory</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Updates public home screen slideshow</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievement Title</label>
                <div className="relative">
                  <input 
                    required 
                    placeholder="e.g. Inter-NIT Champions 2024"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-12 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newAch.title}
                    onChange={(e) => setNewAch({...newAch, title: e.target.value})}
                  />
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievement Image</label>
                <ImageUpload
                  onUploadComplete={(url) => setNewAch({...newAch, imageUrl: url})}
                  label=""
                  folder="achievements"
                  currentImage={newAch.imageUrl}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date achieved</label>
                  <div className="relative">
                    <input 
                      type="date"
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-12 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newAch.date}
                      onChange={(e) => setNewAch({...newAch, date: e.target.value})}
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Milestone Details)</label>
                <div className="relative">
                  <textarea 
                    required 
                    placeholder="Briefly describe the win or milestone..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-12 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 min-h-[100px] resize-none"
                    value={newAch.description}
                    onChange={(e) => setNewAch({...newAch, description: e.target.value})}
                  />
                  <FileText className="absolute left-4 top-6 text-slate-300" size={18} />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-emerald-700">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-black uppercase leading-relaxed">
                  Only Leadership verified achievements are visible on the public portal.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-5 emerald-gradient text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Publish to Home Screen
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsManager;
