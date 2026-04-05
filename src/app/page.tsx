import { auth, signIn } from "@/server/auth";
import { redirect } from "next/navigation";

/**
 * BRICKANTA MINIMALIST GOOGLE AUTH - V2
 * Optimized branding: Replaced abstract mark with 'Brickanta' text.
 * Fixed Google Icon visibility for dark button.
 */
export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/overview");
  }

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-inter selection:bg-brand-accent selection:text-white">
      
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-brand-dark/10 p-12 border border-brand-dark/5 animate-in fade-in zoom-in duration-1000">
        
        <div className="text-center mb-10">
          {/* Company Name Logo instead of Orange Icon */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="w-4 h-4 bg-brand-action"></div>
            <span className="font-tektur font-black text-2xl uppercase tracking-tighter italic text-brand-dark">Brickanta</span>
          </div>
          
          <h1 className="text-4xl font-black font-tektur tracking-tighter italic text-brand-dark mb-4 uppercase leading-none">Welcome back</h1>
          <p className="text-[12px] text-brand-muted font-black uppercase tracking-[0.1em] font-tektur italic opacity-70 leading-relaxed max-w-[200px] mx-auto">
            Sign in to access your Construction Audit Overview
          </p>
        </div>

        {/* Pure Google Social Auth */}
        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/overview" });
        }}>
          <button 
            type="submit"
            className="w-full bg-brand-dark text-brand-bg py-6 rounded-xl font-black text-xs uppercase tracking-[0.3em] font-tektur hover:bg-brand-accent transition-all flex items-center justify-center gap-5 group shadow-xl shadow-brand-dark/20 active:scale-95 cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-white p-1 rounded-sm rotate-0 group-hover:rotate-12 transition-transform duration-500">
               {/* Fixed Google SVG for clear visibility */}
               <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
               </svg>
            </div>
            Sign in with Google
          </button>
        </form>

        <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted italic opacity-40">
               BRICKANTA • AUDIT LEDGER v1.0
            </p>
        </div>
      </div>
    </main>
  );
}
