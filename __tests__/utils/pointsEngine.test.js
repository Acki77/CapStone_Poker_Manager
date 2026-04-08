import { getProcessedRanking } from "@/utils/pointsEngine";

// Hilfsfunktion: Erzeugt ein minimales Turnier-Objekt mit beliebigen Teilnehmern.
// Datum und Monat sind für die Punkteberechnung irrelevant – nur participants zählt.
function makeTournament(participants) {
  return { date: "2026-01-01", month: "Januar", participants };
}

describe("getProcessedRanking – Gleichstandsregel", () => {

  test("Spieler mit gleicher Punktzahl erhalten denselben displayRank", () => {
    // Arrange: Zwei Turniere mit umgekehrter Reihenfolge.
    // Tester1 gewinnt T1, verliert T2 → gleiche Gesamtpunkte wie Tester3.
    // Tester2 landet in beiden Turnieren auf Platz 2 → ebenfalls gleiche Gesamtpunkte.
    const tournaments = [
      makeTournament(["Tester1", "Tester2", "Tester3"]),
      makeTournament(["Tester3", "Tester2", "Tester1"]),
    ];

    // Act
    const ranking = getProcessedRanking(tournaments);

    const tester1 = ranking.find((p) => p.name === "Tester1");
    const tester3 = ranking.find((p) => p.name === "Tester3");

    // Assert: Tester1 und Tester3 haben exakt dieselbe Punktzahl und denselben Platz
    expect(tester1.points).toBe(tester3.points);
    expect(tester1.displayRank).toBe(tester3.displayRank);
  });

  test("Nach geteiltem Platz 1 wird Platz 2 übersprungen – nächster Platz ist 3", () => {
    // Arrange: Gleiche Konstellation wie oben.
    // Tester1 und Tester3 teilen Platz 1 → Tester2 muss Platz 3 bekommen.
    const tournaments = [
      makeTournament(["Tester1", "Tester2", "Tester3"]),
      makeTournament(["Tester3", "Tester2", "Tester1"]),
    ];

    // Act
    const ranking = getProcessedRanking(tournaments);

    const tester2 = ranking.find((p) => p.name === "Tester2");

    // Assert: Platz 2 existiert nicht – Tester2 ist auf Platz 3
    expect(tester2.displayRank).toBe(3);
    const niemandAufPlatz2 = ranking.every((p) => p.displayRank !== 2);
    expect(niemandAufPlatz2).toBe(true);
  });

  test("Ohne Gleichstand werden Plätze fortlaufend vergeben", () => {
    // Arrange: Eindeutige Platzierungen – kein Spieler hat gleiche Gesamtpunkte.
    // Ein einzelnes Turnier mit 3 verschiedenen Teilnehmern reicht dafür aus.
    const tournaments = [
      makeTournament(["Spieler A", "Spieler B", "Spieler C"]),
    ];

    // Act
    const ranking = getProcessedRanking(tournaments);

    // Assert: Plätze 1, 2, 3 – keine Lücken, kein Gleichstand
    expect(ranking[0].displayRank).toBe(1);
    expect(ranking[1].displayRank).toBe(2);
    expect(ranking[2].displayRank).toBe(3);
  });
});

describe("getProcessedRanking – Jahresanteil (yearlyPercentage)", () => {
  test("Platz 1 erhält 25 % ohne Gleichstand", () => {
    // Einzelnes Turnier: eindeutige Platzierungen, kein Teilen nötig.
    // Platz 1 belegt Position 0 in der Prozent-Tabelle → 25 %.
    const ranking = getProcessedRanking([
      makeTournament(["Spieler A", "Spieler B", "Spieler C"]),
    ]);
    expect(ranking[0].yearlyPercentage).toBe(25);
  });

  test("Platz 2 erhält 20 % ohne Gleichstand", () => {
    const ranking = getProcessedRanking([
      makeTournament(["Spieler A", "Spieler B", "Spieler C"]),
    ]);
    expect(ranking[1].yearlyPercentage).toBe(20);
  });

  test("Bei Gleichstand auf Platz 1 werden 25 % und 20 % gemittelt → 22,5 %", () => {
    // Tester1 und Tester3 teilen Platz 1 (Positionen 0 und 1).
    // Summe: 25 + 20 = 45, geteilt durch 2 → 22,5 %.
    const ranking = getProcessedRanking([
      makeTournament(["Tester1", "Tester2", "Tester3"]),
      makeTournament(["Tester3", "Tester2", "Tester1"]),
    ]);
    const tester1 = ranking.find((p) => p.name === "Tester1");
    const tester3 = ranking.find((p) => p.name === "Tester3");

    expect(tester1.yearlyPercentage).toBe(22.5);
    expect(tester3.yearlyPercentage).toBe(22.5);
  });

  test("Tester2 auf übersprungenen Platz 3 erhält 13,5 % (Position 2)", () => {
    // Tester2 landet auf displayRank 3, belegt aber Arrayposition 2.
    // YEARLY_PERCENTAGES[2] = 13,5 %.
    const ranking = getProcessedRanking([
      makeTournament(["Tester1", "Tester2", "Tester3"]),
      makeTournament(["Tester3", "Tester2", "Tester1"]),
    ]);
    const tester2 = ranking.find((p) => p.name === "Tester2");
    expect(tester2.yearlyPercentage).toBe(13.5);
  });

  test("Spieler ab Platz 9 erhalten null als Jahresanteil", () => {
    // Mehr als 8 Teilnehmer: ab Position 8 ist kein Prozentsatz vorgesehen.
    const teilnehmer = ["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10"];
    const ranking = getProcessedRanking([makeTournament(teilnehmer)]);
    expect(ranking[8].yearlyPercentage).toBeNull();
    expect(ranking[9].yearlyPercentage).toBeNull();
  });
});
