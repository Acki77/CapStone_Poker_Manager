import { render, screen } from "@testing-library/react";
import AddTournamentPage from "@/pages/add-tournament";
import "@testing-library/jest-dom";

describe("AddTorunamentPage", () => {
  it(" sollte die korrekte Überschrift rendern", () => {
    render(<AddTournamentPage />);
    const heading = screen.getByRole("heading", {
      name: /neues turnier anlegen/i,
    });
    expect(heading).toBeInTheDocument();
  });
  it("sollte ein Eingabefeld für das Datum haben", () => {
    render(<AddTournamentPage />);
    const dataInput = screen.getByLabelText(/datum/i);
    expect(dataInput).toBeInTheDocument();
    expect(dataInput).toHaveAttribute("type", "date");
  });
});
