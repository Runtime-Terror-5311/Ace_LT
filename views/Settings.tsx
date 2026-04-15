import React, { useEffect, useState } from 'react';
import { User as UserIcon, Bell, Shield, Smartphone, Globe, Camera, Loader } from 'lucide-react';
import { User } from '@/types';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface SettingsProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
  const [photoUrl, setPhotoUrl] = useState(user.avatar || ' ');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: sync with backend updates
  useEffect(() => {
    setPhotoUrl(user.avatar || ' ');
  }, [user.avatar]);

  const saveProfile = async (newPhotoUrl: string) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('ace_token');
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar: newPhotoUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUserUpdate(data.user);

        if (user.role === 'captain' || user.role === 'viceCaptain') {
          window.dispatchEvent(new CustomEvent('leadershipUpdated'));
        }
      } else {
        setError('Failed to save profile');
      }
    } catch (err) {
      setError('Error saving profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadToCloudinary(file, { folder: 'avatars' });

      if (!url) throw new Error("Upload failed");

      setPhotoUrl(url); // ✅ instant UI update
      await saveProfile(url);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
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
              <img
  src={photoUrl ? photoUrl : '/Avatar.png'}
  onError={(e) => {
    (e.currentTarget as HTMLImageElement).src = '/Avatar.png';
  }}
  className="w-full h-full object-cover"
  alt="Profile"
/>
            </div>

            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 disabled:opacity-50">
              {isUploading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Camera size={20} />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <h3 className="font-black text-slate-900 tracking-tight text-lg leading-tight">{user.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Click the camera icon to upload your photo
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {isUploading && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Loader size={14} className="animate-spin" />
                Uploading to Cloudinary...
              </div>
            )}
          </div>
        </section>

        {/* Profile Details */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      Full Name
    </label>
    <input
      value={user.name}
      disabled
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs"
    />
  </div>

  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      Email
    </label>
    <input
      value={user.email}
      disabled
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs"
    />
  </div>

  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      Phone
    </label>
    <input
      value={user.phone}
      disabled
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs"
    />
  </div>

  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      Role
    </label>
    <input
      value={user.role}
      disabled
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs capitalize"
    />
  </div>

  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      Team Category
    </label>
    <input
      value={user.gender}
      disabled
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-400 font-bold text-xs capitalize"
    />
  </div>
</div>
        </section>

        {/* Notifications
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-sm tracking-tight">
            <Bell size={20} className="text-green-500" /> Notifications
          </h3>
          <p className="text-sm text-slate-500">Notification settings here...</p>
        </section> */}

        {/* Security */}
        {/* <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-sm tracking-tight">
            <Shield size={20} className="text-red-500" /> Privacy & Security
          </h3>
          <p className="text-sm text-slate-500">Security settings here...</p>
        </section> */}

      </div>
    </div>
  );
};

export default Settings;