// Testet die visuelle Darstellung von geteilten Plätzen in der Jahrestabelle.
//
// Da die Homepage getServerSideProps nutzt (direkte DB-Abfrage ohne Client-Request),
// ist cy.intercept() hier nicht anwendbar. Stattdessen legt cy.request() die
// Testdaten direkt per API an – der Server rendert sie dann serverseitig in die Seite.
//
// Datenkonstellation:
//   Turnier November: Tester1, Tester2, Tester3
//   Turnier Dezember: Tester3, Tester2, Tester1 (umgekehrte Reihenfolge)
//   → Tester1 und Tester3 erhalten identische Gesamtpunkte → geteilter Platz
//   → Tester2 landet zwei Plätze hinter dem geteilten Platz (Platz dazwischen übersprungen)

describe("Jahrestabelle – Gleichstandsanzeige", () => {
  let idNov;
  let idDez;

  before(() => {
    // Testdaten anlegen – Rückgabe enthält die MongoDB-ID für den späteren Teardown
    cy.request("POST", "http://localhost:3000/api/tournaments", {
      date: "2026-11-28",
      month: "November",
      participants: ["Tester1", "Tester2", "Tester3"],
    }).then((resp) => {
      idNov = resp.body.data._id;
    });

    cy.request("POST", "http://localhost:3000/api/tournaments", {
      date: "2026-12-19",
      month: "Dezember",
      participants: ["Tester3", "Tester2", "Tester1"],
    }).then((resp) => {
      idDez = resp.body.data._id;
    });
  });

  after(() => {
    // Testdaten entfernen damit die Test-DB nach dem Lauf sauber bleibt
    cy.request("DELETE", `http://localhost:3000/api/tournaments/${idNov}`);
    cy.request("DELETE", `http://localhost:3000/api/tournaments/${idDez}`);
  });

  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("zeigt für Tester1 und Tester3 denselben Platz an", () => {
    // Liest den Rang aus der ersten Tabellenzelle der jeweiligen Zeile aus.
    // Der Vergleich ist relativ – unabhängig davon welchen absoluten Platz
    // die Tester in der Gesamtrangliste belegen.
    cy.contains("tr", "Tester1")
      .find("td:first-child")
      .invoke("text")
      .as("rangTester1");

    cy.contains("tr", "Tester3")
      .find("td:first-child")
      .invoke("text")
      .as("rangTester3");

    cy.get("@rangTester1").then((rang1) => {
      cy.get("@rangTester3").then((rang3) => {
        expect(rang1.trim()).to.equal(rang3.trim());
      });
    });
  });

  it("zeigt für beide Spieler mit Gleichstand den gemittelten Jahresanteil an", () => {
    // Tester1 und Tester3 teilen Platz 1 (Positionen 0 und 1).
    // Erwarteter Anteil: (25 % + 20 %) / 2 = 22,5 % – für beide identisch.
    // Das Komma im Anzeigewert kommt durch .replace(".", ",") in YearlyRanking.js.
    cy.contains("tr", "Tester1")
      .find("td:last-child")
      .should("contain", "22,5 %");

    cy.contains("tr", "Tester3")
      .find("td:last-child")
      .should("contain", "22,5 %");
  });

  it("zeigt für den Spieler auf übersprungenen Platz 3 den Anteil von Position 2 an", () => {
    // Tester2 belegt Arrayposition 2, unabhängig vom displayRank 3.
    // YEARLY_PERCENTAGES[2] = 13,5 %.
    cy.contains("tr", "Tester2")
      .find("td:last-child")
      .should("contain", "13,5 %");
  });

  it("überspringt einen Platz nach dem geteilten Rang", () => {
    // Liest den numerischen Rang von Tester1 und Tester2 aus und prüft
    // dass Tester2 genau zwei Plätze hinter Tester1 liegt (ein Platz übersprungen).
    cy.contains("tr", "Tester1")
      .find("td:first-child")
      .invoke("text")
      .as("rangTester1");

    cy.contains("tr", "Tester2")
      .find("td:first-child")
      .invoke("text")
      .as("rangTester2");

    cy.get("@rangTester1").then((rang1) => {
      cy.get("@rangTester2").then((rang2) => {
        const platz1 = parseInt(rang1);
        const platz2 = parseInt(rang2);
        expect(platz2).to.equal(platz1 + 2);
      });
    });
  });
});
