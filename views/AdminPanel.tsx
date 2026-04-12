
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldPlus, Users, UserPlus, Search, Trash2, X, Eye, EyeOff,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Phone, Mail, Calendar, GraduationCap, Shield, Hash, Loader2
} from 'lucide-react';
import { User, UserRole, Gender } from '@/types';

interface AdminPanelProps {
  user: User;
  onUserUpdate?: (user: User) => void;
}

interface DBUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  regNo: string;
  phone?: string;
  designation?: string;
  role: string;
  gender: string;
  isInducted: boolean;
  isPaid?: boolean;
  currentYear?: number;
  year?: number;
  joinedAt: string;
  avatar?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onUserUpdate }) => {
  const [members, setMembers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regNo: '',
    phone: '',
    designation: 'Member',
    gender: '',
    currentYear: '',
    role: 'member'
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ace_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ type: 'success', message: `${formData.name} registered successfully! Password is their phone number.` });
        setFormData({ name: '', email: '', regNo: '', phone: '', designation: 'Member', gender: '', currentYear: '', role: 'member' });
        setShowRegisterForm(false);
        fetchMembers();
      } else {
        setToast({ type: 'error', message: data.message || 'Registration failed.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${memberName}? This action cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setToast({ type: 'success', message: `${memberName} has been removed from the database.` });
        setMembers(prev => prev.filter(m => m._id !== id));
      } else {
        const data = await res.json();
        setToast({ type: 'error', message: data.message || 'Failed to delete member.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePayment = async (id: string, currentStatus: boolean, memberName: string) => {
    setUpdatingPaymentId(id);
    try {
      const res = await fetch(`/api/users/${id}/payment`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPaid: !currentStatus })
      });

      if (res.ok) {
        setMembers(prev => prev.map(m => m._id === id ? { ...m, isPaid: !currentStatus } : m));
        setToast({ type: 'success', message: `Payment status updated for ${memberName}` });
        
        // Update global user state if admin changes their own status
        if ((user._id === id || user.id === id) && onUserUpdate) {
          onUserUpdate({ ...user, isPaid: !currentStatus });
        }
      } else {
        const data = await res.json();
        setToast({ type: 'error', message: data.message || 'Failed to update payment status.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone || '').includes(searchTerm);
      const matchesGender = filterGender === 'all' || m.gender.toLowerCase() === filterGender.toLowerCase();
      const matchesRole = filterRole === 'all' || m.role === filterRole;
      return matchesSearch && matchesGender && matchesRole;
    });
  }, [members, searchTerm, filterGender, filterRole]);

  const stats = useMemo(() => ({
    total: members.length,
    boys: members.filter(m => m.gender.toLowerCase() === 'boys').length,
    girls: members.filter(m => m.gender.toLowerCase() === 'girls').length,
    captains: members.filter(m => m.role === 'captain').length,
    viceCaptains: members.filter(m => m.role === 'viceCaptain').length,
  }), [members]);

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
      captain: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      viceCaptain: 'bg-blue-50 text-blue-700 border-blue-200',
      member: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return styles[role] || styles.member;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      captain: 'Captain',
      viceCaptain: 'Vice Captain',
      member: 'Member'
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <ShieldPlus size={22} />
            </div>
            Admin Panel
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage all team members and register new ones into the database.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMembers}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowRegisterForm(!showRegisterForm)}
            className="flex items-center gap-2 px-5 py-2.5 emerald-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 transition-all active:scale-95"
          >
            <UserPlus size={16} /> Register New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Members', value: stats.total, icon: Users, color: 'slate' },
          { label: 'Boys', value: stats.boys, icon: Shield, color: 'blue' },
          { label: 'Girls', value: stats.girls, icon: Shield, color: 'pink' },
          { label: 'Captains', value: stats.captains, icon: GraduationCap, color: 'emerald' },
          { label: 'Vice Captains', value: stats.viceCaptains, icon: GraduationCap, color: 'indigo' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                stat.color === 'slate' ? 'bg-slate-100 text-slate-600' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'pink' ? 'bg-pink-50 text-pink-600' :
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                'bg-indigo-50 text-indigo-600'
              }`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Register Form */}
      {showRegisterForm && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-100 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Register New Member</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add to database with password = phone number</p>
              </div>
            </div>
            <button onClick={() => setShowRegisterForm(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name *</label>
                <input
                  required
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email *</label>
                <input
                  required
                  type="email"
                  placeholder="name@nitjsr.ac.in"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Reg No *</label>
                <input
                  required
                  placeholder="2024UGCS019"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                  value={formData.regNo}
                  onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phone * (= Password)</label>
                <input
                  required
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Gender *</label>
                <select
                  required
                  className={`w-full bg-slate-50 border rounded-xl py-3 px-4 text-xs font-bold outline-none cursor-pointer ${formData.gender ? 'border-slate-100' : 'border-red-200 bg-red-50/30'}`}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="" disabled>-- Select Gender --</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Designation</label>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none cursor-pointer"
                  value={formData.designation}
                  onChange={(e) => {
                    const des = e.target.value;
                    let role = 'member';
                    if (des.toLowerCase() === 'captain') role = 'captain';
                    else if (des.toLowerCase() === 'vice captain') role = 'viceCaptain';
                    setFormData({ ...formData, designation: des, role });
                  }}
                >
                  <option value="Member">Member</option>
                  <option value="Captain">Captain</option>
                  <option value="Vice Captain">Vice Captain</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Year (auto if blank)</label>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none cursor-pointer"
                  value={formData.currentYear}
                  onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                >
                  <option value="">Auto (from Reg No)</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registering}
                className="px-8 py-3 emerald-gradient text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
              >
                {registering ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {registering ? 'Registering...' : 'Register Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 relative max-w-sm">
            <input
              placeholder="Search by name, email, regNo, phone..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-11 text-sm font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold outline-none cursor-pointer"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
            <select
              className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold outline-none cursor-pointer"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="captain">Captain</option>
              <option value="viceCaptain">Vice Captain</option>
              <option value="member">Member</option>
            </select>
            <div className="bg-slate-900 px-4 py-2.5 rounded-xl text-white text-xs font-black">
              {filteredMembers.length} <span className="text-slate-400 text-[10px]">results</span>
            </div>
          </div>
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-emerald-500" />
            <span className="ml-3 text-slate-400 font-bold text-sm">Loading members from database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5">Member</th>
                  <th className="px-6 py-5">Reg No</th>
                  <th className="px-6 py-5">Phone</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Gender</th>
                  <th className="px-6 py-5">Year</th>
                  <th className="px-6 py-5 text-center">Payment</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredMembers.map(member => {
                  const isExpanded = expandedRow === member._id;
                  const isSelf = (member._id === user._id) || (member._id === user.id);
                  return (
                    <React.Fragment key={member._id}>
                      <tr
                        className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/30' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : member._id)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[1rem] bg-emerald-50 border border-slate-100 overflow-hidden flex items-center justify-center font-bold text-emerald-600 shadow-sm text-sm transition-transform group-hover:scale-105">
                              {member.avatar ? (
                                <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                              ) : (
                                member.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm tracking-tight leading-none mb-1">
                                {member.name}
                                {isSelf && <span className="ml-2 text-[9px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-black uppercase">You</span>}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400 lowercase">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{member.regNo}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-slate-500">{member.phone || '—'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getRoleBadge(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                            {member.gender}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-black text-slate-900 text-sm">{member.currentYear || '—'}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTogglePayment(member._id, member.isPaid || false, member.name); }}
                            disabled={updatingPaymentId === member._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${member.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                            title={member.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          >
                            {updatingPaymentId === member._id ? <Loader2 size={12} className="animate-spin inline" /> : (member.isPaid ? 'PAID' : 'UNPAID')}
                          </button>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : member._id); }}
                              className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-all"
                              title="View Details"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {!isSelf && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(member._id, member.name); }}
                                disabled={deletingId === member._id}
                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                title="Delete Member"
                              >
                                {deletingId === member._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                          <td colSpan={8} className="px-6 py-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
                              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100">
                                <Mail size={16} className="text-emerald-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                  <p className="text-xs font-bold text-slate-700 break-all">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100">
                                <Phone size={16} className="text-blue-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                  <p className="text-xs font-bold text-slate-700">{member.phone || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100">
                                <Hash size={16} className="text-purple-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</p>
                                  <p className="text-xs font-bold text-slate-700">{member.designation || member.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100">
                                <Calendar size={16} className="text-orange-500" />
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined</p>
                                  <p className="text-xs font-bold text-slate-700">{new Date(member.joinedAt).toLocaleDateString('en-IN')}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filteredMembers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400">
                      <Users size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-sm">No members found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
