// Smoke-Test für die Startseite.
// Stellt sicher dass die App grundsätzlich erreichbar ist und
// eine H1-Überschrift rendert. Schlägt dieser Test fehl, ist
// die Anwendung selbst nicht lauffähig.
describe("Homepage", () => {
  it("lädt erfolgreich und zeigt eine Hauptüberschrift an", () => {
    cy.visit("/");
    cy.get("h1").should("exist");
  });
});
