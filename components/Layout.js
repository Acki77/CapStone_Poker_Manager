import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Layout({ children }) {
  const router = useRouter();
  // session enthält die User-Daten wenn eingeloggt, sonst null
  const { data: session } = useSession();

  return (
    <>
      <Nav>
        <Logo href="/" $active={router.pathname === "/"}>
          🏆 TURNIER-APP
        </Logo>

        <LogoWrapper>
          <Image
            src="/images/logo.png"
            alt="Walhalla Logo"
            width={280}
            height={90}
            priority
          />
        </LogoWrapper>

        <NavList>
          {/* NEU-Button nur sichtbar wenn Admin eingeloggt */}
          {session?.user?.isAdmin && (
            <li>
              <StyledLink
                href="/tournaments/add"
                $active={router.pathname === "/tournaments/add"}
              >
                ➕ NEU
              </StyledLink>
            </li>
          )}

          {/* Eingeloggt: Profilbild, Name und Logout */}
          {session ? (
            <li>
              <UserInfo>
                {session.user.image && (
                  <ProfileImage
                    src={session.user.image}
                    alt={session.user.name}
                    width={32}
                    height={32}
                  />
                )}
                <span>{session.user.name}</span>
                <AuthButton onClick={() => signOut()}>Logout</AuthButton>
              </UserInfo>
            </li>
          ) : (
            /* Ausgeloggt: Login-Button */
            <li>
              <AuthButton onClick={() => signIn("google")}>Login</AuthButton>
            </li>
          )}
        </NavList>
      </Nav>

      <MainContent>{children}</MainContent>
    </>
  );
}

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
  background-color: #150f36;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  cursor: pointer;

  color: ${(props) => (props.$active ? "#3498db" : "#efefef")};

  &:hover {
    color: #3498db;
  }
`;

const Logo = styled(StyledLink)`
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 480px) {
    display: none;
  }
`;

const MainContent = styled.main`
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #efefef;
`;

const ProfileImage = styled(Image)`
  border-radius: 50%;
`;

const AuthButton = styled.button`
  background: transparent;
  border: 1px solid #3498db;
  border-radius: 6px;
  color: #3498db;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  &:hover {
    background: #3498db;
    color: white;
  }
`;
