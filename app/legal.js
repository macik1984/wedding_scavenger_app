export const legal = {
  sk: {
    privacyTitle: 'Ochrana osobných údajov',
    privacyUpdated: 'Naposledy aktualizované: september 2026',
    privacy: [
      [
        'Kto stránku prevádzkuje',
        'Túto stránku prevádzkuje súkromná osoba pre potreby jednej svadobnej oslavy. Nejde o komerčnú službu a nie je verejne ponúkaná.',
      ],
      [
        'Aké údaje zbierame',
        'Meno, ktoré do formulára dobrovoľne zadáte, a fotografie, ktoré sami nahráte. Nič iné. Nepoužívame cookies na sledovanie, analytické nástroje ani reklamné skripty. Nevyžadujeme registráciu ani e-mail.',
      ],
      [
        'Kam sa údaje ukladajú',
        'Fotografie sa ukladajú do priečinka na Google Drive, ktorý patrí organizátorovi svadby. Zadané meno je súčasťou názvu súboru, aby bolo zrejmé, kto fotku poslal. Fotografie sú na stránke zobrazené v galérii všetkým, kto pozná jej adresu.',
      ],
      [
        'Komu údaje odovzdávame',
        'Nikomu. Údaje nepredávame, neposkytujeme tretím stranám ani ich nepoužívame na marketing. Jediným spracovateľom je Google ako poskytovateľ úložiska Google Drive a Vercel ako poskytovateľ hostingu.',
      ],
      [
        'Ako dlho ich uchovávame',
        'Fotografie zostávajú v Google Drive organizátora ako súkromný svadobný archív. Stránka sa po skončení podujatia vypína.',
      ],
      [
        'Vaše práva',
        'Môžete kedykoľvek požiadať o vymazanie svojich fotografií alebo mena. Napíšte na kontaktnú adresu nižšie a fotografie budú odstránené.',
      ],
    ],
    termsTitle: 'Podmienky používania',
    terms: [
      [
        'Účel stránky',
        'Stránka slúži hosťom jednej svadobnej oslavy na zdieľanie fotografií. Nie je to verejná služba.',
      ],
      [
        'Čo sem patrí',
        'Nahrávajte iba fotografie z danej oslavy. Nenahrávajte obsah, ktorý je nezákonný, urážlivý alebo ku ktorému nemáte práva.',
      ],
      [
        'Zodpovednosť',
        'Stránka je poskytovaná tak, ako je, bez záruky dostupnosti. Prevádzkovateľ nezodpovedá za stratu nahraných súborov.',
      ],
      [
        'Odstránenie obsahu',
        'Prevádzkovateľ môže bez upozornenia odstrániť akýkoľvek nahraný obsah.',
      ],
    ],
    contact: 'Kontakt',
    back: 'Späť na stránku',
  },
  en: {
    privacyTitle: 'Privacy policy',
    privacyUpdated: 'Last updated: September 2026',
    privacy: [
      [
        'Who runs this site',
        'This site is run by a private individual for a single wedding celebration. It is not a commercial service and is not offered to the public.',
      ],
      [
        'What we collect',
        'The name you voluntarily type into the form, and the photos you upload yourself. Nothing else. We use no tracking cookies, no analytics and no advertising scripts. No sign-up or email is required.',
      ],
      [
        'Where it is stored',
        'Photos are stored in a Google Drive folder belonging to the wedding organiser. The name you enter becomes part of the file name so it is clear who sent the photo. Photos are shown in the gallery to anyone who knows the site address.',
      ],
      [
        'Who we share it with',
        'Nobody. We do not sell your data, pass it to third parties or use it for marketing. The only processors involved are Google as the Drive storage provider and Vercel as the hosting provider.',
      ],
      [
        'How long we keep it',
        'Photos remain in the organiser’s Google Drive as a private wedding archive. The site is taken down after the event.',
      ],
      [
        'Your rights',
        'You may ask for your photos or your name to be deleted at any time. Write to the contact address below and they will be removed.',
      ],
    ],
    termsTitle: 'Terms of use',
    terms: [
      [
        'Purpose',
        'This site lets guests of one wedding celebration share photos. It is not a public service.',
      ],
      [
        'What belongs here',
        'Upload only photos from that celebration. Do not upload content that is unlawful, offensive, or that you do not hold the rights to.',
      ],
      [
        'Liability',
        'The site is provided as is, with no guarantee of availability. The operator is not liable for the loss of uploaded files.',
      ],
      ['Content removal', 'The operator may remove any uploaded content without notice.'],
    ],
    contact: 'Contact',
    back: 'Back to the site',
  },
};

export function l(lang) {
  return legal[lang] ?? legal.sk;
}
