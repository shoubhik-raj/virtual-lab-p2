import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: [optionSchema],
});

const experimentSchema = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    aim: {
      type: String,
      required: true,
    },
    theory: {
      type: String,
      required: true,
    },
    pretest: {
      type: String,
      required: true,
    },
    procedure: {
      type: String,
      required: true,
    },
    simulation: {
      type: String,
      required: false,
    },
    posttest: {
      type: String,
      required: true,
    },
    references: {
      type: String,
      required: true,
    },
    contributors: {
      type: String,
      required: true,
    },
    faqs: {
      type: [{
        question: String,
        answer: String
      }],
      default: [],
    },
    thumbnail: {
      type: String, // Store the file path
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Experiment = mongoose.model("Experiment", experimentSchema);

export default Experiment;
