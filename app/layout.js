import './globals.css';

const couple = process.env.NEXT_PUBLIC_COUPLE || 'Kika a Miro';

export const metadata = {
  title: `${couple} · svadobní paparazzi`,
  description: 'Pošlite nám fotky a videá z našej svadby.',
  robots: { index: false, follow: false },
  openGraph: {
    title: `${couple}`,
    description: 'Svadobná foto misia - pošlite nám svoje fotky.',
  },
};

export const viewport = {
  themeColor: '#fbf7f0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
