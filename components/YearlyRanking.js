import styled from "styled-components";
import { getProcessedRanking } from "@/utils/pointsEngine";

export default function YearlyRanking({ tournaments }) {
  if (!tournaments || tournaments.length === 0) return null;

  const processedRanking = getProcessedRanking(tournaments);
  const currentYear = new Date(tournaments[0].date).getFullYear();

  return (
    <TableContainer>
      <TableTitle>🏆 Jahrestabelle {currentYear}</TableTitle>
      <StyledTable>
        <thead>
          <tr>
            <Th>Platz</Th>
            <Th>Name</Th>
            <ThRight>Punkte</ThRight>
            <ThRight>Anteil %</ThRight>
          </tr>
        </thead>
        <tbody>
          {processedRanking.map((player) => (
            <StyledTableRow key={player.name} $rank={player.displayRank}>
              <Td>
                <RankBadge $rank={player.displayRank}>
                  {player.displayRank}.
                </RankBadge>
              </Td>
              <Td>{player.name}</Td>
              <TdPoints>{player.points}</TdPoints>
              <TdPercentage $hasValue={!!player.yearlyPercentage}>
                {player.yearlyPercentage
                  ? `${player.yearlyPercentage.toString().replace(".", ",")} %`
                  : "–"}
              </TdPercentage>
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

const StyledTableRow = styled.tr`
  border-bottom: 1px solid #40444b;
  background-color: ${(props) =>
    props.$rank <= 8 ? "rgba(52, 152, 219, 0.08)" : "transparent"};
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

const ThRight = styled(Th)`
  text-align: right;
`;

const Td = styled.td`
  padding: 12px 10px;
`;

const TdPoints = styled(Td)`
  text-align: right;
  font-weight: bold;
`;

const TdPercentage = styled(Td)`
  text-align: right;
  font-weight: bold;
  color: ${(props) => (props.$hasValue ? "#f1c40f" : "#555")};
`;

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
    if (props.$rank === 1) return "#f1c40f";
    if (props.$rank === 2) return "#bdc3c7";
    if (props.$rank === 3) return "#e67e22";
    return "transparent";
  }};

  color: ${(props) => (props.$rank <= 3 ? "#1a1a1a" : "#efefef")};
`;
