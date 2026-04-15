import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, History, UserCheck } from 'lucide-react';
import { User, UserRole } from '@/types';

interface AttendanceRecord {
  id: string;
  _id?: string;
  date: string;
  presentCount: number;
  totalCount: number;
  supervisors: string[];
  submittedBy: string;
  lastEditedBy?: string;
  statuses: Record<string, boolean>;
  createdAt: string;
}

interface AttendanceProps {
  user: User;
  members: User[];
}

const Attendance: React.FC<AttendanceProps> = ({ user, members }) => {
  const [activeView, setActiveView] = useState<'mark' | 'register'>('mark');
  const [attendanceSelections, setAttendanceSelections] = useState<Record<string, boolean>>({});
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- DATA FETCHING ---
  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('ace_token');
      const res = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // --- LOGIC & PERMISSIONS ---
  const isLeadership = [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN].includes(user.role as UserRole);
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Normalize members to ensure they have consistent IDs
  const filteredPlayers = useMemo(() => 
    members.filter((m) => m.isInducted).map(m => ({
      ...m,
      id: m.id || m._id || ''
    })), [members]
  );

  const todaysRecord = useMemo(
    () => records.find((record) => record.date === todayStr),
    [records, todayStr]
  );

  // Sync selection state when today's record is loaded/updated
  useEffect(() => {
    if (todaysRecord) {
      setAttendanceSelections(todaysRecord.statuses);
    }
  }, [todaysRecord]);

  // --- STATS CALCULATION (DATABASE DRIVEN) ---
  const personalStats = useMemo(() => {
    const mySessions = records.filter((r) => r.statuses && r.statuses[user.id] !== undefined);
    const present = mySessions.reduce((sum, r) => sum + (r.statuses[user.id] ? 1 : 0), 0);
    return {
      count: mySessions.length,
      present,
      rate: mySessions.length ? Math.round((present / mySessions.length) * 100) : 0
    };
  }, [records, user.id]);

  const teamSummary = useMemo(() => {
    const totalSessions = records.length;
    const totalPossibleslots = totalSessions * filteredPlayers.length;
    let totalPresent = 0;
    records.forEach(r => {
      totalPresent += Object.values(r.statuses || {}).filter(Boolean).length;
    });

    return {
      totalSessions,
      avgPresence: totalPossibleslots ? Math.round((totalPresent / totalPossibleslots) * 100) : 0
    };
  }, [records, filteredPlayers.length]);

  // --- ACTIONS ---
  const toggleAttendance = (memberId: string, status: boolean) => {
    if (!isLeadership) return;
    setAttendanceSelections(prev => ({ ...prev, [memberId]: status }));
  };

  const submitAttendance = async () => {
    if (!isLeadership) return;
    if (Object.keys(attendanceSelections).length === 0) {
      alert('Please mark attendance for at least one player.');
      return;
    }

    setIsLoading(true);
    const presentCount = Object.values(attendanceSelections).filter(Boolean).length;
    
    try {
      const token = localStorage.getItem('ace_token');
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: todayStr,
          presentCount,
          totalCount: filteredPlayers.length,
          supervisors: filteredPlayers
            .filter((m) => [UserRole.CAPTAIN, UserRole.VICE_CAPTAIN].includes(m.role as UserRole))
            .map((m) => m.name),
          statuses: attendanceSelections,
        })
      });

      if (res.ok) {
        await fetchAttendanceRecords(); // Refresh all data from DB
        setActiveView('register');
        alert(todaysRecord ? 'Attendance updated.' : 'Attendance submitted.');
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Attendance Control</h2>
          <p className="text-sm text-slate-500">{isLeadership ? 'Leadership can mark roster attendance.' : 'View team history and your personal summary.'}</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.25rem] border border-slate-200 shadow-sm h-fit">
          <button
            onClick={() => setActiveView('mark')}
            className={`px-8 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'mark' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveView('register')}
            className={`px-8 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
          >
            Attendance Register
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Attendance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Total sessions</p>
              <p className="text-4xl font-black text-slate-900">{teamSummary.totalSessions}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Avg presence</p>
              <p className="text-4xl font-black text-slate-900">{teamSummary.avgPresence}%</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Your Attendance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-1">Sessions</p>
              <p className="text-2xl font-black text-slate-900">{personalStats.count}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-1">Present</p>
              <p className="text-2xl font-black text-slate-900">{personalStats.present}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-1">Rate</p>
              <p className="text-2xl font-black text-emerald-600">{personalStats.rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {activeView === 'mark' ? (
        isLeadership ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SIDEBAR CONTROLS */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Leadership Control</h3>
                </div>
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Date</p>
                  <p className="text-xl font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <button
                  onClick={submitAttendance}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${isLoading ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-200'}`}
                >
                  {isLoading ? 'Saving...' : (todaysRecord ? 'Update Records' : 'Submit Roster')}
                </button>
              </div>
            </div>

            {/* ROSTER LIST */}
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900">{player.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">{player.regNo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAttendance(player.id, true)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${attendanceSelections[player.id] === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => toggleAttendance(player.id, false)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${attendanceSelections[player.id] === false ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100">
            <UserCheck size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-black text-slate-900 uppercase tracking-tight">Only Leadership can mark attendance</p>
            <p className="text-sm text-slate-500 mt-2">Check the "Attendance Register" tab to see history.</p>
          </div>
        )
      ) : (
        /* REGISTER TABLE */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6">Turnout</th>
                  <th className="px-10 py-6">Your Status</th>
                  <th className="px-10 py-6">Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const myStatus = r.statuses[user.id];
                  return (
                    <tr key={r.id || r._id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-10 py-6 font-black text-slate-900">
                        {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-10 py-6 text-slate-500 font-bold">{r.presentCount}/{r.totalCount}</td>
                      <td className="px-10 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${myStatus === undefined ? 'bg-slate-100 text-slate-400' : myStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {myStatus === undefined ? 'N/A' : myStatus ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-xs text-slate-400 italic">{r.submittedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;