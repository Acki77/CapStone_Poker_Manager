import { render, screen } from "@testing-library/react";
import Layout from "@/components/Layout";

// next/router wird gemockt, da die Layout-Komponente useRouter() für den aktiven
// Navigationslink aufruft. Ohne Mock würde der Test mit einem Router-Fehler abbrechen.
jest.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/" }),
}));

// next-auth/react wird gemockt, damit useSession() keine echte Session benötigt.
// jest.fn() erzeugt eine steuerbare Funktion, deren Rückgabewert pro Test gesetzt wird.
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

import { useSession } from "next-auth/react";

// Setzt den Session-Zustand auf "ausgeloggt" für den jeweiligen Test
function setLoggedOut() {
  useSession.mockReturnValue({ data: null });
}

// Setzt den Session-Zustand auf einen eingeloggten Admin
function setAdminLoggedIn() {
  useSession.mockReturnValue({
    data: {
      user: {
        name: "Phil Ivey",
        email: "phil@gmail.com",
        image: null,
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

test("zeigt den Login-Button wenn kein Nutzer eingeloggt ist", () => {
  setLoggedOut();
  render(<Layout><div>Inhalt</div></Layout>);
  expect(screen.getByText("Login")).toBeInTheDocument();
});

test("blendet den NEU-Button aus wenn kein Nutzer eingeloggt ist", () => {
  // queryByText gibt null zurück wenn das Element fehlt –
  // getByText würde einen Fehler werfen und ist für Abwesenheitsprüfungen ungeeignet
  setLoggedOut();
  render(<Layout><div>Inhalt</div></Layout>);
  expect(screen.queryByText(/NEU/i)).not.toBeInTheDocument();
});

test("zeigt den NEU-Button wenn ein Admin eingeloggt ist", () => {
  setAdminLoggedIn();
  render(<Layout><div>Inhalt</div></Layout>);
  expect(screen.getByText(/NEU/i)).toBeInTheDocument();
});

test("zeigt Nutzername und Logout-Button wenn ein Admin eingeloggt ist", () => {
  setAdminLoggedIn();
  render(<Layout><div>Inhalt</div></Layout>);
  expect(screen.getByText("Phil Ivey")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});
