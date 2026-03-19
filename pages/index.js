import TournamentList from "@/components/TournamentList";
import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";

export default function HomePage({ tournaments }) {
  return (
    <main>
      <h1>Tournament Overview</h1>
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
