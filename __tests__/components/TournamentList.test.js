import { render, screen } from "@testing-library/react";
import TournamentList from "@/components/TournamentList";

// Prüfen dass TournamentCard korrekt in TList gerendert wird.
// mocken den Router, da TournamentList useRouter nutzt.
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    asPath: "/",
  }),
}));

describe("TournamentList", () => {
  test("zeigt eine Nachricht an, wenn die Liste leer ist", () => {
    render(<TournamentList tournaments={[]} />);
    const message = screen.getByText(/Keine Turniere gefunden/i);
    expect(message).toBeInTheDocument();
  });

  test("rendert die korrekte Anzahl an Turnieren", () => {
    const mockTournaments = [
      { _id: "1", month: "Januar", date: "2026-01-01", participants: ["A"] },
      { _id: "2", month: "Februar", date: "2026-02-01", participants: ["B"] },
    ];

    render(<TournamentList tournaments={mockTournaments} />);

    // prüfen Monatsnamen, die in den Karten erscheinen sollten
    expect(screen.getByText(/Januar/i)).toBeInTheDocument();
    expect(screen.getByText(/Februar/i)).toBeInTheDocument();
  });
});
