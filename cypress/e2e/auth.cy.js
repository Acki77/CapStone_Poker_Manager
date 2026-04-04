// End-to-End-Tests für den Authentifizierungszustand im ausgeloggten Modus.
// Alle Tests laufen ohne aktive Session – es wird kein Login durchgeführt.
// Geprüft wird ausschließlich das UI-Verhalten bei fehlendem Admin-Zugriff.
describe("Authentifizierung – ausgeloggter Zustand", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("zeigt den Login-Button in der Navbar an", () => {
    cy.contains("Login").should("be.visible");
  });

  it("blendet den NEU-Button aus", () => {
    // Der NEU-Button darf im DOM nicht vorhanden sein –
    // not.exist ist strenger als not.be.visible, da es auch versteckte Elemente ausschließt
    cy.contains("NEU").should("not.exist");
  });

  it("zeigt keinen Logout-Button an", () => {
    cy.contains("Logout").should("not.exist");
  });
});
