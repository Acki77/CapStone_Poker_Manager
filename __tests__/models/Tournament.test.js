/** @jest-environment node */
import Tournament from "../../models/Tournament";

describe("Tournament Model", () => {
  it("sollte einen Validierungsfehler werfen, wenn das Datum fehlt", async () => {
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
