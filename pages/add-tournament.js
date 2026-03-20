import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";

export default function AddTournamentPage() {
  const router = useRouter();
//State für Eingabewerte definieren
  const [formData, setFormData] = useState({
    date: "",
    month: "",
  });
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

    const response = await fetch (/"api/tournaments", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
    });
    if (response.ok) {
        router.push ("/"); // Zurück zur Startseite nach erfolgreichem Speichern
    }
}


  return (
    <main>
      <h1> Neues Turnier anlegen</h1>
      {/* Das 'htmlFor' im Label muss exakt mit der 'id' im Input übereinstimmen.
        Nur so findet 'screen.getByLabelText(/datum/i)' das Feld!
      */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Datum:</label>
          <input 
          type="date" 
          id="date" 
          name="date" 
          value={fornData.date}
          onChange={handleChange}
          required />
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
        <button type="submit">Speichern</button>
      </form>
      <hr />
      <Link href="/">Abbrechen</Link>
    </main>
  );
}
