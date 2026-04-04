/** @jest-environment node */
// Integrationstest für den API-Handler GET /api/tournaments.
// node-mocks-http simuliert Request- und Response-Objekte ohne laufenden HTTP-Server.
// Der Handler wird direkt als Funktion aufgerufen – kein Netzwerk-Overhead.
import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });
import { createMocks } from "node-mocks-http";
const handleTournaments = require("@/pages/api/tournaments").default;
const dbConnect = require("@/db/connect").default;
import Tournament from "@/models/Tournament";

// Datenbankverbindung einmalig vor allen Tests aufbauen
beforeAll(async () => {
  await dbConnect();
});

describe("GET /api/tournaments", () => {
  it("antwortet mit Status 200 und einem Array", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await handleTournaments(req, res);

    // _getStatusCode() und _getData() sind Inspect-Methoden von node-mocks-http
    // und stehen an einem echten Response-Objekt nicht zur Verfügung
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });
});

// Verbindung nach allen Tests schließen – verhindert offene Handles in Jest
afterAll(async () => {
  await mongoose.connection.close();
});
