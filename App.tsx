import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Pause,
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
  BarChart3,
  Key,
  GraduationCap,
  School,
  HeartHandshake,
  Workflow,
  Code2,
  ShieldCheck,
  Activity,
  Award,
  BrainCircuit,
  Lightbulb,
  Volume2,
  VolumeX,
  RefreshCcw,
  CheckCircle,
  BarChart as BarChartIcon,
  Mic,
  X,
  Ticket,
  Megaphone,
  Briefcase,
  PlayCircle,
  Waves
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
import { GoogleGenAI, Modality } from "@google/genai";
import { askPitchAssistant } from './geminiService';

// --- Helper Functions for Audio Decoding ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- HUD & Overlay Components ---

const MissionHUD = ({ phase, progress, current, total }: { phase: string, progress: number, current: number, total: number }) => (
  <div className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start md:items-center z-50 pointer-events-none">
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 bg-slate-900/80 border border-purple-500/30 px-4 py-1.5 md:px-6 md:py-2 rounded-full backdrop-blur-md">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="font-orbitron text-[8px] md:text-[10px] tracking-widest text-purple-400 font-bold uppercase truncate max-w-[150px] md:max-w-none">
          OP_LOG://{phase.replace(/\s+/g, '_')}
        </div>
      </div>
      <div className="bg-slate-900/80 border border-slate-700/50 px-4 py-1 rounded-full backdrop-blur-md w-fit self-start">
        <div className="font-orbitron text-[8px] md:text-[10px] text-slate-400 tracking-widest font-bold">
          PHASE {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-1">
      <div className="font-orbitron text-[8px] md:text-[9px] text-slate-500 tracking-[0.3em] uppercase">SYNC: {Math.round(progress)}%</div>
      <div className="w-32 md:w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-orange-400 transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

const GameMenu = ({ current, total, onSelect }: { current: number, total: number, onSelect: (idx: number) => void }) => (
  <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-black/60 backdrop-blur-2xl border border-white/10 p-1.5 md:p-2 rounded-2xl z-50 pointer-events-auto max-w-[90vw] overflow-x-auto no-scrollbar">
    {Array.from({ length: total }).map((_, i) => (
      <button 
        key={i}
        onClick={() => onSelect(i)}
        className={`h-1.5 md:h-2.5 flex-shrink-0 rounded-full transition-all duration-300 ${i === current ? 'bg-orange-500 w-8 md:w-12 ring-2 md:ring-4 ring-orange-500/20' : 'bg-slate-700 hover:bg-slate-500 w-1.5 md:w-2.5'}`}
        title={`Phase ${i + 1}`}
      />
    ))}
  </div>
);

// --- Slide Components ---

const IntroBriefing = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 pt-16">
    <div className="relative mb-6 md:mb-8 scale-75 md:scale-100">
      <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-purple-500/20 flex items-center justify-center p-4">
        <div className="w-full h-full rounded-full border-4 border-dashed border-purple-500/40 animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-orbitron font-black text-white drop-shadow-[0_0_20px_rgba(147,51,234,0.8)] tracking-tighter italic">S.M</h1>
            <div className="text-[8px] md:text-[10px] font-orbitron text-orange-400 tracking-[0.5em] mt-2">GENESIS</div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 px-4 md:px-6 py-1 rounded-full font-orbitron text-[8px] md:text-[10px] tracking-widest text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
        MISSION_AUTHORIZED
      </div>
    </div>
    
    <div className="max-w-4xl space-y-4 md:space-y-6">
      <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">TEAM <span className="text-purple-500">S.C.A.A.M</span></h2>
      <p className="text-lg md:text-3xl text-slate-300 font-light leading-relaxed italic max-w-2xl mx-auto">
        "Memorizing formulas won’t improve our economy. Real learning happens when students can <span className="text-white font-bold">think, create, and act</span>."
      </p>
    </div>
    
    <div className="mt-12 md:mt-16 flex flex-col items-center gap-4">
      <div className="px-6 py-2 md:px-8 md:py-3 bg-slate-900/80 border border-purple-500/30 rounded-2xl flex items-center gap-4">
        <Presentation className="text-orange-500 w-4 h-4 md:w-5 md:h-5" />
        <div className="text-[8px] md:text-xs text-purple-100 font-orbitron font-bold tracking-[0.3em]">E-LAB FINAL PRESENTATION // 2025</div>
      </div>
    </div>
  </div>
);

const ProblemStatement = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center h-full px-6 md:px-24 pt-20 md:pt-0">
    <div className="space-y-6 md:space-y-8 text-left">
      <div className="flex items-center gap-4">
        <div className="p-3 md:p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
          <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Problem <span className="text-orange-500">Statement</span></h2>
      </div>
      
      <div className="bg-slate-900/80 border border-slate-700/50 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8">
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
          According to World Bank data (<span className="text-white font-bold">CEIC 2023</span>) and <span className="text-white font-bold">UNESCO (2024)</span>, about <span className="text-orange-500 font-black text-2xl md:text-3xl">30%</span> of Cameroon’s young people are not prepared for success in higher education.
        </p>
        <div className="h-px bg-slate-800" />
        <p className="text-sm md:text-base text-slate-400 leading-relaxed italic">
          Every year, over <span className="text-white font-bold">2 million</span> secondary school students graduate from a system heavily focused on rote memorization, lacking essential problem-solving skills.
        </p>
      </div>
    </div>
    
    <div className="flex flex-col gap-4 md:gap-6">
       <div className="glass-panel p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-orange-500/20 relative group overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Lock className="w-24 h-24 md:w-32 md:h-32 text-orange-500" />
          </div>
          <h4 className="font-orbitron text-[8px] md:text-[10px] text-orange-500 font-bold mb-2 md:mb-4 tracking-widest">SYSTEMIC_FAILURE</h4>
          <div className="text-5xl md:text-7xl font-black text-white mb-2">30%</div>
          <p className="text-xs md:text-base text-slate-400">Total unpreparedness rate in youth demographic.</p>
       </div>
       <div className="glass-panel p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-purple-500/20 text-left">
          <h4 className="font-orbitron text-[8px] md:text-[10px] text-purple-500 font-bold mb-2 md:mb-4 tracking-widest">VOLUME_IMPACT</h4>
          <div className="text-5xl md:text-7xl font-black text-white mb-2">2M+</div>
          <p className="text-xs md:text-base text-slate-400">Students trapped in memorization-heavy cycles annually.</p>
       </div>
    </div>
  </div>
);

const ResearchInsights = () => {
  const data = [
    { name: 'Poor CBA Implementation', val: 40, fill: '#9333ea' },
    { name: 'Lack of Materials', val: 10, fill: '#f97316' },
    { name: 'Limited Practicals', val: 5, fill: '#9333ea' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center h-full px-6 md:px-24 pt-20 md:pt-0">
      <div className="bg-slate-900 border border-slate-700 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden h-[300px] md:h-auto">
        <div className="absolute top-4 right-6 text-[8px] md:text-[10px] font-orbitron text-slate-600 uppercase tracking-widest">RESEARCH_INTEL_V1</div>
        <h3 className="text-white font-bold mb-6 md:mb-10 uppercase tracking-widest text-xs md:text-sm flex items-center gap-3 italic">
          <Database className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /> Identified Roadblocks
        </h3>
        <div className="h-40 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={8} width={110} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0718', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px' }}
                cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }} 
              />
              <Bar dataKey="val" radius={[0, 10, 10, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8 text-left">
        <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Research <span className="text-purple-500">Insights</span></h2>
        
        <div className="bg-purple-600 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] relative group overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
            <ClipboardCheck className="w-24 h-24 md:w-32 md:h-32 text-white" />
          </div>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="p-3 md:p-4 bg-white/20 rounded-2xl">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Survey Results</h3>
          </div>
          <p className="text-purple-50 text-xl md:text-2xl leading-relaxed font-medium italic">
            "Based on a primary survey with <span className="text-white font-black underline">55 students</span> and <span className="text-white font-black underline">3 teachers</span>, <span className="text-white font-black text-3xl md:text-4xl">85%</span> report that copying notes is the primary activity."
          </p>
        </div>
      </div>
    </div>
  );
};

const MissionVision = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6">
    <div className="mb-10 md:mb-16">
      <h2 className="text-sm md:text-xl font-orbitron text-orange-500 font-bold tracking-[0.4em] md:tracking-[0.6em] uppercase mb-2 md:mb-4">Core Directive</h2>
      <h3 className="text-4xl md:text-8xl font-black text-white italic uppercase tracking-tighter">Our Mission</h3>
    </div>
    
    <div className="max-w-5xl glass-panel p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] relative shadow-[0_0_100px_rgba(147,51,234,0.1)]">
      <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 w-16 h-16 md:w-24 md:h-24 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.6)]">
        <Target className="w-8 h-8 md:w-12 md:h-12 text-white" />
      </div>
      <p className="text-2xl md:text-5xl text-white font-light leading-tight italic">
        "Equip <span className="text-orange-500 font-black">one million</span> secondary school students in Cameroon with higher order thinking skills by <span className="text-purple-500 font-black">2035</span>."
      </p>
    </div>
  </div>
);

const ProductGenesis = () => (
  <div className="h-full px-6 md:px-10 flex flex-col justify-center pt-16 md:pt-0">
    <div className="mb-10 md:mb-16 text-center">
      <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">Mission <span className="text-orange-500">Genesis</span></h2>
      <p className="text-slate-500 mt-2 md:mt-4 font-orbitron text-[10px] md:text-xs tracking-widest uppercase">Ecosystem Architecture</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto overflow-y-auto no-scrollbar max-h-[60vh] md:max-h-none">
      {[
        { 
          icon: <Gamepad2 />, 
          title: 'Immersive Learning', 
          desc: 'Learn by doing, applying classroom knowledge to real-world community problems in the form of interactive missions.',
          color: 'bg-purple-600'
        },
        { 
          icon: <Database />, 
          title: 'Skill Tracking', 
          desc: 'AI-powered Skill Passport measures growth in HOTS (Higher Order Thinking Skills) and opportunity applications.',
          color: 'bg-orange-600'
        },
        { 
          icon: <Trophy />, 
          title: 'Opportunities', 
          desc: 'Direct connection to competitions, grants, and fellowships to practice skills beyond the digital simulation.',
          color: 'bg-purple-800'
        }
      ].map((item, i) => (
        <div key={i} className="glass-panel p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] hover:border-orange-500/50 transition-all group cursor-default text-left">
          <div className={`w-14 h-14 md:w-20 md:h-20 ${item.color} rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-6 md:mb-10 group-hover:scale-110 transition-transform shadow-2xl`}>
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-8 h-8 md:w-10 md:h-10" })}
          </div>
          <h4 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 italic uppercase tracking-tight">{item.title}</h4>
          <p className="text-slate-400 text-sm md:text-lg leading-relaxed font-light">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const RevenueModel = () => (
  <div className="h-full px-6 md:px-10 flex flex-col justify-center pt-16 md:pt-12 overflow-y-auto no-scrollbar pb-16">
    <div className="mb-2 md:mb-4 text-center shrink-0">
      <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
        <span className="text-purple-500">BUSINESS </span> 
        <span className="text-slate-400">MODEL</span>
      </h2>
      <p className="text-slate-500 mt-1 font-orbitron text-[9px] md:text-xs tracking-[0.4em] uppercase">Fiscal Sustainability & Revenue Architecture</p>
    </div>

    <div className="flex justify-center mb-6 md:mb-8 shrink-0">
      <div className="bg-orange-600/90 backdrop-blur-md px-8 py-1.5 rounded-full font-orbitron text-[9px] md:text-[10px] font-black tracking-[0.3em] shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-400/30 text-white uppercase">
        Subscriptions
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto shrink-0 px-2 md:px-4">
      {[
        { 
          name: 'FREEMIUM', 
          price: '($0/MO)', 
          features: [
            'One challenge access',
            'One chapter/Topic access',
            'Max 2 opportunities/year'
          ],
          icon: <Users className="w-3.5 h-3.5" />
        },
        { 
          name: 'STANDARD', 
          price: '($7/MO)', 
          features: [
            'Five challenges access',
            '5 chapters/Topic access',
            'Max 10 opportunities/year',
            'Leaderboard featuring'
          ],
          highlight: true,
          icon: <Users className="w-3.5 h-3.5" />
        },
        { 
          name: 'PREMIUM', 
          price: '($15/MO)', 
          features: [
            'All challenges unlocked',
            'All chapters unlocked',
            'AI-powered opportunity matching'
          ],
          icon: <Users className="w-3.5 h-3.5" />
        }
      ].map((tier, i) => (
        <div key={i} className={`glass-panel p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border flex flex-col transition-all duration-500 hover:scale-[1.01] ${tier.highlight ? 'border-orange-500/60 shadow-[0_0_40px_rgba(249,115,22,0.1)] ring-1 ring-orange-500/10 md:scale-105 relative z-10' : 'border-slate-800/30'}`}>
          <div className="flex items-center gap-3 mb-4 md:mb-6">
             <div className="p-2 bg-purple-600/20 rounded-full text-purple-500 shadow-md">
                {tier.icon}
             </div>
             <h4 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter leading-none">
               {tier.name} <br/> <span className="text-[9px] md:text-[11px] text-orange-400 opacity-80 font-bold">{tier.price}</span>
             </h4>
          </div>
          <ul className="space-y-2 md:space-y-3 flex-1">
            {tier.features.map((f, j) => (
              <li key={j} className="flex items-start gap-2 text-slate-400 font-light text-[10px] md:text-[13px] text-left leading-tight italic group">
                <div className="w-1 md:w-1.5 h-1 md:w-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.8)] transition-all" /> {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="flex justify-center mt-8 md:mt-12 mb-4 md:mb-6 shrink-0">
      <div className="bg-slate-900/80 border border-slate-700 px-8 py-1.5 rounded-full font-orbitron text-[9px] md:text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
        Revenue Verticals
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 max-w-6xl mx-auto shrink-0 mb-4 px-2">
       {[
         { icon: <Ticket />, label: 'EVENT TICKETS' },
         { icon: <Megaphone />, label: 'ADVERTISING' },
         { icon: <Briefcase />, label: 'SPONSORSHIPS' }
       ].map((item, idx) => (
         <div key={idx} className="glass-panel px-6 py-3 rounded-full border-slate-800/30 flex items-center gap-3 hover:border-purple-500/30 transition-all group cursor-pointer hover:bg-purple-600/5">
            <div className="p-2 bg-slate-800 rounded-full text-orange-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">
               {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-3 h-3" })}
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-slate-300 italic uppercase tracking-tighter leading-none">
              {item.label}
            </span>
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
    <div className="h-full px-6 md:px-10 flex flex-col items-center justify-center pt-16 md:pt-0">
      <div className="text-center mb-6 md:mb-10">
         <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">System <span className="text-purple-500">Interface</span></h2>
         <p className="text-slate-500 text-[10px] font-orbitron tracking-[0.4em] mt-1 md:mt-2 uppercase">Operational Visualization</p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 h-[70vh] md:h-[65vh]">
         <div className="md:col-span-4 flex md:block gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar md:pr-2 h-24 md:h-auto shrink-0">
            {screens.map((s, i) => (
               <button 
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-40 md:w-full text-left p-3 md:p-6 rounded-xl md:rounded-2xl transition-all border group relative overflow-hidden flex-shrink-0 md:mb-3 ${
                    active === i 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-xl' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
               >
                  <div className="flex items-center gap-2 md:gap-4 relative z-10">
                     <div className={`p-1.5 md:p-3 rounded-lg md:rounded-xl ${active === i ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                        {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-3 h-3 md:w-5 md:h-5" })}
                     </div>
                     <div className="truncate">
                        <div className="text-[6px] md:text-[9px] font-orbitron font-bold opacity-60 uppercase tracking-widest mb-0.5 md:mb-1">{s.subtitle}</div>
                        <div className="font-black text-xs md:text-lg uppercase italic">{s.title}</div>
                     </div>
                  </div>
               </button>
            ))}
         </div>
         <div className="md:col-span-8 glass-panel rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl min-h-0">
            <div className="bg-slate-950/80 p-3 md:p-5 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
               <div className="flex gap-1.5 md:gap-2.5">
                  <div className="w-2 md:w-3.5 h-2 md:h-3.5 rounded-full bg-red-500/40" />
                  <div className="w-2 md:w-3.5 h-2 md:h-3.5 rounded-full bg-orange-500/40" />
                  <div className="w-2 md:w-3.5 h-2 md:h-3.5 rounded-full bg-green-500/40" />
               </div>
               <div className="flex items-center gap-2">
                  <Terminal className="w-2 h-2 md:w-3 md:h-3 text-purple-500" />
                  <div className="font-orbitron text-[6px] md:text-[8px] text-slate-500 tracking-[0.4em] md:tracking-[0.6em] uppercase">TERMINAL://{screens[active].title.toUpperCase().replace(/\s+/g, '_')}</div>
               </div>
            </div>
            <div className="flex-1 bg-slate-900 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
               <div className="text-center space-y-4 md:space-y-8 max-w-xl">
                  <div className="w-full aspect-video bg-black/50 rounded-xl md:rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden shadow-inner group">
                     <div className="flex flex-col items-center text-slate-700 group-hover:text-purple-500/50 transition-colors">
                        <Cpu className="w-16 h-16 md:w-32 md:h-32 mb-4 md:mb-6 opacity-5 animate-pulse" />
                        <div className="font-orbitron text-[8px] md:text-[10px] font-black italic tracking-[0.4em] uppercase">ENCODING_VISUAL_FEED</div>
                     </div>
                  </div>
                  <div>
                     <h4 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-4 uppercase italic tracking-tighter">{screens[active].title}</h4>
                     <p className="text-slate-400 text-sm md:text-lg font-light leading-relaxed">{screens[active].desc}</p>
                  </div>
               </div>
               <div className="absolute bottom-3 left-4 text-[6px] md:text-[8px] font-orbitron text-slate-700 uppercase">LATENCY: 12ms</div>
               <div className="absolute bottom-3 right-4 text-[6px] md:text-[8px] font-orbitron text-slate-700 uppercase">SYNC_NODE: CAM_YDE_01</div>
            </div>
         </div>
      </div>
    </div>
  );
};

const TargetAudience = () => (
  <div className="h-full px-6 md:px-10 flex flex-col justify-center pt-16 md:pt-0">
    <div className="mb-10 md:mb-16 text-center">
      <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">Strategic <span className="text-purple-500">Demographics</span></h2>
      <p className="text-slate-500 mt-2 md:mt-4 font-orbitron text-[10px] md:text-xs tracking-widest uppercase">Target Vector Analysis</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto overflow-y-auto no-scrollbar">
      {[
        { icon: <GraduationCap />, title: 'Students', desc: 'Ages 13-18 seeking career readiness and cognitive dominance over rote systems.' },
        { icon: <School />, title: 'Educators', desc: 'Institutions requiring advanced pedagogical tools to implement Competency Based Approach.' },
        { icon: <HeartHandshake />, title: 'Parents', desc: 'Stakeholders invested in long-term economic success and measurable skill growth.' }
      ].map((item, i) => (
        <div key={i} className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-purple-500/10 group hover:border-orange-500/40 transition-all text-left">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600/20 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-500 mb-4 md:mb-8 group-hover:scale-110 transition-transform">
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-6 h-6 md:w-8 md:h-8" })}
          </div>
          <h4 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4 italic uppercase">{item.title}</h4>
          <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const MarketOpportunity = () => {
  const data = [
    { name: 'TAM', value: 16.8, label: '$16.8M', fill: '#1e293b' },
    { name: 'SAM', value: 1.4, label: '$1.4M', fill: '#9333ea' },
    { name: 'SOM (Y1)', value: 0.1, label: '$100k', fill: '#f97316' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center h-full px-6 md:px-24 pt-20 md:pt-0">
      <div className="space-y-6 md:space-y-8 text-left">
        <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">Market <span className="text-orange-500">Capacity</span></h2>
        <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-black text-white">$16.8M</div>
              <div className="text-[8px] md:text-xs font-orbitron text-slate-500 uppercase tracking-widest">Total Available Market (TAM)</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm md:text-lg font-light italic leading-relaxed">Targeting 200,000 students in the Serviceable Addressable Market (SAM) with a focus on urban centers.</p>
        </div>
      </div>
      <div className="h-64 md:h-96 glass-panel rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f0718', border: '1px solid #334155', borderRadius: '16px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AcquisitionStrategy = () => (
  <div className="h-full px-6 md:px-10 flex flex-col justify-center pt-16 md:pt-0">
    <div className="mb-10 md:mb-16 text-center">
      <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">Infection <span className="text-orange-500">Vector</span></h2>
      <p className="text-slate-500 mt-2 md:mt-4 font-orbitron text-[10px] md:text-xs tracking-widest uppercase">Go-To-Market Protocol</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-7xl mx-auto">
      {[
        { icon: <School />, title: 'Direct Outreach', desc: 'Partnerships with secondary schools for system-wide mission integration.' },
        { icon: <Workflow />, title: 'The Hunt', desc: 'Hybrid physical-digital events connecting real-world locations to XP rewards.' },
        { icon: <Globe />, title: 'Digital Engine', desc: 'Precision targeting on TikTok, Instagram, and WhatsApp for youth conversion.' }
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center text-center group">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-orange-500 mb-6 md:mb-8 group-hover:border-purple-500 transition-all shadow-2xl group-hover:bg-purple-600/5">
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-8 h-8 md:w-12 md:h-12" })}
          </div>
          <h4 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4 uppercase italic">{item.title}</h4>
          <p className="text-slate-400 font-light max-w-xs text-xs md:text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const Financials = () => {
  const items = [
    { item: 'Game Design+Development', amount: '4,000 USD' },
    { item: 'Playstore fees', amount: '25 USD' },
    { item: 'Legal compliences', amount: '50 USD' },
    { item: 'Contigency Fund', amount: '500 USD' },
    { item: 'Marketing', amount: '2,935 USD' },
    { item: 'Miscellaneous', amount: '500 USD' },
  ];

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center p-4 md:p-10 text-white overflow-hidden pt-16 md:pt-10">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.1] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale" />
      </div>
      
      <div className="absolute left-[-100px] top-[10%] opacity-15 pointer-events-none z-0 hidden md:block">
         <svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-90">
            <path d="M50 500C150 450 350 350 350 200C350 50 150 50 100 150C50 250 150 350 250 350C350 350 450 200 400 100" stroke="#9333ea" strokeWidth="35" strokeLinecap="round" />
         </svg>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-6 md:mb-12 tracking-tight uppercase italic">COST <span className="text-orange-500">BREAKDOWN</span></h2>
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-12 w-full">
          <div className="w-full max-w-[640px] bg-slate-900 border-[4px] md:border-[6px] border-white/20 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_180px] md:grid-cols-[1fr_240px] bg-[#9333ea] border-b-[4px] md:border-b-[6px] border-white/20 text-white font-bold py-2.5 md:py-4 text-center uppercase tracking-widest text-xs md:text-base">
              <div>ITEM</div>
              <div className="border-l-[4px] md:border-l-[6px] border-white/20">AMOUNT</div>
            </div>
            {items.map((row, i) => (
              <div key={i} className={`grid grid-cols-[1fr_180px] md:grid-cols-[1fr_240px] border-b-[4px] md:border-b-[6px] border-white/10 last:border-b-0 text-center py-2 md:py-4 font-semibold text-[10px] md:text-base ${i % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/50'}`}>
                <div className="flex items-center justify-center px-4 md:px-6 text-slate-100">{row.item}</div>
                <div className="border-l-[4px] md:border-l-[6px] border-white/10 flex items-center justify-center font-bold text-orange-400">{row.amount}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#f97316] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.3)] border-[4px] md:border-[6px] border-white/20 flex items-center justify-center md:min-w-[280px]">
            <div className="text-3xl md:text-6xl font-black text-white whitespace-nowrap tracking-tight italic">7,510 USD</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 bg-[#9333ea] w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-[0_0_20px_rgba(147,51,234,0.5)] border-2 border-white/20 z-10">
        11
      </div>
    </div>
  );
};

const TheSquad = () => (
  <div className="h-full px-6 md:px-10 flex flex-col justify-center pt-16 md:pt-0">
    <div className="mb-10 md:mb-16 text-center">
      <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">Mission <span className="text-orange-500">Architects</span></h2>
      <p className="text-slate-500 mt-2 md:mt-4 font-orbitron text-[10px] md:text-xs tracking-widest uppercase">Team S.C.A.A.M Command</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto overflow-y-auto no-scrollbar max-h-[60vh] md:max-h-none">
      {[
        { name: 'Sandrine Ojong', role: 'Team Lead', origin: 'Cameroon' },
        { name: 'Chrys Gnagne', role: 'Technical Lead', origin: 'Côte d’Ivoire' },
        { name: 'Ayman Bahadur', role: 'Innovation Lead', origin: 'Nigeria' },
        { name: 'Abdulkadir Abduljabar', role: 'Impact Lead', origin: 'Rwanda' },
        { name: 'Marylene Sugira', role: 'Designer', origin: 'Mozambique' }
      ].map((member, i) => (
        <div key={i} className="glass-panel p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center text-center group hover:bg-orange-600/5 transition-all">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-900 rounded-2xl md:rounded-3xl mb-4 md:mb-6 overflow-hidden relative border border-slate-800 group-hover:border-orange-500 transition-colors shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center text-slate-700 group-hover:text-purple-500 transition-colors">
              <Users className="w-8 h-8 md:w-12 md:h-12" />
            </div>
          </div>
          <h4 className="text-white font-bold leading-tight mb-1 text-[10px] md:text-sm">{member.name}</h4>
          <div className="text-[7px] md:text-[9px] font-orbitron text-purple-500 font-bold uppercase tracking-widest mb-1 md:mb-2">{member.role}</div>
          <div className="text-[6px] md:text-[8px] text-slate-500 uppercase tracking-tighter">{member.origin}</div>
        </div>
      ))}
    </div>
  </div>
);

const CallToAction = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 pt-16 md:pt-0">
    <div className="glass-panel p-10 md:p-20 rounded-[2.5rem] md:rounded-[5rem] border-purple-500/30 max-w-5xl relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5">
        <Rocket className="w-32 h-32 md:w-64 md:h-64 text-orange-500" />
      </div>
      <h2 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 md:mb-8">Authorize the <span className="text-orange-500 italic">Mission</span></h2>
      <p className="text-lg md:text-3xl text-slate-300 font-light leading-relaxed italic mb-8 md:mb-12 max-w-3xl mx-auto">
        Join us in transforming education for <span className="text-white font-black underline decoration-purple-500 decoration-4 underline-offset-8">50,000 students</span> in the next 3 years.
      </p>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
        <div className="px-6 py-4 md:px-10 md:py-6 bg-purple-600 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 shadow-2xl hover:scale-105 transition-transform cursor-pointer">
          <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <span className="text-white font-bold italic tracking-tight text-sm md:text-base">contact@missiongenesis.ai</span>
        </div>
        <div className="px-6 py-4 md:px-10 md:py-6 bg-slate-900 border border-slate-700 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 hover:border-orange-500 transition-all cursor-pointer">
          <Globe className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
          <span className="text-slate-300 font-bold italic tracking-tight text-sm md:text-base">missiongenesis.africa</span>
        </div>
      </div>
    </div>
  </div>
);

const Sources = () => {
  const refs = [
    { text: "World Bank (via CEIC). (2023). Secondary education pupils: Cameroon CM: Secondary Education: Pupils. CEIC Data. https://www.ceicdata.com/en/cameroon/social-education-statistics/cm-secondary-education-pupils (reported by World Bank)" },
    { text: "UNESCO International Institute for Capacity Building in Africa. (2024). Cameroon education country brief. UNESCO IICBA. https://www.iicba.unesco.org/en/cameroon" },
    { text: "Tambe Ekobina, S. (2021). Challenges in the implementation of Competencies-Based Approach and the quality of teaching of history in some secondary schools in Mfoundi Division (Unpublished master's thesis). Université de Yaoundé I. DICAMES. https://hdl.handle.net/20.500.12177/10317" }
  ];

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center p-4 md:p-10 text-white overflow-hidden pt-16 md:pt-10">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.1] grayscale pointer-events-none" />
      
      <div className="absolute left-[-150px] top-[15%] opacity-20 pointer-events-none z-0 hidden md:block">
         <svg width="500" height="700" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-100 rotate-[-10deg]">
            <path d="M50 500C150 450 350 350 350 200C350 50 150 50 100 150C50 250 150 350 250 350C350 350 450 200 400 100" stroke="#9333ea" strokeWidth="40" strokeLinecap="round" />
         </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2.5 h-12 bg-purple-600 rounded-sm shadow-[0_0_20px_rgba(147,51,234,0.6)]" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">REFERENCES</h2>
        </div>
        
        <div 
          className="relative w-full bg-[#9333ea] border-[4px] md:border-[6px] border-orange-400 p-8 md:p-12 shadow-[0_0_60px_rgba(147,51,234,0.2)] rounded-sm overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        >
           <div className="absolute top-0 right-0 bg-orange-400 px-4 py-1.5 text-slate-900 font-black text-xs md:text-sm uppercase shadow-lg z-20">
             SA
           </div>

           <ul className="space-y-6 md:space-y-10 relative z-10">
             {refs.map((r, i) => (
               <li key={i} className="flex gap-5 items-start text-xs md:text-lg leading-relaxed text-purple-50 font-semibold italic text-left">
                 <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full mt-2 md:mt-3 shrink-0 shadow-md" />
                 <span>{r.text}</span>
               </li>
             ))}
           </ul>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 bg-[#9333ea] w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-white font-black text-xl md:text-3xl shadow-[0_0_30px_rgba(147,51,234,0.4)] border-2 border-white/20 z-10">
        14
      </div>
    </div>
  );
};

const Annexes = () => (
  <div className="h-full px-6 md:px-10 flex flex-col justify-center items-center pt-16 md:pt-0">
    <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-10 md:mb-16">Operational <span className="text-orange-500">Annexes</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-7xl overflow-y-auto no-scrollbar max-h-[60vh] md:max-h-none">
      {[
        { icon: <Terminal />, title: 'Tech Stack', list: ['React Architecture', 'Tailwind CSS UI', 'Gemini Neural Link', 'Simulation Engine'] },
        { icon: <Map />, title: 'Expansion', list: ['Alpha Pilot: Q1 2025', 'Market Scale: Q4 2025', 'Regional Sync: 2026', 'Impact Metric V3'] },
        { icon: <ShieldCheck />, title: 'Compliance', list: ['GDPR Protocol', 'Student Safety', 'MINSEC Curricula', 'Skill Verify'] }
      ].map((a, i) => (
        <div key={i} className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-slate-800/50 hover:border-purple-500/20 transition-all text-left">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
            <div className="p-2 md:p-4 bg-slate-900 rounded-xl text-orange-500 border border-slate-700 shadow-xl">
              {React.cloneElement(a.icon as React.ReactElement<any>, { className: "w-4 h-4 md:w-6 md:h-6" })}
            </div>
            <h4 className="text-sm md:text-lg font-bold text-white uppercase italic tracking-tight">{a.title}</h4>
          </div>
          <ul className="space-y-2 md:space-y-4">
            {a.list.map((item, j) => (
              <li key={j} className="text-slate-500 font-light flex items-center gap-2 md:gap-3 text-[10px] md:text-xs italic">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-purple-500 rounded-full shadow-[0_0_5px_rgba(147,51,234,1)] shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const ThankYou = () => (
  <div className="h-full w-full relative flex items-center justify-center overflow-hidden animate-in fade-in duration-1000">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://i.ibb.co/wHJVBSv/S-B-4.jpg" 
        alt="Team S.C.A.A.M Mission Genesis" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 165, 0, 0.06), rgba(147, 51, 234, 0.02), rgba(255, 69, 0, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />
    </div>

    <div className="relative z-10 w-full max-w-7xl px-6 md:px-20 h-full flex flex-col items-center justify-center">
       <div className="w-full border-[3px] md:border-[4px] border-dashed border-orange-500/80 rounded-sm p-8 md:p-16 relative flex flex-col justify-end items-start group shadow-[0_0_40px_rgba(249,115,22,0.2)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 -translate-x-2 -translate-y-2 opacity-60" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 translate-x-2 translate-y-2 opacity-60" />
          
          <h2 className="text-4xl md:text-7xl font-orbitron font-black text-orange-400 tracking-tighter italic drop-shadow-[0_0_20px_rgba(249,115,22,1)]">
            Thank You .
          </h2>
       </div>
    </div>

    <div className="absolute bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-[#9333ea] border-2 border-white/20 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-[0_0_40px_rgba(147,51,234,0.6)] z-20">
      16
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatLog, setChatLog] = useState<{role: 'ai'|'user', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const initialGreeting = "Greetings. I’m Dawn, the Team S.C.A.A.M AI Assistant—here to help and answer all your questions, and to help you understand the core of Team S.C.A.A.M, our mission, values, and vision.";

  const slides = [
    { name: 'Commencement', component: <IntroBriefing /> },
    { name: 'Threat Intel', component: <ProblemStatement /> },
    { name: 'Research Output', component: <ResearchInsights /> },
    { name: 'Core Strategy', component: <MissionVision /> },
    { name: 'Pillar Architecture', component: <ProductGenesis /> },
    { name: 'Business Model', component: <RevenueModel /> }, 
    { name: 'Target Audience', component: <TargetAudience /> }, 
    { name: 'Market Capacity', component: <MarketOpportunity /> }, 
    { name: 'Acquisition Channels', component: <AcquisitionStrategy /> }, 
    { name: 'System Interface', component: <InterfaceExplorer /> }, 
    { name: 'Cost Breakdown', component: <Financials /> },
    { name: 'Mission Architects', component: <TheSquad /> },
    { name: 'Final Directive', component: <CallToAction /> },
    { name: 'Operational Sources', component: <Sources /> }, 
    { name: 'Annexes', component: <Annexes /> }, 
    { name: 'Conclusion', component: <ThankYou /> } 
  ];

  const next = useCallback(() => setCurrentSlide(s => Math.min(s + 1, slides.length - 1)), [slides.length]);
  const prev = useCallback(() => setCurrentSlide(s => Math.max(s - 1, 0)), []);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      audioContextRef.current = ctx;
      gainNodeRef.current = gain;
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const speak = async (text: string, id: string | number) => {
    if (!text) return;
    initAudio();
    const ctx = audioContextRef.current!;
    const gain = gainNodeRef.current!;
    
    const sanitizedText = text.replace(/S\.C\.A\.A\.M/g, "Scam").replace(/[*_#~]/g, '').trim();

    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
    }

    setCurrentlyPlayingId(id);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: sanitizedText.substring(0, 1000), 
        config: {
          responseModalities: ['AUDIO'], 
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, 
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gain);
        currentSourceRef.current = source;
        
        const startTime = ctx.currentTime;
        const duration = audioBuffer.duration;
        
        const updateProgress = () => {
          if (!currentSourceRef.current) return;
          const elapsed = ctx.currentTime - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          setPlaybackProgress(progress);
          if (progress < 100) {
            requestAnimationFrame(updateProgress);
          } else {
            setPlaybackProgress(0);
            setCurrentlyPlayingId(null);
          }
        };

        source.start();
        requestAnimationFrame(updateProgress);
        
        source.onended = () => {
          setPlaybackProgress(0);
          setCurrentlyPlayingId(null);
          currentSourceRef.current = null;
        };
      } else {
        setCurrentlyPlayingId(null);
      }
    } catch (err) {
      console.warn("Dawn voice engine retry/failure:", err);
      setCurrentlyPlayingId(null);
    }
  };

  useEffect(() => {
    if (aiOpen && !hasGreeted) {
      speak(initialGreeting, 'intro');
      setHasGreeted(true);
    }
  }, [aiOpen, hasGreeted, initialGreeting]);

  const handleAiAsk = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setChatLog(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);
    
    const responseText = await askPitchAssistant(userText);
    const cleanedResponse = responseText || "Neural link unstable. Please repeat the query.";
    
    const newAiIndex = Date.now(); 
    setChatLog(prev => [...prev, { role: 'ai', text: cleanedResponse }]);
    setIsTyping(false);
    
    speak(cleanedResponse, newAiIndex);
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
    <div className="w-screen h-screen overflow-hidden relative select-none bg-slate-950 text-white">
      <MissionHUD 
        phase={slides[currentSlide].name} 
        progress={((currentSlide + 1) / slides.length) * 100} 
        current={currentSlide + 1}
        total={slides.length}
      />

      <main className="w-full h-full relative z-10">
        <div key={currentSlide} className="h-full slide-enter">
          {slides[currentSlide].component}
        </div>
      </main>

      <div className="fixed bottom-6 md:bottom-10 right-6 md:right-10 flex items-center gap-4 md:gap-6 z-50">
        <button 
          onClick={prev}
          disabled={currentSlide === 0}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-purple-600/30 disabled:opacity-10 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button 
          onClick={next}
          disabled={currentSlide === slides.length - 1}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-600 flex items-center justify-center text-white hover:bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-10 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <GameMenu current={currentSlide} total={slides.length} onSelect={setCurrentSlide} />

      <div className={`fixed left-4 bottom-4 md:left-8 md:bottom-10 z-[60] transition-all duration-700 ease-in-out ${aiOpen ? 'w-[230px] md:w-[310px] h-[340px] md:h-[460px]' : 'w-10 h-10 md:w-12 md:h-12'}`}>
        {aiOpen ? (
          <div className="w-full h-full glass-panel rounded-[1.2rem] md:rounded-[1.5rem] p-3 md:p-4 flex flex-col shadow-[0_0_60px_rgba(147,51,234,0.1)] border-purple-500/20 relative">
            
            {playbackProgress > 0 && (
              <div className="absolute top-0 left-0 w-full h-1 z-20 pointer-events-none rounded-t-[1.2rem] md:rounded-t-[1.5rem] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 via-orange-400 to-white shadow-[0_0_10px_rgba(147,51,234,0.8)] transition-all duration-100 ease-linear"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            )}

            <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 md:w-9 md:h-9 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg transition-transform ${currentlyPlayingId !== null ? 'scale-105' : ''}`}>
                  {currentlyPlayingId !== null ? <Waves className="w-3.5 h-3.5 md:w-4 md:h-4 text-white animate-[pulse_0.5s_infinite]" /> : <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                </div>
                <div className="text-left">
                  <div className="font-orbitron text-[6px] md:text-[8px] text-purple-400 font-bold tracking-[0.1em] uppercase">DAWN V1.2</div>
                  <div className="text-[5px] md:text-[7px] text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5 leading-none">
                    <Activity className={`w-1.5 h-1.5 ${currentlyPlayingId !== null ? 'text-orange-400 animate-pulse' : 'text-green-500'}`} /> {currentlyPlayingId !== null ? 'REPLAYING' : 'STABLE'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-md border border-white/5">
                   <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-0.5 transition-all ${isMuted ? 'text-red-400' : 'text-purple-400 hover:text-white'}`}
                  >
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-6 md:w-8 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <button 
                  onClick={() => setAiOpen(false)} 
                  className="p-1 bg-red-500/10 hover:bg-red-500/30 rounded-md transition-all text-red-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-hide pr-1">
              <div className="bg-purple-600/5 p-3 rounded-[0.8rem] border border-purple-500/10 text-purple-50 text-[9px] md:text-[11px] leading-relaxed italic relative text-left">
                <div className="absolute top-2.5 left-2.5">
                  <div className={`p-0.5 rounded-sm transition-colors ${currentlyPlayingId === 'intro' ? 'bg-orange-500' : 'bg-purple-600'}`}>
                    <MessageSquare className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="pl-5">
                  "{initialGreeting}"
                  <div className="mt-2.5 flex items-center gap-2">
                    <button 
                      onClick={() => speak(initialGreeting, 'intro')}
                      className={`flex items-center gap-1.5 text-[7px] md:text-[9px] text-white transition-all px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-md active:scale-95 ${currentlyPlayingId === 'intro' ? 'bg-orange-600' : 'bg-purple-600 hover:bg-purple-500'}`}
                    >
                      <PlayCircle className={`w-3 h-3 ${currentlyPlayingId === 'intro' ? 'animate-spin' : ''}`} /> 
                      REPLAY INTRO
                    </button>
                  </div>
                </div>
              </div>

              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[95%] p-2.5 rounded-[0.8rem] text-[9px] md:text-[11px] leading-relaxed font-light text-left relative overflow-hidden transition-all ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white shadow-md rounded-tr-none border border-purple-400/20' 
                      : `bg-slate-900/80 border text-purple-50 shadow-inner rounded-tl-none flex flex-col gap-1.5 ${currentlyPlayingId === i ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)]' : 'border-purple-500/10'}`
                  }`}>
                    <div>{msg.text}</div>
                    {msg.role === 'ai' && (
                      <div className="flex items-center justify-between mt-1">
                        <button 
                          onClick={() => speak(msg.text, i)}
                          className={`flex items-center gap-1 text-[7px] md:text-[9px] transition-all px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${currentlyPlayingId === i ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-400/5 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
                        >
                          <Volume2 className={`w-2.5 h-2.5 ${currentlyPlayingId === i ? 'animate-pulse' : ''}`} /> 
                          {currentlyPlayingId === i ? 'Playing' : 'Listen'}
                        </button>
                        {currentlyPlayingId === i && (
                          <div className="flex gap-0.5 items-end h-2">
                             <div className="w-0.5 bg-orange-400 animate-[waves_0.9s_ease-in-out_infinite]" style={{ height: '40%' }} />
                             <div className="w-0.5 bg-orange-400 animate-[waves_0.6s_ease-in-out_infinite]" style={{ height: '100%' }} />
                             <div className="w-0.5 bg-orange-400 animate-[waves_1.1s_ease-in-out_infinite]" style={{ height: '60%' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-1 p-1 items-center">
                  <div className="w-1 bg-purple-500 rounded-full animate-bounce h-1" />
                  <div className="w-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s] h-1" />
                  <div className="w-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s] h-1" />
                </div>
              )}
            </div>
            
            <div className="relative group mt-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-orange-400 rounded-full blur opacity-10 group-focus-within:opacity-20 transition-opacity" />
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAiAsk()}
                  placeholder="Intel query..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-full px-3.5 py-2 md:py-2.5 text-[9px] md:text-[10px] text-white outline-none focus:border-purple-500 transition-all pr-10 md:pr-11"
                />
                <button 
                  onClick={handleAiAsk}
                  className="absolute right-1.5 p-1.5 md:p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-all shadow-md active:scale-90 text-white"
                >
                  <Rocket className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setAiOpen(true)}
            className="w-full h-full bg-slate-900 border-2 border-purple-500/30 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all group backdrop-blur-3xl hover:border-purple-500 relative"
          >
            <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-10" />
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-orange-500 group-hover:text-white transition-colors" />
          </button>
        )}
      </div>

      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ 
          backgroundImage: 'linear-gradient(#9333ea 1px, transparent 1px), linear-gradient(90deg, #9333ea 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />

      <style>{`
        @keyframes waves {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default App;