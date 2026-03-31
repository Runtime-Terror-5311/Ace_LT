
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Swords, 
  BarChart3, 
  IndianRupee, 
  Package, 
  Megaphone, 
  Settings, 
  LogOut,
  Menu,
  ClipboardCheck,
  ShieldCheck,
  Circle,
  Bell,
  Users,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { User, UserRole } from '@/types';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  pendingCount?: number;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, pendingCount = 0, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdminOrCaptain = user.role === UserRole.ADMIN || user.role === UserRole.CAPTAIN || user.role === UserRole.VICE_CAPTAIN;

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/dashboard', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN, UserRole.MEMBER] },
    { name: 'Matches', icon: Swords, path: '/dashboard/matches', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN, UserRole.MEMBER] },
    { name: 'Leaderboard', icon: BarChart3, path: '/dashboard/stats', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN, UserRole.MEMBER] },
    { name: 'Attendance', icon: ClipboardCheck, path: '/dashboard/attendance', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN] },
    { name: 'Financials', icon: IndianRupee, path: '/dashboard/financials', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN] },
    { 
      name: 'Equipment', 
      icon: Package, 
      path: '/dashboard/inventory', 
      roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN, UserRole.MEMBER],
      showBadge: isAdminOrCaptain && pendingCount > 0
    },
    { name: 'Bulletins', icon: Megaphone, path: '/dashboard/announcements', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN, UserRole.MEMBER] },
    { name: 'Registry', icon: Users, path: '/dashboard/registry', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN] },
    { name: 'Achievements', icon: Trophy, path: '/dashboard/achievements', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN] },
    { name: 'Alumni', icon: GraduationCap, path: '/dashboard/alumni', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN] },
    { name: 'Profile', icon: Settings, path: '/dashboard/settings', roles: [UserRole.ADMIN, UserRole.CAPTAIN, UserRole.VICE_CAPTAIN, UserRole.MEMBER] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-700">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-emerald-100 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 emerald-gradient rounded-lg flex items-center justify-center text-white shadow-md"><Swords size={20} /></div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">AceLawn</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${isActive(item.path) ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'}`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
                {item.showBadge && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse">{pendingCount}</span>}
                {isActive(item.path) && !item.showBadge && <Circle size={4} fill="currentColor" className="ml-auto" />}
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"><LogOut size={16} /><span>Log Out</span></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-emerald-50 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={20} className="text-slate-500" /></button>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 relative">
              {isAdminOrCaptain && (
                <div className="relative group cursor-pointer">
                  <Bell size={20} className={`text-slate-400 hover:text-emerald-600 transition-colors ${pendingCount > 0 ? 'animate-bounce' : ''}`} />
                  {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">{pendingCount}</span>}
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-widest"><ShieldCheck size={12} /> Live Portal</div>
            <div className="text-xs font-semibold text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        </header>
        <section className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
