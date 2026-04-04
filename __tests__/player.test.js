/** @jest-environment node */
// Testet die Mongoose-Validierungsregeln des Player-Modells ohne Datenbankverbindung.
// validate() löst die Schema-Validierung aus, ohne einen DB-Roundtrip zu machen –
// schneller und isolierter als ein Integrationstest.
import mongoose from "mongoose";
import Player from "@/models/Player";

describe("Player Model – Validierung", () => {
  it("schlägt fehl wenn firstName fehlt", async () => {
    const player = new Player({ lastName: "Mustermann" });
    let err;
    try {
      await player.validate();
    } catch (error) {
      err = error;
    }
    expect(err.errors.firstName).toBeDefined();
    expect(err.errors.firstName.message).toBe("Vorname ist erforderlich");
  });

  it("schlägt fehl wenn firstName kürzer als 2 Zeichen ist", async () => {
    // minlength-Validierung des Schemas: mindestens 2 Zeichen erforderlich
    const player = new Player({ lastName: "Mustermann", firstName: "B" });
    let err = null;
    try {
      await player.validate();
    } catch (error) {
      err = error;
    }
    expect(err).not.toBeNull();
    expect(err.errors.firstName.kind).toBe("minlength");
    expect(err.errors.firstName.message).toBe(
      "Vorname muss mindestens 2 Zeichen haben"
    );
  });

  it("validiert einen korrekten Spieler ohne Fehler", async () => {
    // resolves.toBeUndefined() prüft dass das Promise erfolgreich auflöst
    // und kein ValidationError wirft – das Gegenteil der Fehlertests oben
    const player = new Player({
      firstName: "Andreas",
      lastName: "Mustermann",
      email: "andreas@poker.de",
    });
    await expect(player.validate()).resolves.toBeUndefined();
  });
});
