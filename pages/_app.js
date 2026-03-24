import GlobalStyle from "@/components/GlobalStyle";
import "../styles/globals.css";
import Navigation from "@/components/Navigation";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <Navigation />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
