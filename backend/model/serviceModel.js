import mongoose from "mongoose";

const serviceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "you must add title"],
    },
    description: {
      type: String,
      required: [true, "you must add description"],
    },
    budget: {
      type: Number,
      required: [true, "you must add price"],
    },
    skills: {
      type: [String],
      required: [true, "must have skills"],
    },
    level: {
      type: String,
      required: [true, "must have must declear the level of the service"],
      enum: ["entry", "intermediate", "expert"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in-progress", "completed", "canceled"],
      default: "pending",
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
Service.create({
  title: "Web Design",
  description: "Designing a responsive and modern website.",
  budget: 500,
  skills: ["HTML", "CSS", "JavaScript"],
  level: "intermediate", // Must be 'entry', 'intermediate', or 'expert'
  status: "in-progress", // Optional, default is 'pending' });
});
export default Service;
