
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Activity,
  Target,
  Plus,
  Megaphone,
  Swords,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Save,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, UserRole, Match } from '@/types';



interface OverviewProps {
  user: User;
}

const DashboardOverview: React.FC<OverviewProps> = ({ user }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const currentDayNumber = today.getDate();
  const monthName = today.toLocaleString('default', { month: 'short' });
  const fullMonthName = today.toLocaleString('default', { month: 'long' });

  const [newEvent, setNewEvent] = useState({
    event: '',
    dateString: `${monthName} ${currentDayNumber}`,
    time: '04:00 PM',
    court: 'Court 1',
    dayOfMonth: currentDayNumber,
    month: currentMonth,
    year: currentYear
  });

  const [matchHistory, setMatchHistory] = useState<Match[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ace_match_history');
    if (saved) {
      try {
        setMatchHistory(JSON.parse(saved) as Match[]);
      } catch {
        setMatchHistory([]);
      }
    }

    const fetchBulletins = async () => {
      try {
        const token = localStorage.getItem('ace_token');
        const res = await fetch('/api/announcements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
    };
    
    const fetchCalendarEvents = async () => {
      try {
        const token = localStorage.getItem('ace_token');
        const res = await fetch('/api/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((e: any) => e.month === currentMonth && e.year === currentYear);
          setEvents(filtered);
        }
      } catch (err) {}
    };

    fetchBulletins();
    fetchCalendarEvents();
  }, [currentMonth, currentYear]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '< 1h';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const matchStats = useMemo(() => {
    const completedMatches = matchHistory.filter((match) => match.completed);
    const activePlayerNames = new Set<string>();
    completedMatches.forEach((match) => {
      activePlayerNames.add(match.player1Name);
      activePlayerNames.add(match.player2Name);
    });

    const userMatches = completedMatches.filter(
      (match) => match.player1Name === user.name || match.player2Name === user.name
    );
    const userWins = userMatches.filter((match) => match.winner === user.name).length;
    const userLosses = userMatches.length - userWins;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        wins: 0,
        losses: 0,
        time: date.getTime(),
      };
    });

    userMatches.forEach((match) => {
      const matchDate = new Date(match.scheduledAt || match.createdAt);
      if (Number.isNaN(matchDate.getTime())) return;
      matchDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((matchDate.getTime() - weekStart.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        if (match.winner === user.name) {
          weeklyData[diffDays].wins += 1;
        } else {
          weeklyData[diffDays].losses += 1;
        }
      }
    });

    const lastMatchDate = userMatches
      .map((match) => new Date(match.scheduledAt || match.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const recentActivity = lastMatchDate
      ? `${lastMatchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : 'No matches yet';

    return {
      completedMatchesCount: completedMatches.length,
      activePlayersCount: activePlayerNames.size,
      userWins,
      userLosses,
      userPlayed: userMatches.length,
      userWinRate: userMatches.length ? Math.round((userWins / userMatches.length) * 100) : 0,
      weeklyData,
      recentActivity,
    };
  }, [matchHistory, user.name]);

  const isAdminOrCaptain = user.role === UserRole.ADMIN || user.role === UserRole.CAPTAIN || user.role === UserRole.VICE_CAPTAIN;
  const [attendanceStatus, setAttendanceStatus] = useState({ sessions: 0, present: 0, rate: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('ace_attendance_records');
    if (!saved) return;

    const records = JSON.parse(saved) as Array<{ statuses: Record<string, boolean> }>;
    const myRecords = records.filter((record) => record.statuses[user.id] !== undefined);
    const present = myRecords.reduce((sum, record) => sum + (record.statuses[user.id] ? 1 : 0), 0);
    setAttendanceStatus({
      sessions: myRecords.length,
      present,
      rate: myRecords.length ? Math.round((present / myRecords.length) * 100) : 0,
    });
  }, [user.id]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.event.trim()) return;

    try {
      const token = localStorage.getItem('ace_token');
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        const added = await res.json();
        setEvents(prev => [...prev, added].sort((a, b) => a.dayOfMonth - b.dayOfMonth));
      }
    } catch (err) {}

    setIsAddingEvent(false);
    setNewEvent({
      event: '',
      dateString: `${monthName} ${currentDayNumber}`,
      time: '04:00 PM',
      court: 'Court 1',
      dayOfMonth: currentDayNumber,
      month: currentMonth,
      year: currentYear
    });
  };

  const removeEvent = async (id: string) => {
    try {
      const token = localStorage.getItem('ace_token');
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => (e._id || e.id) !== id));
      }
    } catch {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 emerald-gradient rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 hover:rotate-0 transition-transform">
            <Swords size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back, {user.name.split(' ')[0]}</h2>
            <p className="text-sm text-slate-500">Overview of your team's current status and recent activity.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/dashboard/matches" 
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> New Match
          </Link>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Matches Played', value: String(matchStats.completedMatchesCount), icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Players Active', value: String(matchStats.activePlayersCount), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Your Win Rate', value: `${matchStats.userWinRate}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Last Match', value: matchStats.recentActivity, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{stat.label === 'Matches Played' ? `${matchStats.completedMatchesCount > 0 ? '+12%' : '—'}` : ''}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black">Your attendance</p>
              <p className="text-xl font-black text-slate-900">{attendanceStatus.rate}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sessions</p>
              <p className="text-lg font-black text-slate-900">{attendanceStatus.sessions}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Present</p>
              <p className="text-lg font-black text-slate-900">{attendanceStatus.present}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Rate</p>
              <p className="text-lg font-black text-slate-900">{attendanceStatus.rate}%</p>
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black">Fee Status</p>
                {user.isPaid ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg">Cleared</span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg">Pending</span>
                )}
              </div>
              <p className="text-xl font-black text-slate-900 mb-2">₹100 Contribution</p>
              {user.isPaid ? (
                <p className="text-xs text-slate-500 font-bold">Thank you! Your payment has been received and verified by the admin.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">Please scan the QR code to pay your ₹100 contribution. Once paid, the admin will update your status.</p>
                </div>
              )}
            </div>
            
            {!user.isPaid ? (
              <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center p-2 shadow-inner shrink-0">
                {/* Fallback to text if image is not there */}
                <img src="/payment-qr.jpeg" alt="Payment QR" className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-[10px] font-bold text-slate-400 text-center">Place payment-qr.jpeg in public dir</span>'; }} />
              </div>
            ) : (
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 strokeWidth={3} size={48} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> Weekly Summary
            </h3>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">W/L Distribution</div>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={matchStats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="wins" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" fill="#d1fae5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2 text-sm tracking-tight">
            <Megaphone size={18} className="text-emerald-600" /> Recent Bulletins
          </h3>
          <div className="space-y-7 flex-1">
            {announcements.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-8">No recent bulletins.</div>
            ) : (
              announcements.slice(0, 5).map((item, i) => (
                <div key={item._id || i} className="group cursor-pointer">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[15px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{item.title}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{getTimeAgo(item.createdAt || item.date)}</span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-normal font-medium">{item.content}</p>
                  <div className="h-px bg-slate-100 mt-6" />
                </div>
              ))
            )}
          </div>
          <Link to="/dashboard/announcements" className="mt-8 block text-center w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[11px] font-black hover:bg-emerald-100 transition-all uppercase tracking-[0.2em] border border-emerald-100/30">
            VIEW ALL
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
