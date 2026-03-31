# Capstone Poker Manager – Testing Reference Guide

Dieses Dokument dient als umfassende Referenz für die Testautomatisierung in diesem Projekt.
Es richtet sich an Test Engineers / Test Automation Engineers und erklärt alle eingesetzten
Test-Frameworks, Strategien und Muster.

---

## Inhaltsverzeichnis

1. [Projektüberblick](#1-projektüberblick)
2. [Tech Stack & Test-Frameworks](#2-tech-stack--test-frameworks)
3. [Testpyramide & Strategie](#3-testpyramide--strategie)
4. [Umgebung & Konfiguration](#4-umgebung--konfiguration)
5. [Unit- und Komponententests (Jest + React Testing Library)](#5-unit--und-komponententests-jest--react-testing-library)
6. [Integrationstests](#6-integrationstests)
7. [End-to-End-Tests mit Cypress](#7-end-to-end-tests-mit-cypress)
8. [Robot Framework – Installation & Einrichtung](#8-robot-framework--installation--einrichtung)
9. [Robot Framework – Tests schreiben & erklären](#9-robot-framework--tests-schreiben--erklären)
10. [Testausführung – Alle Befehle im Überblick](#10-testausführung--alle-befehle-im-überblick)
11. [Mocking-Strategien](#11-mocking-strategien)
12. [Best Practices & Patterns](#12-best-practices--patterns)

---

## 1. Projektüberblick

**Poker Manager** ist eine Full-Stack-Webanwendung für die Verwaltung von Pokerturnieren.

| Bereich         | Technologie                  |
|-----------------|------------------------------|
| Frontend        | Next.js 16, React 19         |
| Styling         | Styled Components            |
| Backend/API     | Next.js API Routes           |
| Datenbank       | MongoDB (via Mongoose)       |
| Hosting         | Node.js-Server               |

**Kernfunktionen:**
- Turniere anlegen, bearbeiten und löschen
- Teilnehmerliste per Drag & Drop sortieren
- Punkteberechnung nach F1-System (25-18-15-12-10-8-6-4-2-1 + Bonuspunkte)
- Jahresrangliste aller Spieler

---

## 2. Tech Stack & Test-Frameworks

### Installierte Test-Dependencies

```json
{
  "devDependencies": {
    "jest": "^30.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jest-environment-jsdom": "^30.x",
    "node-mocks-http": "^1.x",
    "cypress": "^15.x"
  }
}
```

### Geplante Erweiterung

```
Robot Framework (Python-basiert) – siehe Abschnitt 8 & 9
```

---

## 3. Testpyramide & Strategie

```
          /\
         /  \
        / E2E \          <- Cypress (browser-level)
       /--------\
      /Integration\      <- Jest + node-mocks-http (API-level)
     /--------------\
    /  Komponenten   \   <- React Testing Library (component-level)
   /------------------\
  /    Unit Tests      \  <- Jest (function-level)
 /----------------------\
```

| Ebene           | Framework                    | Dateipfad              | Laufzeit |
|-----------------|------------------------------|------------------------|----------|
| Unit            | Jest                         | `__tests__/`           | Sekunden |
| Komponente      | Jest + RTL                   | `__tests__/components/`| Sekunden |
| Integration     | Jest + node-mocks-http       | `__tests__/api/`       | Sekunden |
| E2E (Browser)   | Cypress                      | `cypress/e2e/`         | Minuten  |
| E2E (Keyword)   | Robot Framework              | `robot/`               | Minuten  |

**Strategie:** Viele schnelle Unit/Komponenten-Tests, wenige langsame E2E-Tests.

---

## 4. Umgebung & Konfiguration

### jest.config.js

```js
// Erklärt: Jest für eine Next.js + ESM-Umgebung konfigurieren
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom', // Simuliert den Browser (DOM-API verfügbar)
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Pfad-Alias: "@/components/X" → "components/X"
  },
}

module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js

```js
// Lädt @testing-library/jest-dom-Matcher für alle Tests automatisch
// Dadurch sind Assertions wie toBeInTheDocument(), toHaveTextContent() verfügbar
import '@testing-library/jest-dom'
```

### cypress.config.js

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',  // App muss laufen, bevor Cypress startet
    setupNodeEvents(on, config) {},
  },
})
```

### Umgebungsvariablen

| Datei            | Zweck                                |
|------------------|--------------------------------------|
| `.env.local`     | Produktions-/Entwicklungsdaten       |
| `.env.test.local`| Separate Test-Datenbank (wichtig!)   |

```env
# .env.test.local
MONGODB_URI=mongodb://localhost:27017/poker-manager-test
```

> **Wichtig:** Tests schreiben nie in die Produktionsdatenbank. Die `.env.test.local`-Datei
> wird von Jest automatisch bevorzugt, wenn `NODE_ENV=test` gesetzt ist.

---

## 5. Unit- und Komponententests (Jest + React Testing Library)

### 5.1 Smoke Test

**Datei:** `__tests__/smoke.test.js`

```js
// Der einfachste mögliche Test: Prüft, ob das Test-Framework selbst funktioniert.
// "Smoke Test" = Grundlegender Sanity-Check, bevor aufwändigere Tests laufen.
test('1 + 1 = 2', () => {
  expect(1 + 1).toBe(2)
})
```

**Konzept:** Ein Smoke Test schlägt fehl, wenn das Framework falsch konfiguriert ist.
Er ist der erste Test, den man schreibt.

---

### 5.2 Model/Unit-Tests

**Datei:** `__tests__/player.test.js`

Testet die Mongoose-Validierungsregeln des `Player`-Modells **ohne Datenbankverbindung**.

```js
// Konzept: Schema-Instanz direkt testen, validateSync() löst keine DB-Verbindung aus.
// Besser als Integration, weil schnell und isoliert.

describe('Player Model Validation', () => {
  it('schlägt fehl, wenn firstName fehlt', () => {
    const player = new Player({ lastName: 'Ivey' })
    const error = player.validateSync()
    expect(error.errors['firstName']).toBeDefined()
  })

  it('schlägt fehl, wenn firstName < 2 Zeichen', () => {
    const player = new Player({ firstName: 'P', lastName: 'Ivey' })
    const error = player.validateSync()
    expect(error.errors['firstName'].kind).toBe('minlength')
  })

  it('ist gültig bei korrekten Daten', () => {
    const player = new Player({ firstName: 'Phil', lastName: 'Ivey' })
    const error = player.validateSync()
    expect(error).toBeUndefined()
  })
})
```

**Konzept: `validateSync()` vs `validate()`**
- `validateSync()` – synchron, kein I/O, ideal für Unit-Tests
- `validate()` – async, prüft z.B. unique-Constraints gegen DB

---

**Datei:** `__tests__/models/Tournament.test.js`

```js
it('wirft ValidationError wenn date fehlt', () => {
  const t = new Tournament({ month: 'Januar', participants: ['Phil'] })
  const err = t.validateSync()
  expect(err.errors['date']).toBeDefined()
})
```

---

### 5.3 Komponenten-Tests

**Konzept:** React Testing Library (RTL) rendert Komponenten in einem virtuellen DOM
(jsdom) und testet aus **Benutzerperspektive** – d.h. was der User sieht/klickt,
nicht wie der Code intern funktioniert.

**RTL-Grundprinzip:** "Test your software the way your users use it."

#### Layout-Komponente

**Datei:** `__tests__/components/Layout.test.js`

```js
// next/router muss gemockt werden, da Komponenten useRouter() verwenden
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), pathname: '/' }),
}))

it('rendert das Logo und den NEU-Button', () => {
  render(<Layout>content</Layout>)
  expect(screen.getByAltText(/walhalla/i)).toBeInTheDocument()  // Logo
  expect(screen.getByText(/NEU/i)).toBeInTheDocument()           // Nav-Button
})
```

**Wichtige RTL-Queries:**

| Query                      | Wann nutzen?                               |
|----------------------------|--------------------------------------------|
| `getByText('...')`         | Sichtbarer Text                            |
| `getByRole('button')`      | Semantische Elemente (a11y-konform)        |
| `getByLabelText('...')`    | Form-Inputs mit Label                      |
| `getByAltText('...')`      | Bilder                                     |
| `queryByText('...')`       | Prüfen, dass etwas NICHT da ist            |
| `findByText('...')`        | Async (wartet auf Erscheinen)              |

---

#### TournamentCard-Komponente

**Datei:** `__tests__/components/TournamentCard.test.js`

```js
const mockTournament = {
  _id: '1',
  date: '2024-01-15',
  month: 'Januar',
  participants: ['Phil Ivey', 'Daniel Negreanu', 'Doyle Brunson'],
}

it('zeigt den Gewinner und seine Punkte an', () => {
  render(<TournamentCard tournament={mockTournament} />)
  expect(screen.getByText('Phil Ivey')).toBeInTheDocument()
  // Punkte werden dynamisch berechnet: 25 (Rang 1) + 3 (3 Teilnehmer) + 5 (Anwesenheit)
  expect(screen.getByText('33 Pts')).toBeInTheDocument()
})
```

---

#### TournamentList-Komponente

**Datei:** `__tests__/components/TournamentList.test.js`

```js
it('zeigt "Keine Turniere" bei leerer Liste', () => {
  render(<TournamentList tournaments={[]} />)
  expect(screen.getByText(/Keine Turniere gefunden/i)).toBeInTheDocument()
})

it('rendert die korrekte Anzahl von Karten', () => {
  render(<TournamentList tournaments={[mock1, mock2, mock3]} />)
  // getAllByRole gibt ein Array zurück – Länge prüfen
  const cards = screen.getAllByTestId('tournament-card')
  expect(cards).toHaveLength(3)
})
```

---

#### TournamentForm-Komponente

**Datei:** `__tests__/components/TournamentForm.test.js`

```js
// userEvent simuliert echte Tastatureingaben (realistischer als fireEvent)
import userEvent from '@testing-library/user-event'

it('wandelt Teilnehmer-String in Array beim Submit um', async () => {
  const user = userEvent.setup()
  const mockOnSubmit = jest.fn()

  render(<TournamentForm onSubmit={mockOnSubmit} />)

  await user.type(screen.getByLabelText(/datum/i), '2024-01-15')
  // Weitere Felder ausfüllen...
  await user.click(screen.getByRole('button', { name: /speichern/i }))

  expect(mockOnSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      participants: expect.arrayContaining(['Phil Ivey', 'Daniel Negreanu']),
    })
  )
})
```

**Konzept: `userEvent` vs `fireEvent`**
- `fireEvent.click()` – feuert nur das click-Event, unrealistisch
- `userEvent.click()` – simuliert Maus-Hover, Focus, Click – wie ein echter User

---

#### YearlyRanking-Komponente

**Datei:** `__tests__/components/YearlyRanking.test.js`

```js
it('zeigt den Titel mit dem aktuellen Jahr', () => {
  render(<YearlyRanking tournaments={mockTournaments} />)
  const currentYear = new Date().getFullYear()
  expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
})
```

---

## 6. Integrationstests

Integrationstests testen mehrere Schichten zusammen. Hier: **Next.js API Routes + MongoDB**.

**Datei:** `__tests__/api/tournaments.test.js`

```js
// node-mocks-http: Simuliert HTTP-Request/Response ohne echten Server
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/tournaments/index'

describe('GET /api/tournaments', () => {
  it('gibt Status 200 und ein Array zurück', async () => {
    // Mocks für req und res erstellen
    const { req, res } = createMocks({ method: 'GET' })

    await handler(req, res)  // API-Handler direkt aufrufen (kein HTTP-Overhead)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data)).toBe(true)
  })
})
```

**Konzept: `node-mocks-http`**
- Erlaubt das Testen von API-Handlern ohne laufenden Server
- `req._getBody()`, `res._getData()`, `res._getStatusCode()` – Inspection-Methoden
- Spart Zeit verglichen mit `supertest` + echtem Server

---

### Page-Level Integrationstests

**Datei:** `__tests__/pages/add-tournament.test.js`

```js
// fetch global mocken, damit kein echter API-Aufruf passiert
global.fetch = jest.fn()

it('sendet POST-Request mit korrektem Payload', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

  render(<AddTournamentPage />)
  // Formular ausfüllen...
  await userEvent.click(screen.getByRole('button', { name: /speichern/i }))

  expect(fetch).toHaveBeenCalledWith('/api/tournaments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: expect.stringContaining('"participants"'),
  })
})

it('zeigt Fehlermeldung bei 400-Response', async () => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => ({ error: 'Ungültige Daten' }),
  })

  render(<AddTournamentPage />)
  await userEvent.click(screen.getByRole('button', { name: /speichern/i }))

  expect(await screen.findByText(/Ungültige Daten/i)).toBeInTheDocument()
})
```

---

## 7. End-to-End-Tests mit Cypress

E2E-Tests testen die komplette Anwendung aus Sicht des Browsers – genau wie ein echter User.

### Voraussetzung

```bash
# App muss laufen, bevor Cypress startet
npm run dev
```

### Cypress starten

```bash
# Interaktiv (mit GUI)
npx cypress open

# Headless (für CI)
npx cypress run
```

---

### Homepage Test

**Datei:** `cypress/e2e/home.cy.js`

```js
describe('Homepage', () => {
  it('lädt erfolgreich und zeigt eine H1-Überschrift', () => {
    cy.visit('/')               // Navigiert zu baseUrl (localhost:3000)
    cy.get('h1').should('exist') // Prüft, dass ein h1-Element da ist
  })
})
```

**Cypress-Grundbefehle:**

| Befehl                          | Beschreibung                            |
|---------------------------------|-----------------------------------------|
| `cy.visit('/path')`             | Navigiert zu einer URL                  |
| `cy.get('selector')`            | Element per CSS-Selector suchen         |
| `cy.contains('text')`           | Element mit bestimmtem Text finden      |
| `cy.click()`                    | Element klicken                         |
| `cy.type('text')`               | Text eingeben                           |
| `cy.should('be.visible')`       | Assertion: Element sichtbar             |
| `cy.should('have.text', '...')` | Assertion: Text-Inhalt prüfen           |
| `cy.intercept()`                | HTTP-Requests abfangen/mocken           |

---

### Tournament E2E Test

**Datei:** `cypress/e2e/tournaments.cy.js`

```js
describe('Tournament Liste', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('zeigt die Turnierüberschrift', () => {
    cy.get('h2').should('be.visible')
  })

  it('zeigt den Monatsnamen Januar', () => {
    cy.contains('Januar').should('be.visible')
  })

  it('zeigt Teilnehmer mit korrekter Nummerierung', () => {
    cy.contains('1. Phil Ivey').should('be.visible')
  })

  it('zeigt die korrekte Teilnehmeranzahl', () => {
    cy.contains('10 Teilnehmer').should('be.visible')
  })
})
```

---

### Custom Commands

**Datei:** `cypress/support/commands.js`

Eigene Cypress-Befehle können hier registriert werden:

```js
// Beispiel: Login-Befehl für zukünftige Auth-Features
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-testid="email"]').type(email)
  cy.get('[data-testid="password"]').type(password)
  cy.get('[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Verwendung in Tests:
// cy.login('test@example.com', 'password123')
```

---

## 8. Robot Framework – Installation & Einrichtung

Robot Framework ist ein Python-basiertes, keyword-getriebenes Test-Framework.
Es eignet sich hervorragend für **Acceptance Tests** und **BDD-ähnliche** Testbeschreibungen.

### 8.1 Voraussetzungen

```bash
# Python prüfen (mind. 3.8 erforderlich)
python --version
# oder
python3 --version

# pip prüfen
pip --version
```

Falls Python nicht installiert ist: [python.org/downloads](https://www.python.org/downloads/)

---

### 8.2 Installation

```bash
# 1. Robot Framework selbst
pip install robotframework

# 2. Browser-Bibliothek (Playwright-basiert, moderne Alternative zu Selenium)
pip install robotframework-browser

# Browser-Bibliothek initialisieren (lädt Playwright-Browser herunter)
rfbrowser init

# 3. Requests-Bibliothek für API-Tests
pip install robotframework-requests

# 4. Optionale Utilities
pip install robotframework-jsonlibrary
pip install robotframework-seleniumlibrary  # Alternative zu Browser-Library
```

---

### 8.3 Verzeichnisstruktur anlegen

```bash
# Im Projektroot anlegen:
mkdir -p robot/tests
mkdir -p robot/resources
mkdir -p robot/results
```

```
robot/
├── tests/
│   ├── 01_smoke.robot          # Grundlegende Smoke-Tests
│   ├── 02_homepage.robot       # Homepage E2E-Tests
│   ├── 03_tournaments.robot    # Turnier-Funktionen
│   └── 04_api.robot            # API-Tests
├── resources/
│   ├── common.resource         # Gemeinsame Keywords
│   ├── variables.resource      # Zentrale Variablen
│   └── api_keywords.resource   # API-spezifische Keywords
└── results/                    # Testergebnisse (autogeneriert)
    ├── output.xml
    ├── log.html
    └── report.html
```

---

### 8.4 package.json Scripts erweitern

```json
{
  "scripts": {
    "test:robot": "robot --outputdir robot/results robot/tests/",
    "test:robot:smoke": "robot --outputdir robot/results --include smoke robot/tests/",
    "test:robot:e2e": "robot --outputdir robot/results --include e2e robot/tests/",
    "test:all": "npm test && npx cypress run && npm run test:robot"
  }
}
```

---

### 8.5 VS Code Extension (optional, empfohlen)

Extension: **Robot Framework Language Server** (`robocorp.robotframework-lsp`)

- Syntax-Highlighting
- Code-Completion für Keywords
- Inline-Dokumentation

---

## 9. Robot Framework – Tests schreiben & erklären

### 9.1 Grundstruktur einer .robot-Datei

```robot
*** Settings ***
# Hier werden Libraries, Resource-Dateien und Setup/Teardown definiert
Library     Browser          # Playwright-basierte Browser-Bibliothek
Library     RequestsLibrary  # Für HTTP/API-Tests
Resource    ../resources/common.resource

Suite Setup     Open Browser To App    # Läuft einmal vor der gesamten Test-Suite
Suite Teardown  Close Browser          # Läuft einmal nach der gesamten Test-Suite


*** Variables ***
# Zentrale Konfigurationswerte – können per CLI überschrieben werden
${BASE_URL}         http://localhost:3000
${API_URL}          http://localhost:3000/api
${BROWSER}          chromium
${TOURNAMENT_DATE}  2024-03-15


*** Test Cases ***
# Jeder Block hier ist ein Test-Case
# Format: Name (Zeile 1), dann eingerückte Keyword-Aufrufe
Poker Manager öffnet erfolgreich
    [Documentation]    Prüft, dass die Startseite lädt und einen Titel zeigt
    [Tags]    smoke    homepage
    Navigate To    ${BASE_URL}
    Get Title      ==    Poker Manager

Turnier kann angelegt werden
    [Documentation]    Kompletter Workflow: Formular ausfüllen, speichern, Ergebnis prüfen
    [Tags]    e2e    tournament    create
    Navigate To    ${BASE_URL}/tournaments/add
    Fill Form And Submit
    Verify Tournament In List


*** Keywords ***
# Wiederverwendbare Aktionen – wie Funktionen in Programmiersprachen
Fill Form And Submit
    [Documentation]    Füllt das Turnierformular aus und sendet es ab
    Fill Text    [data-testid=date-input]    ${TOURNAMENT_DATE}
    Fill Text    [data-testid=month-input]    März
    Click    [data-testid=add-participant-btn]
    Fill Text    [data-testid=participant-0]    Phil Ivey
    Click    [data-testid=submit-btn]

Verify Tournament In List
    [Documentation]    Prüft, dass das neu erstellte Turnier in der Liste erscheint
    Navigate To    ${BASE_URL}
    Get Text    h2    contains    März
```

---

### 9.2 Smoke Test

**Datei:** `robot/tests/01_smoke.robot`

```robot
*** Settings ***
Library     Browser

*** Variables ***
${BASE_URL}    http://localhost:3000

*** Test Cases ***
App ist erreichbar
    [Documentation]    Prüft die Grundfunktionsfähigkeit: App lädt und gibt HTTP 200 zurück
    [Tags]    smoke
    New Browser    headless=True    browser=chromium
    New Page    ${BASE_URL}
    Get Title    validate    len(value) > 0

Framework funktioniert
    [Documentation]    Sanity-Check: Robot Framework + Browser-Library sind korrekt installiert
    [Tags]    smoke
    Log    Robot Framework läuft korrekt    console=True

*** Keywords ***
# Leerer Keywords-Abschnitt – zeigt, dass die Sektion optional ist
```

---

### 9.3 Homepage Tests

**Datei:** `robot/tests/02_homepage.robot`

```robot
*** Settings ***
Library     Browser
Resource    ../resources/common.resource

Suite Setup     Open Browser To App
Suite Teardown  Close Browser

*** Variables ***
${EXPECTED_HEADING}    Turniere

*** Test Cases ***
Homepage zeigt Hauptüberschrift
    [Tags]    e2e    homepage
    Navigate To    ${BASE_URL}
    Get Element    h1
    # Alternativ mit Text-Prüfung:
    # Get Text    h1    contains    ${EXPECTED_HEADING}

Navigation-Button NEU ist sichtbar
    [Tags]    e2e    homepage    navigation
    Navigate To    ${BASE_URL}
    Get Element    text=NEU
    # Prüft, dass der Button für neue Turniere in der Navbar sichtbar ist

Leerer Zustand zeigt Willkommensnachricht
    [Tags]    e2e    homepage    empty-state
    # Nur wenn keine Turniere in der DB sind
    Navigate To    ${BASE_URL}
    ${status}=    Run Keyword And Return Status
    ...    Get Element    text=Keine Turniere gefunden
    IF    ${status}
        Log    Leerer Zustand korrekt angezeigt    console=True
    END
```

---

### 9.4 Turnier-Tests

**Datei:** `robot/tests/03_tournaments.robot`

```robot
*** Settings ***
Library     Browser
Library     DateTime
Resource    ../resources/common.resource
Resource    ../resources/api_keywords.resource

Suite Setup     Suite Vorbereitung
Suite Teardown  Suite Aufräumen

*** Variables ***
${TOURNAMENT_DATE}    2024-03-15
${TOURNAMENT_MONTH}   März

*** Test Cases ***
Turnier-Formular ist erreichbar
    [Documentation]    Prüft, dass das Formular unter /tournaments/add geöffnet werden kann
    [Tags]    e2e    tournament    smoke
    Navigate To    ${BASE_URL}/tournaments/add
    Get Element    form
    Get Element    [data-testid=submit-btn]

Neues Turnier anlegen
    [Documentation]    Vollständiger Happy-Path: Turnier anlegen und in Liste prüfen
    [Tags]    e2e    tournament    create
    Navigate To    ${BASE_URL}/tournaments/add
    Turnier Formular Ausfüllen    ${TOURNAMENT_DATE}    ${TOURNAMENT_MONTH}
    Formular Absenden
    # Nach Redirect auf Homepage prüfen
    Get Current URL    contains    /
    Get Text    body    contains    ${TOURNAMENT_MONTH}

Turnier erscheint mit korrekten Punkten
    [Documentation]    Prüft, dass die Punkte korrekt nach F1-System berechnet werden
    [Tags]    e2e    tournament    points
    # Erwartete Punkte: 25 (Rang 1) + 3 (3 Teilnehmer) + 5 (Anwesenheit) = 33
    Navigate To    ${BASE_URL}
    Get Text    body    contains    33 Pts

Turniervalidierung bei fehlendem Datum
    [Documentation]    Prüft, dass das Formular Fehler anzeigt wenn Datum fehlt
    [Tags]    e2e    tournament    validation
    Navigate To    ${BASE_URL}/tournaments/add
    Click    [data-testid=submit-btn]
    # HTML5-Validierung oder custom Error-Message prüfen
    ${error}=    Run Keyword And Return Status
    ...    Get Element    text=erforderlich
    Should Be True    ${error}    Fehlermeldung sollte erscheinen

*** Keywords ***
Turnier Formular Ausfüllen
    [Arguments]    ${datum}    ${monat}
    [Documentation]    Keyword: Füllt alle Pflichtfelder des Turnier-Formulars aus
    Fill Text    [data-testid=date-input]    ${datum}
    Fill Text    [data-testid=month-input]  ${monat}
    # Teilnehmer hinzufügen
    Click    [data-testid=add-participant-btn]
    Fill Text    [data-testid=participant-0]    Phil Ivey
    Click    [data-testid=add-participant-btn]
    Fill Text    [data-testid=participant-1]    Daniel Negreanu
    Click    [data-testid=add-participant-btn]
    Fill Text    [data-testid=participant-2]    Doyle Brunson

Formular Absenden
    [Documentation]    Klickt den Submit-Button und wartet auf Navigation
    Click    [data-testid=submit-btn]
    Wait For Navigation

Suite Vorbereitung
    [Documentation]    Einmaliger Setup: Browser öffnen und zur App navigieren
    Open Browser To App

Suite Aufräumen
    [Documentation]    Einmaliger Teardown: Testdaten löschen und Browser schließen
    # Hier könnten Testdaten via API gelöscht werden
    Close Browser
```

---

### 9.5 API-Tests

**Datei:** `robot/tests/04_api.robot`

```robot
*** Settings ***
Library     RequestsLibrary
Library     Collections

Suite Setup     API Session Erstellen
Suite Teardown  Delete All Sessions

*** Variables ***
${API_URL}    http://localhost:3000/api
${HEADERS}    &{headers}    Content-Type=application/json

*** Test Cases ***
GET /api/tournaments gibt 200 zurück
    [Documentation]    Prüft den API-Endpunkt für die Turnierlisté
    [Tags]    api    smoke
    ${response}=    GET On Session    poker_api    /tournaments
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be True    isinstance($json, list)    Antwort muss eine Liste sein

POST /api/tournaments legt Turnier an
    [Documentation]    Prüft das Anlegen eines Turniers via API (ohne Browser)
    [Tags]    api    tournament    create
    ${payload}=    Create Dictionary
    ...    date=2024-06-15
    ...    month=Juni
    ...    participants=${["Phil Ivey", "Daniel Negreanu"]}
    ${response}=    POST On Session    poker_api    /tournaments
    ...    json=${payload}
    ...    headers=&{HEADERS}
    Should Be Equal As Integers    ${response.status_code}    201
    ${json}=    Set Variable    ${response.json()}
    Should Not Be Empty    ${json}[_id]

POST /api/tournaments schlägt fehl ohne Datum
    [Documentation]    Negativtest: Pflichtfeld-Validierung des API
    [Tags]    api    tournament    validation
    ${payload}=    Create Dictionary
    ...    month=Juni
    ...    participants=${["Phil Ivey"]}
    ${response}=    POST On Session    poker_api    /tournaments
    ...    json=${payload}
    ...    headers=&{HEADERS}
    ...    expected_status=any
    Should Be Equal As Integers    ${response.status_code}    400

*** Keywords ***
API Session Erstellen
    [Documentation]    Erstellt eine wiederverwendbare HTTP-Session für alle API-Tests
    Create Session    poker_api    ${API_URL}    verify=False
```

---

### 9.6 Resource-Dateien

**Datei:** `robot/resources/common.resource`

```robot
*** Settings ***
Library     Browser

*** Variables ***
${BASE_URL}    http://localhost:3000
${BROWSER}     chromium
${HEADLESS}    True

*** Keywords ***
Open Browser To App
    [Documentation]    Öffnet den Browser und navigiert zur App-Startseite
    New Browser    browser=${BROWSER}    headless=${HEADLESS}
    New Context    viewport={'width': 1280, 'height': 720}
    New Page    ${BASE_URL}

Close Browser
    [Documentation]    Schließt alle offenen Browser-Instanzen
    Close All Browsers

Navigate To
    [Arguments]    ${url}
    [Documentation]    Navigiert zu einer URL und wartet auf Seitenladung
    Go To    ${url}
    Wait For Load State    networkidle

Take Screenshot On Failure
    [Documentation]    Wird automatisch bei Test-Fehler aufgerufen (via Listener)
    Take Screenshot    full_page=True
```

---

### 9.7 Robot Framework Befehle

```bash
# Alle Tests ausführen
robot --outputdir robot/results robot/tests/

# Nur Tests mit Tag "smoke"
robot --outputdir robot/results --include smoke robot/tests/

# Nur Tests mit Tag "api"
robot --outputdir robot/results --include api robot/tests/

# Einen bestimmten Test nach Name ausführen
robot --outputdir robot/results --test "GET /api/tournaments gibt 200 zurück" robot/tests/

# Eine bestimmte Datei ausführen
robot --outputdir robot/results robot/tests/01_smoke.robot

# Mit detailliertem Output
robot --outputdir robot/results --loglevel DEBUG robot/tests/

# Parallelausführung (benötigt: pip install robotframework-pabot)
pabot --outputdir robot/results --processes 4 robot/tests/

# Report nach Ausführung öffnen (Windows)
start robot/results/report.html
# macOS/Linux:
open robot/results/report.html
```

---

### 9.8 Robot Framework Konzepte erklärt

#### Keyword-Driven Testing

Robot Framework basiert auf **Keywords** – wiederverwendbare, benannte Aktionsblöcke:

```
Keyword-Ebenen:
├── Low-Level Keywords (Library)    → z.B. Click, Fill Text, Get Element
├── Mid-Level Keywords (Resource)   → z.B. "Turnier Formular Ausfüllen"
└── High-Level Keywords (Test)      → z.B. "Neues Turnier anlegen"
```

#### Tags

```robot
[Tags]    smoke    e2e    regression
```

Tags ermöglichen das selektive Ausführen von Tests:
- `smoke` – schnelle Grundtests
- `e2e` – vollständige End-to-End-Tests
- `regression` – Tests nach Änderungen
- `wip` – Work in Progress (normalerweise von CI ausgeschlossen)

#### Variables

```robot
# Skalare
${NAME}           Phil Ivey

# Listen
@{PARTICIPANTS}   Phil Ivey    Daniel Negreanu    Doyle Brunson

# Dictionaries
&{TOURNAMENT}     date=2024-01    month=Januar
```

#### Setup & Teardown

```robot
Suite Setup     Open Browser To App   # 1x vor allen Tests der Datei
Suite Teardown  Close Browser         # 1x nach allen Tests der Datei
Test Setup      Navigate To Homepage  # Vor jedem einzelnen Test
Test Teardown   Clear Test Data       # Nach jedem einzelnen Test
```

---

## 10. Testausführung – Alle Befehle im Überblick

```bash
# ─── Jest Unit/Integration/Komponenten-Tests ───────────────────────────────
npm test                          # Alle Jest-Tests einmalig ausführen
npm test -- --watch               # Watch-Mode (bei Dateiänderung neu ausführen)
npm test -- --coverage            # Mit Coverage-Report
npm test -- --testPathPattern=api # Nur Tests in "api"-Verzeichnis
npm test -- --verbose             # Detaillierter Output

# ─── Cypress E2E-Tests ─────────────────────────────────────────────────────
npx cypress open                  # GUI öffnen (interaktiv)
npx cypress run                   # Headless (für CI)
npx cypress run --spec "cypress/e2e/home.cy.js"   # Einzelne Datei

# ─── Robot Framework ───────────────────────────────────────────────────────
robot --outputdir robot/results robot/tests/
robot --outputdir robot/results --include smoke robot/tests/
robot --outputdir robot/results --include e2e robot/tests/
robot --outputdir robot/results --include api robot/tests/

# ─── Alle Tests (CI-Pipeline) ──────────────────────────────────────────────
npm test && npx cypress run && robot --outputdir robot/results robot/tests/
```

---

## 11. Mocking-Strategien

### Jest Mocks

```js
// 1. Modul mocken
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), pathname: '/' }),
}))

// 2. Funktion mocken
const mockFn = jest.fn()
mockFn.mockReturnValue('test')
mockFn.mockResolvedValue({ data: [] })  // Async

// 3. Globales Objekt mocken
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ tournaments: [] }),
})

// 4. Nach Tests aufräumen
afterEach(() => {
  jest.clearAllMocks()
})
```

### Cypress Intercept (API-Mocking)

```js
// HTTP-Request abfangen und eigene Antwort zurückgeben
cy.intercept('GET', '/api/tournaments', { fixture: 'tournaments.json' }).as('getTournaments')
cy.visit('/')
cy.wait('@getTournaments')  // Warten, bis der Request abgefangen wurde
```

### Robot Framework Mocking

```robot
# API-Response mit Mock-Daten überschreiben
${mock_response}=    Create Dictionary    tournaments=${[]}
${response}=    Mock HTTP GET    /api/tournaments    ${mock_response}
```

---

## 12. Best Practices & Patterns

### Allgemein

- **AAA-Pattern:** Arrange → Act → Assert (Setup → Aktion → Prüfung)
- **Eines testen pro Test:** Jeder Test hat nur eine Verantwortlichkeit
- **Aussagekräftige Namen:** Testname erklärt was und warum, nicht wie
- **Unabhängige Tests:** Tests dürfen nicht voneinander abhängen
- **Test-Daten isolieren:** Produktionsdatenbank nie für Tests nutzen

### React Testing Library

- Query-Priorität: `ByRole` > `ByLabelText` > `ByText` > `ByTestId`
- Keine Implementation Details testen (keine internen States, keine Klassenprüfungen)
- `findBy*` für async, `queryBy*` für "sollte nicht da sein"

### Cypress

- `data-testid`-Attribute für stabile Selektoren nutzen (nicht CSS-Klassen)
- `cy.intercept()` für API-Abhängigkeiten nutzen
- Keine Timeouts – stattdessen auf Elemente warten

### Robot Framework

- Keywords beschreiben BUSINESS-LOGIK, nicht technische Schritte
- Resource-Dateien für geteilte Keywords und Variablen nutzen
- Tags konsequent nutzen (`smoke`, `regression`, `wip`)
- `Suite Setup`/`Suite Teardown` für Browser-Lifecycle
- Screenshots bei Fehlern aktivieren

---

## Weiterführende Ressourcen

- [Jest Dokumentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)
- [Robot Framework User Guide](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html)
- [Browser Library für Robot Framework](https://marketsquare.github.io/robotframework-browser/Browser.html)
- [RequestsLibrary für Robot Framework](https://marketsquare.github.io/robotframework-requests/doc/RequestsLibrary.html)
