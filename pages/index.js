import dbConnect from "@/db/connect";
import Tournament from "@/models/Tournament";
import YearlyRanking from "@/components/YearlyRanking";
import TournamentList from "@/components/TournamentList";
import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";

export default function HomePage({ tournaments }) {
  // Prüfen, ob überhaupt Turniere vorhanden sind (Empty State Check)
  const hasTournaments = tournaments && tournaments.length > 0;

  return (
    <main>
      {!hasTournaments ? (
        /* --- EMPTY STATE: Wenn noch keine Turniere da sind --- */
        <EmptyStateContainer>
          <WelcomeTitle>Willkommen im Walhalla</WelcomeTitle>
          <StyledHeroImage
            src="/images/titel-pic.jpg" // Pfad zu deinem Foto in public/images/
            alt="Gaststätte Walhalla"
            width={600}
            height={400}
            priority
          />
          <InfoText>
            Seit über 20 Jahren der Ort für unsere Poker-Runden. Aktuell sind
            noch keine Turniere für dieses Jahr eingetragen.
          </InfoText>
          <Link href="/tournaments/add" passHref>
            <AddButton>Erstes Turnier hinzufügen</AddButton>
          </Link>
        </EmptyStateContainer>
      ) : (
        /* --- NORMAL STATE: Wenn Daten vorhanden sind --- */
        <>
          {/* Die neue, ausgelagerte Jahrestabelle */}
          <YearlyRanking tournaments={tournaments} />

          <Divider />

          <SectionTitle>Alle Turniere</SectionTitle>
          <TournamentList tournaments={tournaments} />
        </>
      )}
    </main>
  );
}

export async function getServerSideProps() {
  await dbConnect();
  const data = await Tournament.find().sort({ date: -1 }).lean();
  const tournaments = JSON.parse(JSON.stringify(data));

  return {
    props: { tournaments },
  };
}

const EmptyStateContainer = styled.section`
  text-align: center;
  padding: 3rem 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeTitle = styled.h1`
  color: #3498db;
  margin-bottom: 2rem;
`;

const StyledHeroImage = styled(Image)`
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  object-fit: cover;
  max-width: 100%;
  height: auto;
`;

const InfoText = styled.p`
  margin: 2rem 0;
  font-size: 1.2rem;
  color: #b9bbbe;
  line-height: 1.6;
`;

const AddButton = styled.button`
  background-color: #27ae60;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    background-color: #2ecc71;
  }
`;

const SectionTitle = styled.h3`
  text-align: center;
  color: #efefef;
  margin-top: 2rem;
  font-size: 1.5rem;
`;

const Divider = styled.hr`
  border: 0.5px solid #40444b;
  margin: 3rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;
