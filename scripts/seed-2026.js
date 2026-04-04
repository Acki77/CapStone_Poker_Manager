import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI fehlt in .env.local");
  process.exit(1);
}

const tournamentSchema = new mongoose.Schema({
  date:         { type: String, required: true },
  month:        { type: String, required: true },
  participants: { type: [String], required: true },
});

const Tournament =
  mongoose.models.Tournament ||
  mongoose.model("Tournament", tournamentSchema);

const tournaments = [
  {
    date: "2026-01-12",
    month: "Januar",
    participants: [
      "Rico Witte",
      "Peter Wode",
      "Lars Taraba",
      "Richard Mayer",
      "Andreas Strutz",
      "Marco Hellwig",
      "Frank Ackermann",
      "Claudia Handloser",
      "Heinz Neukirchen",
      "Rolf Liskow",
      "Christian Borchert",
      "Glenn Dortschack",
      "Henning Marx",
      "Oliver Koß",
    ],
  },
  {
    date: "2026-02-23",
    month: "Februar",
    participants: [
      "Andreas Strutz",
      "Richard Mayer",
      "Rico Witte",
      "Heinz Neukirchen",
      "Oliver Koß",
      "Glenn Dortschack",
      "Lars Taraba",
      "Nicole Hörl",
      "Marco Hellwig",
      "Christian Borchert",
      "Steve Mittelbach",
      "Tanja Wand",
      "Frank Ackermann",
      "Dr. Joachim Reichel",
      "Claudia Handloser",
      "Peter Wode",
      "Yves Arikoglu",
      "Rolf Liskow",
      "Henning Marx",
    ],
  },
  {
    date: "2026-03-23",
    month: "März",
    participants: [
      "André Schiemann",
      "Glenn Dortschack",
      "Rico Witte",
      "Rolf Liskow",
      "Marco Hellwig",
      "Frank Ackermann",
      "Andreas Strutz",
      "Christian Borchert",
      "Claudia Handloser",
      "Heinz Neukirchen",
      "Henning Marx",
      "Steve Mittelbach",
      "Lars Taraba",
      "Volkmar Scholz",
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Verbunden mit MongoDB:", MONGODB_URI.split("@").pop());

  const deleted = await Tournament.deleteMany({});
  console.log(`${deleted.deletedCount} bestehende Turniere gelöscht.`);

  const inserted = await Tournament.insertMany(tournaments);
  console.log(`${inserted.length} Turniere eingespielt:`);
  inserted.forEach((t) => console.log(`  - ${t.month} ${t.date} (${t.participants.length} TN)`));

  await mongoose.disconnect();
  console.log("Fertig.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
