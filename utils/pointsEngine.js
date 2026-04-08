/**
 * Prozentuale Verteilung für die Top 8 der Jahresrangliste
 * Nur die Top 8 erhalten einen Anteil, Plätze 9+ bleiben leer
 */
export const YEARLY_PERCENTAGE_TABLE = [25, 20, 13.5, 13.5, 10, 8, 6, 4];

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

/**
 * Berechnet den prozentualen Anteil für einen Spieler basierend auf seinem Rang
 * Berücksichtigt Gleichstand: Bei geteilten Plätzen werden die Prozente gemittelt
 * @param {number} displayRank - Der angezeigte Rang (1-basiert)
 * @param {Array} ranking - Das vollständige Ranking zur Gleichstandserkennung
 * @param {number} playerIndex - Index im Ranking-Array
 * @returns {number|null} Prozentualer Anteil oder null für Plätze 9+
 */
function calculateYearlyPercentage(displayRank, ranking, playerIndex) {
  // Nur Top 8 erhalten Prozentanteil
  if (displayRank > 8) {
    return null;
  }

  // Finde alle Spieler mit demselben Rang (Gleichstand)
  const tiedPlayers = ranking.filter(
    (p, idx) => p.displayRank === displayRank
  );
  const tiedCount = tiedPlayers.length;

  if (tiedCount === 1) {
    // Kein Gleichstand – direkter Prozentwert aus Tabelle
    return YEARLY_PERCENTAGE_TABLE[displayRank - 1] || null;
  }

  // Gleichstand: Summiere die Prozente aller belegten Positionen und teile durch Anzahl
  // Beispiel: Geteilter Platz 1 → Positionen 0 und 1 → (25 + 20) / 2 = 22.5%
  const startIdx = displayRank - 1;
  let percentageSum = 0;
  for (let i = 0; i < tiedCount; i++) {
    const tableIdx = startIdx + i;
    if (tableIdx < YEARLY_PERCENTAGE_TABLE.length) {
      percentageSum += YEARLY_PERCENTAGE_TABLE[tableIdx];
    }
  }

  return percentageSum / tiedCount;
}

/**
 * Wendet die Gleichstandsregel an: Spieler mit gleicher Punktzahl erhalten denselben Rang
 * Berechnet zusätzlich den prozentualen Anteil für die Top 8
 * @param {Array} tournaments - Alle Turnier-Daten
 * @returns {Array} Sortiertes Array mit {name, points, displayRank, yearlyPercentage}
 */
export function getProcessedRanking(tournaments) {
  const rawRanking = getYearlyRanking(tournaments);

  const rankingWithRanks = rawRanking.reduce((acc, player, index) => {
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

  // Berechne Prozentanteil für jeden Spieler
  return rankingWithRanks.map((player, index) => ({
    ...player,
    yearlyPercentage: calculateYearlyPercentage(
      player.displayRank,
      rankingWithRanks,
      index
    ),
  }));
}
