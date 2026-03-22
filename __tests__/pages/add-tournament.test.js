import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTournamentPage from "@/pages/add-tournament";
import "@testing-library/jest-dom";
jest.mock("next/router", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      asPath: "/",
      route: "/",
      query: {},
    };
  },
}));

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
    // globalen fetch-Befehl abfangen, um zu sehen, was passiert
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Turnier erstellt" }),
      }),
    );
    render(<AddTournamentPage />);

    const dateInput = screen.getByLabelText(/datum/i);
    const monthInput = screen.getByLabelText(/monat/i);
    await user.type(dateInput, "2026-05-20");
    await user.type(monthInput, "Mai");

    const submitButton = screen.getByRole("button", { name: /speichern/i });
    await user.click(submitButton);
    // fetch wird nur einmal aufgerufen
    // kurz warten für den Aufruf
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    //prüfen, ob richtige Daten gesendet wurden
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tournaments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ date: "2026-05-20", month: "Mai" }),
      }),
    );
  });
  it("sollte eine Fehlermeldung anzeigen, wenn der Server mit 400 antwortet", async () => {
    const user = userEvent.setup();
    // Simmuation eines Fehlers vom server (z.b. Bad request)
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Ungültiges Datum" }),
      }),
    );
    render(<AddTournamentPage />);

    const dateInput = screen.getByLabelText(/datum/i);
    const monthInput = screen.getByLabelText(/monat/i);
    await user.type(dateInput, "2026-05-20");
    await user.type(monthInput, "Mai");
    const submitButton = screen.getByRole("button", { name: /speichern/i });
    await user.click(submitButton);
    // warten, bis Fehermeldung in DOM angezeigt erscheint
    const errorMessage = await screen.findByText(/ungültiges datum/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
});
