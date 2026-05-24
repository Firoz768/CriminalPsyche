import mongoose, { Schema, Document } from "mongoose";

export interface ICase extends Document {
  title: string;
  slug: string;
  status: "draft" | "published";
  coverImage?: string;
  summary?: string;
  body?: string;
  killerName?: string;
  motiveCategory?: "power" | "greed" | "rage" | "ideology" | "psychosis" | "unknown";
  motiveSummary?: string;
  psychologyProfile?: string;
  behavioralPatterns?: string;
  tags?: string[];
  yearOfCrime?: number;
  region?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    coverImage: { type: String },
    summary: { type: String },
    body: { type: String },
    killerName: { type: String },
    motiveCategory: {
      type: String,
      enum: ["power", "greed", "rage", "ideology", "psychosis", "unknown"],
    },
    motiveSummary: { type: String },
    psychologyProfile: { type: String },
    behavioralPatterns: { type: String },
    tags: [{ type: String }],
    yearOfCrime: { type: Number },
    region: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CaseSchema.index(
  {
    title: "text",
    killerName: "text",
    summary: "text",
    body: "text",
    psychologyProfile: "text",
    behavioralPatterns: "text",
  },
  {
    weights: {
      title: 10,
      killerName: 8,
      summary: 5,
      body: 1,
      psychologyProfile: 3,
      behavioralPatterns: 3,
    },
    name: "CaseTextIndex"
  }
);

export default mongoose.models.Case || mongoose.model<ICase>("Case", CaseSchema);
