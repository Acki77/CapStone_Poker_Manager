/** @jest-environment node */
// Testet die Pflichtfeld-Validierung des Tournament-Modells ohne Datenbankverbindung.
// validate() prüft das Schema synchron – kein Netzwerk, kein I/O.
import Tournament from "../../models/Tournament";

describe("Tournament Model – Validierung", () => {
  it("wirft einen ValidationError wenn das Datum fehlt", async () => {
    // date ist ein Pflichtfeld im Schema – fehlt es, muss errors.date befüllt sein
    const tournament = new Tournament({
      month: "Januar",
      participants: ["Phil Ivey"],
    });

    let error;
    try {
      await tournament.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.date).toBeDefined();
  });
});
