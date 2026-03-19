import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  month: { type: String, required: true }, // z.B. "Januar"
  // Array aus Strings für die Namen
  participants: {
    type: [String],
    required: true,
    default: [],
  },
});

const Tournament =
  mongoose.models.Tournament || mongoose.model("Tournament", tournamentSchema);
export default Tournament;
