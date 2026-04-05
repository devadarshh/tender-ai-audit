"use client"

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import { 
  ShieldAlert, Target, Clock, AlertTriangle, DollarSign, 
  Zap, CheckCircle2, Info, Loader2, Search, TrendingUp, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { getAnalysisResult } from "../../actions";
import { toast } from "sonner";

// --- Types ---

interface AnalysisData {
  document?: any;
  projectSnapshot: any;
  scopeGaps: string[];
  risks: any[];
  riskSummary: any;
  costSignals: any[];
  costBreakdown: any;
  recommendation: string;
  confidence: any;
  completenessScore: number;
}

// Brickanta Brand Palette (Matching User's Specs)
const BRAND_COLORS = {
  accent: '#A65536',   // Terra cotta
  dark: '#0C152F',     // Deep Blue
  muted: '#9C9B98',    // Gray
  action: '#FF1E00',   // Red focus
  paper: '#F5F0E6'      // Off-white
};

const CHART_COLORS = ['#0C152F', '#A65536', '#708E99', '#A78865'];

const SEVERITY_COLORS = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-brand-secondary/20 text-brand-secondary",
  High: "bg-rose-100 text-rose-600"
};

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("processing");

  useEffect(() => {
    let intervalId: any;

    const fetchResult = async () => {
      const result = await getAnalysisResult(id);
      if (result?.status === "completed" && result.data) {
        setData(result.data as unknown as AnalysisData);
        setIsLoading(false);
        if (intervalId) clearInterval(intervalId);
      } else if (result?.status === "failed") {
        toast.error("Analysis Failed", { description: "The AI could not process this document." });
        setIsLoading(false);
        if (intervalId) clearInterval(intervalId);
      } else {
        setStatus(result?.status || "waiting");
      }
    };

    fetchResult();
    intervalId = setInterval(fetchResult, 3000); 

    return () => clearInterval(intervalId);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="animate-spin text-brand-accent font-tektur" size={48} />
        <div className="text-center font-tektur">
          <h2 className="text-2xl font-black text-brand-dark tracking-tighter italic">Analyzing...</h2>
          <p className="text-brand-muted text-[10px] mt-1 uppercase tracking-widest font-black">
            Brickanta AI Engine Online • Phase: {status}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Formatting for Recharts
  const riskData = Object.entries(data.riskSummary || {}).map(([name, value]) => ({ name, value }));
  const costData = Object.entries(data.costBreakdown || {}).map(([name, value]) => {
    let parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (!parsed || parsed <= 0) parsed = 25; // Fallback to 25% equal parts if AI yields '0'
    return { name, value: parsed };
  });
  const radialData = [{ name: 'Completeness', value: data.completenessScore || 0, fill: BRAND_COLORS.accent }];

  const confidenceLevel = data.confidence?.level || 'Medium';
  let confColorText = 'text-yellow-500';
  let confColorBg = 'bg-yellow-500';
  if (confidenceLevel === 'High') {
    confColorText = 'text-[#10B981]'; // Tailwind emerald-500 hex
    confColorBg = 'bg-[#10B981]';
  } else if (confidenceLevel === 'Low') {
    confColorText = 'text-[#F43F5E]'; // Tailwind rose-500 hex
    confColorBg = 'bg-[#F43F5E]';
  }

  return (
    <div className="min-h-screen bg-brand-bg p-8 pt-24 font-inter text-brand-dark overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-1000">
        
        {/* Navigation Back Action */}
        <Link 
          href="/overview" 
          className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.2em] font-tektur text-brand-muted hover:text-brand-accent transition-colors w-fit"
        >
          <ChevronLeft size={16} /> Return to Ledger
        </Link>

        {/* Brickanta Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b-2 border-brand-dark/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 bg-brand-action rounded-xs"></div>
              <span className="text-[12px] font-black uppercase tracking-[0.2em] font-tektur text-brand-secondary truncate max-w-sm">
                {data.document?.fileName || data.projectSnapshot?.project_type || "Tender Document"} • Audited by Brickanta
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter font-tektur leading-[0.8] mb-4">
              Tender <span className="font-brand-serif font-light text-brand-accent">Report</span>
            </h1>
            <p className="font-mono text-[12px] text-brand-muted font-bold uppercase bg-brand-paper px-3 py-1 rounded inline-block">
              PROJECT REFERENCE: ID-{id?.slice(0, 8)}
            </p>
          </div>
          
          <div className="text-right space-y-1">
            <p className="text-[12px] font-black text-brand-muted uppercase tracking-widest font-tektur text-right opacity-60">Confidence Level</p>
            <div className="flex items-center gap-4">
               <span className={`text-2xl font-black font-tektur italic ${confColorText}`}>
                  {data.confidence?.score}%
                </span>
                <div className="w-32 h-1 bg-brand-dark/5 overflow-hidden">
                  <div className={`h-full transition-all duration-[2s] ${confColorBg}`} style={{ width: `${data.confidence?.score}%` }}></div>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Expert Verdict Dedicated Area */}
          <div className="bg-brand-dark p-12 py-16 rounded-sm text-brand-bg relative flex flex-col overflow-hidden shadow-2xl">
            <div className="absolute -top-20 -right-10 p-20 opacity-5 rotate-12 scale-150"><Target size={400}/></div>
            <div className="relative z-10 w-full max-w-5xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-brand-accent font-tektur italic font-bold tracking-wider text-xl uppercase">Expert Verdict</div>
                </div>
                <div>
                  <p className="font-brand-serif text-2xl font-light leading-[1.6] italic text-brand-paper/95">
                    "{data.recommendation}"
                  </p>
                </div>
            </div>
          </div>

          {/* Top Level Metric Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-brand-paper p-8 rounded-sm border-l-4 border-brand-dark h-full relative group hover:shadow-2xl hover:shadow-brand-dark/5 transition-all">
              <div className="flex items-center gap-3 mb-8">
                <div className="text-brand-accent"><Zap size={24}/></div>
                <h2 className="text-xl font-black font-tektur tracking-tight uppercase">Snapshot</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3 bg-brand-dark/5 p-3 rounded">
                  <Clock size={16} className="text-brand-secondary"/>
                  <span className="text-[13px] uppercase font-black tracking-widest">Est. Timeline: {data.projectSnapshot?.timeline || "N/A"}</span>
                </div>
                <div className="space-y-4">
                  <p className="text-[12px] font-black text-brand-muted uppercase tracking-widest mb-2">Documented Scope</p>
                  <ul className="space-y-4">
                    {(data.projectSnapshot?.scope || []).map((item: string, i: number) => (
                      <li key={i} className="text-[13px] text-brand-dark flex items-start gap-4 font-bold leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-brand-accent mt-1.5 shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-brand-paper p-8 rounded-sm border border-brand-dark/5 flex flex-col items-center h-full justify-center shadow-sm">
              <div className="self-start mb-6">
                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest font-tektur">Document Integrity</h3>
              </div>
              <div className="relative w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={0} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-2">
                  <p className="text-4xl font-black text-brand-dark tracking-tighter font-tektur">{data.completenessScore}%</p>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest scale-75 font-tektur">Ready</p>
                </div>
              </div>
              <p className="text-[11px] text-brand-muted text-center font-medium mt-4 leading-relaxed">
                Document data is {data.completenessScore}% resolved against Brickanta's standards.
              </p>
            </div>
          </div>



          {/* Bottom Level Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-10">
              <div className="flex items-center justify-between border-b border-brand-dark/10 pb-4">
                <h2 className="text-3xl font-black font-tektur uppercase tracking-tighter">Gap <span className="font-brand-serif italic font-light lowercase">Analysis</span></h2>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-action animate-pulse"></span>
                  <span className="text-[11px] font-black opacity-60 uppercase tracking-widest font-tektur">Live AI Sync</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 bg-brand-paper/50 p-6 rounded border border-brand-dark/5">
                  <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 block border-b border-brand-dark/5 pb-2">Identified Scope Gaps</h3>
                  {(data.scopeGaps || []).map((gap, i) => (
                    <div key={i} className="p-5 bg-brand-bg border border-brand-dark/5 text-[13px] font-inter font-medium text-brand-dark/90 leading-relaxed flex items-start gap-4 shadow-sm">
                      <span className="text-brand-action text-[12px] mt-1 shrink-0">❗</span>
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 block border-b border-brand-dark/5 pb-2">Risk Inventory</h3>
                    {(data.risks || []).map((risk, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-brand-paper border border-brand-dark/5 hover:border-brand-accent transition-all cursor-default group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xs flex items-center justify-center ${risk.severity === 'High' ? 'bg-brand-action/10 text-brand-action' : 'bg-brand-accent/10 text-brand-accent'}`}>
                            <AlertTriangle size={16}/>
                          </div>
                          <div>
                            <p className="text-[13px] font-black uppercase font-tektur text-brand-dark tracking-tight leading-none mb-1">{risk.issue}</p>
                            <span className="text-[11px] font-black text-brand-muted uppercase tracking-[0.1em] opacity-60">{risk.category}</span>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest ${SEVERITY_COLORS[risk.severity as keyof typeof SEVERITY_COLORS]}`}>
                          {risk.severity}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-brand-bg p-8 border border-brand-dark/10 h-[280px] shadow-sm flex flex-col justify-between">
                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 font-tektur group flex items-center gap-2">
                  <TrendingUp size={12}/> Risk Matrix
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1D7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#9C9B98', letterSpacing: 1}} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: 'rgba(12, 21, 47, 0.05)'}} contentStyle={{borderRadius: '0px', border: 'none', backgroundColor: '#0C152F', color: '#FBFBF3', fontSize: '10px'}} />
                      <Bar dataKey="value" fill={BRAND_COLORS.dark} radius={[0, 0, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-brand-paper p-8 border border-brand-dark/5 shadow-sm">
                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 font-tektur">Financial Signals</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, bottom: 20 }}>
                      <Pie data={costData} innerRadius={60} outerRadius={85} paddingAngle={0} dataKey="value" stroke="none" cx="50%" cy="45%">
                        {costData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="rect" wrapperStyle={{fontSize: '9px', fontWeight: 900, paddingTop: '30px', textTransform: 'uppercase', letterSpacing: 1}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
