import {
  getProcessedRanking,
  YEARLY_PERCENTAGE_TABLE,
} from "@/utils/pointsEngine";

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

describe("YEARLY_PERCENTAGE_TABLE – Prozentuale Verteilung", () => {
  test("Top 8 Prozentwerte sind korrekt definiert", () => {
    expect(YEARLY_PERCENTAGE_TABLE).toEqual([
      25, 20, 13.5, 13.5, 10, 8, 6, 4,
    ]);
  });
});

describe("getProcessedRanking – Jahreswertung Prozentanteil", () => {
  test("Top 8 Spieler erhalten Prozentanteil, Platz 9+ nicht", () => {
    // Arrange: 10 Spieler in einem Turnier
    const participants = Array.from({ length: 10 }, (_, i) => `Spieler${i + 1}`);
    const tournaments = [makeTournament(participants)];

    // Act
    const ranking = getProcessedRanking(tournaments);

    // Assert: Top 8 haben Prozentanteil, Platz 9 und 10 nicht
    for (let i = 0; i < 8; i++) {
      expect(ranking[i].yearlyPercentage).toBeGreaterThan(0);
    }
    expect(ranking[8].yearlyPercentage).toBeNull();
    expect(ranking[9].yearlyPercentage).toBeNull();
  });

  test("Prozentanteile entsprechen der Tabelle bei keinem Gleichstand", () => {
    // Arrange: 8 Spieler mit eindeutigen Plätzen
    const participants = Array.from({ length: 8 }, (_, i) => `Spieler${i + 1}`);
    const tournaments = [makeTournament(participants)];

    // Act
    const ranking = getProcessedRanking(tournaments);

    // Assert: Prozentwerte entsprechen der Tabelle
    const expectedPercentages = [25, 20, 13.5, 13.5, 10, 8, 6, 4];
    ranking.forEach((player, index) => {
      expect(player.yearlyPercentage).toBe(expectedPercentages[index]);
    });
  });

  test("Bei geteiltem Platz 1 wird Prozentanteil gemittelt", () => {
    // Arrange: Zwei Turniere mit umgekehrter Reihenfolge
    // Tester1 und Tester3 teilen sich Platz 1
    const tournaments = [
      makeTournament(["Tester1", "Tester2", "Tester3"]),
      makeTournament(["Tester3", "Tester2", "Tester1"]),
    ];

    // Act
    const ranking = getProcessedRanking(tournaments);

    const tester1 = ranking.find((p) => p.name === "Tester1");
    const tester3 = ranking.find((p) => p.name === "Tester3");
    const tester2 = ranking.find((p) => p.name === "Tester2");

    // Assert: Tester1 und Tester3 teilen Platz 1 → (25 + 20) / 2 = 22.5%
    expect(tester1.yearlyPercentage).toBe(22.5);
    expect(tester3.yearlyPercentage).toBe(22.5);
    // Tester2 ist auf Platz 3 → 13.5%
    expect(tester2.yearlyPercentage).toBe(13.5);
  });

  test("Bei geteilten Plätzen 3+4 bleibt Prozentanteil gleich", () => {
    // Arrange: Konstellation wo Platz 3 und 4 geteilt werden
    // 4 Spieler, 2 Turniere mit spezieller Anordnung
    const tournaments = [
      makeTournament(["A", "B", "C", "D"]),
      makeTournament(["B", "A", "D", "C"]),
    ];

    // Act
    const ranking = getProcessedRanking(tournaments);

    // A und B haben gleiche Punkte (geteilter Platz 1)
    // C und D haben gleiche Punkte (geteilter Platz 3)
    const playerA = ranking.find((p) => p.name === "A");
    const playerB = ranking.find((p) => p.name === "B");
    const playerC = ranking.find((p) => p.name === "C");
    const playerD = ranking.find((p) => p.name === "D");

    // A und B teilen Platz 1: (25 + 20) / 2 = 22.5%
    expect(playerA.yearlyPercentage).toBe(22.5);
    expect(playerB.yearlyPercentage).toBe(22.5);
    // C und D teilen Platz 3: (13.5 + 13.5) / 2 = 13.5%
    expect(playerC.yearlyPercentage).toBe(13.5);
    expect(playerD.yearlyPercentage).toBe(13.5);
  });
});
