# Technisches Daten-Schema: Spieler (Player)

Dieses Dokument beschreibt die Struktur eines Spielers für den **Poker Tournament Manager**.

## 1. Kern-Attribute (Entity: Player)

| Feldname       | Datentyp     | Pflichtfeld | Beschreibung                      | Validierung / Regel   |
| :------------- | :----------- | :---------- | :-------------------------------- | :-------------------- |
| `id`           | String       | Ja          | Vorname des Spielers              | automatisch generiert |
| `firstName`    | String       | Ja          | Vorname des Spielers              | Min. 2 Zeichen        |
| `lastName`     | String       | Ja          | Nachname des Spielers             | Min. 2 Zeichen        |
| `email`        | String       | Nein        | Kontakt für Benachrichtigungen    | Valides E-Mail Format |
| `profileImage` | String (URL) | Nein        | Link zum LinkedIn-Bild            | Valide URL            |
| `totalPoints`  | Number       | Ja          | Aktueller Stand der Jahreswertung | Standard: 0           |

## 2. Turnier-Ergebnisse (Collection: TournamentResults)

Diese Collection speichert die individuellen Platzierungen pro Event und dient als Basis für die Monats- und Jahreswertung.

| Feldname           | Datentyp | Pflicht | Beschreibung                          | Regel / Validierung              |
| :----------------- | :------- | :------ | :------------------------------------ | :------------------------------- |
| `playerId`         | ObjectId | Ja      | Verweis auf den Spieler (aus Players) | Muss existierende Player-ID sein |
| `eventDate`        | Date     | Ja      | Datum des Turniers (Monat/Jahr)       | Format: YYYY-MM                  |
| `rank`             | Number   | Ja      | Erreichte Platzierung                 | Ganze Zahl (1, 2, 3...)          |
| `points`           | Number   | Ja      | Erreichte Monatspunkte                | Wird nach Formel berechnet       |
| `participantCount` | Number   | Ja      | Anzahl der Teilnehmer im Monat        | Beeinflusst die Punkteberechnung |

## 3. Turnier-Struktur (Collection: tournaments)

Diese Collection speichert die Metadaten eines Turnierevents und die Liste der Teilnehmer in der Reihenfolge ihres Ausscheidens.

| Feldname       | Datentyp | Pflicht | Beschreibung                            | Regel / Validierung |
| :------------- | :------- | :------ | :-------------------------------------- | :------------------ |
| `date`         | Date     | Ja      | Exaktes Datum des Events                | ISO-Format          |
| `month`        | String   | Ja      | Anzeigename des Monats                  | z.B. "Januar"       |
| `participants` | [String] | Ja      | Liste der Namen (Platzierung = Index+1) | Array von Strings   |

### Wichtige Logik-Transformation:

- **Speichern:** Ein Textfeld-String (`"Frank, Felix"`) wird via `.split(',')` zu `["Frank", "Felix"]`.
- **Anzeigen (Edit):** Das Array `["Frank", "Felix"]` wird via `.join(', ')` wieder zum String für das Textfeld.

_Hinweis: In Phase 1 & 2 nutzen wir Strings für Teilnehmer. Später erfolgt die Verknüpfung zu den `Players` via ObjectId._

### Berechnungs-Logik (Business Rules)

- **Monatstabelle:** Filtert alle `TournamentResults` nach einem bestimmten `eventDate`. Sortierung nach `points` absteigend.
- **Jahrestabelle:** Summiert alle `points` eines Spielers innerhalb eines Kalenderjahres.
- **Punkte-Formel:** Die `points` sind abhängig von `rank` und `participantCount` (Logik wird im Backend implementiert).

## 3. Business Rules (Geschäftslogik)

- Ein Spieler ist eindeutig identifizierbar durch: (id) (\_id bei MongoDB)
- Punkte aus den monatlichen Events berechnen sich wie folgt(analog aus der Formel 1): Wertungspunkte + Punkte (Platzierung) + 5 Anweisenheitspunkte,
  z.b. bei 15 Leuten hat der Sieger 25+15+5 Punkte
- Die Platzierung berechnet sich am Ende des Jahres aus den `totalPoints`.
