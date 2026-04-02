import { useState } from "react";
import { useRouter } from "next/router";
import TournamentForm from "@/components/TournamentForm";
import dbConnect from "@/db/connect"; // Wichtig: Verbindung zur DB
import Tournament from "@/models/Tournament"; // Wichtig: Das Model

export default function EditTournamentPage({ tournament }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tournament) {
    return <p>Lade Turnierdaten...</p>;
  }

  async function handleEditTournament(data) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tournaments/${tournament._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const errorData = await response.json();
        alert("Fehler beim Speichern: " + errorData.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Netzwerkfehler beim Aktualisieren.");
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Turnier bearbeiten</h1>
      <TournamentForm
        onSubmit={handleEditTournament}
        initialData={tournament}
        buttonText="Änderungen speichern"
        isSubmitting={isSubmitting}
      />
    </main>
  );
}

// Er holt die Daten VOR dem Rendern
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    await dbConnect();
    // Suche in der DB nach der ID aus der URL
    const data = await Tournament.findById(id).lean();

    if (!data) {
      return { notFound: true };
    }

    // Mongoose-Objekte sind komplex; "Next.js-sicher" machen:
    const tournament = JSON.parse(JSON.stringify(data));

    return {
      props: {
        tournament, // Dies füllt oben das { tournament } in der Komponente
      },
    };
  } catch (error) {
    console.error("Fehler in getServerSideProps:", error);
    return { props: { tournament: null } };
  }
}
