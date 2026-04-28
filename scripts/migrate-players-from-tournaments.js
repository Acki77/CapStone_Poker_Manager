/**
 * Migrations-Script: Players-Collection aus Turnierdaten befüllen
 *
 * Was es tut:
 * 1. Alle Turniere aus der DB lesen
 * 2. Alle Teilnehmernamen einsammeln und deduplizieren
 * 3. Players-Collection leeren (Fake-Daten entfernen)
 * 4. Für jeden eindeutigen Namen einen Player-Eintrag anlegen
 *
 * Ausführen: node scripts/migrate-players-from-tournaments.js
 * (App muss NICHT laufen, aber MongoDB muss erreichbar sein)
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Fehler: MONGODB_URI nicht in .env.local gefunden");
  process.exit(1);
}

// Schemas direkt definieren (ohne Next.js-Kontext)
const TournamentSchema = new mongoose.Schema({ participants: [String] });
const PlayerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
});

const Tournament = mongoose.models.Tournament || mongoose.model("Tournament", TournamentSchema);
const Player = mongoose.models.Player || mongoose.model("Player", PlayerSchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log("Verbunden mit MongoDB:", MONGODB_URI);

  // Alle Teilnehmernamen aus allen Turnieren einsammeln
  const tournaments = await Tournament.find({}, "participants");
  const allNames = tournaments.flatMap((t) => t.participants);

  // Deduplizieren (case-insensitive): "frank ackermann" und "Frank Ackermann" → nur einer
  const uniqueNames = [...new Set(allNames.map((n) => n.trim().toLowerCase()))]
    .map((n) => {
      // Originale Schreibweise wiederherstellen: ersten Treffer aus allNames nehmen
      const original = allNames.find((orig) => orig.trim().toLowerCase() === n);
      return original.trim();
    });

  console.log(`Gefunden: ${uniqueNames.length} eindeutige Namen aus ${tournaments.length} Turnieren`);

  // Players-Collection leeren
  const deleted = await Player.deleteMany({});
  console.log(`Gelöscht: ${deleted.deletedCount} alte Player-Einträge`);

  // Neue Player-Einträge anlegen
  let created = 0;
  let skipped = 0;

  for (const fullName of uniqueNames) {
    const parts = fullName.split(" ").filter((w) => w.length > 0);

    if (parts.length < 2) {
      console.warn(`  Übersprungen (kein Nachname): "${fullName}"`);
      skipped++;
      continue;
    }

    // Letztes Wort = Nachname, alles davor = Vorname
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(" ");

    // Normalisieren: Erster Buchstabe groß, Rest klein
    const normalize = (str) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    await Player.create({
      firstName: normalize(firstName),
      lastName: normalize(lastName),
    });

    console.log(`  Angelegt: "${normalize(firstName)} ${normalize(lastName)}"`);
    created++;
  }

  console.log(`\nFertig: ${created} Spieler angelegt, ${skipped} übersprungen.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration fehlgeschlagen:", err);
  process.exit(1);
});
