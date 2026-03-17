const tournamentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  month: { type: String, required: true }, // z.B. "Januar"
  results: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player", // Hier Link zu Dummy Usern
      },
      position: { type: Number },
      points: { type: Number },
    },
  ],
});
