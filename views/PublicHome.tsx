import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, ArrowRight, Camera, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Achievement, Alumni, User as UserType } from '@/types';

interface PublicHomeProps {
  achievements: Achievement[];
  alumni: Alumni[];
  members: UserType[];
}

const PublicHome: React.FC<PublicHomeProps> = ({ achievements: initialAchievements, alumni: initialAlumni, members }) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [leadership, setLeadership] = useState<{ name: string; role: string; img: string; gender: string }[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [alumni, setAlumni] = useState<Alumni[]>(initialAlumni);

  useEffect(() => {
    // Fetch achievements from database to ensure fresh data
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/achievements');
        if (response.ok) {
          const data = await response.json();
          setAchievements(data);
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
        // Fall back to props if API fails
        setAchievements(initialAchievements);
      }
    };

    fetchAchievements();
  }, [initialAchievements]);

  // Fetch alumni from database to ensure fresh data
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await fetch('/api/alumni');
        if (response.ok) {
          const data = await response.json();
          setAlumni(data);
        }
      } catch (err) {
        console.error('Error fetching alumni:', err);
        // Fall back to props if API fails
        setAlumni(initialAlumni);
      }
    };

    fetchAlumni();
  }, [initialAlumni]);

  useEffect(() => {
    if (achievements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % achievements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [achievements]);


  // Fetch leadership from database
  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        // Filter for captains and vice captains
        const leaders = users
          .filter((user: UserType) => user.role === 'captain' || user.role === 'viceCaptain')
          .map((user: UserType) => ({
            name: user.name,
            role: `${user.role === 'captain' ? 'Captain' : 'Vice Captain'} (${user.gender?.toLowerCase() === 'boys' ? 'Boys' : 'Girls'})`,
            img: user.avatar || '/avatar.png',
            gender: user.gender
          }))
          .sort((a: { name: string; role: string; img: string; gender: string }, b: { name: string; role: string; img: string; gender: string }) => {
            // Sort: Captain Boys, Captain Girls, Vice Captain Boys, Vice Captain Girls
            const priority: Record<string, number> = {
              'Captain (Boys)': 0,
              'Captain (Girls)': 1,
              'Vice Captain (Boys)': 2,
              'Vice Captain (Girls)': 3
            };
            return (priority[a.role] ?? 4) - (priority[b.role] ?? 4);
          });

        setLeadership(leaders);
      } catch (err) {
        console.error('Error fetching leadership data:', err);
      }
    };

    fetchLeadership();

    // Listen for leadership updates (e.g., when a leader changes their photo)
    const handleLeadershipUpdate = () => {
      fetchLeadership();
    };

    window.addEventListener('leadershipUpdated', handleLeadershipUpdate);
    return () => window.removeEventListener('leadershipUpdated', handleLeadershipUpdate);
  }, []);

  const triggerPracticeGlow = () => {
    setIsGlowing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsGlowing(false), 3000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };



  return (
    <div className="min-h-screen bg-white text-slate-700">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-50">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Star size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-slate-900">AceLawn</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <button onClick={() => scrollToSection('leadership')} className="hover:text-emerald-600 transition-colors outline-none">Leadership</button>
            <button onClick={triggerPracticeGlow} className="hover:text-emerald-600 transition-colors outline-none">Practice</button>
            <button onClick={() => scrollToSection('alumni')} className="hover:text-emerald-600 transition-colors outline-none">Alumni</button>
          </div>
          <Link to="/login" className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 group">
            Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-32 pb-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-8 border border-emerald-100">
            <ShieldCheck size={12} /> Official Team Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            Precision Management for <br /><span className="text-emerald-600">Lawn Tennis Excellence</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
            Where legacy meets technology. Manage matches, track attendance, and grow the team with our professional dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className={`bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-3 relative ${isGlowing ? 'animate-glow ring-4 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-105' : ''}`}>
              <Users size={22} className={isGlowing ? 'animate-bounce' : ''} /> Member Access
            </Link>
          </div>
        </div>
      </header>

      {/* Achievements Section - Same as Dashboard */}
      {achievements.length > 0 && (
        <section id="achievements" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Hall of Fame</h2>
              <p className="text-slate-500 font-medium">Celebrating the victories that defined our team legacy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((ach) => (
                <div key={ach._id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="h-48 relative overflow-hidden">
                    <img src={ach.imageUrl || '/avatar.png'} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={ach.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{new Date(ach.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-slate-900 tracking-tight text-lg mb-2">{ach.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alumni Section - Strictly DB Data */}
      <section id="alumni" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Distinguished Alumni</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">The pioneers who laid the foundations of lawn tennis excellence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumni.map((member) => (
              <div key={member._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center gap-6">
                 <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-emerald-50 shrink-0 shadow-inner">
                    {/* Updated to use DB imageUrl with local fallback */}
                    <img src={member.imageUrl || '/avatar.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={member.name} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 leading-none tracking-tight capitalize">{member.name}</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Batch of {member.batch}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter pt-1">{member.regNo}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Leadership Section - Strictly DB Data */}
      <section id="leadership" className="py-24 bg-emerald-50/20 scroll-mt-20 border-y border-emerald-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Team Leadership</h2>
            <p className="text-slate-500 font-medium">The visionaries steering the team towards competitive triumph.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {leadership.map((leader, i) => leader && (
              <div key={i} className="flex flex-col items-center group">
                <div className="relative w-52 h-52 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100 group-hover:border-emerald-500 transition-all duration-500" />
                  <img src={leader.img} className="w-full h-full object-cover rounded-full p-3 shadow-inner" alt={leader.name} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{leader.name}</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <div>&copy; 2024 AceLawn Systems. Engineering Athletic Success.</div>
            <div className="flex gap-8">
               <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Protocol</a>
               <a href="#" className="hover:text-emerald-400 transition-colors">Support Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;