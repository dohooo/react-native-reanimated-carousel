import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2209220476314227"
          data-overlays="collapsed-bottom"
          crossOrigin="anonymous"
        />
      </Head>
      <body className="google-anno-skip">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
