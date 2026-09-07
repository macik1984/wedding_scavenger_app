export const LANGS = ['sk', 'en'];

export const copy = {
  sk: {
    label: 'SK',
    tagline: 'Svadobný fotolov',
    heading: 'Nafoťte to za nás',
    intro:
      'Na stole máte kartičku s úlohami. Fotky nahrajte sem - idú rovno do nášho albumu. Žiadna registrácia, žiadna aplikácia.',
    nameLabel: 'Vaše meno',
    namePlaceholder: 'napr. Žofia Nováková',
    nameHint: 'Aby sme vedeli, komu poďakovať.',
    pick: 'Vybrať fotky',
    pickMore: 'Pridať ďalšie',
    dropHint: 'alebo sem presuňte fotky',
    upload: 'Nahrať',
    uploading: 'Nahrávam...',
    done: 'Hotovo, ďakujeme!',
    doneMore: 'Nahrať ďalšie fotky',
    gallery: 'Pozrieť galériu',
    back: 'Späť na nahrávanie',
    galleryTitle: 'Živá galéria',
    gallerySub: 'Aktualizuje sa každých 30 sekúnd.',
    empty: 'Zatiaľ žiadne fotky. Buďte prví.',
    loadMore: 'Načítať ďalšie',
    errName: 'Najprv prosím zadajte meno.',
    errFiles: 'Vyberte aspoň jednu fotku.',
    errUpload: 'Nahrávanie zlyhalo. Skúste to prosím znova.',
    photos: (n) => `${n} ${n === 1 ? 'fotka' : n < 5 ? 'fotky' : 'fotiek'}`,
    close: 'Zavrieť',
  },
  en: {
    label: 'EN',
    tagline: 'Wedding photo hunt',
    heading: 'Shoot it for us',
    intro:
      'There is a task card on your table. Upload your photos here - they go straight into our album. No sign-up, no app.',
    nameLabel: 'Your name',
    namePlaceholder: 'e.g. Sophie Novak',
    nameHint: 'So we know who to thank.',
    pick: 'Choose photos',
    pickMore: 'Add more',
    dropHint: 'or drop photos here',
    upload: 'Upload',
    uploading: 'Uploading...',
    done: 'All done, thank you!',
    doneMore: 'Upload more photos',
    gallery: 'View gallery',
    back: 'Back to upload',
    galleryTitle: 'Live gallery',
    gallerySub: 'Refreshes every 30 seconds.',
    empty: 'No photos yet. Be the first.',
    loadMore: 'Load more',
    errName: 'Please enter your name first.',
    errFiles: 'Pick at least one photo.',
    errUpload: 'Upload failed. Please try again.',
    photos: (n) => `${n} photo${n === 1 ? '' : 's'}`,
    close: 'Close',
  },
};

export function t(lang) {
  return copy[lang] ?? copy.sk;
}
