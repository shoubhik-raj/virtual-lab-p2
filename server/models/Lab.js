import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discipline: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    courseAlignment: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    institution: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Lab = mongoose.model("Lab", labSchema);

export default Lab;
