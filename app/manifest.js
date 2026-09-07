const couple = process.env.NEXT_PUBLIC_COUPLE || 'Kika a Miro';

/** Aby stranka po pridani na plochu telefonu vyzerala ako appka, nie ako záložka. */
export default function manifest() {
  return {
    name: `${couple} - svadobní paparazzi`,
    short_name: couple,
    description: 'Pošlite nám fotky a videá z našej svadby.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf7f0',
    theme_color: '#fbf7f0',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
