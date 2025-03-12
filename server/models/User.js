import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    githubUsername: {
      type: String,
    },
    githubAccessToken: {
      type: String,
    },
    institution: {
      type: String,
      ref: "Institution",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    settings: {
      preferredLLM: {
        type: String,
        enum: ["openai", "deepseek"],
        default: "deepseek",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
