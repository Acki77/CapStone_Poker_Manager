import { useState } from "react";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

export default function TournamentForm({ onSubmit, initialData, buttonText }) {
  // Falls initialData da ist (Edit), nutzen wir sie. Sonst leere Strings (Add).
  const [formData, setFormData] = useState({
    date: initialData?.date ? initialData.date.split("T")[0] : "",
    month: initialData?.month || "",
    participants: initialData?.participants
      ? initialData.participants.join(", ")
      : "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Die Transformation von String zu Array
    const participantsArray = formData.participants
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== ""); // löscht leere Einträge raus bei doppelten Kommas

    // Wir geben die fertigen Daten an die übergeordnete Seite zurück
    onSubmit({ ...formData, participants: participantsArray });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <label htmlFor="date">Datum:</label>
      <input
        type="date"
        id="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <label htmlFor="month">Monat:</label>
      <input
        type="text"
        id="month"
        name="month"
        value={formData.month}
        onChange={handleChange}
        required
      />

      <label htmlFor="participants">Teilnehmer (mit Komma getrennt):</label>
      <textarea
        id="participants"
        name="participants"
        value={formData.participants}
        onChange={handleChange}
        required
        rows="5"
      />

      <button type="submit">{buttonText || "Speichern"}</button>
    </Form>
  );
}
