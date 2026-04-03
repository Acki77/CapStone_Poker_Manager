*** Settings ***
# Browser-Library: Playwright-basiert, moderner Ersatz für Selenium.
# Alle Keywords wie "Get Select Options", "Select Options By" kommen von hier.
Library     Browser
Resource    ../resources/common.resource

# Suite Setup/Teardown läuft je einmal vor/nach ALLEN Tests dieser Datei.
# So wird der Browser nicht für jeden einzelnen Test neu gestartet – spart Zeit.
Suite Setup     Open App
Suite Teardown  Close App


*** Variables ***
# Zentrale URL-Konstante aus common.resource (http://localhost:3000)
# Hier überschreiben wir nichts – BASE_URL kommt aus variables.resource


*** Test Cases ***
Monat-Dropdown enthält alle zwölf deutschen Monate
    [Documentation]    Prüft dass das Select-Element alle 12 Monate als Optionen hat.
    ...                Dieser Test ist unabhängig von DB-Daten – er prüft nur die UI.
    [Tags]    form    dropdown    smoke

    # Direkt zur Add-Seite navigieren (kein Login nötig für diesen Check,
    # solange die Seite ohne Auth erreichbar ist)
    Navigate To Page    /tournaments/add

    # Get Select Options gibt ein Dictionary mit allen <option>-Elementen zurück.
    # Wir holen den "value"-Key als Liste und prüfen einzelne Einträge.
    ${options}=    Get Select Options    select#month

    # Jede Option ist ein Dictionary: {label: "Januar", value: "Januar", ...}
    # Wir bauen daraus eine Liste aller value-Strings
    ${values}=    Evaluate    [o['value'] for o in $options]

    # Stichprobenartig prüfen: erster, mittlerer und letzter Monat
    Should Contain    ${values}    Januar
    Should Contain    ${values}    Juni
    Should Contain    ${values}    Dezember

    # Gesamtanzahl: 12 Monate + 1 Platzhalter-Option ("– Monat wählen –")
    Length Should Be    ${values}    13


Datum-Eingabe wählt Monat automatisch vor
    [Documentation]    Gibt ein Datum ein und prüft ob der Monat automatisch
    ...                im Dropdown vorausgewählt wird (handleDateChange-Logik).
    ...
    ...                Warum Robot Framework hier wertvoll ist:
    ...                RF testet im echten Playwright-Browser mit echten DOM-Events.
    ...                Das ist näher an der Realität als Jest/jsdom-Simulation.
    [Tags]    form    dropdown    auto-detect

    Navigate To Page    /tournaments/add

    # Sicherstellen dass noch kein Monat gewählt ist (Platzhalter aktiv)
    ${initial}=    Get Selected Options    select#month
    Should Be Empty    ${initial}

    # Datum eingeben: 20. Mai 2026 → getMonth() = 4 → MONTHS[4] = "Mai"
    # Fill Text ersetzt den Inhalt des Feldes komplett (kein Tippen nötig)
    Fill Text    input#date    2026-05-20

    # Kurz warten bis React den State aktualisiert hat
    Sleep    0.3s

    # Jetzt muss "Mai" im Dropdown ausgewählt sein
    ${selected}=    Get Selected Options    select#month
    Should Not Be Empty    ${selected}
    Should Be Equal    ${selected}[0][value]    Mai


*** Keywords ***
# Keine eigenen Keywords nötig – Navigate To Page kommt aus common.resource
