import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TournamentForm from "@/components/TournamentForm";

describe("TournamentForm", () => {
  test("transformiert den Teilnehmer-String korrekt in ein Array beim Absenden", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();

    render(<TournamentForm onSubmit={mockOnSubmit} buttonText="Speichern" />);

    // Eingabefelder finden
    const dateInput = screen.getByLabelText(/Datum:/i);
    const monthInput = screen.getByLabelText(/Monat:/i);
    const participantsInput = screen.getByLabelText(/Teilnehmer/i);
    const submitButton = screen.getByRole("button", { name: /Speichern/i });

    // Felder ausfüllen
    await user.type(dateInput, "2026-03-26");
    await user.type(monthInput, "März");
    await user.type(participantsInput, "Andreas, Felix,  Marco ");

    // Absenden
    await user.click(submitButton);

    // Prüfen: Wurde onSubmit mit dem transformierten Array aufgerufen?
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Andreas", "Felix", "Marco"], // Leerzeichen müssen weg sein
      }),
    );
  });
});
