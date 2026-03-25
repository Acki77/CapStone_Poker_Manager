import { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import TournamentForm from "@/components/TournamentForm";

const PageTitle = styled.h1`
  text-align: center;
  color: #efefef;
`;

const ErrorMessage = styled.p`
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  padding: 0.8rem;
  border-radius: 6px;
  text-align: center;
  max-width: 400px;
  margin: 1rem auto;
`;

export default function AddTournamentPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  async function addTournament(dataToSend) {
    setError(null);
    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.message || "Da lief was schief.");
      }
    } catch (err) {
      setError("Netzwerkfehler. Bitte später erneut versuchen.");
    }
  }

  return (
    <main>
      <PageTitle>Neues Turnier anlegen</PageTitle>

      {/* Fehlermeldung wird hier angezeigt, falls der API-Call schiefgeht */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <TournamentForm onSubmit={addTournament} buttonText="Speichern" />
    </main>
  );
}
