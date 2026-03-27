import { render, screen } from "@testing-library/react";
import YearlyRanking from "@/components/YearlyRanking";

const mockTournaments = [
  {
    date: "2026-01-01",
    participants: ["Spieler A", "Spieler B"],
    // Daten, die bei der Punkteberechnung zum Gleichstand führen würden
  },
];

test("zeigt die Jahrestabelle mit dem richtigen Titel an", () => {
  render(<YearlyRanking tournaments={mockTournaments} />);

  const title = screen.getByText(/Jahrestabelle 2026/i);
  expect(title).toBeInTheDocument();
});
