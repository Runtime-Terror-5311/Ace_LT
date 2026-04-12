
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

const INITIAL_EVENTS = [
  { id: '1', date: 'Feb 15', time: '05:00 PM', event: 'Urja Quarter Finals', court: 'Court 1', dayOfMonth: 15 },
  { id: '2', date: 'Feb 18', time: '06:30 AM', event: 'Team Endurance Drills', court: 'Court 4', dayOfMonth: 18 },
  { id: '3', date: 'Feb 21', time: '04:00 PM', event: 'Inter-Hostel Round 2', court: 'Court 2', dayOfMonth: 21 },
];

interface OverviewProps {
  user: User;
}

const DashboardOverview: React.FC<OverviewProps> = ({ user }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  
  const [newEvent, setNewEvent] = useState({
    event: '',
    date: 'Feb 14',
    time: '04:00 PM',
    court: 'Court 1',
    dayOfMonth: 14
  });

  const [matchHistory, setMatchHistory] = useState<Match[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ace_match_history');
    if (!saved) return;

    try {
      setMatchHistory(JSON.parse(saved) as Match[]);
    } catch {
      setMatchHistory([]);
    }
  }, []);

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

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.event.trim()) return;

    const eventToAdd = {
      ...newEvent,
      id: Date.now().toString()
    };

    setEvents(prev => [...prev, eventToAdd].sort((a, b) => a.dayOfMonth - b.dayOfMonth));
    setIsAddingEvent(false);
    setNewEvent({
      event: '',
      date: 'Feb 14',
      time: '04:00 PM',
      court: 'Court 1',
      dayOfMonth: 14
    });
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
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
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <CalendarIcon size={16} /> Calendar
          </button>
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
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 font-bold">
                    Note: Save the image uploaded in this chat as <code className="bg-amber-100 px-1 rounded">payment-qr.jpeg</code> in the <code className="bg-amber-100 px-1 rounded">frontend/public</code> folder.
                  </p>
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
            {[
              { title: 'Training Update', time: '1h', text: 'Evening drills moved to court 4.' },
              { title: 'Match Finalized', time: '3h', text: 'Roger vs Nadal stats published.' },
              { title: 'Fees Reminder', time: '1d', text: 'Contribution window closes Sunday.' },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[15px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{item.title}</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.time}</span>
                </div>
                <p className="text-[13px] text-slate-500 leading-normal font-medium">{item.text}</p>
                <div className="h-px bg-slate-100 mt-6" />
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[11px] font-black hover:bg-emerald-100 transition-all uppercase tracking-[0.2em] border border-emerald-100/30">
            VIEW ALL
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div 
          onClick={() => setIsCalendarOpen(false)}
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100"
          >
            {/* Functional Circular Close Button - Region inside circled area acts as cross */}
            <button 
              onClick={() => {
                setIsCalendarOpen(false);
                setIsAddingEvent(false);
              }} 
              className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-full transition-all shadow-sm hover:shadow-md z-[60] active:scale-90 group"
              aria-label="Close"
            >
              <X size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <div className="flex items-center justify-between mb-8 pr-16 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 emerald-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Team Schedule</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">February 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mr-2">
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* Date Grid Mini View */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 h-fit">
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                  {['S','M','T','W','T','F','S'].map(day => (
                    <span key={day} className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: 31}).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === 14;
                    const hasEvent = events.some(e => e.dayOfMonth === day);
                    return (
                      <div 
                        key={day} 
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative cursor-pointer
                          ${isToday ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-emerald-600'}
                        `}
                      >
                        {day}
                        {hasEvent && !isToday && <div className="absolute bottom-1.5 w-1 h-1 bg-emerald-400 rounded-full" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Panel: Events List or Add Form */}
              <div className="flex flex-col min-h-[350px]">
                {!isAddingEvent ? (
                  <>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Activity size={12} className="text-emerald-500" /> Upcoming Fixtures
                    </h4>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[300px] custom-scrollbar">
                      {events.map((item) => (
                        <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all group cursor-pointer shadow-sm relative overflow-hidden">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{item.date}</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <Clock size={12} /> {item.time}
                            </div>
                          </div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{item.event}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <MapPin size={12} /> {item.court}
                            </div>
                            {isAdminOrCaptain && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeEvent(item.id); }}
                                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {events.length === 0 && (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold">No upcoming events.</p>
                        </div>
                      )}
                    </div>
                    {isAdminOrCaptain && (
                      <button 
                        onClick={() => setIsAddingEvent(true)}
                        className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                      >
                        ADD NEW EVENT
                      </button>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleAddEvent} className="space-y-4 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Plus size={12} /> Schedule New Event
                    </h4>
                    
                    <div className="space-y-3 flex-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                        <input 
                          autoFocus
                          required
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                          value={newEvent.event}
                          onChange={(e) => setNewEvent({...newEvent, event: e.target.value})}
                          placeholder="e.g. Training Drills"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day of Feb</label>
                          <input 
                            type="number"
                            min="1"
                            max="31"
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                            value={newEvent.dayOfMonth}
                            onChange={(e) => {
                              const day = parseInt(e.target.value) || 1;
                              setNewEvent({...newEvent, dayOfMonth: day, date: `Feb ${day}`});
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                          <input 
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                            placeholder="05:00 PM"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none cursor-pointer"
                          value={newEvent.court}
                          onChange={(e) => setNewEvent({...newEvent, court: e.target.value})}
                        >
                          <option value="Court 1">Court 1</option>
                          <option value="Court 2">Court 2</option>
                          <option value="Court 3">Court 3</option>
                          <option value="Court 4">Court 4</option>
                          <option value="Main Arena">Main Arena</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                      <button 
                        type="button"
                        onClick={() => setIsAddingEvent(false)}
                        className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Save size={14} /> Confirm
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
