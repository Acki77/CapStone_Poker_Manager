import Link from "next/link";
import React from "react";

export default function AddTournamentPage() {
  return (
    <main>
      <h1> Neues Turnier anlegen</h1>
      {/* Das 'htmlFor' im Label muss exakt mit der 'id' im Input übereinstimmen.
        Nur so findet 'screen.getByLabelText(/datum/i)' das Feld!
      */}
      <form>
        <div>
          <label htmlFor="date">Datum:</label>
          <input type="date" id="date" name="date" required />
        </div>
        <div>
          <label htmlFor="month">Monat:</label>
          <input
            type="text"
            id="month"
            name="month"
            placeholder="Kalendermonat"
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
