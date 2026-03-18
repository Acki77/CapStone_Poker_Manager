/** @jest-environment node */
import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });
import { createMocks } from "node-mocks-http";
const handleTournaments = require("@/pages/api/tournaments").default;
const dbConnect = require("@/db/connect").default;
import Tournament from "@/models/Tournament";

// nutzen der DB- Verbindung
beforeAll(async () => {
  await dbConnect();
});

describe("/api/tournaments API Endpoint", () => {
  it("sollte eine Liste von Turnieren mit Status 200 zurückgeben", async () => {
    // 1. Vorbereitung eines simulierten Request
    const { req, res } = createMocks({
      method: "GET",
    });

    // 2. Handler Aufruf (der noch nicht existiert oder leer ist)
    await handleTournaments(req, res);

    // 3. Erwartungen (Assertions)
    expect(res._getStatusCode()).toBe(200); //prüfen, ob Status 200(OK) zurück kommt
    const data = JSON.parse(res._getData()); // Umwandlung der Antwort in ein JSON
    expect(Array.isArray(data)).toBe(true); // Enthält die Antwort wirklich eine Liste (Array)
  });
});
afterAll(async () => {
  await mongoose.connection.close();
});
