"use client"

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import { 
  ShieldAlert, Target, Clock, AlertTriangle, DollarSign, 
  Zap, CheckCircle2, Info, Loader2, Search, TrendingUp
} from "lucide-react";
import { getAnalysisResult } from "../../actions";
import { toast } from "sonner";

// --- Types ---

interface AnalysisData {
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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
const SEVERITY_COLORS = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700"
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
    intervalId = setInterval(fetchResult, 3000); // Polling for real-time updates

    return () => clearInterval(intervalId);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Expert AI Analysis in Progress</h2>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-black">
            Current Status: {status}
          </p>
          <p className="text-slate-400 text-xs mt-6 italic max-w-xs leading-relaxed">
            Extracting scope details and assessing risk parameters from your tender document...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Formatting for Recharts
  const riskData = Object.entries(data.riskSummary || {}).map(([name, value]) => ({ name, value }));
  const costData = Object.entries(data.costBreakdown || {}).map(([name, value]) => ({ name, value }));
  const radialData = [{ name: 'Completeness', value: data.completenessScore || 0, fill: '#6366f1' }];

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {data.projectSnapshot?.project_type || "Tender Document"}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-xs font-mono">
                ORD-{id?.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tight italic">Audit Report</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditor Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-bold ${data.confidence?.level === 'High' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {data.confidence?.level} ({data.confidence?.score}%)
                </span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${data.confidence?.score}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Zap size={20}/></div>
                  <h2 className="font-bold text-slate-800 tracking-tight">Project Snapshot</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-400"/>
                    <span className="text-sm text-slate-600 font-medium">Timeline: <b className="text-slate-900">{data.projectSnapshot?.timeline || "N/A"}</b></span>
                  </div>
                  <div className="space-y-2 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Scope</p>
                    <ul className="space-y-2">
                      {(data.projectSnapshot?.scope || []).map((item, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-3 leading-relaxed">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-1 shrink-0"/>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-lg shadow-indigo-100 text-white relative flex flex-col justify-between overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-700"><Target size={180}/></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/20 rounded-lg"><Info size={20}/></div>
                      <h2 className="font-bold tracking-tight">Expert Rec</h2>
                    </div>
                    <p className="text-indigo-50 leading-relaxed text-sm font-medium italic">
                      "{data.recommendation}"
                    </p>
                </div>
                <button className="relative mt-8 w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all">
                  Generate Response Draft
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-baseline justify-between mb-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ShieldAlert size={20}/></div>
                  <h2 className="font-bold text-slate-800 text-xl tracking-tight">Scope Gaps & Critical Risks</h2>
                </div>
                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">AI-Detected</span>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Identified Gaps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.scopeGaps || []).map((gap, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-[11px] text-slate-600 font-medium">
                        {gap}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Detailed Risk Tracker</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {(data.risks || []).map((risk, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all hover:shadow-lg hover:shadow-slate-100/50 cursor-default group">
                        <div className="flex items-center gap-4">
                          <AlertTriangle className={risk.severity === 'High' ? 'text-rose-500' : 'text-amber-500'} size={20}/>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{risk.issue}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{risk.category}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${SEVERITY_COLORS[risk.severity as keyof typeof SEVERITY_COLORS]}`}>
                          {risk.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="flex items-center gap-3 self-start mb-6 w-full">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Target size={20}/></div>
                <h2 className="font-bold text-slate-800 tracking-tight">Doc Readiness</h2>
              </div>
              <div className="relative w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={30} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-2">
                  <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{data.completenessScore}%</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Prepared</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center font-medium px-6 mt-4">
                The document is rated {data.completenessScore}% for completeness against the initial tender request.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingUp size={20}/></div>
                <h2 className="font-bold text-slate-800 tracking-tight">Risk Distribution</h2>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
                <h2 className="font-bold text-slate-800 tracking-tight">Cost Signals</h2>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                      {costData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 700, paddingTop: '20px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
