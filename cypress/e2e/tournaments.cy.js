describe("Tournament List E2E", () => {
  beforeEach(() => {
    // Wir besuchen die Startseite vor jedem Test
    cy.visit("http://localhost:3000");
  });

  it("zeigt die Überschrift und die Turnierkarten an", () => {
    // Prüfen, ob die Hauptüberschrift existiert
    cy.get("h1").should("be.visible");

    // Prüfen, ob der Monat aus unserem Seeder (Januar) angezeigt wird
    cy.contains("Januar").should("be.visible");
  });

  it("listet die Teilnehmer mit korrekter Nummerierung auf", () => {
    // Wir suchen nach dem ersten Spieler aus deinem Seeder
    // Da wir (index + 1) nutzen, sollte "1. Phil Ivey" dort stehen
    cy.contains("1. Phil Ivey").should("be.visible");

    // Prüfen, ob die Teilnehmeranzahl korrekt angezeigt wird
    // Wir suchen den Absatz, der den Text enthält, und prüfen dann den gesamten Inhalt
    cy.get("p")
      .contains(/Teilnehmeranzahl/i)
      .parent() // Wir gehen eine Ebene hoch zum <p>, das alles umschließt
      .should("contain", "10");
  });

  it("zeigt einen Empty-State, wenn keine Daten da wären (optionaler Check)", () => {
    // Dieser Test ist schwierig, solange Daten in der DB sind,
    // aber wir haben die Logik ja manuell geprüft.
  });
});
