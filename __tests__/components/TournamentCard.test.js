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
