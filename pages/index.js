import TournamentList from "@/components/TournamentList";
import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";
import { getYearlyRanking } from "@/utils/pointsEngine";
import styled from "styled-components";

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
  color: #3498db;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: #efefef;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 2px solid #40444b;
  color: #b9bbbe;
`;

const Td = styled.td`
  padding: 12px 10px;
  border-bottom: 1px solid #40444b;
`;

const Rank = styled.span`
  font-weight: bold;
  color: ${(props) =>
    props.$first ? "#f1c40f" : "#efefef"}; // Gold für Platz 1
`;

export default function HomePage({ tournaments }) {
  const ranking = getYearlyRanking(tournaments);

  return (
    <main>
      <TableContainer>
        <TableTitle>🏆 Jahrestabelle 2026</TableTitle>
        <StyledTable>
          <thead>
            <tr>
              <Th>Platz</Th>
              <Th>Name</Th>
              <Th style={{ textAlign: "right" }}>Punkte</Th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player, index) => (
              <tr key={player.name}>
                <Td>
                  <Rank $first={index === 0}>{index + 1}.</Rank>
                </Td>
                <Td>{player.name}</Td>
                <Td style={{ textAlign: "right", fontWeight: "bold" }}>
                  {player.points}
                </Td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>

      {/* Hier drunter kommt dann deine bisherige Liste der einzelnen Turniere */}
      <hr style={{ border: "0.5px solid #40444b", margin: "3rem 0" }} />
      <h3>Alle Turniere</h3>
      <TournamentList tournaments={tournaments} />
    </main>
  );
}

export async function getServerSideProps() {
  await dbConnect();
  // .lean() macht die Daten zu einfachen JS-Objekten (wichtig für Next.js Props)
  const data = await Tournament.find().lean();

  // Wir müssen Mongoose-IDs und Daten in Strings umwandeln
  const tournaments = JSON.parse(JSON.stringify(data));

  return {
    props: { tournaments },
  };
}
