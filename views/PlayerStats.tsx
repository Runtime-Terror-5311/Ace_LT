
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { User, UserRole, Match } from '@/types';

interface PlayerStatsProps {
  user: User;
  members: User[];
}

const PlayerStatsView: React.FC<PlayerStatsProps> = ({ user, members }) => {
  const [filter, setFilter] = useState<'GLOBAL' | 'BOYS' | 'GIRLS'>('GLOBAL');
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('ace_token');
        const res = await fetch('/api/matches', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMatchHistory(data);
        }
      } catch (err) {
        console.error('Failed to fetch match history:', err);
      }
    };

    fetchMatches();
  }, []);

  const statsData = useMemo(() => {
    const map = new Map<string, {
      name: string;
      played: number;
      win: number;
      loss: number;
      rate: number;
      trend: 'up' | 'down';
      gender: string;
      avatar?: string;
      rank: number;
    }>();

    members
      .forEach((member) => {
        map.set(member.name, {
          name: member.name,
          played: 0,
          win: 0,
          loss: 0,
          rate: 0,
          trend: 'up',
          gender: member.gender ? member.gender.toUpperCase() : 'GLOBAL',
          avatar: member.avatar,
          rank: 0,
        });
      });

    matchHistory.forEach((match) => {
      const player1 = map.get(match.player1Name);
      const player2 = map.get(match.player2Name);
      if (player1) {
        player1.played += 1;
        if (match.winner === player1.name) {
          player1.win += 1;
        } else {
          player1.loss += 1;
        }
      }
      if (player2) {
        player2.played += 1;
        if (match.winner === player2.name) {
          player2.win += 1;
        } else {
          player2.loss += 1;
        }
      }
    });

    const stats = Array.from(map.values()).map((stat) => ({
      ...stat,
      rate: stat.played ? Math.round((stat.win / stat.played) * 100) : 0,
      trend: stat.win >= stat.loss ? 'up' : 'down',
    }));

    stats.sort((a, b) => {
      if (b.rate !== a.rate) return b.rate - a.rate;
      if (b.win !== a.win) return b.win - a.win;
      return a.name.localeCompare(b.name);
    });

    return stats.map((stat, index) => ({ ...stat, rank: index + 1 }));
  }, [members, matchHistory]);

  const filteredPlayers = statsData.filter((p) => {
    if (filter === 'GLOBAL') return true;
    return p.gender === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Performance Index Section */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 pb-4 flex items-center justify-between">
           <h3 className="text-xl font-bold text-slate-900 tracking-tight">Performance Index</h3>
           <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
             {(['GLOBAL', 'BOYS', 'GIRLS'] as const).map((f) => (
               <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${filter === f ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-50">
              <tr>
                <th className="px-8 py-6">Pos</th>
                <th className="px-8 py-6">Player</th>
                <th className="px-8 py-6">Games</th>
                <th className="px-8 py-6">W/L Record</th>
                <th className="px-8 py-6">Success %</th>
                <th className="px-8 py-6">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
               {filteredPlayers.length > 0 ? (
                 filteredPlayers.map((p) => (
                   <tr key={p.name} className="hover:bg-slate-50/30 transition-colors">
                     <td className="px-8 py-8 font-bold text-slate-300">#{p.rank}</td>
                     <td className="px-8 py-8">
                       <div className="flex items-center gap-5">
                         <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm overflow-hidden shadow-sm">
                            {p.avatar ? (
                              <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
                            ) : (
                              p.name.charAt(0)
                            )}
                         </div>
                         <span className="font-bold text-slate-800 text-[15px]">{p.name}</span>
                       </div>
                     </td>
                     <td className="px-8 py-8 text-slate-500 font-bold text-[15px]">{p.played}</td>
                     <td className="px-8 py-8">
                       <span className="text-emerald-600 font-bold text-[15px]">{p.win}</span> <span className="text-slate-200 mx-1">/</span> <span className="text-slate-400 font-bold text-[15px]">{p.loss}</span>
                     </td>
                     <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-slate-100 h-[6px] rounded-full overflow-hidden max-w-[100px]">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.rate}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-400">{p.rate}%</span>
                        </div>
                     </td>
                     <td className="px-8 py-8">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${p.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 bg-slate-50'}`}>
                          {p.trend === 'up' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                        </div>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={6} className="px-8 py-16 text-center text-slate-400">No leaderboard data available yet. Add matches to update rankings.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Rank Records</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsView;
