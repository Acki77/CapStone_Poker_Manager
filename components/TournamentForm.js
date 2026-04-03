import { useState, useEffect } from "react";
import styled from "styled-components";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

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
  margin-bottom: -0.5rem;
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

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid #23272a;
  background: #40444b;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  option:disabled {
    color: #888;
  }
`;

const AddPlayerControl = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const ParticipantList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlayerName = styled.span`
  flex-grow: 1;
`;

const DragHandle = styled.span`
  color: #888;
  user-select: none;
`;

const PositionNumber = styled.span`
  min-width: 25px;
  font-variant-numeric: tabular-nums; /* Sorgt dafür, dass Zahlen (1 vs 11) gleich breit sind */
  color: #b9bbbe;
  font-weight: bold;
`;

const ControlButton = styled.button`
  background: #40444b;
  border: 1px solid #23272a;
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: #3498db;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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

const ParticipantItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  background: ${(props) => {
    if (props.$isDragging) return "rgba(255, 255, 255, 0.03)"; // Das gezogene Element selbst
    if (props.$isDragOver) return "rgba(52, 152, 219, 0.15)"; // Die markierte Zielposition
    return "rgba(255, 255, 255, 0.05)"; // Standard
  }};
  border: 1px solid
    ${(props) => {
      if (props.$isDragging) return "dashed rgba(255, 255, 255, 0.2)"; // Das gezogene Element selbst
      if (props.$isDragOver) return "#3498db"; // Die markierte Zielposition
      return "rgba(255, 255, 255, 0.1)"; // Standard
    }};
  border-radius: 8px;
  opacity: ${(props) => (props.$isDragging ? 0.4 : 1)};
  cursor: grab;
  transition: all 0.2s ease-in-out;

  /* Name, Handle und Nummer ignorieren die Maus (verhindert Flackern beim Ziehen) */
  ${PlayerName}, ${DragHandle}, ${PositionNumber} {
    pointer-events: none;
  }

  /* Die Buttons MÜSSEN Klicks empfangen können, damit Up/Down/Löschen geht! */
  ${ControlButton} {
    pointer-events: auto;
    cursor: pointer;
  }
`;

export default function TournamentForm({ onSubmit, initialData, buttonText, isSubmitting }) {
  // Falls initialData da ist (Edit), nutzen wir sie. Sonst leere Strings (Add).
  const [formData, setFormData] = useState({
    date: initialData?.date ? initialData.date.split("T")[0] : "",
    month: initialData?.month || "",
    participants: initialData?.participants || [],
  });

  const [usedMonths, setUsedMonths] = useState([]);

  // Bereits verwendete Monate aus der API laden
  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((tournaments) => {
        const used = tournaments.map((t) => t.month);
        setUsedMonths(used);
      })
      .catch(() => {}); // Fehler still ignorieren – Dropdown bleibt voll verfügbar
  }, []);

  // Wenn Datum gewählt wird: Monat automatisch vorauswählen
  function handleDateChange(event) {
    const dateValue = event.target.value;
    setFormData((prev) => {
      // Monat nur vorauswählen wenn noch kein Monat manuell gewählt wurde
      if (dateValue && !prev.month) {
        const monthIndex = new Date(dateValue).getMonth();
        const detectedMonth = MONTHS[monthIndex];
        // Wenn der erkannte Monat schon vergeben ist, nächsten freien suchen
        const currentMonth = initialData?.month || null;
        const effectiveUsed = usedMonths.filter((m) => m !== currentMonth);
        if (!effectiveUsed.includes(detectedMonth)) {
          return { ...prev, date: dateValue, month: detectedMonth };
        }
        // Nächsten freien Monat suchen (ab dem erkannten)
        const nextFree = MONTHS.find((m) => !effectiveUsed.includes(m));
        return { ...prev, date: dateValue, month: nextFree || "" };
      }
      return { ...prev, date: dateValue };
    });
  }

  // State für das Eingabefeld des "nächsten" Spielers
  const [newName, setNewName] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  // Speichert den Index des Elements, ÜBER dem wir gerade schweben
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function addPlayer() {
    if (newName.trim() !== "") {
      const normalized = newName.trim().charAt(0).toUpperCase() + newName.trim().slice(1).toLowerCase();
      setFormData({
        ...formData,
        participants: [...formData.participants, normalized],
      });
      setNewName(""); // Feld wieder leeren
    }
  }

  function moveParticipant(oldIndex, newIndex) {
    if (newIndex < 0 || newIndex >= formData.participants.length) return;
    const newParticipants = [...formData.participants];
    const [movedElement] = newParticipants.splice(oldIndex, 1);
    newParticipants.splice(newIndex, 0, movedElement);
    setFormData({ ...formData, participants: newParticipants });
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit(formData);
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    // notwendig, um "drop" zu erlauben
    event.preventDefault();
  };

  const handleDragEnter = (index) => {
    // Beim Element ziehen, markieren wir es
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    // beim rausziehen, löschen wir die Markierung
    setDragOverIndex(null);
  };

  const handleDrop = (index) => {
    // beim loslassen:
    if (draggedIndex === null) return;
    moveParticipant(draggedIndex, index); // Tausch ausführen
    setDraggedIndex(null); // Drag beenden
    setDragOverIndex(null); // Markierung löschen
  };

  return (
    <FormWrapper>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="date">Datum:</Label>
        <Input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleDateChange}
          required
        />

        <Label htmlFor="month">Monat:</Label>
        <Select
          id="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
        >
          <option value="">– Monat wählen –</option>
          {MONTHS.map((m) => {
            const currentMonth = initialData?.month || null;
            const isUsed = usedMonths.includes(m) && m !== currentMonth;
            return (
              <option key={m} value={m} disabled={isUsed}>
                {m} {isUsed ? "✓" : ""}
              </option>
            );
          })}
        </Select>

        <Label>Neuen Teilnehmer hinzufügen:</Label>
        <AddPlayerControl>
          <Input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addPlayer();
              }
            }}
            placeholder="eindeutiger Name..."
          />
          <ControlButton type="button" onClick={addPlayer}>
            ➕
          </ControlButton>
        </AddPlayerControl>

        <Label>Teilnehmer & Platzierung</Label>
        <ParticipantList>
          {formData.participants.map((participant, index) => (
            <ParticipantItem
              key={index}
              draggable
              $isDragging={draggedIndex === index}
              $isDragOver={dragOverIndex === index} // visuelle Feedback
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(index)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(index)}
            >
              <DragHandle>⠿</DragHandle>
              <PositionNumber>{index + 1}.</PositionNumber>
              <PlayerName>{participant}</PlayerName>

              <ControlButton
                type="button"
                onClick={() => moveParticipant(index, index - 1)}
                disabled={index === 0}
              >
                ⬆️
              </ControlButton>
              <ControlButton
                type="button"
                onClick={() => moveParticipant(index, index + 1)}
                disabled={index === formData.participants.length - 1}
              >
                ⬇️
              </ControlButton>
              <ControlButton
                type="button"
                onClick={() => {
                  const updated = formData.participants.filter(
                    (_, i) => i !== index,
                  );
                  setFormData({ ...formData, participants: updated });
                }}
              >
                ❌
              </ControlButton>
            </ParticipantItem>
          ))}
        </ParticipantList>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert..." : buttonText || "Speichern"}
        </SubmitButton>
      </Form>
    </FormWrapper>
  );
}
