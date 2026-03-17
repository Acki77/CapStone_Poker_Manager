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
