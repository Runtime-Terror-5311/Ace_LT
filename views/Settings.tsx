
import React, { useState } from 'react';
import { User as UserIcon, Bell, Shield, Smartphone, Globe, Save, Camera, X } from 'lucide-react';
import { User } from '@/types';

interface SettingsProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
  const [photoUrl, setPhotoUrl] = useState(user.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onUserUpdate({ ...user, avatar: photoUrl });
      setIsSaving(false);
      alert('Profile updated successfully!');
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="pb-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Manage your profile and dashboard preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Photo Section */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
           <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-emerald-50 overflow-hidden shadow-inner flex items-center justify-center">
                 {photoUrl ? (
                   <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   <UserIcon size={48} className="text-slate-200" />
                 )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-700 transition-all hover:scale-110">
                <Camera size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
           </div>
           
           <div className="flex-1 space-y-4 w-full">
              <div>
                <h3 className="font-black text-slate-900 tracking-tight text-lg leading-tight">Profile Identity</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">This photo is displayed in leadership and registry records.</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    placeholder="https://images.unsplash.com/..." 
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  {photoUrl && (
                    <button onClick={() => setPhotoUrl('')} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
           </div>
        </section>

        {/* Profile Details Card */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-sm tracking-tight">
            <UserIcon size={20} className="text-blue-500" /> Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input value={user.name} disabled className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input value={user.email} disabled className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
              <input value={user.phone} disabled className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
              <input value={user.role} disabled className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs capitalize" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Category</label>
              <input value={user.gender} disabled className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs capitalize" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-sm tracking-tight">
            <Bell size={20} className="text-green-500" /> Notifications
          </h3>
          <div className="space-y-4">
            {[
              { title: 'New Announcements', desc: 'Get notified when a captain posts an update.', default: true },
              { title: 'Match Invitations', desc: 'Alerts for upcoming fixtures scheduled for you.', default: true },
              { title: 'Financial Reminders', desc: 'Monthly contribution due date alerts.', default: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-none">
                <div>
                  <p className="font-bold text-slate-800 text-sm tracking-tight">{item.title}</p>
                  <p className="text-[11px] font-medium text-slate-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.default} />
                  <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-sm tracking-tight">
            <Shield size={20} className="text-red-500" /> Privacy & Security
          </h3>
          <div className="space-y-4">
            <button className="text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-3 uppercase tracking-widest">
              <Smartphone size={18} /> Update MFA (Multi-Factor Authentication)
            </button>
            <button className="text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-3 uppercase tracking-widest">
              <Globe size={18} /> Review Active Sessions
            </button>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'UPDATING...' : <><Save size={18} /> SAVE CHANGES</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
