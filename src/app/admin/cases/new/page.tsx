import CaseForm from "@/components/admin/CaseForm";

export const dynamic = "force-dynamic";

export default function NewCasePage() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      <CaseForm />
    </div>
  );
}
