*** Settings ***
Library     Browser
Resource    ../resources/common.resource

Suite Setup     Open App
Suite Teardown  Close App


*** Test Cases ***
Login-Button ist sichtbar wenn kein Nutzer eingeloggt ist
    [Documentation]    Ruft die Startseite ohne aktive Session auf und prüft ob
    ...                der Login-Button in der Navigationsleiste sichtbar ist.
    [Tags]    auth    smoke
    Navigate To Page    /
    Get Element    text=Login
    Wait For Elements State    text=Login    visible

NEU-Button fehlt im DOM wenn kein Nutzer eingeloggt ist
    [Documentation]    Prüft dass der Button zum Anlegen neuer Turniere ohne
    ...                Admin-Session nicht im DOM vorhanden ist.
    ...                Get Element Count mit == 0 schlägt fehl sobald das Element existiert.
    [Tags]    auth
    Navigate To Page    /
    Get Element Count    text=NEU    ==    0

Logout-Button fehlt im DOM wenn kein Nutzer eingeloggt ist
    [Documentation]    Prüft dass kein Logout-Button ohne aktive Session erscheint.
    [Tags]    auth
    Navigate To Page    /
    Get Element Count    text=Logout    ==    0
