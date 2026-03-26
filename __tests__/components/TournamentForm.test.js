import { render, screen, fireEvent } from "@testing-library/react";
import TournamentForm from "@/components/TournamentForm";

describe("TournamentForm", () => {
  test("transformiert den Teilnehmer-String korrekt in ein Array beim Absenden", () => {
    // Ein Mock für die onSubmit Funktion
    const mockOnSubmit = jest.fn();

    render(<TournamentForm onSubmit={mockOnSubmit} buttonText="Speichern" />);

    // Eingabefelder finden
    const dateInput = screen.getByLabelText(/Datum:/i);
    const monthInput = screen.getByLabelText(/Monat:/i);
    const participantsInput = screen.getByLabelText(/Teilnehmer/i);
    const submitButton = screen.getByRole("button", { name: /Speichern/i });

    // Felder ausfüllen
    fireEvent.change(dateInput, { target: { value: "2026-03-26" } });
    fireEvent.change(monthInput, { target: { value: "März" } });
    fireEvent.change(participantsInput, {
      target: { value: "Andreas, Felix,  Marco " }, // Mit extra Leerzeichen zum Testen
    });

    // Absenden
    fireEvent.click(submitButton);

    // Prüfen: Wurde onSubmit mit dem transformierten Array aufgerufen?
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Andreas", "Felix", "Marco"], // Leerzeichen müssen weg sein
      }),
    );
  });
});
