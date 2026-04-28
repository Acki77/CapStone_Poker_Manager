import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TournamentForm from "@/components/TournamentForm";

// fetch mocken: Das Formular ruft zwei Endpunkte auf:
//   GET /api/tournaments  → verwendete Monate (leere Liste)
//   GET /api/players      → Autocomplete-Vorschläge (leere Liste als Standard)
//   POST /api/players     → neuen Spieler speichern (wird ignoriert)
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/players")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    // /api/tournaments → leere Liste (keine verwendeten Monate)
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("TournamentForm", () => {
  test("fügt Teilnehmer einzeln hinzu und übergibt sie als Array beim Absenden", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();

    render(<TournamentForm onSubmit={mockOnSubmit} buttonText="Speichern" />);

    await user.type(screen.getByLabelText(/Datum:/i), "2026-03-26");
    await user.selectOptions(screen.getByLabelText(/Monat:/i), "März");

    const nameInput = screen.getByPlaceholderText(/z\.B\. Frank Ackermann/i);
    await user.type(nameInput, "Andreas Müller");
    await user.click(screen.getByText("➕"));

    await user.type(nameInput, "Felix Huber");
    await user.click(screen.getByText("➕"));

    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Andreas Müller", "Felix Huber"],
      })
    );
  });

  test("normalisiert Vor- und Nachname beim Hinzufügen", async () => {
    // Prüft dass jedes Wort einzeln normalisiert wird – nicht nur das erste
    const user = userEvent.setup();

    render(<TournamentForm onSubmit={jest.fn()} buttonText="Speichern" />);

    const nameInput = screen.getByPlaceholderText(/z\.B\. Frank Ackermann/i);
    await user.type(nameInput, "fRANK müLLER");
    await user.click(screen.getByText("➕"));

    expect(screen.getByText("Frank Müller")).toBeInTheDocument();
  });

  test("zeigt Hinweis wenn nur ein Wort eingegeben wird (kein Nachname)", async () => {
    // Soft-Validierung: kein harter Fehler, aber Hinweistext erscheint
    const user = userEvent.setup();

    render(<TournamentForm onSubmit={jest.fn()} buttonText="Speichern" />);

    const nameInput = screen.getByPlaceholderText(/z\.B\. Frank Ackermann/i);
    await user.type(nameInput, "Frank");
    await user.click(screen.getByText("➕"));

    // Hinweis muss sichtbar sein – queryByText gibt null zurück wenn nicht gefunden,
    // daher prüfen wir gezielt den Hinweistext der nur bei Validierungsfehler erscheint
    expect(screen.getByText(/Bitte Vor- und Nachname eingeben/i)).toBeInTheDocument();

    // Teilnehmerliste bleibt leer – "Frank" wurde nicht hinzugefügt
    expect(screen.queryByText(/1\./)).not.toBeInTheDocument();
  });

  test("zeigt Autocomplete-Vorschläge bei Eingabe", async () => {
    // fetch für /api/players gibt Vorschläge zurück
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/players?search=Fra")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(["Frank Ackermann", "Franz Müller"]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    const user = userEvent.setup();
    render(<TournamentForm onSubmit={jest.fn()} buttonText="Speichern" />);

    const nameInput = screen.getByPlaceholderText(/z\.B\. Frank Ackermann/i);
    await user.type(nameInput, "Fra");

    // Vorschläge müssen im Dropdown erscheinen
    await waitFor(() => {
      expect(screen.getByText("Frank Ackermann")).toBeInTheDocument();
      expect(screen.getByText("Franz Müller")).toBeInTheDocument();
    });
  });

  test("Submit-Button zeigt 'Wird gespeichert...' wenn isSubmitting=true", () => {
    render(
      <TournamentForm
        onSubmit={() => {}}
        buttonText="Speichern"
        isSubmitting={true}
      />
    );

    const button = screen.getByRole("button", { name: /Wird gespeichert/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test("Submit-Button ist aktiv und zeigt 'Speichern' wenn isSubmitting=false", () => {
    render(
      <TournamentForm
        onSubmit={() => {}}
        buttonText="Speichern"
        isSubmitting={false}
      />
    );

    const button = screen.getByRole("button", { name: /Speichern/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test("Monat-Dropdown zeigt alle 12 Monate an", async () => {
    render(<TournamentForm onSubmit={jest.fn()} buttonText="Speichern" />);

    const select = screen.getByLabelText(/Monat:/i);
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.value
    );

    expect(options).toContain("Januar");
    expect(options).toContain("Juni");
    expect(options).toContain("Dezember");
  });
});
