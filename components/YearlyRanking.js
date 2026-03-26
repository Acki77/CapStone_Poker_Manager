import styled from "styled-components";
import { getYearlyRanking } from "@/utils/pointsEngine";

export default function YearlyRanking({ tournaments }) {
  if (!tournaments || tournaments.length === 0) return null;

  const rawRanking = getYearlyRanking(tournaments);
  const currentYear = new Date(tournaments[0].date).getFullYear();

  // Die Andreas-Regel Logik bleibt gleich
  const processedRanking = rawRanking.reduce((acc, player, index) => {
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

  return (
    <TableContainer>
      <TableTitle>🏆 Jahrestabelle {currentYear}</TableTitle>
      <StyledTable>
        <thead>
          <tr>
            <Th>Platz</Th>
            <Th>Name</Th>
            <Th style={{ textAlign: "right" }}>Punkte</Th>
          </tr>
        </thead>
        <tbody>
          {processedRanking.map((player) => (
            /* WICHTIG: Die GANZE ZEILE bekommt den $rank Prop */
            <StyledTableRow key={player.name} $rank={player.displayRank}>
              <Td>
                <RankBadge $rank={player.displayRank}>
                  {player.displayRank}.
                </RankBadge>
              </Td>
              <Td>{player.name}</Td>
              <Td style={{ textAlign: "right", fontWeight: "bold" }}>
                {player.points}
              </Td>
            </StyledTableRow>
          ))}
        </tbody>
      </StyledTable>
    </TableContainer>
  );
}

// --- STYLING ---

const TableContainer = styled.section`
  margin: 2rem auto;
  max-width: 600px;
  background: #2c2f33;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const TableTitle = styled.h2`
  text-align: center;
  color: #efefef;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #efefef;
`;

/**
 * NEU: Die Zeile steuert jetzt die Hintergrundfarbe für die Top 10
 */
const StyledTableRow = styled.tr`
  border-bottom: 1px solid #40444b;
  /* Wenn Platz 1-10, dann bekommt die ganze Zeile einen blauen Schimmer */
  background-color: ${(props) =>
    props.$rank <= 10 ? "rgba(52, 152, 219, 0.08)" : "transparent"};

  transition: background-color 0.2s;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 2px solid #40444b;
  color: #b9bbbe;
`;

const Td = styled.td`
  padding: 12px 10px;
`;

/**
 * Der Kreis für die Platzierung (1-3)
 */
const RankBadge = styled.span`
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;

  background-color: ${(props) => {
    if (props.$rank === 1) return "#f1c40f"; // Gold
    if (props.$rank === 2) return "#bdc3c7"; // Silber
    if (props.$rank === 3) return "#e67e22"; // Bronze
    return "transparent";
  }};

  color: ${(props) => (props.$rank <= 3 ? "#1a1a1a" : "#efefef")};
`;
