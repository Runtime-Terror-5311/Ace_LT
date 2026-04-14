import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, History, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import { User, UserRole } from '@/types';

interface AttendanceRecord {
  id: string;
  date: string;
  presentCount: number;
  totalCount: number;
  supervisors: string[];
  submittedBy: string;
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

  const normalizedMembers = useMemo(() => {
    return members.map((member) => ({
      ...member,
      id: (member as any).id || (member as any)._id || Math.random().toString(36).slice(2),
    }));
  }, [members]);

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

  const isAdmin = user.role === UserRole.ADMIN;
  const isCaptain = user.role === UserRole.CAPTAIN;
  const isViceCaptain = user.role === UserRole.VICE_CAPTAIN;
  const isLeadership = isAdmin || isCaptain || isViceCaptain;
  
  const canMarkAttendance = isLeadership;
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredPlayers = normalizedMembers.filter((member) => member.isInducted);

  const todaysRecord = useMemo(
    () => records.find((record) => record.date === todayStr),
    [records, todayStr]
  );

  // Load today's selections if record exists (for editing)
  useEffect(() => {
    if (todaysRecord) {
      setAttendanceSelections(todaysRecord.statuses);
    }
  }, [todaysRecord]);

  const myRecords = useMemo(
    () => records.filter((record) => record.statuses[user.id] !== undefined),
    [records, user.id]
  );

  // Attendance Register is now visible to everyone
  const visibleRecords = records;

  const myAttendanceCount = useMemo(() => {
    const present = myRecords.reduce((sum, record) => sum + (record.statuses[user.id] ? 1 : 0), 0);
    return { present, total: myRecords.length };
  }, [myRecords, user.id]);

  const attendanceSummary = useMemo(() => {
    const totalSessions = records.length;
    let totalPresent = 0;
    records.forEach(record => {
        totalPresent += Object.values(record.statuses).filter(Boolean).length;
    });
    
    return {
      totalSessions,
      averagePercentage: (totalSessions && filteredPlayers.length) ? Math.round((totalPresent / (filteredPlayers.length * totalSessions)) * 100) : 0,
    };
  }, [records, filteredPlayers.length]);

  const toggleAttendance = (memberId: string, status: boolean) => {
    if (!canMarkAttendance) return;
    setAttendanceSelections((prev) => ({ ...prev, [memberId]: status }));
  };

  const submitAttendance = async () => {
    if (!canMarkAttendance) return;

    const selectedCount = Object.keys(attendanceSelections).length;
    if (selectedCount === 0) {
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
          supervisors: normalizedMembers
            .filter((member) => member.role === UserRole.CAPTAIN || member.role === UserRole.VICE_CAPTAIN)
            .map((member) => member.name),
          submittedBy: user.name,
          statuses: attendanceSelections,
        })
      });

      if (res.ok) {
        const savedRecord = await res.json();
        // Update local state by replacing or adding
        setRecords(prev => {
           const exists = prev.findIndex(r => r.date === todayStr);
           if (exists > -1) {
             const newArr = [...prev];
             newArr[exists] = savedRecord;
             return newArr;
           }
           return [savedRecord, ...prev];
        });
        setActiveView('register');
        alert(todaysRecord ? 'Attendance updated successfully.' : 'Attendance submitted successfully.');
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.message}`);
      }
    } catch (err) {
      console.error('Attendance submit error:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Attendance Control</h2>
          <p className="text-sm text-slate-500">{canMarkAttendance ? 'Leadership can mark roster attendance for the team.' : 'View team attendance history and your personal summary.'}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Attendance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Total sessions</p>
              <p className="text-4xl font-black text-slate-900">{attendanceSummary.totalSessions}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Average presence</p>
              <p className="text-4xl font-black text-slate-900">{attendanceSummary.averagePercentage}%</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Players tracked</p>
              <p className="text-4xl font-black text-slate-900">{filteredPlayers.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Today submitted</p>
              <p className="text-4xl font-black text-slate-900">{todaysRecord ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Your Attendance</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-[2rem] bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Sessions recorded</p>
              <p className="text-3xl font-black text-slate-900">{myRecords.length}</p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Present count</p>
              <p className="text-3xl font-black text-slate-900">{myAttendanceCount.present}</p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black mb-2">Attendance rate</p>
              <p className="text-3xl font-black text-slate-900">{myAttendanceCount.total ? Math.round((myAttendanceCount.present / myAttendanceCount.total) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {activeView === 'mark' ? (
        canMarkAttendance ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Leadership Control</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Admins, Captains, and Vice-Captains can mark attendance for the team roster.</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Current session</p>
                    <p className="text-2xl font-black text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${todaysRecord ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {todaysRecord ? 'Submitted' : 'Pending'}
                  </div>
                </div>
                
                {todaysRecord && (
                  <div className="mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                     <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Status Summary</p>
                     <p className="text-xs text-emerald-600 font-bold">
                        Submitted by: {todaysRecord.submittedBy}
                        {todaysRecord.lastEditedBy && todaysRecord.lastEditedBy !== todaysRecord.submittedBy && ` • Edited by: ${todaysRecord.lastEditedBy}`}
                     </p>
                  </div>
                )}

                <button
                  onClick={submitAttendance}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${isLoading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  {isLoading ? 'Saving...' : (todaysRecord ? 'Update Attendance' : 'Submit Attendance')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Roster</h3>
                <p className="text-sm text-slate-500 mt-2">Mark each player's presence for today.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{player.name}</p>
                      <p className="text-xs uppercase tracking-widest text-slate-400">{player.regNo} • Year {player.currentYear ?? 'N/A'}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => toggleAttendance(player.id, true)}
                        className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${attendanceSelections[player.id] === true ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => toggleAttendance(player.id, false)}
                        className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${attendanceSelections[player.id] === false ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
                {filteredPlayers.length === 0 && (
                  <div className="p-32 text-center">
                    <UserCheck size={64} className="text-slate-100 mx-auto mb-6" />
                    <p className="text-slate-400 font-black text-xl uppercase tracking-tight">No active registered players yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400 font-black">Attendance access</p>
                <p className="text-lg font-black text-slate-900">Only leadership can mark team attendance.</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Your attendance overview is visible here, but only administrators or captains can update the team roster attendance.</p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3"><History size={24} className="text-emerald-600" /> Attendance Register</h3>
                <p className="text-sm text-slate-500 mt-2">Team-wide session history for the current roster.</p>
              </div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400 font-black">{visibleRecords.length} sessions</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                <tr>
                  <th className="px-12 py-6">Date</th>
                  <th className="px-12 py-6">Present</th>
                  <th className="px-12 py-6">Total</th>
                  <th className="px-12 py-6">Supervisors</th>
                  <th className="px-12 py-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {visibleRecords.map((record) => {
                  const myStatus = record.statuses[user.id];
                  const statusLabel = isLeadership ? `${record.presentCount}/${record.totalCount}` : (myStatus === undefined ? 'N/A' : myStatus ? 'Present' : 'Absent');
                  const statusClass = isLeadership ? 'bg-slate-100 text-slate-500' : (myStatus === undefined ? 'bg-slate-50 text-slate-300' : myStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700');
                  
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-12 py-8">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-slate-900">{new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                             By: {record.submittedBy}
                             {record.lastEditedBy && record.lastEditedBy !== record.submittedBy && <span className="text-emerald-500"> (Edited by {record.lastEditedBy})</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-8">{record.presentCount}</td>
                      <td className="px-12 py-8">{record.totalCount}</td>
                      <td className="px-12 py-8 text-xs font-bold text-slate-500">{record.supervisors && record.supervisors.length > 0 ? record.supervisors.join(', ') : 'None'}</td>
                      <td className="px-12 py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${statusClass}`}>
                          {statusLabel}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-12 py-16 text-center text-slate-400">No attendance records available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
