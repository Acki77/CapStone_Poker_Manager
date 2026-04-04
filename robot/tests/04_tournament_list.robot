*** Settings ***
Library     Browser
Resource    ../resources/common.resource

Suite Setup     Open App
Suite Teardown  Close App


*** Test Cases ***
Turnierkarte zeigt den Monatsnamen an
    [Documentation]    Prüft ob mindestens eine Turnierkarte mit einem h2-Monatsnamen
    ...                gerendert wird. css=article h2 schränkt die Suche auf Elemente
    ...                innerhalb von <article>-Tags ein und vermeidet den h2 der
    ...                Jahrestabelle (strict mode würde sonst mehrere Treffer melden).
    [Tags]    tournament-list    smoke
    Navigate To Page    /
    ${count}=    Get Element Count    css=article h2
    Should Be True    ${count} >= 1

Turnierkarte zeigt das Datum im deutschen Format an
    [Documentation]    Prüft ob ein Datum im Format TT.MM.JJJJ sichtbar ist.
    ...                Das Format wird in TournamentCard per toLocaleDateString('de-DE') erzeugt.
    ...                In Robot Framework muss \d als \\d geschrieben werden, da \ ein
    ...                Steuerzeichen ist und sonst als einfaches 'd' interpretiert wird.
    [Tags]    tournament-list    date-format
    Navigate To Page    /
    ${count}=    Get Element Count    css=article >> text=/\\d{2}\\.\\d{2}\\.\\d{4}/
    Should Be True    ${count} >= 1

Turnierkarte zeigt die Teilnehmeranzahl an
    [Documentation]    Prüft ob die Teilnehmeranzahl im Format "👥 X Spieler" sichtbar ist.
    ...                Das Element befindet sich im Header jeder TournamentCard.
    [Tags]    tournament-list
    Navigate To Page    /
    ${count}=    Get Element Count    text=/👥 \\d+ Spieler/
    Should Be True    ${count} >= 1

Erster Platz in der Turnierkarte trägt die Nummer 1
    [Documentation]    Prüft ob innerhalb einer Turnierkarte ein Element mit dem Text "1."
    ...                vorhanden ist. css=article span grenzt die Suche auf <span>-Elemente
    ...                innerhalb von <article>-Tags ein – der Platz-1-Badge der Jahrestabelle
    ...                liegt außerhalb und wird dadurch ausgeschlossen.
    [Tags]    tournament-list
    Navigate To Page    /
    ${count}=    Get Element Count    css=article span >> text=1.
    Should Be True    ${count} >= 1

Punkteanzeige ist in der Turnierkarte vorhanden
    [Documentation]    Prüft ob für mindestens einen Teilnehmer eine Punktzahl im Format
    ...                "(X Pkt.)" angezeigt wird. Die Klammern sind Teil des Formats und
    ...                müssen im Regex escaped werden (\\( und \\)).
    [Tags]    tournament-list    points
    Navigate To Page    /
    ${count}=    Get Element Count    text=/\\(\\d+ Pkt\\.\\)/
    Should Be True    ${count} >= 1
