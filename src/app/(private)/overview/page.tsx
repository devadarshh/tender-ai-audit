import { auth, signOut } from "@/server/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, LogOut, FileText, BarChart3, Clock, 
  ChevronRight, AlertTriangle, CheckCircle 
} from "lucide-react";

/**
 * BRICKANTA OVERVIEW (SECURE)
 * High-fidelity 'Senior Architect' experience for viewing all audits.
 */
export default async function OverviewPage() {
  const session = await auth();

  // Route Guard: Ensure only authenticated 'Senior Builders' can access
  if (!session) {
    redirect("/");
  }

  // Fetch all recent audits
  const documents = await prisma.document.findMany({
    where: { 
      // Link to user eventually, but for MVP we fetch all.
    },
    include: {
      analysis: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen bg-brand-bg text-brand-dark p-8 md:p-12 font-inter selection:bg-brand-accent selection:text-white">
      
      {/* Premium Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b-2 border-brand-dark/5 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4 scale-90 origin-left">
             <div className="w-6 h-6 bg-brand-action"></div>
             <span className="font-tektur font-black text-2xl uppercase tracking-tighter italic">Brickanta Overview</span>
          </div>
          <h1 className="text-8xl font-black font-tektur tracking-tighter leading-[0.8] mb-6 italic">
            Audit <br/> <span className="font-brand-serif font-light text-brand-secondary lowercase">ledger</span>
          </h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[11px] font-black uppercase tracking-widest opacity-60">System Online</span>
          </div>
          <span className="text-brand-dark/10 opacity-30">|</span>
          <p className="text-[12px] text-brand-muted font-tektur font-black tracking-widest uppercase italic">Logged in as {session.user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <Link 
            href="/upload" 
            className="bg-brand-dark text-brand-bg px-8 py-4 font-tektur font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-brand-accent transition-all shadow-xl shadow-brand-dark/20 group"
           >
             <Plus size={16} className="group-hover:rotate-90 transition-transform"/> New Audit
           </Link>

           <form action={async () => {
             "use server";
             await signOut();
           }}>
             <button className="bg-brand-paper p-4 text-brand-muted hover:text-brand-action transition-all border border-brand-dark/5 hover:border-brand-action/20 cursor-pointer">
               <LogOut size={20}/>
             </button>
           </form>
        </div>
      </div>

      {/* Audit Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in slide-in-from-bottom-8 duration-1000">
        
        {/* Quick Stats Summary Card */}
        <div className="bg-brand-dark text-brand-paper p-8 flex flex-col justify-between h-[300px] shadow-2xl relative overflow-hidden group">
           <div className="relative">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 font-tektur mb-4">Integrity Summary</h3>
             <p className="text-[54px] font-black font-tektur italic tracking-tighter leading-none">{documents.length}</p>
             <p className="text-[12px] mt-3 uppercase tracking-widest font-black opacity-60">Audits Calculated</p>
           </div>
           {/* Decorative Background Icon */}
           <BarChart3 size={150} className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"/>
           <button className="relative w-full border-t border-brand-paper/10 pt-4 text-[10px] uppercase font-black tracking-widest flex items-center justify-between group-hover:text-brand-accent transition-colors">
              Request Detailed PDF Report <ChevronRight size={14}/>
           </button>
        </div>

        {/* Existing Audit Cards */}
        {documents.map((doc) => (
          <Link 
            key={doc.id} 
            href={`/analysis/${doc.id}`}
            className="bg-brand-paper border border-brand-dark/5 p-8 flex flex-col justify-between h-[300px] hover:shadow-2xl hover:shadow-brand-dark/5 transition-all group relative"
          >
             {/* Dynamic Accent Bar based on status */}
             <div className={`absolute top-0 left-0 h-1 transition-all ${doc.status === 'completed' ? 'bg-emerald-500 w-full' : 'bg-brand-accent w-1/2'}`}></div>
             
             <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-brand-bg border border-brand-dark/10 text-brand-dark"><FileText size={18}/></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted opacity-60 font-mono">
                     {new Date(doc.createdAt).toLocaleDateString()}
                   </span>
                </div>
                <h4 className="text-xl font-black font-tektur tracking-tighter leading-[0.9] truncate uppercase italic group-hover:text-brand-accent transition-colors">
                  {doc.fileName.split('.')[0]}
                </h4>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-dark/5 pb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Status Index</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${doc.status === 'completed' ? 'text-emerald-500' : 'text-brand-accent animate-pulse'}`}>
                     {doc.status}
                   </span>
                </div>

                {doc.analysis ? (
                   <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-1">
                        <CheckCircle size={14} className="text-emerald-500"/>
                        <span className="text-[12px] font-black font-tektur">{doc.analysis.completenessScore}%</span>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest italic opacity-40">Ready</span>
                   </div>
                ) : (
                  <div className="flex items-center gap-2 opacity-40 pt-2">
                     <Clock size={14}/>
                     <span className="text-[11px] font-black uppercase tracking-widest">Calculating Results...</span>
                  </div>
                )}
             </div>
          </Link>
        ))}

        {/* Empty State / Add New */}
        <Link 
          href="/upload" 
          className="bg-brand-bg border-2 border-dotted border-brand-dark/10 p-8 flex flex-col items-center justify-center gap-4 h-[300px] hover:border-brand-accent transition-all group"
        >
          <div className="w-12 h-12 rounded-full border border-brand-dark/10 flex items-center justify-center text-brand-muted group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
             <Plus size={24}/>
          </div>
          <p className="font-tektur text-[10px] font-black uppercase tracking-widest text-brand-muted">Initiate New Audit Sequence</p>
        </Link>
      </div>

      <footer className="mt-32 max-w-7xl mx-auto text-center opacity-20">
         <p className="font-tektur font-black text-[9px] uppercase tracking-[0.6em]">BRICKANTA AUDIT LEDGER v1.0 • SOCIETY BUILDERS</p>
      </footer>
    </main>
  );
}
