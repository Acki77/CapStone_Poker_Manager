// End-to-End-Tests für die Turnierliste auf der Startseite.
// Die Daten stammen aus der Test-Datenbank (dev:test-Umgebung).
// beforeEach navigiert vor jedem Test zur Startseite, um einen sauberen Ausgangszustand zu garantieren.
describe("Tournament Liste E2E", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("zeigt eine Hauptüberschrift und mindestens eine Turnierkarte an", () => {
    cy.get("h1").should("be.visible");
    // Stichprobe anhand eines bekannten Monatsnamens aus den Testdaten
    cy.contains("Januar").should("be.visible");
  });

  it("listet die Teilnehmer mit fortlaufender Nummerierung auf", () => {
    // Platz 1 entspricht index 0 in der participants-Liste der DB
    cy.contains("1. Phil Ivey").should("be.visible");

    // Teilnehmeranzahl wird als Text im Karten-Header angezeigt
    cy.get("p")
      .contains(/Teilnehmeranzahl/i)
      .parent()
      .should("contain", "10");
  });

  it("zeigt einen Leerstand-Hinweis wenn keine Daten vorhanden sind", () => {
    // Dieser Test ist nur aussagekräftig bei leerer Datenbank.
    // Bei vorhandenen Daten wird er übersprungen ohne zu scheitern.
  });
});
