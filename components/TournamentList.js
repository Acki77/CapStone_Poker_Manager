import styled from "styled-components";
import { useRouter } from "next/router";
import TournamentCard from "./TournamentCard"; // Import der neuen Karte

export default function TournamentList({ tournaments }) {
  const router = useRouter();

  if (!tournaments || tournaments.length === 0) {
    return <EmptyMessage>Keine Turniere gefunden.</EmptyMessage>;
  }

  // --- LOGIK-FUNKTIONEN (Bleiben hier in der Liste) ---

  async function handleDelete(id) {
    const confirmed = confirm("Turnier wirklich löschen?");
    if (!confirmed) return;

    const response = await fetch(`/api/tournaments/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.replace(router.asPath);
    } else {
      alert("Fehler beim Löschen!");
    }
  }

  function handleEdit(id) {
    router.push(`/tournaments/${id}`);
  }

  return (
    <List>
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament._id}
          tournament={tournament}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </List>
  );
}

const List = styled.ul`
  list-style: none;
  padding: 0;
  max-width: 600px;
  margin: 2rem auto;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #efefef;
  margin-top: 2rem;
`;
