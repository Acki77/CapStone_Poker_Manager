# MVP Roadmap: Poker-Liga Turnierverwaltung

## Vision

Eine Web-App zur Erfassung von Monatsturnieren einer privaten Poker-Runde mit automatischer Berechnung der Jahrestabelle.

## Kern-Features (In-Scope)

- **Turnier-Management:** Erstellen und Editieren von Monatsturnieren.
- **Teilnehmer-Auswahl:** Dropdown-Zuweisung von Spielern aus einem festen Pool (Dummy-Daten).
- **Punktesystem:** Automatische Vergabe von Punkten basierend auf der Platzierung.
- **Dashboard:** - Übersicht der gespielten Monatsturniere.
  - Dynamische Jahrestabelle (aggregierte Punkte).

## Out-of-Scope (für später)

- Authentifizierung / User-Login.
- CRUD-Operationen für die Spieler-Stammdaten.
- Drag & Drop (wird im ersten Schritt durch Dropdowns/Input gelöst).

## Datenmodell-Erweiterung

- **Tournament-Model:**
  - Date (Date)
  - Month (String/Number)
  - Results (Array of Objects: { position: Number, playerId: ObjectId, points: Number })

## Aktuelle Meilensteine (Backlog)

### [Ticket 11] Turnier-Rahmendaten anlegen (Basic Setup)

**Status:** 🆕 Offen
**Ziel:** Erstellung der leeren Turnier-Hülle (Datum & Monat).

- **Feature:** Seite `/add-tournament` mit Formular (Date-Picker & Monat).
- **API:** `POST`-Route zur Speicherung in MongoDB.
- **TDD:** API-Test (Status 201) & Cypress-Validierung der Eingabefelder.

### [Ticket 12] Teilnehmer-Erfassung & Punkte-Engine

**Status:** ⏳ Wartet auf #11
**Ziel:** Dynamische Eingabe der Platzierungen und automatische Punkteberechnung.

- **Feature:** Dynamische Zeilen-Generierung basierend auf Teilnehmeranzahl.
- **Logik:** Zentrale Funktion `utils/pointsCalculator.js` für die Punkteformel.
- **TDD:** Unit-Tests für die mathematische Korrektheit der Formel.
