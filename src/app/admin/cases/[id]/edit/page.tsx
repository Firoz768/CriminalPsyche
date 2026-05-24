import CaseForm from "@/components/admin/CaseForm";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";

export const dynamic = "force-dynamic";

export default async function EditCasePage({ params }: { params: { id: string } }) {
  await dbConnect();
  
  // Need to ensure the id is a valid ObjectId string, otherwise mongoose throws
  if (!params.id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const caseFile = await Case.findById(params.id).lean();

  if (!caseFile) {
    notFound();
  }

  // Convert ObjectIds to strings so they can be passed as props to Client Component
  const serializedCase = {
    ...caseFile,
    _id: caseFile._id.toString(),
    createdBy: caseFile.createdBy?.toString(),
    createdAt: caseFile.createdAt?.toISOString(),
    updatedAt: caseFile.updatedAt?.toISOString(),
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
      <CaseForm initialData={serializedCase} isEdit={true} />
    </div>
  );
}
