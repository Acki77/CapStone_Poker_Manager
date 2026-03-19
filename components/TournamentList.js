import styled from "styled-components";

const List = styled.ul`
  list-style: none;
  padding: 0;
  max-width: 600px;
  margin: 2rem auto;
`;

const Card = styled.li`
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PlayerBadge = styled.span`
  background: #f0f0f0;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  border-left: 4px solid #0070f3;
  color: #333;
`;

export default function TournamentList({ tournaments }) {
  if (!tournaments || tournaments.length === 0) {
    return <p>Keine Turniere gefunden.</p>;
  }
  return (
    <List>
      {tournaments.map((tournament) => (
        <Card key={tournament._id}>
          <h2>
            {tournament.month}
            {tournament.date ? new Date(tournament.date).getFullYear() : "2026"}
          </h2>
          <p>
            <strong>Teilnehmeranzahl:</strong>
            {tournament.participants?.length || 0}
          </p>

          <PlayerList>
            {tournament.participants.map((player, index) => (
              <PlayerBadge key={player}>
                {index + 1}. {player}
              </PlayerBadge>
            ))}
          </PlayerList>
        </Card>
      ))}
    </List>
  );
}
