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

// Wrapper um Eingabefeld + Dropdown – position:relative damit das Dropdown
// direkt unter dem Eingabefeld erscheint (position:absolute im Child)
const AutocompleteWrapper = styled.div`
  position: relative;
  flex: 1;
`;

// Die Vorschlagsliste erscheint direkt unter dem Eingabefeld
const SuggestionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #40444b;
  border: 1px solid #3498db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
`;

// $isActive: per Tastatur markierter Eintrag – gleiche Farbe wie Hover
// Das $-Präfix verhindert dass React das Attribut ans DOM-Element weitergibt
const SuggestionItem = styled.li`
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  color: white;
  background: ${(props) => (props.$isActive ? "#3498db" : "transparent")};
  &:hover {
    background: #3498db;
  }
`;

const HintText = styled.small`
  color: #888;
  font-size: 0.78rem;
  margin-top: -0.8rem;
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

  // Autocomplete: Liste der Vorschläge aus der API
  const [suggestions, setSuggestions] = useState([]);

  // Autocomplete: Index des aktuell per Tastatur markierten Vorschlags (-1 = keiner)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Soft-Validierung: Hinweis wenn kein Leerzeichen im Namen (= kein Nachname)
  const [nameHint, setNameHint] = useState("");

  // Autocomplete: Bei Eingabe die API nach passenden Namen befragen
  async function handleNameInput(event) {
    const value = event.target.value;
    setNewName(value);
    setNameHint("");

    if (value.trim().length < 2) {
      // Unter 2 Zeichen keine Suche starten – zu viele Treffer
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
      return;
    }

    try {
      const res = await fetch(`/api/players?search=${encodeURIComponent(value)}`);
      const names = await res.json();

      // Bereits hinzugefügte Teilnehmer aus den Vorschlägen ausblenden
      const filtered = names.filter((n) => !formData.participants.includes(n));
      setSuggestions(filtered);
    } catch {
      setSuggestions([]);
    }
  }

  // Autocomplete: Vorschlag auswählen → Feld befüllen, Dropdown schließen
  function selectSuggestion(name) {
    setNewName(name);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  }

  // Autocomplete: Tastaturnavigation im Dropdown
  // ArrowDown → nächster Eintrag, ArrowUp → vorheriger Eintrag, Enter → auswählen
  function handleKeyDown(event) {
    if (suggestions.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        addPlayer();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault(); // verhindert Cursor-Bewegung im Textfeld
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeSuggestionIndex >= 0) {
        // Vorschlag per Enter übernehmen
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else {
        addPlayer();
      }
    } else if (event.key === "Escape") {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  }

  const [draggedIndex, setDraggedIndex] = useState(null);
  // Speichert den Index des Elements, ÜBER dem wir gerade schweben
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function addPlayer() {
    if (newName.trim() === "") return;

    // Soft-Validierung: Hinweis wenn kein Nachname erkennbar (kein Leerzeichen)
    if (!newName.trim().includes(" ")) {
      setNameHint("Bitte Vor- und Nachname eingeben, z.B. Frank Ackermann");
      return;
    }

    const normalized = newName.trim().split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setFormData({
      ...formData,
      participants: [...formData.participants, normalized],
    });
    setNewName("");
    setSuggestions([]);
    setNameHint("");

    // Neuen Namen automatisch in der Players-Collection speichern.
    // Bereits vorhandene Spieler werden von der API still ignoriert (created: false).
    const parts = normalized.split(" ");
    const firstName = parts.slice(0, -1).join(" ");
    const lastName = parts[parts.length - 1];
    fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName }),
    }).catch(() => {}); // Fehler still ignorieren – Turnier-Speichern bleibt davon unabhängig
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

        <Label>Neuen Teilnehmer hinzufügen (Vor- und Nachname):</Label>
        <AddPlayerControl>
          <AutocompleteWrapper>
            <Input
              type="text"
              value={newName}
              onChange={handleNameInput}
              onKeyDown={handleKeyDown}
              placeholder="z.B. Frank Ackermann"
              autoComplete="off"
            />
            {/* Dropdown nur anzeigen wenn Vorschläge vorhanden */}
            {suggestions.length > 0 && (
              <SuggestionList>
                {suggestions.map((name, index) => (
                  <SuggestionItem
                    key={name}
                    $isActive={index === activeSuggestionIndex}
                    onMouseDown={() => selectSuggestion(name)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                  >
                    {name}
                  </SuggestionItem>
                ))}
              </SuggestionList>
            )}
          </AutocompleteWrapper>
          <ControlButton type="button" onClick={addPlayer}>
            ➕
          </ControlButton>
        </AddPlayerControl>
        {/* Soft-Validierungshinweis – erscheint nur wenn kein Nachname erkannt */}
        {nameHint && <HintText>{nameHint}</HintText>}

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
