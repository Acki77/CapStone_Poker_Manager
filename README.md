# Project Setup: Poker Session Manager

## Tech Stack und Tools

- **Framework:** Next.js (Page Router)
- **Styling:** Styled Components
- **Database:** MongoDB und Mongoose
- **Data Fetching:** SWR
- **Testing:** Jest, Cypress und Robot Framework
- **Deployment:** Vercel
- **Project Management:** GitHub Projects (Kanban)

## Installation und Initiale Schritte

### 1. Repository und Next.js

- Repository auf GitHub initialisiert.
- Next.js installiert mit:  
  _npx create-next-app@latest ._
- Wichtige Einstellungen:
  - JavaScript
  - ESLint
  - kein Tailwind
  - kein App Router

### 2. Styling Setup

- Styled Components installieren:  
  _npm install styled-components_
- Datei `pages/_document.js` erstellen (für SSR Support).
- GlobalStyles anlegen in:  
  `components/GlobalStyle.js`

### 3. Testing Environment

- Cypress installieren:  
  _npm install cypress --save-dev_
- Robot Framework (Python):  
  _pip install robotframework robotframework-browser_
- Browser Library initialisieren:  
  _rfbrowser init_

### 4. Datenbank und Deployment

- MongoDB Atlas Cluster einrichten.
- Environment Variables:
  - `MONGODB_URI` in `.env.local` hinterlegen.

## MVP Fokus und Workflow

- **Spieler-Verwaltung:** CRUD-Operationen für alle Poker-Teilnehmer.
- **Session-Tracking:** Aufzeichnung von Zeitstempel, Teilnehmern und Beträgen.
- **Statistik-Modul:** Automatische Berechnung von Profit und Verlust.

_Hinweis: Der Blind-Timer wurde aus dem MVP entfernt._

## Testing Strategie

- **Unit (Jest):** Validierung der mathematischen Logik.
- **E2E (Cypress):** Prüfung der technischen Browser-Abläufe.
- **Acceptance (Robot):** Fachliche Abnahme der User Stories.
