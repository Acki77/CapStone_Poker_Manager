*** Settings ***
Library     Browser
Resource    ../resources/common.resource

# Suite Setup und Teardown laufen je einmal vor bzw. nach allen Tests dieser Datei.
# Der Browser wird dadurch nicht für jeden einzelnen Test neu gestartet.
Suite Setup     Open App
Suite Teardown  Close App


*** Test Cases ***
Anwendung ist über den Browser erreichbar
    [Documentation]    Ruft die Startseite auf und prüft ob der Browser-Titel gesetzt ist.
    ...                Schlägt dieser Test fehl, ist die Anwendung nicht erreichbar
    ...                oder der Server läuft nicht.
    [Tags]    smoke
    Get Element    body
    Get Title    ==    After Work - Poker Manager
