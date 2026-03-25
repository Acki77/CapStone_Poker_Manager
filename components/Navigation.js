import Link from "next/link";
import styled from "styled-components";
import { useRouter } from "next/router";

// Der Container für die gesamte Leiste
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 60px;
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

// Ein "schlauer" Link, der seine Farbe ändert, wenn er aktiv ist
const StyledLink = styled(Link)`
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  /* Hier nutzen wir eine Prop ($active), um die Farbe zu steuern */
  color: ${(props) => (props.$active ? "#3498db" : "#efefef")};

  &:hover {
    color: #3498db;
  }
`;

const Logo = styled(StyledLink)`
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 1px;
`;

export default function Navigation() {
  const router = useRouter();

  return (
    <Nav>
      <Logo href="/" $active={router.pathname === "/tournaments/add"}>
        🏆 TURNIER-APP
      </Logo>
      <NavList>
        <li>
          <StyledLink
            href="/tournaments/add"
            $active={router.pathname === "/tournaments/add"}
          >
            ➕ NEU
          </StyledLink>
        </li>
      </NavList>
    </Nav>
  );
}
