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
  timelineEvents?: {
    id: string;
    date: string;
    title: string;
    description: string;
    type: "murder" | "investigation" | "suspect" | "arrest" | "evidence" | "communication" | "outcome";
  }[];
  evidenceItems?: {
    id: string;
    title: string;
    description?: string;
    type: "photo" | "document" | "weapon" | "note" | "map" | "profile";
    imageUrl?: string;
    x: number;
    y: number;
    connections: number[];
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TimelineEventSchema = new Schema({
  id: { type: String },
  date: { type: String },
  title: { type: String },
  description: { type: String },
  type: {
    type: String,
    enum: ["murder", "investigation", "suspect", "arrest", "evidence", "communication", "outcome"],
  },
}, { _id: false });

const EvidenceItemSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ["photo", "document", "weapon", "note", "map", "profile"],
    default: "note"
  },
  imageUrl: { type: String },
  x: { type: Number, default: 50 },
  y: { type: Number, default: 50 },
  connections: [{ type: Number }]
}, { _id: false });

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
    timelineEvents: [TimelineEventSchema],
    evidenceItems: [EvidenceItemSchema],
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
