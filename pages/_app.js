import GlobalStyle from "@/components/GlobalStyle";
import "../styles/globals.css";
import Layout from "@/components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
