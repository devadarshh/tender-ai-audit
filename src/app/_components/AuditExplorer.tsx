"use client"

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, LogOut, FileText, BarChart3, Clock, 
  ChevronRight, AlertTriangle, CheckCircle,
  LayoutGrid, List
} from "lucide-react";
import { signOut } from "next-auth/react";

interface Document {
  id: string;
  fileName: string;
  status: string;
  createdAt: Date;
  analysis?: {
    completenessScore: number;
  } | null;
}

interface AuditExplorerProps {
  initialDocuments: Document[];
  userEmail?: string | null;
}

/**
 * BRICKANTA AUDIT EXPLORER
 * Senior-level client component for dynamic view management (Grid vs List).
 * Orchestrates high-fidelity animations and responsive layout shifts.
 */
export function AuditExplorer({ initialDocuments, userEmail }: AuditExplorerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Premium Header Integrated with View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 pb-12 border-b-2 border-brand-dark/10 mb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-4 scale-110 origin-left">
             <div className="w-5 h-5 bg-brand-action"></div>
             <span className="font-tektur font-black text-2xl uppercase tracking-tighter italic text-brand-dark">Brickanta Overview</span>
          </div>
          
          <h1 className="text-[10rem] font-black font-tektur tracking-tighter leading-[0.75] italic -ml-1 text-brand-dark">
            Audit <br/> <span className="font-brand-serif font-light text-brand-secondary lowercase italic">ledger</span>
          </h1>
          
          <div className="flex items-center gap-8 pt-4">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[13px] font-black uppercase tracking-widest text-brand-dark">System Online</span>
             </div>
             <span className="text-brand-dark/20 h-4 border-l border-brand-dark/20"></span>
             <p className="text-[13px] text-brand-muted font-tektur font-black tracking-widest uppercase italic bg-brand-dark/5 px-2 py-1">
                Authenticated: {userEmail}
             </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-6">
          {/* View Toggle Control */}
          <div className="bg-brand-paper p-1.5 flex gap-1 border border-brand-dark/5 shadow-sm rounded-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-brand-dark text-brand-bg shadow-lg' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <LayoutGrid size={18}/>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-brand-dark text-brand-bg shadow-lg' : 'text-brand-muted hover:text-brand-dark'}`}
            >
              <List size={18}/>
            </button>
          </div>

          <div className="flex items-center gap-4">


             <button 
               onClick={() => signOut({ callbackUrl: '/' })}
               className="flex items-center gap-3 bg-brand-bg border-2 border-brand-dark/5 px-6 py-4 text-brand-dark hover:text-brand-action hover:border-brand-action/30 transition-all cursor-pointer shadow-lg group font-tektur font-black text-[12px] uppercase tracking-widest"
             >
               <LogOut size={18} className="group-hover:-translate-x-1 transition-transform"/> LOGOUT
             </button>
          </div>
        </div>
      </div>

      {/* Full-width Initiate Sequence Button */}
      <Link 
        href="/upload" 
        className="flex items-center gap-4 px-10 py-6 mb-10 border-2 border-dotted border-[#A65536] bg-[#A65536]/5 hover:bg-[#A65536]/10 transition-all group cursor-pointer w-full"
      >
         <Plus size={22} className="text-[#A65536] group-hover:rotate-90 transition-transform duration-500"/>
         <span className="font-tektur text-[14px] font-black uppercase tracking-[0.2em] text-[#A65536]">Initiate New Sequence</span>
      </Link>

      {/* Dynamic Content Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-in slide-in-from-bottom-12 duration-1000">
          {/* Stats Summary Card (Fixed in Grid) */}
          <div className="bg-brand-dark text-brand-paper p-10 flex flex-col justify-between h-[340px] shadow-2xl relative overflow-hidden group">
             <div className="relative">
               <h3 className="text-[12px] font-black uppercase tracking-[0.4em] opacity-50 font-tektur mb-6">Integrity Summary</h3>
               <p className="text-7xl font-black font-tektur italic tracking-tighter leading-none">{initialDocuments.length}</p>
               <p className="text-[14px] mt-4 uppercase tracking-[0.1em] font-black opacity-80 italic">Audits Sequence Active</p>
             </div>
             <BarChart3 size={200} className="absolute -bottom-16 -right-16 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12"/>
             <button className="relative w-full border-t border-brand-paper/20 pt-6 text-[12px] uppercase font-black tracking-widest flex items-center justify-between group-hover:text-brand-accent transition-colors cursor-pointer">
                Full Document Report <ChevronRight size={16}/>
             </button>
          </div>

          {initialDocuments.map((doc) => (
            <Link 
              key={doc.id} 
              href={`/analysis/${doc.id}`}
              className="bg-brand-paper border border-brand-dark/5 p-10 flex flex-col justify-between h-[340px] hover:shadow-2xl hover:border-brand-accent/30 transition-all group relative overflow-hidden"
            >
               <div className={`absolute top-0 left-0 h-2 transition-all duration-1000 ${doc.status === 'completed' ? 'bg-emerald-500 w-full' : 'bg-brand-accent w-1/3'}`}></div>
               <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-dark/5">
                     <div className="p-2 bg-brand-bg text-brand-dark"><FileText size={20}/></div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-brand-muted font-mono bg-brand-bg px-2 py-1">
                       {new Date(doc.createdAt).toLocaleDateString()}
                     </span>
                  </div>
                  <h4 className="text-2xl font-black font-tektur tracking-tighter leading-[1] truncate uppercase italic group-hover:text-brand-accent transition-colors mb-2">
                    {doc.fileName.split('.')[0]}
                  </h4>
               </div>
               <div className="space-y-6 pt-6 mt-auto">
                  <div className="flex items-center justify-between border-b border-brand-dark/5 pb-3">
                     <span className="text-[11px] font-black uppercase tracking-widest text-brand-muted opacity-80">Status Index</span>
                     <span className={`text-[11px] font-black uppercase tracking-widest ${doc.status === 'completed' ? 'text-emerald-500' : 'text-brand-accent animate-pulse'}`}>
                       {doc.status}
                     </span>
                  </div>
                  {doc.analysis ? (
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <CheckCircle size={18} className="text-emerald-500"/>
                          <span className="text-[15px] font-black font-tektur text-brand-dark tracking-tighter">{doc.analysis.completenessScore}% Confidence</span>
                       </div>
                     </div>
                  ) : (
                    <div className="flex items-center gap-3 opacity-60">
                       <Clock size={16} className="animate-spin duration-slow"/>
                       <span className="text-[11px] font-black uppercase tracking-[0.1em]">Processing Sequence...</span>
                    </div>
                  )}
               </div>
            </Link>
          ))}
          

        </div>
      ) : (
        /* Senior List View: Optimized for Data-Dense Environments */
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="grid grid-cols-6 px-10 py-4 border-b border-brand-dark/10 text-[11px] font-black uppercase tracking-widest text-brand-muted/60">
            <div className="col-span-2">Project / Document</div>
            <div>Sequence Date</div>
            <div>Process Status</div>
            <div>Audit Score</div>
            <div className="text-right">Actions</div>
          </div>
          
          {initialDocuments.map((doc) => (
            <Link 
              key={doc.id} 
              href={`/analysis/${doc.id}`}
              className="grid grid-cols-6 items-center px-10 py-8 bg-brand-paper border border-brand-dark/5 hover:border-brand-accent/30 hover:shadow-xl transition-all group"
            >
              <div className="col-span-2 flex items-center gap-6">
                <div className={`w-2 h-12 ${doc.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-accent animate-pulse'}`}></div>
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brand-dark/40"/>
                  <h4 className="text-xl font-black font-tektur italic uppercase tracking-tighter truncate max-w-[300px]">
                    {doc.fileName.split('.')[0]}
                  </h4>
                </div>
              </div>
              <div className="text-[12px] font-mono font-black text-brand-muted">
                {new Date(doc.createdAt).toLocaleDateString()}
              </div>
              <div className={`text-[12px] font-black uppercase tracking-widest font-tektur ${doc.status === 'completed' ? 'text-emerald-500' : 'text-brand-accent'}`}>
                {doc.status}
              </div>
              <div>
                {doc.analysis ? (
                   <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-emerald-500"/>
                      <span className="text-lg font-black font-tektur">{doc.analysis.completenessScore}%</span>
                   </div>
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-40">Awaiting AI...</span>
                )}
              </div>
              <div className="flex justify-end">
                <div className="w-10 h-10 bg-brand-bg flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-brand-bg transition-colors">
                   <ChevronRight size={18}/>
                </div>
              </div>
            </Link>
          ))}
          

        </div>
      )}

      <footer className="mt-40 text-center opacity-30">
         <p className="font-tektur font-black text-[11px] uppercase tracking-[0.8em] italic">BRICKANTA AUDIT LEDGER v2.1 • SOCIETY BUILDERS</p>
      </footer>
    </div>
  );
}
