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

// Hilfsfunktion: Teilnehmer über das neue Eingabefeld hinzufügen
async function addParticipant(user, name) {
  const nameInput = screen.getByPlaceholderText(/eindeutiger Name/i);
  await user.type(nameInput, name);
  await user.click(screen.getByText("➕"));
}

describe("AddTournamentPage Logik", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sendet die Formulardaten als POST-Request an die API", async () => {
    const user = userEvent.setup();

    // 1. Aufruf: GET /api/tournaments (Monatsliste im Form-useEffect)
    // 2. Aufruf: POST /api/tournaments (Submit)
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Turnier erstellt" }),
      });

    render(<AddTournamentPage />);

    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.selectOptions(screen.getByLabelText(/monat/i), "Mai");
    await addParticipant(user, "Andreas");
    await addParticipant(user, "Felix");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect(global.fetch).toHaveBeenLastCalledWith(
      "/api/tournaments",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-05-20",
          month: "Mai",
          participants: ["Andreas", "Felix"],
        }),
      })
    );
  });

  it("zeigt die Server-Fehlermeldung an wenn die API mit 400 antwortet", async () => {
    const user = userEvent.setup();

    // 1. Aufruf: GET (Monatsliste), 2. Aufruf: POST schlägt fehl
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Ungültiges Datum" }),
      });

    render(<AddTournamentPage />);

    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.selectOptions(screen.getByLabelText(/monat/i), "Mai");
    await addParticipant(user, "Andreas");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

    const errorMessage = await screen.findByText(/ungültiges datum/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: "rgb(255, 77, 77)" });
  });
});
