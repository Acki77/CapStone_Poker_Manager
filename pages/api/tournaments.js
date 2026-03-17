import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";

export default async function handler(req, res) {
  // 1. Verbindung zur Datenbank herstellen
  await dbConnect();

  // 2. Wir prüfen, welche HTTP-Methode genutzt wird
  if (req.method === "GET") {
    try {
      // 3. Alle Turniere aus der DB abrufen
      const tournaments = await Tournament.find();

      // 4. Erfolg: Wir schicken die Daten mit Status 200 zurück
      return res.status(200).json(tournaments);
    } catch (error) {
      // 5. Fehlerfall: Etwas ging bei der DB-Abfrage schief
      return res
        .status(500)
        .json({ message: "Fehler beim Abrufen der Turniere" });
    }
  }

  // Falls jemand eine andere Methode (z.B. POST) nutzt, die wir noch nicht erlauben
  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
