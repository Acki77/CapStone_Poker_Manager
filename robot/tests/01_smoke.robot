*** Settings ***
Library     Browser
Resource    ../resources/common.resource

Suite Setup     Open App
Suite Teardown  Close App


*** Test Cases ***
App ist erreichbar
    [Documentation]    Prüft ob die Startseite lädt und einen Titel hat
    [Tags]    smoke
    Get Element    body
    Get Title    ==    After Work - Poker Manager
