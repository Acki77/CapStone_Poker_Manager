import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Vorname ist erforderlich"],
      minlength: [2, "Vorname muss mindestens 2 Zeichen haben"],
    },
    lastName: {
      type: String,
      required: [true, "Nachname ist erforderlich"],
      minlength: [2, "Nachname muss mindestens 2 Zeichen haben"],
    },
    email: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
); // Erstellt automatisch createdAt und updatedAt

const Player = mongoose.models.Player || mongoose.model("Player", PlayerSchema);

export default Player;
