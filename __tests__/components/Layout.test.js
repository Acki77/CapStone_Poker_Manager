import { render, screen } from "@testing-library/react";
import Layout from "@/components/Layout";
// Router mocken, da Layout useRouter() nutzt
jest.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/" }),
}));

test("zeigt das Walhalla-Logo und den Neu-Button in der Navigation", () => {
  render(
    <Layout>
      <div>Inhalt</div>
    </Layout>,
  );

  const logo = screen.getByAltText(/Walhalla Logo/i);
  const navLink = screen.getByText(/NEU/i);

  expect(logo).toBeInTheDocument();
  expect(navLink).toBeInTheDocument();
});
