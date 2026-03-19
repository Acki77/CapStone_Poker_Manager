const mongoose = require("mongoose");
// Pfad zum Model
const Player = require("../models/Player").default;
const result = require("dotenv").config({ path: ".env.local" }); // Lädt MONGODB_URI aus der .env.local Datei

const dummyPlayers = [
  { firstName: "Phil", lastName: "Ivey", email: "phil.ivey@poker.de" },
  { firstName: "Daniel", lastName: "Negreanu", email: "kid.poker@poker.de" },
  { firstName: "Doyle", lastName: "Brunson", email: "texas.dolly@poker.de" },
  { firstName: "Chris", lastName: "Moneymaker", email: "money.maker@poker.de" },
  { firstName: "Liv", lastName: "Boeree", email: "liv.science@poker.de" },
  { firstName: "All", lastName: "In-Anton", email: "anton@poker.de" },
  { firstName: "Full", lastName: "House-Frank", email: "frank@poker.de" },
  { firstName: "Bluff", lastName: "Berta", email: "berta@poker.de" },
  { firstName: "Check-Raise", lastName: "Charly", email: "charly@poker.de" },
  { firstName: "Pocket", lastName: "Paula", email: "paula@poker.de" },
  { firstName: "Bad", lastName: "Beat-Ben", email: "ben@poker.de" },
  { firstName: "River", lastName: "Robby", email: "robby@poker.de" },
  { firstName: "Royal", lastName: "Rosi", email: "rosi@poker.de" },
  { firstName: "Straight", lastName: "Stefan", email: "stefan@poker.de" },
  { firstName: "Tilt", lastName: "Thomas", email: "thomas@poker.de" },
  { firstName: "Nut", lastName: "Nancy", email: "nancy@poker.de" },
  { firstName: "Dealer", lastName: "Dan", email: "dan@poker.de" },
  { firstName: "Bubble", lastName: "Bob", email: "bob@poker.de" },
  { firstName: "Ace", lastName: "Alice", email: "alice@poker.de" },
  { firstName: "Fish", lastName: "Friedrich", email: "friedrich@poker.de" },
];

// 2. Prüfe, ob die Datei überhaupt geladen werden konnte
if (result.error) {
  console.error("❌ Fehler: Die Datei .env.local wurde nicht gefunden!");
  process.exit(1);
}

// 3. Prüfe, ob die MONGODB_URI darin auch wirklich existiert
if (!process.env.MONGODB_URI) {
  console.error("❌ Fehler: MONGODB_URI ist in .env.local nicht definiert!");
  process.exit(1);
} else {
  // Wir geben nur den Anfang der URI aus Sicherheitsgründen an
  console.log("✅ .env.local geladen. Verbindung wird vorbereitet...");
}
async function seed() {
  try {
    console.log("⏳ Verbinde mit der Datenbank...");
    await mongoose.connect(process.env.MONGODB_URI);

    // Löschen der alten Player, um sauberen Stand zu haben ohne Dublikate
    await Player.deleteMany({ email: { $regex: /@poker.de/ } });

    await Player.insertMany(dummyPlayers);

    console.log("✅ 20 Poker-Legenden wurden erfolgreich in die DB gesetzt!");
    process.exit();
  } catch (err) {
    console.error("❌ Fehler beim Seeden:", err);
    process.exit(1);
  }
}

seed();
