import { useState } from "react";
import styled from "styled-components";

// Der Container, der das Formular auf Add/Edit zentriert
const FormWrapper = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #2c2f33; /* Dunkler Discord-Style Hintergrund */
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  color: #efefef;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 0.9rem;
  color: #b9bbbe;
  margin-bottom: -0.5rem; /* Rückt Label näher an das Input */
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #23272a;
  background: #40444b;
  color: white;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #23272a;
  background: #40444b;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  margin-top: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background-color: #2980b9;
  }
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
    <FormWrapper>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="date">Datum:</Label>
        <Input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Label htmlFor="month">Monat:</Label>
        <Input
          type="text"
          id="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
          placeholder="z.B. März"
        />

        <Label htmlFor="participants">Teilnehmer (mit Komma getrennt):</Label>
        <TextArea
          id="participants"
          name="participants"
          value={formData.participants}
          onChange={handleChange}
          required
          rows="5"
          placeholder="Spieler 1, Spieler 2, Spieler 3..."
        />

        <SubmitButton type="submit">{buttonText || "Speichern"}</SubmitButton>
      </Form>
    </FormWrapper>
  );
}
