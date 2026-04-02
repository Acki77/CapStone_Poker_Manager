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

// AddTournamentPage rendert TournamentForm → TournamentCard nicht direkt,
// aber TournamentForm selbst braucht kein useSession - kein Mock nötig hier.
// AddTournamentPage rendert TournamentForm das kein useSession nutzt - OK.

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

  it("sollte die Formulardaten an die API senden", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Turnier erstellt" }),
      })
    );

    render(<AddTournamentPage />);

    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.type(screen.getByLabelText(/monat/i), "Mai");
    await addParticipant(user, "Andreas");
    await addParticipant(user, "Felix");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

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
      })
    );
  });

  it("sollte eine Fehlermeldung anzeigen, wenn der Server mit 400 antwortet", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Ungültiges Datum" }),
      })
    );

    render(<AddTournamentPage />);

    await user.type(screen.getByLabelText(/datum/i), "2026-05-20");
    await user.type(screen.getByLabelText(/monat/i), "Mai");
    await addParticipant(user, "Andreas");

    await user.click(screen.getByRole("button", { name: /speichern/i }));

    const errorMessage = await screen.findByText(/ungültiges datum/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: "rgb(255, 77, 77)" });
  });
});
