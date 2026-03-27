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

      // Wir kummulieren: Wenn Name schon da, addieren, sonst neu anlegen
      if (ranking[name]) {
        ranking[name] += points;
      } else {
        ranking[name] = points;
      }
    });
  });

  // Umwandeln in Array und sortieren (Höchste Punktzahl zuerst)
  return Object.entries(ranking)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);
}

/**
 * Wendet die Gleichstandsregel an: Spieler mit gleicher Punktzahl erhalten denselben Rang
 * @param {Array} tournaments - Alle Turnier-Daten
 * @returns {Array} Sortiertes Array mit {name, points, displayRank}
 */
export function getProcessedRanking(tournaments) {
  const rawRanking = getYearlyRanking(tournaments);

  return rawRanking.reduce((acc, player, index) => {
    const previousPlayer = acc[index - 1];
    let displayRank;
    if (previousPlayer && player.points === previousPlayer.points) {
      displayRank = previousPlayer.displayRank;
    } else {
      displayRank = index + 1;
    }
    acc.push({ ...player, displayRank });
    return acc;
  }, []);
}
