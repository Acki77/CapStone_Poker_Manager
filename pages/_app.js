import GlobalStyle from "@/components/GlobalStyle";
import "../styles/globals.css";
import Layout from "@/components/Layout";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // SessionProvider macht die Session in der ganzen App verfügbar
    // pageProps.session wird von NextAuth automatisch befüllt
    <SessionProvider session={session}>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

export default MyApp;
