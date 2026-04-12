
import React, { useState, useEffect, useMemo } from 'react';
import { Megaphone, Filter, Plus, Clock, User as UserIcon, X, Send, AlertCircle, Calendar as CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { User, UserRole, Announcement } from '@/types';

const AnnouncementsView: React.FC<{ user: User }> = ({ user }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'urgent'>('all');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    urgent: false
  });

  const isAdmin = user.role === UserRole.ADMIN;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ace_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Map DB response to match Announcement type
        const mapped = data.map((a: any) => ({
          id: a._id || a.id,
          title: a.title,
          content: a.content,
          author: a.author,
          date: a.date ? new Date(a.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          urgent: a.urgent
        }));
        setAnnouncements(mapped);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    setPosting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          urgent: newPost.urgent,
          author: user.name
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewPost({ title: '', content: '', urgent: false });
        fetchAnnouncements(); // Refetch to get latest
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to post announcement');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    if (filterMode === 'urgent') {
      return announcements.filter(a => a.urgent);
    }
    return announcements;
  }, [announcements, filterMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Team Board</h2>
          <p className="text-slate-500 text-sm font-medium">Official updates and urgent team notifications.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} /> POST UPDATE
          </button>
        )}
      </div>

      {/* Header Info: Filter functionality implemented here */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Bulletin Board</p>
            <p className="text-base font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             {filteredAnnouncements.length} Bulletins Shown
           </div>
           
           <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
             <button 
              onClick={() => setFilterMode('all')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'all' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               All
             </button>
             <button 
              onClick={() => setFilterMode('urgent')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'urgent' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-red-500'}`}
             >
               Urgent
             </button>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <span className="ml-3 text-slate-400 font-bold text-sm">Loading announcements...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAnnouncements.map((post) => (
            <div key={post.id} className={`bg-white p-8 rounded-[2rem] shadow-sm border transition-all hover:shadow-md ${post.urgent ? 'border-l-[6px] border-l-red-500 border-red-100 bg-red-50/10' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl shadow-inner ${post.urgent ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {post.date}</span>
                      <span className="flex items-center gap-1.5"><UserIcon size={14} /> {post.author}</span>
                    </div>
                  </div>
                </div>
                {post.urgent && (
                  <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-200">Urgent</span>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed text-[15px] font-medium pl-2">{post.content}</p>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-4 border-white bg-slate-200 shadow-sm" />
                     ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visible to all members</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100">
                  <CheckCircle size={14} /> Acknowledge
                </button>
              </div>
            </div>
          ))}
          {filteredAnnouncements.length === 0 && !loading && (
            <div className="p-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <Megaphone size={48} className="text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No announcements found in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* Post Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Post Bulletin</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Broadcast official updates to all team members.</p>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Title</label>
                <input 
                  required
                  placeholder="e.g. Practice Time Change"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                <textarea 
                  required
                  placeholder="Details of the announcement..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all min-h-[150px] resize-none"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${newPost.urgent ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-400'}`}>
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Mark as Urgent</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Triggers push notification</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={newPost.urgent}
                    onChange={(e) => setNewPost({...newPost, urgent: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Posting as</p>
                <p className="text-sm font-black text-slate-900">{user.name} <span className="text-emerald-600 text-[10px] uppercase">({user.role})</span></p>
              </div>

              <button 
                type="submit"
                disabled={posting}
                className="w-full py-5 emerald-gradient text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {posting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {posting ? 'Publishing...' : 'Publish Bulletin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsView;
