*** Settings ***
Library     Browser
Resource    ../resources/common.resource

Suite Setup     Open App
Suite Teardown  Close App


*** Test Cases ***
Login-Button ist sichtbar wenn ausgeloggt
    [Documentation]    Prüft dass der Login-Button in der Navbar sichtbar ist
    [Tags]    auth    smoke
    Navigate To Page    /
    Get Element    text=Login
    Wait For Elements State    text=Login    visible

NEU-Button ist nicht sichtbar wenn ausgeloggt
    [Documentation]    Prüft dass der NEU-Button ohne Admin-Login nicht existiert
    [Tags]    auth
    Navigate To Page    /
    # "Assert No Element" prüft dass das Element nicht im DOM vorhanden ist
    Get Element Count    text=NEU    ==    0

Logout-Button ist nicht sichtbar wenn ausgeloggt
    [Documentation]    Prüft dass kein Logout-Button ohne aktive Session erscheint
    [Tags]    auth
    Navigate To Page    /
    Get Element Count    text=Logout    ==    0
