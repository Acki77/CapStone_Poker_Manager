import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTournamentPage from "@/pages/add-tournament";
import "@testing-library/jest-dom";

describe("AddTorunamentPage", () => {
  it(" sollte die korrekte Überschrift rendern", () => {
    render(<AddTournamentPage />);
    const heading = screen.getByRole("heading", {
      name: /neues turnier anlegen/i,
    });
    expect(heading).toBeInTheDocument();
  });
  it("sollte ein Eingabefeld für das Datum haben", () => {
    render(<AddTournamentPage />);
    const dataInput = screen.getByLabelText(/datum/i);
    expect(dataInput).toBeInTheDocument();
    expect(dataInput).toHaveAttribute("type", "date");
  });
});
describe("AddTournamentPage Logik", () => {
  it("sollte die Formulardaten an die API senden", async () => {
    const user = userEvent.setup();
    // globalen fetch-Befehl abfangen, um su sehen, was passiert
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Turnier erstellt" }),
      }),
    );
    render(<AddTournamentPage />);

    const dateInput = screen.getByLabelText(/datum/i);
    const monthInput = screen.getByLabelText(/monat/i);
    const submitButton = screen.getByRole("button", { name: /speichern/i });

    await user.type(dateInput, "2026-05-20);");
    await user.type(monthInput, "Mai");

    await user.click(submitButton);
    // fetch wird nur einmal aufgerufen
    expect(global.fetch).toHaveBeenCalledTimes(1);
    //prüfen, ob richtige Daten gesendet wurden
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tournaments",
      expect.objectContaining({
        methd: "POST",
        body: JSON.stringify({ date: "2026-05-20", month: "Mai" }),
      }),
    );
    fetchSpy.mockRestor(); // Spion wieder abbauen
  });
});
