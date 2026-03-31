
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Star, GraduationCap, ChevronRight, ShieldCheck, ArrowRight, Camera, ChevronLeft, Phone } from 'lucide-react';
import { Achievement, Alumni, User as UserType, UserRole } from '@/types';

interface PublicHomeProps {
  achievements: Achievement[];
  alumni: Alumni[];
  members: UserType[];
}

const PublicHome: React.FC<PublicHomeProps> = ({ achievements, alumni, members }) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % achievements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [achievements]);

  const triggerPracticeGlow = () => {
    setIsGlowing(true);
    // Smooth scroll to hero to see the glow
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsGlowing(false), 3000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
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

  // Derive leadership from the members registry
  const getLeader = (role: UserRole, gender: 'boys' | 'girls') => {
    const member = members.find(m => m.role === role && m.gender === gender);
    if (member) {
      return {
        name: member.name,
        role: `${role.charAt(0).toUpperCase() + role.slice(1)} (${gender.charAt(0).toUpperCase() + gender.slice(1)})`,
        img: member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
      };
    }
    return null;
  };

  const leadership = [
    getLeader(UserRole.CAPTAIN, 'boys'),
    getLeader(UserRole.CAPTAIN, 'girls'),
    getLeader(UserRole.VICE_CAPTAIN, 'boys'),
    getLeader(UserRole.VICE_CAPTAIN, 'girls'),
  ].filter(Boolean);

  const galleryImages = [
    'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1554068865-24bccd4e3d77?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1531315630201-bb15b9966a1c?auto=format&fit=crop&q=80&w=600',
  ];

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
            <button 
              onClick={() => scrollToSection('leadership')} 
              className="hover:text-emerald-600 transition-colors outline-none"
            >
              Leadership
            </button>
            <button 
              onClick={triggerPracticeGlow} 
              className="hover:text-emerald-600 transition-colors outline-none"
            >
              Practice
            </button>
            <button 
              onClick={() => scrollToSection('gallery')} 
              className="hover:text-emerald-600 transition-colors outline-none"
            >
              Photos
            </button>
            <button 
              onClick={() => scrollToSection('alumni')} 
              className="hover:text-emerald-600 transition-colors outline-none"
            >
              Alumni
            </button>
          </div>
          <Link 
            to="/login" 
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 group"
          >
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
            <Link 
              to="/login" 
              className={`bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-3 relative ${isGlowing ? 'animate-glow ring-4 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-105' : ''}`}
            >
              <Users size={22} className={isGlowing ? 'animate-bounce' : ''} /> Member Access
            </Link>
          </div>
        </div>
      </header>

      {/* Achievements Slideshow */}
      {achievements.length > 0 && (
        <section className="py-24 bg-white overflow-hidden relative">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Hall of Fame</h2>
                <p className="text-slate-500 font-medium">Celebrating the victories that defined our team legacy.</p>
              </div>

              <div className="relative h-[400px] md:h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-900 border-8 border-white">
                {achievements.map((ach, idx) => (
                  <div 
                    key={ach.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                  >
                    <img src={ach.imageUrl} className="w-full h-full object-cover opacity-70" alt={ach.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-16 text-white max-w-3xl">
                       <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-4 drop-shadow-md">{new Date(ach.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</p>
                       <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none drop-shadow-xl">{ach.title}</h3>
                       <p className="text-xl text-slate-200 font-medium leading-relaxed drop-shadow-lg">{ach.description}</p>
                    </div>
                  </div>
                ))}
                
                {/* Dots */}
                <div className="absolute bottom-12 right-16 flex gap-4">
                   {achievements.map((_, idx) => (
                     <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-emerald-500 w-12' : 'bg-white/20 hover:bg-white/50'}`}
                     />
                   ))}
                </div>

                <button 
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + achievements.length) % achievements.length)}
                  className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-2xl"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % achievements.length)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-2xl"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
           </div>
        </section>
      )}

      {/* Alumni Section */}
      <section id="alumni" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Distinguished Alumni</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">The pioneers who laid the foundations of lawn tennis excellence at our institution.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumni.map((member) => (
              <div key={member.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center gap-6">
                 <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-emerald-50 shrink-0 shadow-inner">
                    <img src={member.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={member.name} />
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

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">On the Court</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">Capturing the intensity, discipline, and passion of our daily practice sessions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-[2.5rem] group relative shadow-md">
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Practice" />
                <div className="absolute inset-0 bg-emerald-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30">
                    <Camera size={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="py-24 bg-emerald-50/20 scroll-mt-20 border-y border-emerald-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Team Leadership</h2>
            <p className="text-slate-500 font-medium">The visionaries steering the team towards competitive triumph.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {leadership.map((leader, i) => (
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
