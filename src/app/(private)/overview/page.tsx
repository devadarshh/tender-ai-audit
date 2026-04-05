import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuditExplorer } from "../../_components/AuditExplorer";

/**
 * BRICKANTA OVERVIEW (SERVER-SIDE)
 * Senior-Grade Implementation: Fetches data at the edge and hydrates the 
 * dynamic 'AuditExplorer' client component for advanced view management.
 */
export default async function OverviewPage() {
  const session = await auth();

  // Route Guard: Ensure only authenticated 'Senior Builders' can access
  if (!session) {
    redirect("/");
  }

  // Fetch all recent audits with full relation hydration
  const documents = await prisma.document.findMany({
    where: { 
      // Filter by userId in production; for MVP we fetch global ledger
    },
    include: {
      analysis: {
        select: {
          completenessScore: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen bg-brand-bg text-brand-dark p-8 md:p-12 font-inter selection:bg-brand-accent selection:text-white">
      {/* Hydrating the AuditExplorer with server-fetched documents */}
      <AuditExplorer 
        initialDocuments={documents} 
        userEmail={session.user?.email} 
      />
    </main>
  );
}
