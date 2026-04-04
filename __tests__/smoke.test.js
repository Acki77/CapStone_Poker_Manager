// Smoke Test – grundlegender Sanity-Check der Test-Infrastruktur.
// Schlägt dieser Test fehl, liegt ein Konfigurationsproblem in Jest vor,
// nicht ein Fehler in der Anwendung selbst.
describe("Smoke Test", () => {
  it("Jest-Konfiguration ist funktionsfähig", () => {
    expect(1 + 1).toBe(2);
  });
});
