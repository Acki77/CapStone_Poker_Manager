describe("Homepage", () => {
  it("should load successfully", () => {
    cy.visit("/");
    cy.get("h1").should("exist");
  });
});
