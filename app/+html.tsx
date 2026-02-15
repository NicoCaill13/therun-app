import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0a181e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Open Graph defaults */}
        <meta property="og:site_name" content="THE RUN" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Create group runs, share QR codes, and run together."
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: webStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const webStyles = `
body {
  background-color: #f6f7f8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #141b1e;
  }
}
/* Hide scrollbar for a native app feel */
::-webkit-scrollbar {
  display: none;
}
html {
  scrollbar-width: none;
}
::selection {
  background-color: #FFE6DE;
  color: #0a181e;
}
/* Pulse animation for skeleton loading on web */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
/* Input focus ring override for NativeWind */
input:focus, textarea:focus {
  outline: none;
}
`;
