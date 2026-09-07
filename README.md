# Svadobný fotolov - upload do Google Drive

Jednoduchá webová aplikácia pre svadobných hostí: zadajú meno, vyberú fotky
a tie idú rovno do tvojho Google Drive priečinka. Žiadna registrácia, žiadna
aplikácia, žiadna databáza.

- `/` - nahrávanie fotiek (SK / EN prepínač)
- `/gallery` - živá galéria, obnovuje sa každých 30 sekúnd

**Ako to funguje:** server vytvorí na Google Drive tzv. resumable upload
session a vráti telefónu URL, na ktorú pošle fotku priamo Googlu. Vercel
funkcia teda nikdy nedrží telo súboru a neplatí pre ňu limit 4,5 MB. Autor
fotky je zakódovaný v názve súboru, napr.
`2026-09-05_2143__Zofia-Novakova__IMG_1234.jpg` - preto nie je potrebná
žiadna databáza.

---

## Čo budeš potrebovať

- Google účet, do ktorého Drive majú fotky chodiť
- účet na [Vercel](https://vercel.com) (stačí free Hobby)
- Node.js 20+ na počítači (len na jednorazové nastavenie)

---

## Krok 1 - Google Cloud projekt

1. Choď na [console.cloud.google.com](https://console.cloud.google.com/) a
   prihlás sa účtom, kam majú fotky chodiť.
2. Hore vľavo vytvor nový projekt, napr. `svadba-fotky`.
3. V ľavom menu **APIs & Services → Library** vyhľadaj **Google Drive API**
   a daj **Enable**.

## Krok 2 - OAuth súhlasná obrazovka

V ľavom menu choď na **Google Auth Platform** (predtým sa to volalo OAuth
consent screen).

1. **Branding** - App name napr. `Svadobné fotky`, support e-mail tvoj.
2. **Audience** - zvoľ **External**.
3. Na tej istej záložke klikni **Publish app** a potvrď prechod do
   **In production**.

> Toto je dôležité. Kým je appka v stave *Testing*, Google ruší refresh token
> po 7 dňoch a nahrávanie zrazu prestane fungovať. Rozsah `drive.file`, ktorý
> používame, nie je citlivý, takže publikovanie neprejde žiadnym overovaním -
> je to okamžité.

## Krok 3 - OAuth klient

1. **Google Auth Platform → Clients → Create client**
2. Application type: **Web application**
3. Name: `wedding-photo`
4. **Authorized redirect URIs** → pridaj:
   ```
   http://localhost:5555/callback
   ```
5. Ulož a odlož si **Client ID** a **Client secret**.

## Krok 4 - Projekt na počítači

```bash
git clone https://github.com/macik1984/wedding_scavenger_app.git
cd wedding_scavenger_app
npm install
cp .env.example .env.local
```

Do `.env.local` vyplň zatiaľ len `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET`.

## Krok 5 - Refresh token

```bash
npm run token
```

Skript vypíše odkaz. Otvor ho v prehliadači, prihlás sa Google účtom, povoľ
prístup. V termináli sa objaví riadok `GOOGLE_REFRESH_TOKEN=...` - skopíruj
ho do `.env.local`.

> Ak Google ukáže varovanie „Google hasn't verified this app", klikni
> **Advanced → Go to ... (unsafe)**. Je to tvoja vlastná aplikácia.

## Krok 6 - Priečinok na Drive

```bash
npm run setup-folder -- "Svadobné fotky 2026"
```

Vypíše `DRIVE_FOLDER_ID=...` - skopíruj do `.env.local`.

> Priečinok sa **musí** vytvoriť takto. Rozsah `drive.file` vidí len súbory
> a priečinky, ktoré aplikácia sama vytvorila; ručne založený priečinok by
> vracal 404.

## Krok 7 - Vyskúšaj lokálne

```bash
npm run dev
```

Otvor `http://localhost:3000`, nahraj fotku, skontroluj `/gallery` aj svoj
Google Drive.

## Krok 8 - Nasadenie na Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** →
   vyber `macik1984/wedding_scavenger_app`.
2. V sekcii **Environment Variables** pridaj (hodnoty z `.env.local`):

   | Názov | Hodnota |
   |---|---|
   | `GOOGLE_CLIENT_ID` | z kroku 3 |
   | `GOOGLE_CLIENT_SECRET` | z kroku 3 |
   | `GOOGLE_REFRESH_TOKEN` | z kroku 5 |
   | `DRIVE_FOLDER_ID` | z kroku 6 |
   | `NEXT_PUBLIC_COUPLE` | napr. `Miroslav & Žofia` |

3. **Deploy**. Za minútu máš adresu typu `wedding-scavenger-app.vercel.app`.

> Keď neskôr zmeníš niektorú premennú, treba dať **Redeploy** - Vercel ich
> načítava pri builde.

## Krok 9 - QR kód na stoly

Vygeneruj QR kód na svoju Vercel adresu (napr.
[qr-code-generator.com](https://www.qr-code-generator.com/)) a daj ho na
kartičky k úlohám fotolovu.

---

## Poznámky

- Fotky sa počítajú do úložiska **tvojho** Google účtu. 100 hostí × 20 fotiek
  po 4 MB ≈ 8 GB - free Google účet má 15 GB, takže sleduj stav.
- Aplikácia nahráva originály bez zmenšovania.
- Galéria je verejná pre každého, kto pozná adresu - fotky sa servujú cez
  `/api/photo/[id]`, samotný Drive priečinok zostáva súkromný.
- Ak chceš galériu vypnúť, stačí zmazať `app/gallery/` a odkazy naň.

## Riešenie problémov

| Príznak | Príčina |
|---|---|
| `drive_init_failed` | zlé `DRIVE_FOLDER_ID`, alebo priečinok nevytvorený skriptom |
| `invalid_grant` po týždni | appka zostala v stave *Testing* (krok 2) |
| Fotky sa nahrajú, galéria prázdna | `DRIVE_FOLDER_ID` ukazuje inam než upload |
| Build na Verceli padne | chýba niektorá env premenná |
