import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";

export default async function handler(request, response) {
  await dbConnect();

  // ID kommt aus der URL
  const { id } = request.query;

  // FALL 1: Ein einzelnes Turnier abrufen (EDIT)
  if (request.method === "GET") {
    try {
      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return response
          .status(404)
          .json({ message: "Turnier nicht gefunden!" });
      }
      return response.status(200).json(tournament);
    } catch (error) {
      return response.status(500).json({ message: "Fehler beim Aufrufen!" });
    }
  }
  // Fall 2: Turnier aktualisieren (Edit speichern)

  if (request.method === "PUT") {
    try {
      const updateTournament = await Tournament.findByIdAndUpdate(
        id,
        { $set: request.body }, //setzen der neuen aus request
        { new: true, runValidators: true }, // schicke das aktualisierte Dokument zurück
      );
      if (!updateTournament) {
        return response
          .status(404)
          .json({ message: "Turnier nicht gefunden!" });
      }
      return response.status(200).json(updateTournament);
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Fehler beim Aktualisieren!" });
    }
  }

  if (request.method === "DELETE") {
    try {
      const deleteTournament = await Tournament.findByIdAndDelete(id);
      if (!deleteTournament) {
        return response
          .status(404)
          .json({ message: "Turnier nicht gefunden!" });
      }
      return response
        .status(200)
        .json({ message: "Turnier erfolgreich gelöscht!" });
    } catch (error) {
      return response.status(500).json({ message: "Fehler beim Löschen!" });
    }
  }
  // Auschluss anderer Methoden
  return response.status(405).json({ message: "Methode nicht erlaubt!" });
}
