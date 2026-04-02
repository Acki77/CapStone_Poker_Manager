import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TournamentForm from "@/components/TournamentForm";

describe("TournamentForm", () => {
  test("fügt Teilnehmer einzeln hinzu und übergibt sie als Array beim Absenden", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();

    render(<TournamentForm onSubmit={mockOnSubmit} buttonText="Speichern" />);

    // Pflichtfelder ausfüllen
    await user.type(screen.getByLabelText(/Datum:/i), "2026-03-26");
    await user.type(screen.getByLabelText(/Monat:/i), "März");

    // Teilnehmer einzeln über das Eingabefeld + Button hinzufügen
    // placeholder="eindeutiger Name..." identifiziert das Input eindeutig
    const nameInput = screen.getByPlaceholderText(/eindeutiger Name/i);
    await user.type(nameInput, "Andreas");
    await user.click(screen.getByText("➕"));

    await user.type(nameInput, "Felix");
    await user.click(screen.getByText("➕"));

    // Absenden
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    // onSubmit muss mit Array aufgerufen worden sein
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Andreas", "Felix"],
      })
    );
  });

  test("Submit-Button zeigt 'Wird gespeichert...' wenn isSubmitting=true", () => {
    // isSubmitting=true wird direkt als Prop übergeben - kein Klick nötig
    // Wir testen nur das visuelle Verhalten der Komponente
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
});
