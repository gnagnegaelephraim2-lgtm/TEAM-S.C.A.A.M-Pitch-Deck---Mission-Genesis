
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Users, 
  TrendingUp, 
  Cpu, 
  Gamepad2, 
  ShieldAlert,
  Rocket,
  MessageSquare,
  Sparkles,
  Info,
  Play,
  Loader2,
  Video,
  Database,
  Lock,
  Zap,
  Terminal,
  ExternalLink,
  Mail,
  ClipboardCheck,
  Globe,
  CreditCard,
  Layers,
  Map,
  BookOpen,
  Trophy,
  History,
  Presentation,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { askPitchAssistant } from './geminiService';

// --- HUD & Overlay Components ---

const MissionHUD = ({ phase, progress }: { phase: string, progress: number }) => (
  <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
    <div className="flex items-center gap-4 bg-slate-900/80 border border-blue-500/30 px-6 py-2 rounded-full backdrop-blur-md">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="font-orbitron text-[10px] tracking-widest text-blue-400 font-bold uppercase">
        OP_LOG://{phase.replace(/\s+/g, '_')}
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-1">
      <div className="font-orbitron text-[9px] text-slate-500 tracking-[0.3em] uppercase">SYNCHRONIZATION: {Math.round(progress)}%</div>
      <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

const GameMenu = ({ current, total, onSelect }: { current: number, total: number, onSelect: (idx: number) => void }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl z-50 pointer-events-auto max-w-[95vw] overflow-x-auto no-scrollbar">
    {Array.from({ length: total }).map((_, i) => (
      <button 
        key={i}
        onClick={() => onSelect(i)}
        className={`w-2.5 h-2.5 flex-shrink-0 rounded-full transition-all duration-300 ${i === current ? 'bg-blue-500 w-12 ring-4 ring-blue-500/20' : 'bg-slate-700 hover:bg-slate-500'}`}
        title={`Phase ${i + 1}`}
      />
    ))}
  </div>
);

// --- Slide Components ---

const IntroBriefing = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="relative mb-8">
      <div className="w-64 h-64 rounded-full border border-blue-500/20 flex items-center justify-center p-4">
        <div className="w-full h-full rounded-full border-4 border-dashed border-blue-500/40 animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-7xl font-orbitron font-black text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] tracking-tighter italic">S.M</h1>
            <div className="text-[10px] font-orbitron text-blue-400 tracking-[0.5em] mt-2">GENESIS</div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-1 rounded-full font-orbitron text-[10px] tracking-widest text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        MISSION_AUTHORIZED
      </div>
    </div>
    
    <div className="max-w-4xl space-y-6">
      <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">TEAM <span className="text-blue-500">S.C.A.A.M</span></h2>
      <p className="text-2xl md:text-3xl text-slate-300 font-light leading-relaxed italic max-w-2xl mx-auto">
        "Memorizing formulas won’t improve our economy. Real learning happens when students can <span className="text-white font-bold">think, create, and act</span>."
      </p>
    </div>
    
    <div className="mt-16 flex flex-col items-center gap-4">
      <div className="px-8 py-3 bg-slate-900/80 border border-blue-500/30 rounded-2xl flex items-center gap-4">
        <Presentation className="text-blue-500 w-5 h-5" />
        <div className="text-xs text-blue-100 font-orbitron font-bold tracking-[0.3em]">E-LAB FINAL PRESENTATION // 2025</div>
      </div>
    </div>
  </div>
);

const ProblemStatement = () => (
  <div className="grid md:grid-cols-2 gap-12 items-center h-full px-10 md:px-24">
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Problem <span className="text-red-500">Statement</span></h2>
      </div>
      
      <div className="bg-slate-900/80 border border-slate-700/50 p-10 rounded-[3rem] space-y-8">
        <p className="text-xl text-slate-300 leading-relaxed font-light">
          According to World Bank data (<span className="text-white font-bold">CEIC 2023</span>) and <span className="text-white font-bold">UNESCO (2024)</span>, about <span className="text-red-500 font-black text-3xl">30%</span> of Cameroon’s young people are not prepared for success in higher education.
        </p>
        <div className="h-px bg-slate-800" />
        <p className="text-slate-400 leading-relaxed italic">
          Every year, over <span className="text-white font-bold">2 million</span> secondary school students graduate from a system heavily focused on rote memorization, lacking essential problem-solving skills.
        </p>
      </div>
    </div>
    
    <div className="flex flex-col gap-6">
       <div className="glass-panel p-10 rounded-[2.5rem] border-red-500/20 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Lock className="w-32 h-32 text-red-500" />
          </div>
          <h4 className="font-orbitron text-[10px] text-red-500 font-bold mb-4 tracking-widest">SYSTEMIC_FAILURE</h4>
          <div className="text-7xl font-black text-white mb-2">30%</div>
          <p className="text-slate-400">Total unpreparedness rate in youth demographic.</p>
       </div>
       <div className="glass-panel p-10 rounded-[2.5rem] border-blue-500/20">
          <h4 className="font-orbitron text-[10px] text-blue-500 font-bold mb-4 tracking-widest">VOLUME_IMPACT</h4>
          <div className="text-7xl font-black text-white mb-2">2M+</div>
          <p className="text-slate-400">Students trapped in memorization-heavy cycles annually.</p>
       </div>
    </div>
  </div>
);

const ResearchInsights = () => {
  const data = [
    { name: 'Poor CBA Implementation', val: 40, fill: '#3b82f6' },
    { name: 'Lack of Materials', val: 10, fill: '#3b82f6' },
    { name: 'Limited Practicals', val: 5, fill: '#3b82f6' }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center h-full px-10 md:px-24">
      <div className="bg-slate-900 border border-slate-700 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 right-6 text-[10px] font-orbitron text-slate-600 uppercase tracking-widest">RESEARCH_INTEL_V1</div>
        <h3 className="text-white font-bold mb-10 uppercase tracking-widest text-sm flex items-center gap-3 italic">
          <Database className="w-5 h-5 text-blue-500" /> Identified Roadblocks
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={140} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} 
              />
              <Bar dataKey="val" radius={[0, 10, 10, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Research <span className="text-blue-500">Insights</span></h2>
        
        <div className="bg-blue-600 p-12 rounded-[3rem] relative group overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ClipboardCheck className="w-32 h-32 text-white" />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-white/20 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Survey Results</h3>
          </div>
          <p className="text-blue-50 text-2xl leading-relaxed font-medium italic">
            "Based on a primary survey with <span className="text-white font-black underline">55 students</span> and <span className="text-white font-black underline">3 teachers</span>, <span className="text-white font-black text-4xl">85%</span> report that copying notes is the primary activity."
          </p>
        </div>
      </div>
    </div>
  );
};

const MissionVision = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-10">
    <div className="mb-16">
      <h2 className="text-xl font-orbitron text-blue-500 font-bold tracking-[0.6em] uppercase mb-4">Core Directive</h2>
      <h3 className="text-8xl font-black text-white italic uppercase tracking-tighter">Our Mission</h3>
    </div>
    
    <div className="max-w-5xl glass-panel p-20 rounded-[4rem] relative shadow-[0_0_100px_rgba(59,130,246,0.1)]">
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.6)]">
        <Target className="w-12 h-12 text-white" />
      </div>
      <p className="text-4xl md:text-5xl text-white font-light leading-tight italic">
        "Equip <span className="text-blue-500 font-black">one million</span> secondary school students in Cameroon with higher order thinking skills by <span className="text-blue-500 font-black">2035</span>."
      </p>
    </div>
  </div>
);

const ProductGenesis = () => (
  <div className="h-full px-10 flex flex-col justify-center">
    <div className="mb-16 text-center">
      <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Mission <span className="text-blue-500">Genesis</span></h2>
      <p className="text-slate-500 mt-4 font-orbitron text-xs tracking-widest uppercase">Ecosystem Architecture</p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {[
        { 
          icon: <Gamepad2 />, 
          title: 'Immersive Learning', 
          desc: 'Learn by doing, applying classroom knowledge to real-world community problems in the form of interactive missions.',
          color: 'bg-blue-600'
        },
        { 
          icon: <Database />, 
          title: 'Skill Tracking', 
          desc: 'AI-powered Skill Passport measures growth in HOTS (Higher Order Thinking Skills) and opportunity applications.',
          color: 'bg-indigo-600'
        },
        { 
          icon: <Trophy />, 
          title: 'Opportunities', 
          desc: 'Direct connection to competitions, grants, and fellowships to practice skills beyond the digital simulation.',
          color: 'bg-purple-600'
        }
      ].map((item, i) => (
        <div key={i} className="glass-panel p-12 rounded-[3rem] hover:border-blue-500/50 transition-all group cursor-default">
          <div className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform shadow-2xl`}>
            {/* Fix: Cast icon to ReactElement<any> to resolve className prop type error */}
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-10 h-10" })}
          </div>
          <h4 className="text-2xl font-bold text-white mb-6 italic uppercase tracking-tight">{item.title}</h4>
          <p className="text-slate-400 text-lg leading-relaxed font-light">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const InterfaceExplorer = () => {
  const [active, setActive] = useState(0);
  const screens = [
    { title: 'Home Sector', subtitle: 'Challenges & Subjects', desc: 'A global sector grid where students select their academic missions.', icon: <Globe /> },
    { title: 'Tactical Profile', subtitle: 'Chapters & Topics', desc: 'Deep dive into specific operational phases for each subject.', icon: <Layers /> },
    { title: 'Mission Directives', subtitle: 'Active Challenges', desc: 'Practical problem-solving scenarios based on curriculum data.', icon: <Zap /> },
    { title: 'Neural Profile', subtitle: 'Skills Passport', desc: 'Real-time AI tracking of cognitive growth and HOTS indices.', icon: <Cpu /> },
    { title: 'Growth Strategy', subtitle: 'Global Opportunities', desc: 'Pipelines to Mandela Washington, Mastercard Scholars, and more.', icon: <Rocket /> },
    { title: 'Neural Ranks', subtitle: 'Competitive Leaderboard', desc: 'Community sync showcasing top contributors and problem solvers.', icon: <Trophy /> }
  ];

  return (
    <div className="h-full px-10 flex flex-col items-center justify-center">
      <div className="text-center mb-10">
         <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">System <span className="text-blue-500">Interface</span></h2>
         <p className="text-slate-500 text-xs font-orbitron tracking-[0.4em] mt-2 uppercase">Operational Visualization</p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 h-[65vh]">
         <div className="md:col-span-4 space-y-3 overflow-y-auto no-scrollbar pr-2">
            {screens.map((s, i) => (
               <button 
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-full text-left p-6 rounded-2xl transition-all border group relative overflow-hidden ${
                    active === i 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-xl' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
               >
                  <div className="flex items-center gap-4 relative z-10">
                     <div className={`p-3 rounded-xl ${active === i ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                        {/* Fix: Cast icon to ReactElement<any> to resolve className prop type error */}
                        {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                     </div>
                     <div>
                        <div className="text-[9px] font-orbitron font-bold opacity-60 uppercase tracking-widest mb-1">{s.subtitle}</div>
                        <div className="font-black text-lg uppercase italic">{s.title}</div>
                     </div>
                  </div>
                  {active === i && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      {/* Fix: Cast icon to ReactElement<any> to resolve className prop type error */}
                      {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-16 h-16" })}
                    </div>
                  )}
               </button>
            ))}
         </div>
         <div className="md:col-span-8 glass-panel rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-slate-950/80 p-5 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
               <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
               </div>
               <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-blue-500" />
                  <div className="font-orbitron text-[8px] text-slate-500 tracking-[0.6em] uppercase">TERMINAL_OUTPUT://{screens[active].title.toUpperCase().replace(/\s+/g, '_')}</div>
               </div>
            </div>
            <div className="flex-1 bg-slate-900 flex items-center justify-center p-12 relative">
               <div className="text-center space-y-8 max-w-xl">
                  <div className="w-full aspect-video bg-black/50 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden shadow-inner group">
                     <div className="flex flex-col items-center text-slate-700 group-hover:text-blue-500/50 transition-colors">
                        <Cpu className="w-32 h-32 mb-6 opacity-5 animate-pulse" />
                        <div className="font-orbitron text-xs font-black italic tracking-[0.4em] uppercase">ENCODING_VISUAL_FEED</div>
                     </div>
                  </div>
                  <div>
                     <h4 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">{screens[active].title}</h4>
                     <p className="text-slate-400 text-lg font-light leading-relaxed">{screens[active].desc}</p>
                  </div>
               </div>
               {/* Aesthetic overlays */}
               <div className="absolute bottom-6 left-6 text-[8px] font-orbitron text-slate-700 uppercase">LATENCY: 12ms</div>
               <div className="absolute bottom-6 right-6 text-[8px] font-orbitron text-slate-700 uppercase">SYNC_NODE: CAM_YDE_01</div>
            </div>
         </div>
      </div>
    </div>
  );
};

const MarketOpportunity = () => (
  <div className="h-full grid md:grid-cols-2 gap-12 items-center px-10 md:px-24">
    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-16 rounded-[4rem] text-white shadow-[0_0_100px_rgba(37,99,235,0.2)] relative overflow-hidden group">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full -mb-40 -mr-40 group-hover:scale-110 transition-transform duration-1000" />
      <h3 className="text-blue-200 text-xs font-bold font-orbitron tracking-[0.4em] mb-10 uppercase">Intelligence Summary</h3>
      
      <div className="space-y-12">
        <div className="space-y-3">
          <div className="text-8xl font-black tracking-tighter italic">$16.8M</div>
          <div className="text-blue-100 font-bold uppercase tracking-[0.2em] text-sm">TAM (Total Available Market)</div>
        </div>
        
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-2">
            <div className="text-4xl font-black">$1.2M</div>
            <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">SAM (Serviceable)</div>
          </div>
          <div className="space-y-2 border-l border-white/10 pl-10">
            <div className="text-4xl font-black text-cyan-400 font-orbitron italic">$42,000</div>
            <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">SOM (500 Student Pilot)</div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-black italic">Market Capacity in 1 Year</div>
            <div className="text-xs text-blue-200 uppercase tracking-widest">Growth Curve Analysis</div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Market <span className="text-blue-500">Intel</span></h2>
        <p className="text-slate-400 text-xl leading-relaxed font-light">
          We are targeting a niche but high-influence demographic of <span className="text-white font-bold">200,000 students</span> in Year 1.
        </p>
      </div>
      
      <div className="space-y-5">
        {[
          { icon: <Target className="text-blue-500" />, title: 'TAM', desc: 'Total students in target bracket -> 200,000 users.' },
          { icon: <Globe className="text-blue-500" />, title: 'SAM', desc: 'Urban tech-accessible hubs in major cities.' },
          { icon: <Rocket className="text-blue-500" />, title: 'SOM', desc: 'Initial capture of 500 pilot students for 2025.' }
        ].map((item, i) => (
          <div key={i} className="flex gap-8 p-8 glass-panel rounded-3xl hover:border-blue-500/60 transition-all group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
              {item.icon}
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1 uppercase italic tracking-tight">{item.title}</h4>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RevenueModel = () => (
  <div className="h-full px-10 flex flex-col justify-center">
    <div className="mb-16 text-center">
       <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Revenue <span className="text-blue-500">Model</span></h2>
       <p className="text-slate-500 mt-2 font-orbitron text-xs tracking-[0.4em] uppercase">Sustainable Monetization</p>
    </div>

    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
       {[
          { 
            name: 'FREEMIUM', price: '$0/Month', 
            features: ['Access to one challenge', 'Access to one chapter', 'Max 2 opportunities displayed/yr'] 
          },
          { 
            name: 'STANDARD', price: '$7/Month', accent: true,
            features: ['Access to five challenges', '5 chapters per challenge', 'Max 10 opportunities displayed/yr', 'Leaderboard featuring'] 
          },
          { 
            name: 'PREMIUM', price: '$15/Month',
            features: ['All Challenges unlocked', 'All Chapters unlocked', 'Unlimited Opportunities', 'AI powered opportunity matching'] 
          }
       ].map((tier, i) => (
          <div key={i} className={`p-10 rounded-[3.5rem] border relative overflow-hidden flex flex-col ${tier.accent ? 'bg-blue-600 border-blue-400 shadow-[0_0_80px_rgba(59,130,246,0.3)] scale-105 z-10' : 'bg-slate-900 border-slate-800'}`}>
             {tier.accent && (
                <div className="absolute top-6 right-6 p-2 bg-white/20 rounded-lg">
                   <Sparkles className="w-5 h-5 text-white" />
                </div>
             )}
             <h4 className="font-orbitron text-[10px] font-bold mb-4 tracking-[0.3em] uppercase opacity-70">{tier.name}</h4>
             <div className="text-5xl font-black mb-10 italic">{tier.price}</div>
             <ul className="space-y-6 flex-1">
                {tier.features.map((f, j) => (
                   <li key={j} className="flex gap-4 text-sm font-medium">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${tier.accent ? 'text-blue-200' : 'text-blue-500'}`} />
                      <span className={tier.accent ? 'text-blue-50' : 'text-slate-300'}>{f}</span>
                   </li>
                ))}
             </ul>
          </div>
       ))}
    </div>

    <div className="mt-16 flex flex-wrap justify-center gap-8">
       {['Physical Event Fees / Tickets', 'Advertising / Featured Content', 'Corporate Sponsorships'].map((other, i) => (
          <div key={i} className="px-8 py-4 glass-panel rounded-full text-[10px] font-orbitron font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
             {other}
          </div>
       ))}
    </div>
  </div>
);

const AcquisitionStrategy = () => (
  <div className="h-full px-10 flex flex-col items-center justify-center">
    <div className="text-center mb-20">
      <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Strategic <span className="text-blue-500">Channels</span></h2>
    </div>
    
    <div className="relative w-full max-w-6xl">
       <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800/50 -translate-y-1/2 hidden md:block" />
       <div className="grid md:grid-cols-3 gap-16 relative z-10">
          {[
             { title: 'School Outreach', desc: 'Direct institutional partnerships for bulk licensing and curriculum integration.', icon: <Users /> },
             { title: 'The Hunt', desc: 'Physical challenge events linking reality with the digital mission ecosystem.', icon: <Map /> },
             { title: 'Online Marketing', desc: 'Precision-targeted awareness across tech-active youth platforms.', icon: <Globe /> }
          ].map((c, i) => (
             <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-28 h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500 border-4 border-slate-900">
                   {/* Fix: Cast icon to ReactElement<any> to resolve className prop type error */}
                   {React.cloneElement(c.icon as React.ReactElement<any>, { className: "w-12 h-12" })}
                </div>
                <h4 className="text-3xl font-black mb-4 uppercase italic tracking-tight">{c.title}</h4>
                <p className="text-slate-400 text-lg font-light leading-relaxed max-w-xs">{c.desc}</p>
             </div>
          ))}
       </div>
    </div>
  </div>
);

const Financials = () => (
  <div className="h-full px-10 flex flex-col justify-center items-center">
    <div className="text-center mb-16">
      <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Budget <span className="text-blue-500">Allocation</span></h2>
      <p className="text-slate-500 font-orbitron text-[10px] tracking-[0.5em] uppercase mt-2">Bootstrap Phase Alpha</p>
    </div>

    <div className="w-full max-w-5xl glass-panel rounded-[3.5rem] overflow-hidden shadow-[0_0_150px_rgba(59,130,246,0.05)] border-blue-500/10">
       <table className="w-full text-left">
          <thead>
             <tr className="bg-slate-900 text-blue-400 font-orbitron text-[10px] tracking-widest border-b border-slate-800">
                <th className="p-8">OP_EXPENSE_ITEM</th>
                <th className="p-8 text-right">VAL_AMOUNT_USD</th>
             </tr>
          </thead>
          <tbody className="text-slate-300">
             {[
                ['Game Design + Development', '4,000'],
                ['Playstore Fees', '25'],
                ['Legal Compliances', '50'],
                ['Contingency Fund', '500'],
                ['Marketing Operations', '2,935'],
                ['Miscellaneous Logistics', '500']
             ].map((row, i) => (
                <tr key={i} className="border-t border-slate-800/30 hover:bg-white/5 transition-colors group">
                   <td className="p-8 font-bold text-lg group-hover:text-white transition-colors uppercase tracking-tight italic">{row[0]}</td>
                   <td className="p-8 font-orbitron text-right text-xl text-white">${row[1]}</td>
                </tr>
             ))}
             <tr className="bg-blue-600/20 text-white font-black text-4xl border-t-2 border-blue-500">
                <td className="p-12 italic uppercase tracking-tighter">Operational Total</td>
                <td className="p-12 font-orbitron text-right text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">$7,510</td>
             </tr>
          </tbody>
       </table>
    </div>
  </div>
);

const TheSquad = () => (
  <div className="h-full px-10 flex flex-col justify-center items-center">
    <div className="text-center mb-20">
      <h2 className="text-6xl font-black text-white italic mb-4 uppercase tracking-tighter">Mission <span className="text-blue-500 italic">Architects</span></h2>
      <p className="text-slate-500 font-orbitron text-xs tracking-[0.6em] uppercase">Cross-Continental Neural Link</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 max-w-[90vw]">
      {[
        { name: 'Sandrine Ojong', role: 'Team Lead', loc: 'Cameroon', c: 'border-blue-500' },
        { name: 'Chrys Gnagne', role: 'Technical Lead', loc: 'Côte d\'Ivoire', c: 'border-purple-500' },
        { name: 'Ayman Bahadur', role: 'R & I Strategist', loc: 'Mozambique', c: 'border-cyan-500' },
        { name: 'Abdulkadir Abduljabar', role: 'Impact Analyst', loc: 'Nigeria', c: 'border-yellow-500' },
        { name: 'Marylene Sugira', role: 'Team Designer', loc: 'Rwanda', c: 'border-red-500' }
      ].map((m, i) => (
        <div key={i} className="flex flex-col items-center group cursor-pointer text-center">
          <div className={`relative w-40 h-40 md:w-52 md:h-52 rounded-[3.5rem] overflow-hidden mb-8 border-4 ${m.c} p-1.5 grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:rotate-3`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-end p-6">
              <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">{m.loc}</span>
            </div>
            <img src={`https://picsum.photos/400?random=${i+200}`} alt={m.name} className="w-full h-full object-cover rounded-[3rem]" />
          </div>
          <h4 className="text-2xl font-black text-white leading-tight mb-2 uppercase tracking-tight italic">{m.name}</h4>
          <p className="text-blue-500 text-[10px] font-orbitron font-bold uppercase tracking-[0.2em]">{m.role}</p>
        </div>
      ))}
    </div>
  </div>
);

const MissionVisionVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const generateVision = async () => {
    try {
      setLoading(true);
      setStatus('Initializing Neural Sim...');
      
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      setStatus('Synthesizing Future Educational Landscape...');

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Cinematic wide shot of a futuristic classroom in Yaoundé, Cameroon. Teenage students collaborating around a floating holographic map of the city, using futuristic touch interfaces. The environment is vibrant with deep blue, amber, and purple neon lighting, blending traditional Cameroonian textile patterns into the tech aesthetics. High-end sci-fi look, ultra-realistic textures, 4k, peaceful and inspiring innovation hub.',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        setStatus(`Encoding reality frames... ${Math.floor(Math.random() * 20) + 10}s sync remaining.`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      setVideoUrl(URL.createObjectURL(blob));
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found.")) {
        await (window as any).aistudio.openSelectKey();
      }
      setStatus('SYNC FAILED: Link Refused. Check Billing Docs.');
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-10">
      <div className="text-center mb-10">
        <h2 className="text-7xl font-black mb-4 tracking-tighter italic uppercase">Sim: <span className="text-blue-500 italic">Genesis</span></h2>
        <p className="text-slate-400 text-xl font-light max-w-3xl mx-auto italic">Visualizing the shift from memorization to real-world innovation.</p>
      </div>

      <div className="w-full max-w-6xl aspect-video glass-panel rounded-[3rem] overflow-hidden flex items-center justify-center relative group shadow-[0_0_150px_rgba(59,130,246,0.1)]">
        {videoUrl ? (
          <video src={videoUrl} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-16 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                  <div className="w-24 h-24 border-b-2 border-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <p className="font-orbitron text-xs text-blue-400 animate-pulse tracking-[0.4em] uppercase">{status}</p>
              </div>
            ) : (
              <>
                <div className="w-32 h-32 bg-blue-600/5 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 group-hover:scale-110 transition-all duration-700 shadow-inner">
                  <Play className="w-12 h-12 text-blue-500 translate-x-1" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-3 uppercase italic">Synthesize Vision</h3>
                  <p className="text-slate-500 text-sm mb-10 font-orbitron tracking-widest">DRIVE_UNIT: VEO_3.1_ENGINE</p>
                  <button 
                    onClick={generateVision}
                    className="cyber-button px-14 py-5 rounded-2xl font-orbitron font-black uppercase tracking-[0.3em] flex items-center gap-6 mx-auto hover:scale-105 active:scale-95"
                  >
                    <Zap className="w-5 h-5" /> Execute_Simulation
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-8 text-[10px] text-slate-600 font-orbitron tracking-[0.5em] flex items-center gap-4">
        <Database className="w-3 h-3" /> NEURAL_LINK_STABLE // REQUIRES_PAID_API_CREDENTIALS
      </div>
    </div>
  );
};

const CallToAction = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-10">
    <div className="space-y-6 mb-16">
      <h2 className="text-xl font-orbitron text-blue-500 font-bold tracking-[0.8em] uppercase">Final Directive</h2>
      <h3 className="text-9xl font-black italic tracking-tighter uppercase leading-none">Call to <span className="text-blue-500">Action</span></h3>
      <div className="flex flex-col items-center gap-2 mt-8">
         <div className="text-2xl font-bold text-white tracking-tight">s.ayuktabong@alustudent.com</div>
         <div className="text-slate-500 font-orbitron text-xs tracking-[0.3em]">TEAM_SCAAM // @MISSION_GENESIS</div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="p-10 glass-panel rounded-[3rem] border-blue-500/10 hover:border-blue-500/40 transition-all">
           <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <History className="text-blue-500 w-8 h-8" />
           </div>
           <h4 className="text-2xl font-black text-white mb-4 italic uppercase">3-Year View</h4>
           <p className="text-slate-400 text-sm leading-relaxed">Help over 50,000 Cameroonian students move from memorizing formulas to applying concepts.</p>
        </div>
        
        <div className="p-12 glass-panel rounded-[3.5rem] bg-blue-600/10 border-blue-500/50 scale-110 shadow-2xl relative">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-[9px] font-orbitron font-black px-4 py-1.5 rounded-full shadow-lg tracking-widest">CRITICAL_GOAL</div>
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg">
              <Target className="text-white w-10 h-10" />
           </div>
           <h4 className="text-3xl font-black text-white mb-6 italic uppercase">The Outcome</h4>
           <p className="text-blue-100 font-medium leading-relaxed italic">"Mission Genesis creates a generation of learners ready for success and meaningful economic contribution."</p>
        </div>

        <div className="p-10 glass-panel rounded-[3rem] border-blue-500/10 hover:border-blue-500/40 transition-all">
           <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <Users className="text-blue-500 w-8 h-8" />
           </div>
           <h4 className="text-2xl font-black text-white mb-4 italic uppercase">Join Us</h4>
           <p className="text-slate-400 text-sm leading-relaxed">Join us in improving this project with feedback, ideas, and resources to prepare for implementation.</p>
        </div>
    </div>
    
    <div className="mt-20 flex gap-8">
       <button 
          onClick={() => window.open('mailto:s.ayuktabong@alustudent.com')}
          className="cyber-button px-16 py-6 rounded-2xl flex items-center gap-5 font-black text-2xl uppercase tracking-[0.2em] shadow-2xl"
       >
          <Mail className="w-8 h-8" /> Secure_Contact
       </button>
    </div>
  </div>
);

const Sources = () => (
  <div className="h-full px-10 flex flex-col justify-center items-center">
    <div className="text-center mb-12">
      <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Operational <span className="text-blue-500">Sources</span></h2>
      <p className="text-slate-500 font-orbitron text-[10px] tracking-[0.6em] mt-2 uppercase">Data Integrity References</p>
    </div>

    <div className="w-full max-w-5xl glass-panel p-16 rounded-[4rem] space-y-10 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
       {[
          'World Bank (via CEIC). (2023). Secondary education pupils: Cameroon CM: Secondary Education: Pupils. CEIC Data Archive.',
          'UNESCO International Institute for Capacity Building in Africa. (2024). Cameroon education country brief. UNESCO IICBA Portal.',
          'Tambe Ekobina, S. (2021). Challenges in the implementation of Competencies-Based Approach and the quality of teaching of history in some secondary schools in Mfoundi Division (Unpublished master\'s thesis).'
       ].map((ref, i) => (
          <div key={i} className="flex gap-10 p-8 hover:bg-white/5 rounded-[2rem] transition-all border border-transparent hover:border-slate-800 group">
             <div className="text-4xl font-orbitron font-black text-blue-500/30 group-hover:text-blue-500 transition-colors">0{i+1}</div>
             <p className="text-slate-300 text-lg italic leading-relaxed font-light">{ref}</p>
          </div>
       ))}
    </div>
  </div>
);

// --- Main App Controller ---

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatLog, setChatLog] = useState<{role: 'ai'|'user', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const slides = [
    { name: 'Commencement', component: <IntroBriefing /> },
    { name: 'Threat Intel', component: <ProblemStatement /> },
    { name: 'Research Output', component: <ResearchInsights /> },
    { name: 'Core Strategy', component: <MissionVision /> },
    { name: 'Pillar Architecture', component: <ProductGenesis /> },
    { name: 'System Interface', component: <InterfaceExplorer /> },
    { name: 'Visual Simulation', component: <MissionVisionVideo /> },
    { name: 'Market Capacity', component: <MarketOpportunity /> },
    { name: 'Revenue Logic', component: <RevenueModel /> },
    { name: 'Acquisition Channels', component: <AcquisitionStrategy /> },
    { name: 'Fiscal Breakdown', component: <Financials /> },
    { name: 'Mission Architects', component: <TheSquad /> },
    { name: 'Final Directive', component: <CallToAction /> },
    { name: 'Operational Sources', component: <Sources /> }
  ];

  const next = useCallback(() => setCurrentSlide(s => Math.min(s + 1, slides.length - 1)), [slides.length]);
  const prev = useCallback(() => setCurrentSlide(s => Math.max(s - 1, 0)), []);

  const handleAiAsk = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setChatLog(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);
    
    const response = await askPitchAssistant(userText);
    setChatLog(prev => [...prev, { role: 'ai', text: response || 'Neural link failure.' }]);
    setIsTyping(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none">
      <MissionHUD 
        phase={slides[currentSlide].name} 
        progress={((currentSlide + 1) / slides.length) * 100} 
      />

      <main className="w-full h-full relative z-10">
        <div key={currentSlide} className="h-full slide-enter">
          {slides[currentSlide].component}
        </div>
      </main>

      {/* Manual Controls */}
      <div className="fixed bottom-12 right-12 flex items-center gap-6 z-50">
        <button 
          onClick={prev}
          disabled={currentSlide === 0}
          className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-white hover:bg-blue-600/30 disabled:opacity-10 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={next}
          disabled={currentSlide === slides.length - 1}
          className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-10 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <GameMenu current={currentSlide} total={slides.length} onSelect={setCurrentSlide} />

      {/* AI Strategic Node */}
      <div className={`fixed left-12 bottom-12 z-[60] transition-all duration-700 ease-in-out ${aiOpen ? 'w-[450px] h-[650px]' : 'w-16 h-16'}`}>
        {aiOpen ? (
          <div className="w-full h-full glass-panel rounded-[3rem] p-10 flex flex-col shadow-[0_0_150px_rgba(59,130,246,0.2)] border-blue-500/40">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-orbitron text-[10px] text-blue-400 font-bold tracking-[0.3em] uppercase">PITCH_AI v3.1</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Neural Link Status: SECURE</div>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ShieldAlert className="w-5 h-5 text-slate-500 rotate-45 hover:text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 mb-8 scrollbar-hide">
              {chatLog.length === 0 && (
                <div className="bg-blue-500/5 p-8 rounded-[2rem] border border-blue-500/20 text-slate-300 text-lg leading-relaxed italic">
                  "Greetings, Officer. I am the Strategic Advisor for S.C.A.A.M. How can I facilitate your understanding of the Mission Genesis roadmap today?"
                </div>
              )}
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2rem] text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-xl rounded-tr-none' 
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 p-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>
            
            <div className="relative">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiAsk()}
                placeholder="Query strategic intelligence..." 
                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-blue-500 transition-all pr-16"
              />
              <button 
                onClick={handleAiAsk}
                className="absolute right-3.5 top-3.5 p-2.5 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95"
              >
                <Rocket className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setAiOpen(true)}
            className="w-full h-full bg-slate-900 border border-blue-500/30 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all group backdrop-blur-3xl hover:border-blue-500"
          >
            <MessageSquare className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-[3px] border-slate-950 animate-bounce" />
          </button>
        )}
      </div>

      {/* Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0" 
        style={{ 
          backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', 
          backgroundSize: '100px 100px' 
        }}
      />
    </div>
  );
};

export default App;
