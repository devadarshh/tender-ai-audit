"use client"

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Target, Clock, AlertTriangle, 
  Zap, Loader2, TrendingUp, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { getAnalysisResult } from "../../actions";
import { toast } from "sonner";
import type { AuditAnalysisSchema } from "@/lib/analyser";

// --- Types ---

interface AnalysisData extends AuditAnalysisSchema {
  document?: {
    fileName: string;
  };
}

// Brickanta Brand Palette
const BRAND_COLORS = {
  accent: '#A65536',   
  dark: '#0C152F',     
  muted: '#9C9B98',    
  action: '#FF1E00',   
  paper: '#F5F0E6'      
};

const CHART_COLORS = ['#0C152F', '#A65536', '#708E99', '#A78865'];

const SEVERITY_COLORS: Record<string, string> = {
  Low: "bg-blue-50 text-blue-600 border border-blue-100",
  Medium: "bg-amber-50 text-amber-700 border border-amber-100",
  High: "bg-rose-50 text-rose-600 border border-rose-100"
};

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("processing");

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchResult = async () => {
      try {
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
          setStatus(result?.status ?? "waiting");
        }
      } catch (err) {
        console.error("Fetch Analysis Error:", err);
      }
    };

    void fetchResult();
    intervalId = setInterval(() => {
      void fetchResult();
    }, 3000); 

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="animate-spin text-brand-accent font-tektur" size={48} />
        <div className="text-center font-tektur">
          <h2 className="text-2xl font-black text-brand-dark tracking-tighter italic">Analyzing...</h2>
          <p className="text-brand-muted text-[10px] mt-1 uppercase tracking-widest font-black transition-all">
            Brickanta AI Engine Online • {status.toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const riskData = Object.entries(data.riskSummary ?? {}).map(([name, value]) => ({ name, value }));
  const costData = Object.entries(data.costBreakdown ?? {}).map(([name, value]) => {
    let parsed = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (!parsed || parsed <= 0) parsed = 25; 
    return { name, value: parsed };
  });

  const confidenceLevel = data.confidence?.level ?? 'Medium';
  let confColorText = 'text-yellow-500';
  if (confidenceLevel === 'High') {
    confColorText = 'text-[#10B981]'; 
  } else if (confidenceLevel === 'Low') {
    confColorText = 'text-[#F43F5E]'; 
  }

  const riskCount = riskData.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFCF9] p-4 md:p-8 pt-24 font-inter text-brand-dark overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-1000">
        
        {/* TOP: Navigation & Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            href="/overview" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] font-tektur text-brand-muted hover:text-brand-accent transition-all w-fit"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Ledger
          </Link>
          <div className="flex items-center gap-3 bg-brand-dark text-white px-4 py-2 rounded-full shadow-lg shadow-brand-dark/10 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-action animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-widest font-tektur">Protocol Active • Live AI Audit</span>
          </div>
        </div>

        {/* HEADER: Title & Reference */}
        <div className="space-y-4 border-l-8 border-brand-accent pl-8 py-4">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 bg-brand-accent animate-pulse"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] font-tektur text-brand-accent">
              {(data.document?.fileName ?? "Generic Tender") }
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-tektur leading-none">
            Project <span className="font-brand-serif italic font-light text-brand-accent">Intelligence</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <p className="font-mono text-[11px] text-brand-muted font-bold uppercase flex items-center gap-2">
              <span className="opacity-50">Reference:</span> ID-{id?.slice(0, 8)}
            </p>
            <span className="w-1 h-1 rounded-full bg-brand-dark/20"></span>
            <p className="font-mono text-[11px] text-brand-muted font-bold uppercase flex items-center gap-2">
              <span className="opacity-50">Type:</span> {data.projectSnapshot?.projectType ?? "N/A"}
            </p>
          </div>
        </div>

        {/* ROW 1: KPI STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-dark/5 flex flex-col justify-between group hover:border-brand-accent/30 transition-all">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest font-tektur mb-4">Risk Density</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-tektur text-brand-dark tracking-tighter">{riskCount}</span>
              <span className="text-[10px] font-bold text-brand-muted uppercase">Issues</span>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-dark/5">
              <span className={`text-[9px] font-black px-2 py-1 rounded-full ${riskCount > 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600 uppercase'}`}>
                {riskCount > 10 ? 'Critical Density' : 'Stable Profile'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-dark/5 flex flex-col justify-between group hover:border-brand-accent/30 transition-all">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest font-tektur mb-4">Audit Completion</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-tektur text-brand-accent tracking-tighter">{data.completenessScore}%</span>
              <div className="h-2 w-16 bg-brand-dark/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent transition-all duration-[2s]" style={{ width: `${data.completenessScore}%` }}></div>
              </div>
            </div>
            <p className="text-[9px] font-bold text-brand-muted mt-4">Calculated based on document depth.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-dark/5 flex flex-col justify-between group hover:border-brand-accent/30 transition-all lg:col-span-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 -scale-x-100 rotate-12"><Clock size={120}/></div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest font-tektur mb-4">Project Timeline Window</p>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-brand-dark rounded-xl text-white">
                <Clock size={24} />
              </div>
              <p className="text-[15px] md:text-[18px] font-bold text-brand-dark leading-tight uppercase tracking-tight max-w-[80%]">
                {data.projectSnapshot?.timeline ?? "Timeline data not found in extraction protocol."}
              </p>
            </div>
            <p className="text-[9px] font-bold text-brand-muted mt-4 opacity-50 uppercase tracking-widest leading-none relative z-10">Inferred from contract clauses</p>
          </div>
        </div>

        {/* ROW 2: MAIN ANALYSIS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Expert Recommendation (The Big Idea) */}
            <div className="bg-brand-dark p-8 md:p-12 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12"><Zap size={200}/></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-8 bg-brand-accent"></div>
                  <span className="text-[11px] font-black uppercase tracking-[.4em] font-tektur text-brand-accent">Expert Decision Engine</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-brand-serif italic font-light leading-[1.3] text-white/90">
                  &ldquo;{data.recommendation}&rdquo;
                </h3>
              </div>
            </div>

            {/* Findings Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gaps List */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-brand-dark/5 pb-4 px-2">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] font-tektur text-brand-dark/40 italic">01. Protocol Gaps</h4>
                    <span className="text-[10px] font-mono text-brand-accent font-black">{data.scopeGaps?.length ?? 0} Missing</span>
                 </div>
                 <div className="space-y-3">
                    {(data.scopeGaps ?? []).map((gap, i) => (
                      <div key={i} className="group p-6 bg-white border border-brand-dark/5 rounded-[24px] hover:border-brand-action/40 transition-all flex items-start gap-5 shadow-sm hover:shadow-2xl">
                        <div className="mt-1 w-6 h-6 rounded-lg flex items-center justify-center bg-brand-action/5 text-brand-action shrink-0 shadow-inner">
                          <AlertTriangle size={14}/>
                        </div>
                        <p className="text-[14px] font-bold text-brand-dark leading-relaxed">{gap}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Snapshot List (Full Scope) */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-brand-dark/5 pb-4 px-2">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] font-tektur text-brand-dark/40 italic">02. Scope Profile</h4>
                    <span className="text-[10px] font-mono text-brand-secondary font-black">{data.projectSnapshot?.scope?.length ?? 0} Points</span>
                 </div>
                 <div className="bg-brand-paper/30 p-8 rounded-[32px] border border-brand-dark/5 space-y-5">
                    {(data.projectSnapshot?.scope ?? []).map((item, i) => (
                      <div key={i} className="flex items-start gap-4 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/30 mt-2 shrink-0 group-hover:bg-brand-accent transition-colors"></div>
                        <p className="text-[14px] font-bold text-brand-dark/80 group-hover:text-brand-dark transition-colors leading-relaxed tracking-tight">{item}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Sidebar Analytics (1/3) */}
          <div className="space-y-8 sticky top-24">
            
            {/* Risk Distribution Chart */}
            <div className="bg-white p-8 rounded-[32px] border border-brand-dark/5 shadow-sm space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[11px] font-black text-brand-muted uppercase tracking-widest font-tektur">Category Analytics</h4>
                  <p className="text-[10px] text-brand-muted/60 uppercase font-black">Cluster impact</p>
                </div>
                <TrendingUp size={16} className="text-brand-accent"/>
              </div>
              <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} margin={{ top: 20, right: 0, left: -40, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#9C9B98', letterSpacing: 1.5}} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: 'rgba(12, 21, 47, 0.03)'}} 
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            const dataPayload = payload[0]?.payload as { name: string };
                            return (
                              <div className="bg-brand-dark text-brand-bg p-4 shadow-3xl border border-brand-accent/20 rounded-2xl">
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">{dataPayload?.name}</p>
                                <p className="text-2xl font-black font-tektur italic text-brand-accent leading-none">{payload[0]?.value} Issues</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill={BRAND_COLORS.dark} radius={[10, 10, 10, 10]} barSize={28} label={{ position: 'top', fill: BRAND_COLORS.accent, fontSize: 10, fontWeight: 900, offset: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Pie Chart */}
            <div className="bg-white p-8 rounded-[32px] border border-brand-dark/5 shadow-sm space-y-6">
               <h4 className="text-[11px] font-black text-brand-muted uppercase tracking-widest font-tektur">Cost Sensitivity</h4>
               <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, bottom: 20 }}>
                      <Pie data={costData} innerRadius={65} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none" cx="50%" cy="45%">
                        {costData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} className="focus:outline-none" />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '900', paddingTop: '30px', textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.8}} />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
            </div>

            {/* Intelligence Card */}
            <div className="bg-brand-dark p-8 rounded-[32px] text-white space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 p-20 opacity-5 scale-150 group-hover:scale-125 transition-transform"><Target size={150}/></div>
              <div className="flex items-center gap-3 text-brand-accent">
                <Target size={20}/>
                <h5 className="text-[11px] font-black uppercase tracking-[.3em] font-tektur">Audit Intelligence</h5>
              </div>
              <p className="text-[12px] font-medium text-white/70 leading-[1.8] relative z-10 font-inter">
                This report generated using **Expert RAG Protocol v2**. Data integrity based on cross-referencing {data.projectSnapshot?.scope?.length ?? 0} construction silos. Audit finalized by Brickanta AI.
              </p>
              <div className="pt-4 flex items-center justify-between relative z-10 border-t border-white/10 mt-4">
                 <div className={`text-[10px] font-black uppercase tracking-widest ${confColorText}`}>Status: Certified</div>
                 <div className="text-[9px] font-mono text-white/30 uppercase">Build 0x7E4</div>
              </div>
            </div>

          </div>
        </div>

        {/* ROW 3: Risk Inventory (FULL WIDTH) */}
        <div className="space-y-8 pt-12">
          <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-6">
            <h4 className="text-[14px] font-black uppercase tracking-[0.4em] font-tektur italic text-brand-dark/40">03. Audit Findings & Risk Inventory</h4>
            <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-rose-400 border-4 border-white shadow-lg"></div>
                      <div className="w-8 h-8 rounded-full bg-amber-400 border-4 border-white shadow-lg"></div>
                      <div className="w-8 h-8 rounded-full bg-blue-400 border-4 border-white shadow-lg"></div>
                  </div>
                  <span className="text-[11px] font-black text-brand-dark uppercase font-tektur tracking-[0.2em] pl-4">Priority Scoring Active</span>
                </div>
                <div className="h-8 w-px bg-brand-dark/10 mx-2"></div>
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest font-mono">Rating Logic v1.4</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.risks ?? []).map((risk, i) => (
                <div key={i} className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-8 bg-white rounded-[40px] border border-brand-dark/5 hover:border-brand-accent/40 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(166,85,54,0.15)] hover:-translate-y-2 transition-all duration-500 group overflow-hidden relative">
                  <div className="flex items-start gap-8 pr-12 relative z-10">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:rotate-6 duration-500 ${risk.severity === 'High' ? 'bg-brand-action text-white shadow-brand-action/20' : 'bg-brand-dark text-white'}`}>
                      <AlertTriangle size={28}/>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[18px] md:text-[20px] font-black text-brand-dark tracking-tight leading-[1.3] group-hover:text-brand-accent transition-colors">
                        {risk.issue}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-brand-muted uppercase tracking-[.2em] opacity-60 italic">{risk.category}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/20"></span>
                        <span className="text-[10px] font-black text-brand-muted/30 uppercase tracking-[0.3em] font-mono">IDX-R{i+1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 md:mt-0 flex items-center gap-6 shrink-0 relative z-10">
                    <span className={`px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[.2em] shadow-lg transition-transform group-hover:scale-105 ${SEVERITY_COLORS[risk.severity] ?? ""}`}>
                      {risk.severity} LEVEL
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}
