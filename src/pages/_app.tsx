import type { AppProps } from "next/app";
import "../styles/globals.css";
import "react-circular-progressbar/dist/styles.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
