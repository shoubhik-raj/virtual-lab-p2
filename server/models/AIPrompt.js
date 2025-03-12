import mongoose from "mongoose";

const aiPromptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
  },
  type: {
    type: String,
    enum: ["simulation", "experiment", "lab"],
    required: true,
  },
  model: {
    type: String,
    enum: ["openai", "deepseek"],
    default: "deepseek",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AIPrompt = mongoose.model("AIPrompt", aiPromptSchema);

export default AIPrompt;
