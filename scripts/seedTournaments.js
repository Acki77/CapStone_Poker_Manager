const mongoose = require("mongoose");
// .default nutzen wir wegen des CommonJS/ES-Module Mixes
const Tournament = require("../models/Tournament").default;
require("dotenv").config({ path: ".env.local" });

const sampleTournaments = [
  {
    date: new Date("2026-01-15"),
    month: "Januar",
    participants: [
      "Phil Ivey",
      "Daniel Negreanu",
      "Doyle Brunson",
      "Chris Moneymaker",
      "Liv Boeree",
      "All-In Anton",
      "Full House-Frank",
      "Bluff Berta",
      "Check-Raise Charly",
      "Pocket Paula",
    ], // 10 Teilnehmer
  },
  {
    date: new Date("2026-02-10"),
    month: "Februar",
    participants: [
      "Bad Beat-Ben",
      "River Robby",
      "Royal Rosi",
      "Straight Stefan",
      "Tilt Thomas",
      "Nut Nancy",
      "Dealer Dan",
    ], // 7 Teilnehmer
  },
];

async function seed() {
  try {
    console.log("⏳ Verbinde für Tournament-Seed...");
    await mongoose.connect(process.env.MONGODB_URI);

    // Reset: Wir löschen alle alten Turniere, um sauber zu starten
    await Tournament.deleteMany({});

    await Tournament.insertMany(sampleTournaments);

    console.log("✅ Skateboard-Daten geladen: Januar (10 TN), Februar (7 TN).");
    process.exit();
  } catch (err) {
    console.error("❌ Fehler:", err);
    process.exit(1);
  }
}

seed();
