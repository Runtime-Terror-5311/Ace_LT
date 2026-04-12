import React, { useState, useMemo, useEffect } from 'react';
import { Swords, Trophy, History, Coins, RotateCcw, Zap, Activity, Calendar, Play, Settings2, Search, CheckCircle, FileDown, LayoutList, Undo2 } from 'lucide-react';
import { User, UserRole, MatchType, Match, GameScore } from '@/types';

const TENNIS_POINTS = ['0', '15', '30', '40', 'AD'];

interface MatchState {
  score: { p1: number; p2: number; games1: number; games2: number; sets1: number; sets2: number };
  setScores: string[];
  gameHistory: GameScore[];
  currentServer: string;
  isMatchOver: boolean;
}

const MatchManager: React.FC<{ user: User; members: User[] }> = ({ user, members }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'umpire-sheet'>('create');
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [selectedMatchForSheet, setSelectedMatchForSheet] = useState<Match | null>(null);

  const [matchHistory, setMatchHistory] = useState<Match[]>(() => {
    const saved = localStorage.getItem('ace_match_history');
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as Match[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ace_match_history', JSON.stringify(matchHistory));
  }, [matchHistory]);

  const eligiblePlayers = useMemo(
    () => members.filter((member) => member.isInducted && member.role !== UserRole.ADMIN),
    [members]
  );

  const [config, setConfig] = useState({
    p1Name: eligiblePlayers[0]?.name || '',
    p2Name: eligiblePlayers[1]?.name || eligiblePlayers[0]?.name || '',
    type: MatchType.RANDOM,
    gamesToWin: 5,
    setsToWin: 1,
    date: new Date().toISOString().slice(0, 10),
    court: 'Main Court',
  });

  useEffect(() => {
    if (eligiblePlayers.length === 0) return;
    setConfig((prev) => {
      const defaultP1 = prev.p1Name && eligiblePlayers.some((m) => m.name === prev.p1Name) ? prev.p1Name : eligiblePlayers[0].name;
      const defaultP2 = prev.p2Name && eligiblePlayers.some((m) => m.name === prev.p2Name) ? prev.p2Name : eligiblePlayers.find((m) => m.name !== defaultP1)?.name || '';
      return {
        ...prev,
        p1Name: defaultP1,
        p2Name: defaultP1 === defaultP2 ? eligiblePlayers.find((m) => m.name !== defaultP1)?.name || '' : defaultP2,
      };
    });
  }, [eligiblePlayers]);

  const [score, setScore] = useState({ p1: 0, p2: 0, games1: 0, games2: 0, sets1: 0, sets2: 0 });
  const [setScores, setSetScores] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<GameScore[]>([]);
  const [historyStack, setHistoryStack] = useState<MatchState[]>([]);
  
  const [tossResult, setTossResult] = useState<{ winner: string; choice: 'serve' | 'side' | null } | null>(null);
  const [isTossing, setIsTossing] = useState(false);
  const [showTossChoice, setShowTossChoice] = useState(false);
  const [currentServer, setCurrentServer] = useState<string>('');

  const selectedPlayer1 = eligiblePlayers.find((member) => member.name === config.p1Name);
  const selectedPlayer2 = eligiblePlayers.find((member) => member.name === config.p2Name);

  const arePlayersSelected = Boolean(config.p1Name && config.p2Name && config.p1Name !== config.p2Name);
  const canFlipToss = arePlayersSelected;
  const canStartMatch = Boolean(tossResult?.choice && arePlayersSelected);

  const handleToss = () => {
    if (!canFlipToss) return;
    setIsTossing(true);
    setTossResult(null);
    setCurrentServer('');
    setTimeout(() => {
      const winner = Math.random() < 0.5 ? config.p1Name : config.p2Name;
      setTossResult({ winner, choice: null });
      setIsTossing(false);
      setShowTossChoice(true);
    }, 800);
  };

  const handleTossChoice = (choice: 'serve' | 'side') => {
    if (!tossResult) return;
    setTossResult({ ...tossResult, choice });
    setShowTossChoice(false);

    if (choice === 'serve') {
      setCurrentServer(tossResult.winner);
    } else {
      setCurrentServer(tossResult.winner === config.p1Name ? config.p2Name : config.p1Name);
    }
  };

  const startMatch = () => {
    if (!tossResult || !tossResult.choice) {
      alert('Please complete the toss and choice first.');
      return;
    }
    setIsMatchStarted(true);
    setIsMatchOver(false);
    setScore({ p1: 0, p2: 0, games1: 0, games2: 0, sets1: 0, sets2: 0 });
    setSetScores([]);
    setGameHistory([]);
    setHistoryStack([]);
  };

  const undoMove = () => {
    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setScore(lastState.score);
    setSetScores(lastState.setScores);
    setGameHistory(lastState.gameHistory);
    setCurrentServer(lastState.currentServer);
    setIsMatchOver(lastState.isMatchOver);
    setHistoryStack(prev => prev.slice(0, -1));
  };

  const scorePoint = (player: 'p1' | 'p2') => {
    if (isMatchOver) return;

    // Snapshot current state for undo
    const snapshot: MatchState = {
      score: { ...score },
      setScores: [...setScores],
      gameHistory: [...gameHistory],
      currentServer,
      isMatchOver
    };
    setHistoryStack(prev => [...prev, snapshot]);

    const opp = player === 'p1' ? 'p2' : 'p1';
    let newScore = { ...score };

    if (newScore[player] === 3 && newScore[opp] === 3) {
      newScore[player] = 4; // AD
    } else if (newScore[opp] === 4) {
      newScore[opp] = 3; // Back to Deuce
    } else if (newScore[player] >= 3) {
      const gameOutcome = `${TENNIS_POINTS[newScore.p1]}-${TENNIS_POINTS[newScore.p2]}`;
      setGameHistory(prev => [...prev, {
        gameNumber: prev.length + 1,
        serverInitials: currentServer,
        score: gameOutcome
      }]);

      setCurrentServer(currentServer === config.p1Name ? config.p2Name : config.p1Name);

      newScore.p1 = 0;
      newScore.p2 = 0;
      const gameKey = player === 'p1' ? 'games1' : 'games2';
      newScore[gameKey]++;
      
      const p1G = newScore.games1;
      const p2G = newScore.games2;
      
      if (p1G >= config.gamesToWin || p2G >= config.gamesToWin) {
          if (Math.abs(p1G - p2G) >= 1) {
             const setWinner = p1G > p2G ? '1' : '2';
             const setKey = `sets${setWinner}` as 'sets1' | 'sets2';
             newScore[setKey]++;
             setSetScores(prev => [...prev, `${p1G}-${p2G}`]);
             newScore.games1 = 0;
             newScore.games2 = 0;
             if (newScore.sets1 >= config.setsToWin || newScore.sets2 >= config.setsToWin) {
               setIsMatchOver(true);
             }
          }
      }
    } else {
      newScore[player]++;
    }
    setScore(newScore);
  };

  const saveAndSyncStats = () => {
    const winnerName = score.sets1 > score.sets2 ? config.p1Name : config.p2Name;
    const winnerId = score.sets1 > score.sets2 ? selectedPlayer1?.id : selectedPlayer2?.id;
    const newHistoryItem: Match = {
      id: `h${Date.now()}`,
      player1Id: selectedPlayer1?.id || '',
      player2Id: selectedPlayer2?.id || '',
      player1Name: config.p1Name,
      player2Name: config.p2Name,
      score1: String(score.sets1),
      score2: String(score.sets2),
      winnerId: winnerId,
      winner: winnerName,
      type: config.type,
      court: config.court,
      gameHistory: [...gameHistory],
      scheduledAt: config.date,
      completed: true,
      createdAt: new Date().toISOString(),
    };

    setMatchHistory(prev => [newHistoryItem, ...prev]);
    setIsMatchStarted(false);
    setIsMatchOver(false);
    setActiveTab('history');
  };

  const downloadPDF = () => {
    window.print();
  };

  const openUmpireSheet = (match: any) => {
    setSelectedMatchForSheet(match);
    setActiveTab('umpire-sheet');
  };

  const getPagedGames = () => {
    if (!selectedMatchForSheet) return [];
    const history = selectedMatchForSheet.gameHistory || [];
    const pages = [];
    const totalGames = Math.max(history.length, 15);
    for (let i = 0; i < totalGames; i += 15) {
      pages.push(history.slice(i, i + 15));
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .page-break { page-break-after: always; }
          #root { padding: 0 !important; }
          main { overflow: visible !important; }
        }
      `}</style>

      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Match Center</h2>
          <p className="text-sm text-slate-500">
            {activeTab === 'umpire-sheet' ? 'Official Umpire Score Sheet' : (isMatchStarted ? (isMatchOver ? 'Match Concluded' : 'Recording live performance...') : 'Track and manage competitive tennis fixtures.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
            {activeTab === 'umpire-sheet' && (
                <button 
                  onClick={downloadPDF}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-emerald-700 flex items-center gap-2 transition-all"
                >
                  <FileDown size={14} /> Download PDF
                </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
              <Activity size={12} /> Live Portal
            </div>
            <div className="text-xs font-semibold text-slate-500 mr-2">
              Feb 13
            </div>
        </div>
      </div>

      <div className="flex bg-white/50 p-1 rounded-2xl border border-slate-200 w-fit mb-4 print:hidden">
          {(['create', 'history'] as const).map(tab => (
              <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'create' && (
        <div className="max-w-5xl mx-auto w-full print:hidden">
          {!isMatchStarted ? (
            <div className="bg-white rounded-[1rem] border border-slate-200 shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Settings2 size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Pre-Match Configuration</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Tournament Setup</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Player 1</label>
                    <select
                      value={config.p1Name}
                      onChange={(e) => {
                        setConfig((prev) => {
                          const updatedP1 = e.target.value;
                          const updatedP2 = prev.p2Name === updatedP1
                            ? eligiblePlayers.find((member) => member.name !== updatedP1)?.name || ''
                            : prev.p2Name;
                          return {
                            ...prev,
                            p1Name: updatedP1,
                            p2Name: updatedP2,
                          };
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold outline-none cursor-pointer"
                    >
                      {eligiblePlayers
                        .filter((member) => member.name !== config.p2Name)
                        .map((member) => (
                          <option key={`${member.id}-${member.name}`} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Player 2</label>
                    <select
                      value={config.p2Name}
                      onChange={(e) => {
                        setConfig((prev) => {
                          const updatedP2 = e.target.value;
                          const updatedP1 = prev.p1Name === updatedP2
                            ? eligiblePlayers.find((member) => member.name !== updatedP2)?.name || ''
                            : prev.p1Name;
                          return {
                            ...prev,
                            p2Name: updatedP2,
                            p1Name: updatedP1,
                          };
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold outline-none cursor-pointer"
                    >
                      {eligiblePlayers
                        .filter((member) => member.name !== config.p1Name)
                        .map((member) => (
                          <option key={`${member.id}-${member.name}`} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Match Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold outline-none"
                      value={config.date}
                      onChange={(e) => setConfig({ ...config, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-50"><Coins size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Coin Toss</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{tossResult ? `Winner: ${tossResult.winner}` : 'Flip to decide'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleToss}
                          disabled={!canFlipToss || isTossing}
                          className="bg-white text-emerald-600 border border-emerald-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {tossResult ? (isTossing ? '...' : 'Re-Toss') : (isTossing ? '...' : 'Flip')}
                        </button>
                        {tossResult?.winner && (
                          <div className="px-6 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span>Toss winner:</span> <span className="font-bold text-slate-900">{tossResult.winner}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {showTossChoice && tossResult && (
                      <div className="space-y-3 animate-in fade-in">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Option:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleTossChoice('serve')} className="bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Serve</button>
                          <button onClick={() => handleTossChoice('side')} className="bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Side</button>
                        </div>
                      </div>
                    )}
                    {tossResult?.choice && (
                      <div className="flex items-center gap-2 text-emerald-700 font-black text-[10px] uppercase tracking-widest mt-2">
                        <CheckCircle size={14} /> {tossResult.winner} chose {tossResult.choice.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fixture Category</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold appearance-none cursor-pointer" value={config.type} onChange={(e) => setConfig({...config, type: e.target.value as MatchType})}>
                      {Object.values(MatchType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Court Number / Name</label>
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold outline-none" value={config.court} onChange={(e) => setConfig({...config, court: e.target.value})} placeholder="e.g. Court 1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Games / Set</label>
                      <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold outline-none" value={config.gamesToWin} onChange={(e) => setConfig({...config, gamesToWin: parseInt(e.target.value) || 5})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Sets to Win</label>
                      <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-slate-900 font-bold outline-none" value={config.setsToWin} onChange={(e) => setConfig({...config, setsToWin: parseInt(e.target.value) || 1})} />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={startMatch}
                disabled={!canStartMatch}
                className="w-full mt-10 py-5 emerald-gradient text-white rounded-[1rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:opacity-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
              >
                <Play size={20} fill="currentColor" /> Initialize Scoreboard
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[1rem] border border-slate-200 shadow-2xl p-10 animate-in zoom-in-95 duration-300">
              {isMatchOver ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><Trophy size={40} /></div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Match Winner</h3>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-8">{score.sets1 > score.sets2 ? config.p1Name : config.p2Name}</h2>
                  <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-8 mb-10 border border-slate-100">
                    <div className="grid grid-cols-2 gap-8">
                       <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2">{config.p1Name}</p><div className="text-3xl font-black text-slate-900">{score.sets1} <span className="text-xs text-slate-400 uppercase">Sets</span></div></div>
                       <div><p className="text-[10px] font-black text-slate-400 uppercase mb-2">{config.p2Name}</p><div className="text-3xl font-black text-slate-900">{score.sets2} <span className="text-xs text-slate-400 uppercase">Sets</span></div></div>
                    </div>
                  </div>
                  <div className="flex gap-4 max-w-md mx-auto">
                    <button onClick={saveAndSyncStats} className="flex-1 py-4 emerald-gradient text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"><CheckCircle size={18} /> Finish Match</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 emerald-gradient rounded-xl flex items-center justify-center text-white shadow-lg"><Activity size={20} /></div>
                       <div>
                         <h3 className="font-bold text-slate-900 tracking-tight uppercase text-sm sm:text-base">Live Umpiring</h3>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{config.court} • Serving: {currentServer}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={undoMove} 
                          disabled={historyStack.length === 0}
                          title="Undo last point"
                          className="p-3 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Undo2 size={20} />
                        </button>
                        <button 
                          onClick={() => setIsMatchStarted(false)} 
                          title="Reset match"
                          className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all"
                        >
                          <RotateCcw size={20} />
                        </button>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16 relative">
                    <div className="text-center group">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center justify-center gap-2">
                        Player One {currentServer === config.p1Name && <span className="text-yellow-500">🎾</span>}
                      </p>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">{config.p1Name}</h4>
                      <div className="text-8xl sm:text-[120px] font-black text-slate-900 leading-none mb-6 sm:mb-10 tabular-nums tracking-tighter group-hover:text-emerald-600 transition-colors">{TENNIS_POINTS[score.p1]}</div>
                      <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-10 text-[10px] font-black uppercase text-slate-400">
                        <div className="bg-slate-50 px-3 sm:px-4 py-2 rounded-xl">Games: <span className="text-emerald-600">{score.games1}</span></div>
                        <div className="bg-slate-50 px-3 sm:px-4 py-2 rounded-xl">Sets: <span className="text-emerald-600">{score.sets1}</span></div>
                      </div>
                      <button onClick={() => scorePoint('p1')} className="w-full py-5 bg-emerald-600 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Point P1</button>
                    </div>
                    <div className="text-center group">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center justify-center gap-2">
                        Player Two {currentServer === config.p2Name && <span className="text-yellow-500">🎾</span>}
                      </p>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">{config.p2Name}</h4>
                      <div className="text-8xl sm:text-[120px] font-black text-slate-900 leading-none mb-6 sm:mb-10 tabular-nums tracking-tighter group-hover:text-emerald-600 transition-colors">{TENNIS_POINTS[score.p2]}</div>
                      <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-10 text-[10px] font-black uppercase text-slate-400">
                        <div className="bg-slate-50 px-3 sm:px-4 py-2 rounded-xl">Games: <span className="text-emerald-600">{score.games2}</span></div>
                        <div className="bg-slate-50 px-3 sm:px-4 py-2 rounded-xl">Sets: <span className="text-emerald-600">{score.sets2}</span></div>
                      </div>
                      <button onClick={() => scorePoint('p2')} className="w-full py-5 bg-emerald-600 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Point P2</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 print:hidden">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Match Registry</h3>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg"><Calendar size={18} /></button>
                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg"><Search size={18} /></button>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                 <tr>
                   <th className="px-10 py-5">Fixture</th>
                   <th className="px-10 py-5">Sets Won</th>
                   <th className="px-10 py-5">Match Winner</th>
                   <th className="px-10 py-5">Event</th>
                   <th className="px-10 py-5">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                 {matchHistory.map((m) => (
                   <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><Swords size={18} /></div>
                          <span className="font-bold text-slate-800 tracking-tight">{m.player1Name} vs {m.player2Name}</span>
                       </div>
                     </td>
                     <td className="px-10 py-8">
                       <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-emerald-600 font-bold shadow-sm">{(m as any).score ?? `${m.score1}-${m.score2}`}</span>
                     </td>
                     <td className="px-10 py-8">
                       <div className="flex items-center gap-2">
                         <Trophy size={14} className="text-amber-500" />
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">{m.winner}</span>
                       </div>
                     </td>
                     <td className="px-10 py-8"><span className="text-xs font-bold text-slate-500">{m.type}</span></td>
                     <td className="px-10 py-8">
                        <button 
                            onClick={() => openUmpireSheet(m)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-xl transition-all"
                        >
                            <LayoutList size={14} /> View Sheet
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'umpire-sheet' && selectedMatchForSheet && (
        <div className="max-w-4xl mx-auto space-y-8">
          {getPagedGames().map((pageGames, pageIdx) => (
            <div key={pageIdx} className={`bg-white p-12 rounded-[2rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500 print:shadow-none print:p-8 print:max-w-none print:w-full ${pageIdx < getPagedGames().length - 1 ? 'page-break' : ''}`}>
              <div className="text-center mb-10">
                  <h1 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-900 mb-2">Umpire Score Sheet</h1>
                  <div className="h-1 w-24 bg-emerald-600 mx-auto rounded-full" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-4 tracking-widest">Page {pageIdx + 1} of {getPagedGames().length}</p>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-12 text-sm">
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tournament</p>
                      <p className="font-bold text-slate-900">{selectedMatchForSheet.type}</p>
                  </div>
                  <div className="space-y-1 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="font-bold text-slate-900">{selectedMatchForSheet.scheduledAt || (selectedMatchForSheet as any).date || 'N/A'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Court</p>
                      <p className="font-bold text-slate-900">{selectedMatchForSheet.court || 'N/A'}</p>
                  </div>
              </div>

              <div className="grid grid-cols-2 border-y border-slate-200 py-6 mb-12">
                  <div className="border-r border-slate-100 px-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Player One</p>
                      <p className="text-xl font-black text-slate-900">{selectedMatchForSheet.player1Name}</p>
                      <div className="mt-4 flex gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Sets Won:</span>
                          {[1,2,3,4,5,6,7,8].map(n => (
                              <span key={n} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${Number(selectedMatchForSheet.score1) >= n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>{n}</span>
                          ))}
                      </div>
                  </div>
                  <div className="px-8 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Player Two</p>
                      <p className="text-xl font-black text-slate-900">{selectedMatchForSheet.player2Name}</p>
                      <div className="mt-4 flex gap-2 justify-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Sets Won:</span>
                          {[1,2,3,4,5,6,7,8].map(n => (
                              <span key={n} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${Number(selectedMatchForSheet.score2) >= n ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>{n}</span>
                          ))}
                      </div>
                  </div>
              </div>

              <table className="w-full border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Game</th>
                          <th className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Server's Name</th>
                          <th className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Game Score Summary</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {Array.from({length: 15}).map((_, i) => {
                          const history = pageGames[i];
                          const actualGameNumber = (pageIdx * 15) + (i + 1);
                          return (
                              <tr key={i} className="hover:bg-slate-50/50">
                                  <td className="border border-slate-200 px-6 py-4 text-center font-bold text-slate-900">{actualGameNumber}</td>
                                  <td className="border border-slate-200 px-6 py-4 text-center font-mono font-bold text-emerald-600 tracking-widest uppercase">
                                    {history?.serverInitials || '—'}
                                  </td>
                                  <td className="border border-slate-200 px-6 py-4 text-center font-mono font-black text-slate-800 tracking-tighter text-lg">
                                    {history?.score || '—'}
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>

              {pageIdx === getPagedGames().length - 1 && (
                <div className="mt-12 flex items-center justify-between pt-10 border-t border-slate-200">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Umpire Signature</p>
                        <div className="h-12 w-48 border-b-2 border-slate-200 italic text-slate-400 flex items-end pb-1 px-2">____________________</div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match Conclusion</p>
                        <p className="text-sm font-bold text-slate-900">Winner: {selectedMatchForSheet.winner}</p>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchManager;