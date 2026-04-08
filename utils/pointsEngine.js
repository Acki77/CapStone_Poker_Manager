/**
 * Berechnet die Punkte für einen einzelnen Teilnehmer nach F1-Logik
 * @param {number} rank - Der Platz (0 = 1. Platz, 1 = 2. Platz, etc.)
 * @param {number} totalParticipants - Anzahl aller Teilnehmer im Turnier
 * @returns {number} Die Summe aus Platzierung + TN-Anzahl + Anwesenheit
 */
export function calculatePoints(rank, totalParticipants) {
  // 1. Die Platzierungspunkte (Formel 1 System)
  const rankPointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  // Falls jemand 11. wird, bekommt er 0 Punkte aus der Tabelle
  const rankPoints = rankPointsTable[rank] || 0;

  // 2. TN-Punkte (1 Pkt pro Mitspieler)
  const participantPoints = totalParticipants;

  // 3. Anwesenheits-Bonus (Fixstarter-Punkte)
  const attendancePoints = 5;

  return rankPoints + participantPoints + attendancePoints;
}

/**
 * Erstellt das Gesamtranking aus allen Turnieren
 * @param {Array} tournaments - Alle Turnier-Daten aus der MongoDB
 * @returns {Array} Ein sortiertes Array mit {name, points} Objekten
 */
export function getYearlyRanking(tournaments) {
  const ranking = {};

  tournaments.forEach((tournament) => {
    const totalTN = tournament.participants.length;

    tournament.participants.forEach((name, index) => {
      const points = calculatePoints(index, totalTN);
      const normalizedName = name.trim();

      // Wir kummulieren: Wenn Name schon da, addieren, sonst neu anlegen
      if (ranking[normalizedName]) {
        ranking[normalizedName] += points;
      } else {
        ranking[normalizedName] = points;
      }
    });
  });

  // Umwandeln in Array und sortieren (Höchste Punktzahl zuerst)
  return Object.entries(ranking)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);
}

// Prozentualer Anteil am Jahrespunktpool für die Top 8.
// Index 0 = Platz 1, Index 1 = Platz 2, usw.
// Ab Position 8 (Platz 9+) wird 0 verwendet.
const YEARLY_PERCENTAGES = [25, 20, 13.5, 13.5, 10, 8, 6, 4];

/**
 * Wendet die Gleichstandsregel an und berechnet den prozentualen Jahresanteil.
 * Bei geteilten Plätzen werden die Prozente der belegten Positionen gemittelt:
 * Platz 1 geteilt → (25 + 20) / 2 = 22,5 % für beide Spieler.
 * @param {Array} tournaments - Alle Turnier-Daten
 * @returns {Array} Sortiertes Array mit {name, points, displayRank, yearlyPercentage}
 */
export function getProcessedRanking(tournaments) {
  const rawRanking = getYearlyRanking(tournaments);

  // Erster Durchlauf: displayRank vergeben
  const withRanks = rawRanking.reduce((acc, player, index) => {
    const prev = acc[index - 1];
    const displayRank =
      prev && player.points === prev.points ? prev.displayRank : index + 1;
    acc.push({ ...player, displayRank });
    return acc;
  }, []);

  // Zweiter Durchlauf: Prozente berechnen – Gleichstandsgruppen zusammenfassen
  let i = 0;
  while (i < withRanks.length) {
    const currentRank = withRanks[i].displayRank;

    // Alle Spieler mit demselben Rang finden
    let j = i;
    while (j < withRanks.length && withRanks[j].displayRank === currentRank) {
      j++;
    }

    // Summe der Prozente für die belegten Positionen (i bis j-1)
    const totalPct = withRanks
      .slice(i, j)
      .reduce((sum, _, k) => sum + (YEARLY_PERCENTAGES[i + k] || 0), 0);

    // Gleichmäßige Verteilung auf alle Spieler der Gruppe
    const avgPct = Math.round((totalPct / (j - i)) * 10) / 10;

    for (let k = i; k < j; k++) {
      withRanks[k].yearlyPercentage = avgPct > 0 ? avgPct : null;
    }

    i = j;
  }

  return withRanks;
}
