import GlobalStyle from "@/components/GlobalStyle";
import "../styles/globals.css";
import Layout from "@/components/Layout";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>After Work - Poker Manager</title>
      </Head>
      <GlobalStyle />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
