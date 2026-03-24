import { useRouter } from "next/router";
import { useState } from "react";
import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";
import Link from "next/link";

export default function EditTournamentPage({ tournament }) {
  const router = useRouter();

  // Wir befüllen den State direkt mit den Daten aus der Datenbank
  // Wichtig: Das Array wieder in einen String für die Textarea umwandeln!
  const [formData, setFormData] = useState({
    date: tournament.date ? tournament.date.split("T")[0] : "",
    month: tournament.month,
    participants: tournament.participants.join(", "),
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Wieder String -> Array Transformation (wie beim Add)
    const participantsArray = formData.participants
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    const dataToSend = { ...formData, participants: participantsArray };

    const response = await fetch(`/api/tournaments/${tournament._id}`, {
      method: "PUT", // WICHTIG: PUT für Update
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      router.push("/");
    } else {
      alert("Fehler beim Speichern der Änderungen.");
    }
  }

  return (
    <main>
      <h1>Turnier bearbeiten</h1>
      <form onSubmit={handleSubmit}>
        {/* Hier kommen die gleichen Input-Felder wie in add-tournament.js rein */}
        <div>
          <label htmlFor="date">Datum:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="month">Monat:</label>
          <input
            type="text"
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="participants">Namen (mit Komma getrennt):</label>
          <textarea
            id="participants"
            name="participants"
            value={formData.participants}
            onChange={handleChange}
            required
            rows="5"
          />
        </div>
        <button type="submit">Änderungen speichern</button>
      </form>
      <Link href="/">Abbrechen</Link>
    </main>
  );
}

// Wir holen die Daten direkt beim Laden der Seite
export async function getServerSideProps(context) {
  const { id } = context.params;
  await dbConnect();
  const data = await Tournament.findById(id).lean();

  if (!data) {
    return { notFound: true };
  }

  const tournament = JSON.parse(JSON.stringify(data));
  return { props: { tournament } };
}
