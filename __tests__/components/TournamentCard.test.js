import { render, screen } from "@testing-library/react";
import TournamentCard from "@/components/TournamentCard";

// Mock-Daten für das Turnier
const mockTournament = {
  _id: "1",
  month: "März",
  date: "2026-03-26",
  participants: ["Andreas", "Felix"],
};

test("rendert den Namen des Turniersiegers und seine Punkte", () => {
  render(
    <TournamentCard
      tournament={mockTournament}
      onDelete={() => {}}
      onEdit={() => {}}
    />,
  );

  const playerName = screen.getByText(/Andreas/i);
  expect(playerName).toBeInTheDocument();

  // getAllByText statt getByText nutzen
  const pointsLabels = screen.getAllByText(/\(\d+ Pkt\.\)/);
  expect(pointsLabels.length).toBeGreaterThan(0);
  expect(pointsLabels[0]).toBeInTheDocument();
});
