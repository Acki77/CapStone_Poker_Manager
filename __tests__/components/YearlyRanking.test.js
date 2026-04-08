import { render, screen } from "@testing-library/react";
import YearlyRanking from "@/components/YearlyRanking";

// Minimales Turnier-Objekt – reicht aus um das Jahr aus dem Datum zu lesen
// und die Tabelle zu rendern. Punktegleichstand ist für diesen Test nicht relevant.
const mockTournaments = [
  {
    date: "2026-01-01",
    participants: ["Spieler A", "Spieler B"],
  },
];

test("zeigt die Jahrestabelle mit dem richtigen Titel an", () => {
  render(<YearlyRanking tournaments={mockTournaments} />);

  const title = screen.getByText(/Jahrestabelle 2026/i);
  expect(title).toBeInTheDocument();
});
