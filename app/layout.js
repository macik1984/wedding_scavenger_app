import './globals.css';

const couple = process.env.NEXT_PUBLIC_COUPLE || 'Naša svadba';

export const metadata = {
  title: `${couple} - fotky`,
  description: 'Nahrajte svadobné fotky priamo do nášho albumu.',
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: '#faf6f0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
