/** @jest-environment node */
import mongoose from "mongoose";
import Player from "@/models/Player";

describe("Player Model Test", () => {
  it("should fail if no name is provided", async () => {
    console.log(
      "Pflichtfelder:",
      Object.keys(Player.schema.paths).filter(
        (p) => Player.schema.paths[p].isRequired,
      ),
    );
    const playerWithoutFirstName = new Player({
      lastName: "Mustermann",
    });
    let err;
    try {
      await playerWithoutFirstName.validate();
      console.log("Kein Fehler gefunden");
    } catch (error) {
      err = error;
      console.log("FEHLER GEFANGEN:", err.errors ? "Ja" : "Nein");
    }
    // Prüfung: existiert überhaupt ein Fehler?
    expect(err.errors.firstName).toBeDefined();
    // Prüfung: existiert die korrekte Fehlermeldung
    expect(err.errors.firstName.message).toBe("Vorname ist erforderlich");
  });
});
