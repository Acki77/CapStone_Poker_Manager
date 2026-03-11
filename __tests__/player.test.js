/** @jest-environment node */
import mongoose from "mongoose";
import Player from "@/models/Player";

describe("Player Model Test", () => {
  it("should fail if no name is provided", async () => {
    const playerWithoutFirstName = new Player({
      lastName: "Mustermann",
    });
    let err;
    try {
      await playerWithoutFirstName.validate();
    } catch (error) {
      err = error;
    }
    // Prüfung: existiert überhaupt ein Fehler?
    expect(err.errors.firstName).toBeDefined();
    // Prüfung: existiert die korrekte Fehlermeldung
    expect(err.errors.firstName.message).toBe("Vorname ist erforderlich");
  });
  it("should fail if firstName is shorter than 2 characters", async () => {
    const shortNamePlayer = new Player({
      lastName: "Mustermann",
      firstName: "A",
    });
    let err = null;
    try {
      await shortNamePlayer.validate();
    } catch (error) {
      err = error;
      console.log("err", err);
    }
    expect(err).not.toBeNull();
    expect(err.errors.firstName.kind).toBe("minlength");
    expect(err.errors.firstName.message).toBe(
      "Vorname muss mindestens 2 Zeichen haben",
    );
  });
  it("should validate a correct player without errors", async () => {
    const validPlayer = new Player({
      firstName: "Andreas",
      lastName: "Mustermann",
      email: "andreas@poker.de",
    });

    await expect(validPlayer.validate()).resolves.toBeUndefined();
  });
});
