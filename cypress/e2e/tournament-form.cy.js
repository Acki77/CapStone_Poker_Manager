// Cypress testet die App im echten Browser – keine Mocks, echter Server, echte DB.
// Voraussetzung: App läuft auf localhost:3000 (npm run dev).
//
// Diese Tests prüfen das Formular unter /tournaments/add.
// Da wir keinen Admin-Login simulieren, mocken wir die Session via cy.intercept().

describe("Turnier-Formular Verbesserungen", () => {
  beforeEach(() => {
    // NextAuth-Session-Endpunkt abfangen und Admin-Session zurückgeben.
    // Ohne diesen Mock würde das Formular gar nicht erreichbar sein,
    // weil der NEU-Button nur für Admins sichtbar ist.
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: { name: "Frank", email: "frank@test.de", isAdmin: true },
        expires: "2099-01-01",
      },
    }).as("session");

    // Turnier-API abfangen: gibt einen bereits verwendeten Monat zurück.
    // So können wir testen, ob Januar im Dropdown gesperrt ist.
    cy.intercept("GET", "/api/tournaments", {
      statusCode: 200,
      body: [{ _id: "1", month: "Januar", date: "2026-01-15" }],
    }).as("tournaments");

    cy.visit("http://localhost:3000/tournaments/add");
  });

  it("bereits verwendeter Monat ist im Dropdown deaktiviert", () => {
    // Warum cy.intercept()?
    // Cypress läuft im Browser und kann HTTP-Requests abfangen, bevor sie
    // die echte API erreichen. Wir simulieren eine DB mit "Januar" als
    // bestehendem Turnier – ohne Testdaten in der echten DB zu brauchen.

    // Warten bis die Seite die Monatsliste geladen hat
    cy.wait("@tournaments");

    // Das Select-Element per Label finden
    cy.get("select#month").should("be.visible");

    // Die "Januar"-Option muss disabled sein
    // cy.get('option[value="Januar"]') findet das <option>-Element direkt
    cy.get('option[value="Januar"]').should("be.disabled");

    // Ein freier Monat (Februar) darf NICHT disabled sein
    cy.get('option[value="Februar"]').should("not.be.disabled");
  });

  it("wählt den Monat automatisch vor wenn ein Datum eingegeben wird", () => {
    // Warum dieser Test?
    // Die handleDateChange-Funktion liest getMonth() aus dem Datum und
    // setzt den Monat automatisch. Das ist Logik die im Browser läuft –
    // Cypress kann das realistischer testen als Jest (echter DOM, echte Events).

    cy.wait("@tournaments");

    // Sicherstellen dass kein Monat vorausgewählt ist
    cy.get("select#month").should("have.value", "");

    // Datum eingeben: 15. März 2026
    // .type() auf einem date-Input setzt den Wert direkt
    cy.get("input#date").type("2026-03-15");

    // März muss jetzt automatisch im Dropdown ausgewählt sein
    cy.get("select#month").should("have.value", "März");
  });
});
