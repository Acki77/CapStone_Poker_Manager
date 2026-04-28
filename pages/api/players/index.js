import dbConnect from "@/db/connect";
import Player from "@/models/Player";

export default async function handler(req, res) {
  await dbConnect();

  // READ (GET) – optional mit ?search=xxx für Autocomplete-Suche
  if (req.method === "GET") {
    try {
      const { search } = req.query;

      // Wenn ein Suchbegriff übergeben wird, filtern wir per Regex (case-insensitive).
      // Beispiel: ?search=fra → findet "Frank Ackermann", "Franz Müller"
      // Ohne search-Parameter werden alle Spieler zurückgegeben.
      const query = search
        ? {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      const players = await Player.find(query).sort({ firstName: 1 });

      // Für das Autocomplete reicht der vollständige Name als String
      const names = players.map((p) => `${p.firstName} ${p.lastName}`);
      return res.status(200).json(names);
    } catch (error) {
      return res.status(500).json({ message: "Fehler beim Abrufen der Spieler" });
    }
  }

  // CREATE (POST) – legt einen neuen Spieler an, falls er noch nicht existiert
  if (req.method === "POST") {
    try {
      const { firstName, lastName } = req.body;

      // Duplikat-Prüfung: gleicher Vor- und Nachname (case-insensitive)
      const existing = await Player.findOne({
        firstName: { $regex: `^${firstName}$`, $options: "i" },
        lastName: { $regex: `^${lastName}$`, $options: "i" },
      });

      // Bereits vorhanden → kein neuer Eintrag, aber kein Fehler
      if (existing) {
        return res.status(200).json({ success: true, data: existing, created: false });
      }

      const newPlayer = await Player.create({ firstName, lastName });
      return res.status(201).json({ success: true, data: newPlayer, created: true });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Fehler beim Speichern des Spielers" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
