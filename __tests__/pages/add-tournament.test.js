/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTournamentPage from "@/pages/tournaments/add";
import "@testing-library/jest-dom";

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    asPath: "/",
  }),
}));

describe("AddTournamentPage Logik", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sollte die Formulardaten an die API senden", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Turnier erstellt" }),
      }),
    );

    render(<AddTournamentPage />);

    // Alle Felder ausfüllen (Wichtig: participants nicht vergessen!)
    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.type(screen.getByLabelText(/monat/i), "Mai");
    await user.type(screen.getByLabelText(/teilnehmer/i), "Andreas, Felix");

    const submitButton = screen.getByRole("button", { name: /speichern/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tournaments",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-05-20",
          month: "Mai",
          participants: ["Andreas", "Felix"],
        }),
      }),
    );
  });

  it("sollte eine Fehlermeldung anzeigen, wenn der Server mit 400 antwortet", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Ungültiges Datum" }),
      }),
    );

    render(<AddTournamentPage />);

    // Auch hier: Alles ausfüllen, damit der Submit durchgeht
    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.type(screen.getByLabelText(/monat/i), "Mai");
    await user.type(screen.getByLabelText(/teilnehmer/i), "Andreas");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

    // Suche nach der Fehlermeldung (Groß-/Kleinschreibung ignorieren)
    const errorMessage = await screen.findByText(/ungültiges datum/i);
    expect(errorMessage).toBeInTheDocument();

    // Wir prüfen nur, ob es überhaupt eine Farbe hat,
    // da RGB-Werte zwischen Browser und CSS-Variablen oft leicht abweichen
    expect(errorMessage).toHaveStyle({ color: "rgb(255, 77, 77)" });
  });
});
