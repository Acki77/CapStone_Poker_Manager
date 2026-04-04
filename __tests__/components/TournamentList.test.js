import { render, screen } from "@testing-library/react";
import TournamentList from "@/components/TournamentList";

// TournamentList rendert TournamentCard-Komponenten, die useRouter() und useSession()
// aufrufen. Beide werden gemockt, damit der Test ohne laufenden Server auskommt.
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    asPath: "/",
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null })),
}));

describe("TournamentList", () => {
  test("zeigt eine Hinweismeldung an wenn keine Turniere vorhanden sind", () => {
    // Leeres Array simuliert den Zustand direkt nach der Erstinstallation
    // oder wenn alle Turniere gelöscht wurden
    render(<TournamentList tournaments={[]} />);
    expect(screen.getByText(/Keine Turniere gefunden/i)).toBeInTheDocument();
  });

  test("rendert für jedes Turnier eine Karte mit dem Monatsnamen", () => {
    // getByRole('heading') prüft semantisch korrekte Überschriften-Elemente –
    // bevorzugte Abfragestrategie in React Testing Library (accessibility-first)
    const mockTournaments = [
      { _id: "1", month: "Januar", date: "2026-01-01", participants: ["A"] },
      { _id: "2", month: "Februar", date: "2026-02-01", participants: ["B"] },
    ];

    render(<TournamentList tournaments={mockTournaments} />);

    expect(screen.getByRole("heading", { name: /Januar/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Februar/i })).toBeInTheDocument();
  });
});
