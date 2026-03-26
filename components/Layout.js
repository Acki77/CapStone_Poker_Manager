import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <>
      <Nav>
        <Link href="/" passHref>
          <Logo $active={router.pathname === "/"}>🏆 TURNIER-APP</Logo>
        </Link>

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
          <li>
            <Link href="/tournaments/add" passHref>
              <StyledLink $active={router.pathname === "/tournaments/add"}>
                ➕ NEU
              </StyledLink>
            </Link>
          </li>
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

const StyledLink = styled.span`
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
