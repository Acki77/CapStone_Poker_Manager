describe("Authentifizierung", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("zeigt den Login-Button wenn ausgeloggt", () => {
    // Ohne Login muss der Login-Button in der Navbar sichtbar sein
    cy.contains("Login").should("be.visible");
  });

  it("versteckt den NEU-Button wenn ausgeloggt", () => {
    // Ohne Admin-Login darf der NEU-Button nicht sichtbar sein
    cy.contains("NEU").should("not.exist");
  });

  it("zeigt den Logout-Button nicht wenn ausgeloggt", () => {
    cy.contains("Logout").should("not.exist");
  });
});
