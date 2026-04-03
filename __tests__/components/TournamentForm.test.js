import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TournamentForm from "@/components/TournamentForm";

// fetch mocken: useEffect im Form lädt verwendete Monate – leere Liste zurückgeben
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("TournamentForm", () => {
  test("fügt Teilnehmer einzeln hinzu und übergibt sie als Array beim Absenden", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();

    render(<TournamentForm onSubmit={mockOnSubmit} buttonText="Speichern" />);

    // Datum wählen
    await user.type(screen.getByLabelText(/Datum:/i), "2026-03-26");

    // Monat aus Dropdown wählen
    await user.selectOptions(screen.getByLabelText(/Monat:/i), "März");

    // Teilnehmer einzeln hinzufügen
    const nameInput = screen.getByPlaceholderText(/eindeutiger Name/i);
    await user.type(nameInput, "Andreas");
    await user.click(screen.getByText("➕"));

    await user.type(nameInput, "Felix");
    await user.click(screen.getByText("➕"));

    // Absenden
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Andreas", "Felix"],
      })
    );
  });

  test("normalisiert Teilnehmernamen beim Hinzufügen", async () => {
    const user = userEvent.setup();

    render(<TournamentForm onSubmit={jest.fn()} buttonText="Speichern" />);

    const nameInput = screen.getByPlaceholderText(/eindeutiger Name/i);
    await user.type(nameInput, "fRANK");
    await user.click(screen.getByText("➕"));

    expect(screen.getByText("Frank")).toBeInTheDocument();
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
