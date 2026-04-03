import { render, screen } from "@testing-library/react";
import TournamentCard from "@/components/TournamentCard";

// next-auth mocken - TournamentCard nutzt useSession() für Admin-Check
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

import { useSession } from "next-auth/react";

// Mock-Daten für das Turnier
const mockTournament = {
  _id: "1",
  month: "März",
  date: "2026-03-26",
  participants: ["Andreas", "Felix"],
};

function setLoggedOut() {
  useSession.mockReturnValue({ data: null });
}

function setAdminLoggedIn() {
  useSession.mockReturnValue({
    data: {
      user: {
        name: "Phil Ivey",
        email: "phil@gmail.com",
        isAdmin: true,
      },
    },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("zeigt das Datum im deutschen Format an", () => {
  // Arrange: ausgeloggt – Admin-Buttons spielen hier keine Rolle
  setLoggedOut();

  // Act: Karte mit einem Turnier rendern, das ein konkretes Datum hat
  render(
    <TournamentCard
      tournament={mockTournament}
      onDelete={() => {}}
      onEdit={() => {}}
    />
  );

  // Assert: "2026-03-26" (ISO-Format aus DB) muss als "26.03.2026" sichtbar sein.
  //
  // Warum dieser Test wichtig ist:
  // Die Umwandlung passiert mit toLocaleDateString("de-DE") – das ist
  // browser- und laufzeitabhängig. Wenn jemand das Format versehentlich
  // ändert oder das Feld ganz entfernt, schlägt dieser Test sofort an.
  expect(screen.getByText("26.03.2026")).toBeInTheDocument();
});

test("rendert den Namen des Turniersiegers und seine Punkte", () => {
  setLoggedOut();
  render(
    <TournamentCard
      tournament={mockTournament}
      onDelete={() => {}}
      onEdit={() => {}}
    />
  );

  expect(screen.getByText(/Andreas/i)).toBeInTheDocument();

  const pointsLabels = screen.getAllByText(/\(\d+ Pkt\.\)/);
  expect(pointsLabels.length).toBeGreaterThan(0);
});

test("versteckt Löschen- und Bearbeiten-Button wenn ausgeloggt", () => {
  setLoggedOut();
  render(
    <TournamentCard
      tournament={mockTournament}
      onDelete={() => {}}
      onEdit={() => {}}
    />
  );

  // Buttons dürfen nicht sichtbar sein
  expect(screen.queryByText(/Löschen/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Bearbeiten/i)).not.toBeInTheDocument();
});

test("zeigt Löschen- und Bearbeiten-Button wenn Admin eingeloggt", () => {
  setAdminLoggedIn();
  render(
    <TournamentCard
      tournament={mockTournament}
      onDelete={() => {}}
      onEdit={() => {}}
    />
  );

  // Buttons müssen sichtbar sein
  expect(screen.getByText(/Löschen/i)).toBeInTheDocument();
  expect(screen.getByText(/Bearbeiten/i)).toBeInTheDocument();
});
