import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  caseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  body: string;
  createdAt: Date;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
}

const CommentSchema = new Schema<IComment>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: "Case", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    body: { type: String, required: true, minlength: 3, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: false }
);

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
