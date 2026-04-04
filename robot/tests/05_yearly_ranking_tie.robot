*** Settings ***
Library     Browser
Library     RequestsLibrary
Library     Collections
Resource    ../resources/common.resource

# Suite Setup legt die Testdaten per API an und öffnet den Browser.
# Suite Teardown löscht die Testdaten wieder und schließt den Browser.
# Dadurch bleibt die Test-DB nach dem Testlauf sauber.
Suite Setup     Testdaten Anlegen Und Browser Öffnen
Suite Teardown  Testdaten Löschen Und Browser Schließen


*** Variables ***
${API_URL}          http://localhost:3000/api
# IDs der angelegten Turniere – werden im Setup befüllt und im Teardown genutzt
${TURNIER_NOV_ID}   ${EMPTY}
${TURNIER_DEZ_ID}   ${EMPTY}


*** Test Cases ***
Gleichstand in der Jahrestabelle zeigt geteilte Plätze
    [Documentation]    Prüft das Gleichstandsverhalten in der Jahrestabelle.
    ...
    ...                Ausgangslage: Zwei Turniere mit je 3 Testteilnehmern in
    ...                umgekehrter Reihenfolge (Tester1/Tester2/Tester3 und Tester3/Tester2/Tester1).
    ...                Punkte nach F1-Formel + TN-Anzahl + Anwesenheitsbonus:
    ...                  Tester1: (25+3+5) + (15+3+5) = 56 Punkte
    ...                  Tester3: (15+3+5) + (25+3+5) = 56 Punkte → Gleichstand!
    ...                  Tester2: (18+3+5) + (18+3+5) = 52 Punkte
    ...
    ...                Erwartetes Ergebnis in der Jahrestabelle:
    ...                  Platz 1: Tester1 (56 Pkt.)
    ...                  Platz 1: Tester3 (56 Pkt.)  ← geteilter Platz
    ...                  Platz 3: Tester2 (52 Pkt.)  ← Platz 2 wird übersprungen
    [Tags]    yearly-ranking    tie
    Navigate To Page    /

    # Platz 1 muss zweimal vorkommen – einmal für Tester1, einmal für Tester3
    ${platz1_count}=    Get Element Count    css=table >> text=1.
    Should Be True    ${platz1_count} >= 2

    # Platz 2 darf in der Tabelle nicht vorkommen
    # "2." könnte theoretisch in anderen Kontexten erscheinen, daher
    # gezielt in Tabellenzellen gesucht
    ${platz2_count}=    Get Element Count    css=table td >> text=2.
    Should Be Equal As Integers    ${platz2_count}    0

    # Platz 3 muss genau einmal vorkommen (Tester2)
    ${platz3_count}=    Get Element Count    css=table >> text=3.
    Should Be True    ${platz3_count} >= 1


*** Keywords ***
Testdaten Anlegen Und Browser Öffnen
    [Documentation]    Erstellt zwei Turniere per API-POST und speichert die zurückgegebenen IDs
    ...                als Suite-Variablen für den späteren Teardown.
    Create Session    poker_api    ${API_URL}    verify=False

    # Turnier November: Tester1 gewinnt
    ${nov_body}=    Create Dictionary
    ...    date=2026-11-28
    ...    month=November
    ...    participants=@{TN_REIHENFOLGE_1}
    ${nov_resp}=    POST On Session    poker_api    /tournaments
    ...    json=${nov_body}
    ...    expected_status=201
    ${nov_id}=    Set Variable    ${nov_resp.json()['data']['_id']}
    Set Suite Variable    ${TURNIER_NOV_ID}    ${nov_id}

    # Turnier Dezember: Tester3 gewinnt (umgekehrte Reihenfolge)
    ${dez_body}=    Create Dictionary
    ...    date=2026-12-19
    ...    month=Dezember
    ...    participants=@{TN_REIHENFOLGE_2}
    ${dez_resp}=    POST On Session    poker_api    /tournaments
    ...    json=${dez_body}
    ...    expected_status=201
    ${dez_id}=    Set Variable    ${dez_resp.json()['data']['_id']}
    Set Suite Variable    ${TURNIER_DEZ_ID}    ${dez_id}

    Open App

Testdaten Löschen Und Browser Schließen
    [Documentation]    Löscht die im Setup angelegten Turniere per API-DELETE.
    ...                Die Test-DB bleibt dadurch im selben Zustand wie vor dem Testlauf.
    DELETE On Session    poker_api    /tournaments/${TURNIER_NOV_ID}    expected_status=200
    DELETE On Session    poker_api    /tournaments/${TURNIER_DEZ_ID}    expected_status=200
    Delete All Sessions
    Close App


*** Variables ***
# Teilnehmerlisten als Robot Framework Listen-Variablen
@{TN_REIHENFOLGE_1}    Tester1    Tester2    Tester3
@{TN_REIHENFOLGE_2}    Tester3    Tester2    Tester1
