import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

export default function AddTournamentPage() {
  const router = useRouter();
  //State für Eingabewerte definieren
  const [formData, setFormData] = useState({
    date: "",
    month: "",
    participants: "",
  });

  // Neuer State für Fehler
  const [error, setError] = useState(null);

  // Fkt, wenn sich Feld ändert (Tippen)
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Fkt, beim Abschicken des Formulars (Speichern)
  async function handleSubmit(event) {
    event.preventDefault(); // Schaltet Neuladen der Seite aus
    setError(null); // Fehler zurücksetzen

    // Den String in ein Array umwandeln
    const participantsArray = formData.participants
      .split(",") // Trennen am Komma
      .map((name) => name.trim()) // Leerzeichen entfernen
      .filter((name) => name !== ""); // Leere Einträge (,,) löschen

    // 2. Das neue Objekt für die API vorbereiten
    const dataToSend = {
      ...formData,
      participants: participantsArray, // Wir überschreiben den String mit dem Array
    };

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        router.push("/"); // Zurück zur Startseite nach erfolgreichem Speichern
      } else {
        // Falls Server z.B. einen 400er Fehler schickt
        const data = await response.json();
        setError(data.message || "Da lief was schief.");
      }
    } catch (err) {
      // Falls NW ausfällt
      setError("Netwerkfehler. Bitte später erneut versuchen.");
    }
  }

  return (
    <main>
      <h1> Neues Turnier anlegen</h1>
      {/* Das 'htmlFor' im Label muss exakt mit der 'id' im Input übereinstimmen.
        Nur so findet 'screen.getByLabelText(/datum/i)' das Feld!
      */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Form onSubmit={handleSubmit}>
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
            placeholder="Kalendermonat"
            value={formData.month}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="participants">Namen: </label>
          <textarea
            id="participants"
            name="participants"
            placeholder="Frank, Felix, Elena..."
            value={formData.participants}
            onChange={handleChange}
            required
            rows="4" // Damit man mehr sieht
          />
        </div>
        <button type="submit">Speichern</button>
      </Form>
      <hr />
      <Link href="/">Abbrechen</Link>
    </main>
  );
}
