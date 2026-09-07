# Svadobní paparazzi - foto a video od hostí do Google Drive

Webová aplikácia pre svadobných hostí: zadajú meno, vyberú fotky alebo videá
z albumu v telefóne a tie idú rovno do Google Drive priečinka organizátora.
Bez registrácie, bez inštalácie, bez databázy.

- `/` - odosielanie, so schovaným zoznamom úloh foto misie
- `/gallery` - živá galéria, obnovuje sa každých 30 sekúnd
- `/slideshow` - premietanie na projektor alebo televízor v sále
- `/privacy`, `/terms` - povinné odkazy pre Google OAuth
- `/api/health` - diagnostika nasadenia (nevypisuje hodnoty premenných)

## Ako to funguje

Server vytvorí na Google Drive **resumable upload session** a vráti telefónu
adresu, na ktorú pošle bajty priamo Googlu. Vercel funkcia teda nikdy nedrží
telo súboru a neplatí pre ňu limit 4,5 MB, takže prejdú aj veľké videá.

Keď priamy prenos neprejde (CORS, prísna sieť), súbor sa pošle po 3 MB kusoch
cez `/api/upload-chunk`. Pred tým sa aplikácia Googlu opýta, koľko už z toho
súboru má, aby sa nič nenahralo dvakrát.

Autor je zakódovaný v názve súboru:
`2026-09-18_2143__Zofia-Novakova__IMG_1234.jpg`. Preto nie je potrebná žiadna
databáza.

## Premietanie v sále

Otvor `/slideshow` na notebooku pripojenom k projektoru alebo televízoru
a klikni na tlačidlo vpravo hore pre celú obrazovku. Fotky sa striedajú po
siedmich sekundách a nová fotka predbehne rad, takže hosť svoju fotku uvidí
krátko po odoslaní. Videá sa preskakujú, na plátne by ich aj tak nikto
nepočul.

## Jazyk

Určuje sa z nastavenia prehliadača: slovenčina pre `sk` a `cs`, angličtina pre
všetko ostatné. V pätičke je diskrétny prepínač, jeho voľba sa uloží
v zariadení hosťa.

## Vzhľad

Paleta a typografia sú prevzaté zo svadobnej pozvánky: krémový papier, sépiová
hnedá, kaligrafický `Alex Brush` na mená, `Cormorant Garamond` na zvyšok.
Botanické vetvičky sú kreslené priamo v SVG, nič sa nedoťahuje ako obrázok.
Stránka drží svetlý vzhľad aj v tmavom režime telefónu.

---

## Nastavenie od nuly

### 1. Google Cloud projekt

1. [console.cloud.google.com](https://console.cloud.google.com/), prihlás sa
   účtom, kam majú súbory chodiť.
2. Vytvor projekt.
3. **APIs & Services → Library** → **Google Drive API** → **Enable**.

### 2. OAuth súhlasná obrazovka

**Google Auth Platform → Branding**: App name, support e-mail, a po nasadení
na Vercel aj Application home page, Privacy policy (`/privacy`) a Terms
(`/terms`). Bez tých troch URL sa nedá publikovať.

**Audience** → External → **Publish app** → **In production**.

> V stave *Testing* Google ruší refresh token po 7 dňoch a odosielanie
> prestane fungovať. Rozsah `drive.file` nie je citlivý, publikovanie preto
> neprechádza žiadnym overovaním.

### 3. OAuth klient

**Clients → Create client** → **Web application** → Authorized redirect URIs:

```
http://localhost:5555/callback
```

### 4. Projekt na počítači

```bash
git clone https://github.com/macik1984/wedding_scavenger_app.git
cd wedding_scavenger_app
npm install
cp .env.example .env.local
```

Do `.env.local` vyplň `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET`.

### 5. Refresh token

```bash
npm run token
```

### 6. Priečinok na Drive

```bash
npm run setup-folder -- "Svadobne fotky 2026"
```

> Priečinok sa **musí** vytvoriť týmto skriptom. Rozsah `drive.file` vidí len
> to, čo aplikácia sama vytvorila; ručne založený priečinok vracia 404.

### 7. Skúška

```bash
npm run dev
```

### 8. Vercel

[vercel.com/new](https://vercel.com/new) → import repa → Environment
Variables → **Deploy**.

| Názov | Povinné |
|---|---|
| `GOOGLE_CLIENT_ID` | áno |
| `GOOGLE_CLIENT_SECRET` | áno |
| `GOOGLE_REFRESH_TOKEN` | áno |
| `DRIVE_FOLDER_ID` | áno |
| `NEXT_PUBLIC_COUPLE` | nie (predvolene `Kika a Miro`) |
| `NEXT_PUBLIC_WEDDING_DATE` | nie (predvolene `18. 9. 2026`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | nie |

Premenné zaškrtni pre **Production**. Po ich zmene treba **Redeploy**, Vercel
ich číta pri builde.

### 9. QR kód

Vygeneruj QR kód na svoju adresu a daj ho na kartičky k stolom.

---

## Poznámky

- Súbory sa počítajú do úložiska **tvojho** Google účtu. Fotky sú po 3 až
  5 MB, videá aj 100 MB za minútu záznamu - pri videách sleduj voľné miesto.
- Nahráva sa originál bez zmenšovania.
- Dva súbory idú naraz. Wake Lock drží obrazovku zapnutú, inak by uspatý
  prehliadač prenos zastavil. Na pozadí to nefunguje a ani nemôže - webová
  stránka na to nemá prostriedky.
- Pri zlyhaní sa každý súbor skúsi ešte raz a tlačidlo sa zmení na „Skúsiť
  znova"; už odoslané súbory sa neposielajú druhýkrát.
- Galéria je prístupná každému, kto pozná adresu; samotný Drive priečinok
  zostáva súkromný, súbory idú cez `/api/photo/[id]`.

## Riešenie problémov

Najprv otvor `/api/health`. Povie, ktorá premenná chýba, či prejde výmena
refresh tokenu a či aplikácia vidí na priečinok.

| Príznak | Príčina |
|---|---|
| `slot 500: server_error` | chýba premenná, pozri `/api/health` |
| `drive_init_failed` | zlé `DRIVE_FOLDER_ID`, alebo priečinok nevytvorený skriptom |
| `invalid_grant` po týždni | aplikácia zostala v stave *Testing* |
| Súbory dorazia, galéria prázdna | `DRIVE_FOLDER_ID` ukazuje inam než odosielanie |
| `SERVICE_DISABLED` | nezapnuté Google Drive API |
