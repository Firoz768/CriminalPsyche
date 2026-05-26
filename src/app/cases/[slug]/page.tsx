import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import { Metadata } from "next";
import CaseClient from "./CaseClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  await dbConnect();
  const caseFile = await Case.findOne({
    slug: params.slug,
    status: "published",
  }).lean();
  if (!caseFile) return { title: "Case Not Found - CriminalPsyche" };

  return {
    title: `${caseFile.title} — CriminalPsyche`,
    description:
      caseFile.summary ||
      "Classified case file details and psychological profile.",
    openGraph: {
      images: caseFile.coverImage ? [caseFile.coverImage] : [],
    },
  };
}

export default async function CaseSinglePage({
  params,
}: {
  params: { slug: string };
}) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  const caseFile = await Case.findOne({
    slug: params.slug,
    status: "published",
  }).lean();

  if (!caseFile) {
    notFound();
  }

  // Related cases logic
  const relatedCases = await Case.find({
    _id: { $ne: caseFile._id },
    status: "published",
    $or: [
      { motiveCategory: caseFile.motiveCategory },
      { tags: { $in: caseFile.tags || [] } },
    ],
  })
    .limit(3)
    .lean();

  const tags = caseFile.tags || [];
  const isUnsolved = tags
    .map((t: string) => t.toLowerCase())
    .includes("unsolved");

  // We serialize the MongoDB documents before passing to client components
  // since .lean() returns plain objects, it should be fine, but we need to convert _id to string
  const serializeMongoData = (doc: unknown) => {
    return JSON.parse(JSON.stringify(doc));
  };

  return (
    <CaseClient
      caseFile={serializeMongoData(caseFile)}
      relatedCases={relatedCases.map(serializeMongoData)}
      tags={tags}
      isUnsolved={isUnsolved}
      isAdmin={isAdmin}
      slug={params.slug}
    />
  );
}
