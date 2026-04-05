"use client"

import { useParams } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import { 
  ShieldAlert, 
  Target, 
  Clock, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  Info,
  MessageSquare
} from "lucide-react";

// --- Types ---

interface AnalysisData {
  project_snapshot: {
    project_type: string;
    scope: string[];
    timeline: string;
  };
  scope_gaps: string[];
  risks: Array<{
    issue: string;
    category: "Scope" | "Timeline" | "Cost" | "Contract";
    severity: "Low" | "Medium" | "High";
  }>;
  risk_summary: {
    Scope: number;
    Timeline: number;
    Cost: number;
    Contract: number;
  };
  cost_signals: Array<{
    type: "Material" | "Labor" | "Logistics" | "Equipment";
    description: string;
    impact: "Low" | "Medium" | "High";
  }>;
  cost_breakdown: {
    Material: number;
    Labor: number;
    Logistics: number;
    Equipment: number;
  };
  recommendation: string;
  confidence: {
    level: "Low" | "Medium" | "High";
    score: number;
  };
  completeness_score: number;
}

// --- Static Dummy Data (as requested) ---

const DUMMY_ANALYSIS: AnalysisData = {
  project_snapshot: {
    project_type: "Commercial HVAC Retrofit",
    scope: ["Replace 4 modular chillers", "Retrofit BMS controls", "Test and Balance"],
    timeline: "14 weeks"
  },
  scope_gaps: [
    "No mention of crane permits or logistical staging",
    "Temporary cooling requirements during downtime not defined",
    "Missing interface details for fire alarm integration"
  ],
  risks: [
    { issue: "Long lead-time on modular chillers (18 weeks)", category: "Timeline", severity: "High" },
    { issue: "Access restricted to night-shift only", category: "Cost", severity: "Medium" },
    { issue: "Potential asbestos in mechanical penthouse", category: "Contract", severity: "High" }
  ],
  risk_summary: {
    Scope: 1,
    Timeline: 1,
    Cost: 1,
    Contract: 1
  },
  cost_signals: [
    { type: "Material", description: "Stainless steel pipe pricing volatile (+15%)", impact: "High" },
    { type: "Labor", description: "Specialized BMS technicians required", impact: "Medium" }
  ],
  cost_breakdown: {
    Material: 45,
    Labor: 35,
    Logistics: 12,
    Equipment: 8
  },
  recommendation: "Request specialized asbestos survey before submittal. Negotiate 4-week timeline extension due to chiller delays.",
  confidence: {
    level: "High",
    score: 88
  },
  completeness_score: 72
};

// --- Styling Constants ---

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
const SEVERITY_COLORS = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700"
};

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const data = DUMMY_ANALYSIS; // Using dummy data for now

  // Prepare data for charts
  const riskData = Object.entries(data.risk_summary).map(([name, value]) => ({ name, value }));
  const costData = Object.entries(data.cost_breakdown).map(([name, value]) => ({ name, value }));
  const radialData = [{ name: 'Completeness', value: data.completeness_score, fill: '#6366f1' }];

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {data.project_snapshot.project_type}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-sm flex items-center gap-1">
                #ORD-{id?.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-none">Tender Analysis Report</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">AI Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-bold ${data.confidence.level === 'High' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {data.confidence.level} ({data.confidence.score}%)
                </span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${data.confidence.score}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column (Left/Center) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Snapshot & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Zap size={20}/></div>
                  <h2 className="font-bold text-slate-800">Project Snapshot</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-400"/>
                    <span className="text-sm text-slate-600">Timeline: <b className="text-slate-900">{data.project_snapshot.timeline}</b></span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Core Scope</p>
                    <ul className="space-y-1">
                      {data.project_snapshot.scope.map((item, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-1 shrink-0"/>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg"><Info size={20}/></div>
                  <h2 className="font-bold">Recommendation</h2>
                </div>
                <p className="text-indigo-50 leading-relaxed text-sm">
                  {data.recommendation}
                </p>
                <button className="mt-6 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                  Generate Response Draft
                </button>
              </div>
            </div>

            {/* Scope Gaps & Risks List */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShieldAlert size={20}/></div>
                  <h2 className="font-bold text-slate-800 text-xl">Critical Risks & Gaps</h2>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  Auto-Detected
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Identified Gaps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.scope_gaps.map((gap, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-600">
                        {gap}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">High-Level Risks</h3>
                  <div className="space-y-3">
                    {data.risks.map((risk, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <AlertTriangle className={risk.severity === 'High' ? 'text-red-500' : 'text-amber-500'} size={18}/>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{risk.issue}</p>
                            <span className="text-xs text-slate-400">{risk.category}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${SEVERITY_COLORS[risk.severity]}`}>
                          {risk.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column (Right) */}
          <div className="space-y-8">
            
            {/* Completeness Score Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="flex items-center gap-3 self-start mb-6 w-full">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Target size={20}/></div>
                <h2 className="font-bold text-slate-800">Doc Integrity</h2>
              </div>
              <div className="relative w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={30} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-2">
                  <p className="text-4xl font-black text-slate-900">{data.completeness_score}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-4 px-4">
                The document is <b>{data.completeness_score}%</b> complete based on industry tender standards.
              </p>
            </div>

            {/* Risk Distribution Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle size={20}/></div>
                <h2 className="font-bold text-slate-800">Risk Matrix</h2>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Breakdown Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
                <h2 className="font-bold text-slate-800">Cost Focus</h2>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 600}} />
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
