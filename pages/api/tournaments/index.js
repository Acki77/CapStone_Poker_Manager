import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";

export default async function handler(req, res) {
  // Verbindung zur Datenbank herstellen
  await dbConnect();

  // READ (GET)
  if (req.method === "GET") {
    try {
      // Alle Turniere aus der DB abrufen
      const tournaments = await Tournament.find();

      // Erfolg: Daten mit Status 200 zurück
      return res.status(200).json(tournaments);
    } catch (error) {
      // Fehlerfall: Etwas ging bei der DB-Abfrage schief
      return res
        .status(500)
        .json({ message: "Fehler beim Abrufen der Turniere" });
    }
  }
  // CREATE (POST)
  if (req.method === "POST") {
    try {
      const tournamentData = req.body; // hier kommen {date, month} an
      //erstellen ein neues Doc in der MongoDB
      const newTournament = await Tournament.create(tournamentData);
      // Status 201 (Created)
      return res.status(201).json({ success: true, data: newTournament });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Feher beim Speichern" });
    }
  }

  // Falls jemand eine andere Methode (z.B. POST) nutzt, die wir noch nicht erlauben
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
