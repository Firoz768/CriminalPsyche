import AdminCasesTable from "@/components/admin/AdminCasesTable";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      <header className="mb-14">
        <h1 className="font-heading text-[#e8e8e8] text-4xl md:text-[36px] font-bold tracking-tight mb-3 uppercase">
          ARCHIVE CASES
        </h1>
        <p className="font-body text-[#888888] text-sm uppercase tracking-widest font-semibold">
          Manage, edit, and classify all documents
        </p>
      </header>

      <AdminCasesTable />
    </main>
  );
}
