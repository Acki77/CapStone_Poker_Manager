import { render, screen } from "@testing-library/react";
import Layout from "@/components/Layout";

// next/router mocken - Layout nutzt useRouter() für den aktiven Link
jest.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/" }),
}));

// next-auth/react mocken - damit useSession() keine echte Session braucht
// jest.fn() erstellt eine "leere" Funktion die wir pro Test beliebig steuern können
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// useSession importieren damit wir es in den Tests konfigurieren können
import { useSession } from "next-auth/react";

// --- Hilfsfunktion: simuliert einen ausgeloggten Zustand ---
function setLoggedOut() {
  useSession.mockReturnValue({ data: null });
}

// --- Hilfsfunktion: simuliert einen eingeloggten Admin ---
function setAdminLoggedIn() {
  useSession.mockReturnValue({
    data: {
      user: {
        name: "Phil Ivey",
        email: "phil@gmail.com",
        image: null, // kein Bild, damit kein next/image Problem im Test
        isAdmin: true,
      },
    },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("zeigt das Walhalla-Logo in der Navigation", () => {
  setLoggedOut();
  render(<Layout><div>Inhalt</div></Layout>);

  expect(screen.getByAltText(/Walhalla Logo/i)).toBeInTheDocument();
});

test("zeigt den Login-Button wenn ausgeloggt", () => {
  setLoggedOut();
  render(<Layout><div>Inhalt</div></Layout>);

  // Ausgeloggt: Login-Button muss sichtbar sein
  expect(screen.getByText("Login")).toBeInTheDocument();
});

test("versteckt den NEU-Button wenn ausgeloggt", () => {
  setLoggedOut();
  render(<Layout><div>Inhalt</div></Layout>);

  // queryByText gibt null zurück wenn Element nicht da ist (kein Fehler wie getByText)
  expect(screen.queryByText(/NEU/i)).not.toBeInTheDocument();
});

test("zeigt den NEU-Button wenn Admin eingeloggt", () => {
  setAdminLoggedIn();
  render(<Layout><div>Inhalt</div></Layout>);

  expect(screen.getByText(/NEU/i)).toBeInTheDocument();
});

test("zeigt Name und Logout-Button wenn Admin eingeloggt", () => {
  setAdminLoggedIn();
  render(<Layout><div>Inhalt</div></Layout>);

  expect(screen.getByText("Phil Ivey")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});
