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

// fetch mocken: Das Formular ruft GET /api/tournaments (Monate) und
// GET /api/players (Autocomplete) auf – beide geben leere Listen zurück.
function mockFetchDefault() {
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/players")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
}

// Hilfsfunktion: Teilnehmer über das Eingabefeld hinzufügen (Vor- und Nachname)
async function addParticipant(user, name) {
  const nameInput = screen.getByPlaceholderText(/z\.B\. Frank Ackermann/i);
  await user.type(nameInput, name);
  await user.click(screen.getByText("➕"));
}

describe("AddTournamentPage Logik", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sendet die Formulardaten als POST-Request an die API", async () => {
    const user = userEvent.setup();

    // fetch-Aufrufe in Reihenfolge:
    //   1. GET /api/tournaments (Monatsliste im Form-useEffect)
    //   2. GET /api/players     (Autocomplete bei Eingabe "Andreas Müller")
    //   3. GET /api/players     (Autocomplete bei Eingabe "Felix Huber")
    //   4. POST /api/players    (neuer Spieler automatisch speichern)
    //   5. POST /api/players    (neuer Spieler automatisch speichern)
    //   6. POST /api/tournaments (Submit)
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/players") && url.includes("search=")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes("/api/players")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }
      if (url === "/api/tournaments" && !url.includes("method")) {
        // Letzter Aufruf ist der POST → mock-Antwort für Submit
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    // POST /api/tournaments überschreiben für den Submit-Aufruf
    global.fetch = jest.fn((url, options) => {
      if (options?.method === "POST" && url === "/api/tournaments") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Turnier erstellt" }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<AddTournamentPage />);

    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.selectOptions(screen.getByLabelText(/monat/i), "Mai");
    await addParticipant(user, "Andreas Müller");
    await addParticipant(user, "Felix Huber");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tournaments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            date: "2026-05-20",
            month: "Mai",
            participants: ["Andreas Müller", "Felix Huber"],
          }),
        })
      );
    });
  });

  it("zeigt die Server-Fehlermeldung an wenn die API mit 400 antwortet", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn((url, options) => {
      if (options?.method === "POST" && url === "/api/tournaments") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ message: "Ungültiges Datum" }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<AddTournamentPage />);

    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.selectOptions(screen.getByLabelText(/monat/i), "Mai");
    await addParticipant(user, "Andreas Müller");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

    const errorMessage = await screen.findByText(/ungültiges datum/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: "rgb(255, 77, 77)" });
  });
});
