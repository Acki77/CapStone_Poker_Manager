import styled from "styled-components";
import { calculatePoints } from "@/utils/pointsEngine";

export default function TournamentCard({ tournament, onDelete, onEdit }) {
  const year = tournament.date
    ? new Date(tournament.date).getFullYear()
    : "2026";
  const participantCount = tournament.participants?.length || 0;

  return (
    <Card>
      <CardHeader>
        <TitleGroup>
          <MonthYear>
            {tournament.month} {year}
          </MonthYear>
          <ParticipantInfo>👥 {participantCount} Spieler</ParticipantInfo>
        </TitleGroup>
      </CardHeader>

      <PlayerList>
        {tournament.participants.map((player, index) => {
          /** * LOGIK: Punkte live berechnen
           * Platzierung (index + 1) und die Gesamtanzahl
           */
          const points = calculatePoints(index, participantCount);

          return (
            <PlayerBadge key={`${tournament._id}-${player}`} $rank={index + 1}>
              <RankNumber>{index + 1}.</RankNumber>
              <PlayerName>{player}</PlayerName>
              <PointsLabel>({points} Pkt.)</PointsLabel>
            </PlayerBadge>
          );
        })}
      </PlayerList>

      <ActionContainer>
        <DeleteButton onClick={() => onDelete(tournament._id)}>
          🗑️ Löschen
        </DeleteButton>
        <EditButton onClick={() => onEdit(tournament._id)}>
          ✏️ Bearbeiten
        </EditButton>
      </ActionContainer>
    </Card>
  );
}

const Card = styled.article`
  border: 1px solid #0070f3;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: rgba(221, 221, 221, 0.34);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  border-bottom: 1px solid #0070f3;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
`;

const TitleGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MonthYear = styled.h2`
  margin: 0;
  color: #f3d700;
  font-size: 1.3rem;
`;

const ParticipantInfo = styled.span`
  font-size: 0.85rem;
  color: #efefef;
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlayerBadge = styled.div`
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;

  /* Gold, Silber, Bronze oder Blau */
  border-left: 12px solid
    ${(props) => {
      if (props.$rank === 1) return "#D4AF37";
      if (props.$rank === 2) return "#C0C0C0";
      if (props.$rank === 3) return "#CD7F32";
      return "#0070f3";
    }};

  font-weight: ${(props) => (props.$rank === 1 ? "bold" : "normal")};
`;

const RankNumber = styled.span`
  width: 25px;
  font-weight: bold;
  color: #666;
`;

const PlayerName = styled.span`
  flex-grow: 1;
`;

const PointsLabel = styled.span`
  color: #0070f3;
  font-weight: bold;
  margin-left: 8px;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.2rem;
`;

const DeleteButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  &:hover {
    background: #cc0000;
  }
`;

const EditButton = styled.button`
  background: #1b859d;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  &:hover {
    background: #008820;
  }
`;
