*** Settings ***
Library     Browser
Resource    variables.resource


*** Keywords ***
Open App
    [Documentation]    Öffnet den Browser und navigiert zur Startseite
    New Browser    browser=${BROWSER}    headless=${HEADLESS}
    New Context    viewport={'width': 1280, 'height': 720}
    New Page    ${BASE_URL}

Close App
    [Documentation]    Schließt alle offenen Browser-Instanzen
    Close Browser

Navigate To Page
    [Arguments]    ${path}
    [Documentation]    Navigiert zu einem bestimmten Pfad der App
    Go To    ${BASE_URL}${path}
    Wait For Load State    networkidle
