# GiveWally MVP-mini — webapp zonder login, zonder Stripe

Doel: de snelst mogelijke werkende versie. Jij bent voorlopig de enige gever (geen account, wel afgeschermd met één wachtwoord). Ontvangers hebben geen account — hun unieke link is hun toegang. Een cadeau kan herhaaldelijk gebruikt worden totdat het bedrag op is, met een volledige historie die zowel jij als de ontvanger kunnen terugzien.

Dit is bewust een aparte, veel kleinere tak naast het volledige stappenplan (`stappenplan-cadeau-app-fase-A.md`) — geen Stripe, geen iDEAL, geen wachttijd op goedkeuring. Je kunt hier vandaag mee starten.

---

## Datamodel

- **Gift**: id, secretSlug (lang, random, url-safe), recipientName, originalAmount (centen), remainingAmount (centen), photoUrl, message, createdAt.
- **Submission**: id, giftId, description ("wat heb je gekocht"), amount (centen), receiptPhotoUrl, submittedAt, status ("open" / "reimbursed").

## Beveiliging

- **Gever-dashboard**: één wachtwoord (env var `DASHBOARD_PASSWORD`), simpele sessie-cookie na inloggen — geen account, geen registratie.
- **Ontvangerpagina** (`/cadeau/[secretSlug]`): geen wachtwoord, de niet-raadbare link is de sleutel.
- Foto's in private storage met random bestandsnamen, niet publiek doorzoekbaar (`robots.txt` blokkeert alles, geen sitemap).

## Schermen

**Gever (jij), achter het wachtwoord:**
1. Login — één wachtwoordveld.
2. Dashboard — alle cadeaus: naam ontvanger, resterend saldo, aantal open inzendingen.
3. Nieuw cadeau — naam ontvanger, bedrag, foto upload, boodschap (max 1.500 tekens, tekenteller) → genereert de deel-link.
4. Cadeau-detail — foto+boodschap-voorvertoning, resterend saldo, volledige historie van inzendingen, "Markeer als vergoed"-knop per open inzending.

**Ontvanger, geen login:**
1. Cadeaupagina — foto + boodschap, resterend saldo, knop "Ik heb iets gekocht". Bij eerste bezoek: de "zet op beginscherm"-stap met exact deze tekst: *"GiveWally kan straks automatisch betalen. Voor deze testfase: betaal zelf, upload foto van de bon en ik betaal meteen terug."*
2. Inzendingsformulier — wat gekocht, bedrag, bonfoto (verplicht). Bedrag mag niet boven het resterende saldo uitkomen. Saldo telt direct af bij inzending (ongeacht vergoedingsstatus) — status "open" totdat jij op "vergoed" klikt.
3. Historie — dezelfde pagina toont ook de eerdere inzendingen van dit cadeau, zodat de ontvanger zelf kan terugkijken.

## Overig

- E-mailnotificatie naar jou bij elke nieuwe inzending.
- PWA-manifest zodat de cadeaupagina op het beginscherm kan.
- Simpele, mobiel-eerste Tailwind-styling — geen uitgebreide visuele afwerking nodig.

---

## Eén complete opdracht voor Claude Code

Plak onderstaand blok in zijn geheel als je allereerste bericht in Claude Code. Het is bewust volledig gespecificeerd, zodat er niets te vragen overblijft.

```
Bouw een complete Next.js-webapp genaamd GiveWally-mini. Dit is een MVP zonder Stripe en zonder gebruikersaccounts. Werk dit volledig zelfstandig af zonder tussentijdse vragen te stellen — maak bij elke onderspecificeerde keuze zelf een redelijke aanname en vermeld die kort in je eindsamenvatting.

STACK: Next.js (App Router, TypeScript), Prisma + PostgreSQL, Tailwind CSS, Vercel Blob (of vergelijkbaar) voor foto-opslag.

DATAMODEL (Prisma):
- Gift: id, secretSlug (uniek, lang, random, url-safe), recipientName, originalAmount (centen), remainingAmount (centen), photoUrl, message (tekst, max 1500 tekens), createdAt.
- Submission: id, giftId (relatie), description, amount (centen), receiptPhotoUrl, submittedAt, status ("open" | "reimbursed").

BEVEILIGING:
- Gever-dashboard: beschermd met één wachtwoord uit env var DASHBOARD_PASSWORD. Simpele sessie via een httpOnly cookie na correct wachtwoord — geen registratie, geen gebruikersaccounts.
- Ontvangerpagina op /cadeau/[secretSlug] — geen wachtwoord, de niet-raadbare slug is de toegang.
- robots.txt blokkeert alles; genereer geen sitemap.
- Foto's via Vercel Blob met random bestandsnamen, niet publiek oplijstbaar.

SCHERMEN (gever, achter het wachtwoord):
1. /login — wachtwoordveld.
2. /dashboard — lijst van alle Gifts: naam ontvanger, resterend saldo, aantal open inzendingen, gesorteerd op meest recente activiteit.
3. /dashboard/nieuw — formulier: naam ontvanger, bedrag, foto upload, boodschap (max 1500 tekens met tekenteller) → maakt een Gift aan met gegenereerde secretSlug, toont daarna de deelbare link met kopieer-knop.
4. /dashboard/[giftId] — cadeau-detail: foto+boodschap-voorvertoning, resterend saldo, volledige historie van Submissions (datum, omschrijving, bedrag, bonfoto als klikbare thumbnail, status), met "Markeer als vergoed"-knop per open Submission.

SCHERMEN (ontvanger, geen login):
1. /cadeau/[secretSlug] — foto + boodschap, resterend saldo, duidelijke knop "Ik heb iets gekocht". Bij eerste bezoek (detecteer via localStorage) toon een banner met exact deze tekst: "GiveWally kan straks automatisch betalen. Voor deze testfase: betaal zelf, upload foto van de bon en ik betaal meteen terug." plus een korte "zet op beginscherm"-instructie (iOS: "Tik op het deel-icoon → Zet op beginscherm"; Android: toon de native installprompt via het beforeinstallprompt-event indien beschikbaar).
2. Inzendingsformulier (zelfde pagina of substap): omschrijving, bedrag, bonfoto (verplicht). Valideer dat het bedrag niet hoger is dan het resterende saldo; blokkeer met duidelijke foutmelding indien wel. Trek bij een geslaagde inzending het bedrag direct af van remainingAmount (ongeacht vergoedingsstatus) en maak een Submission aan met status "open".
3. Historie: toon onder het formulier een lijst van eerdere Submissions voor dit cadeau (datum, omschrijving, bedrag, status), zodat de ontvanger zelf kan terugkijken.

OVERIG:
- E-mailnotificatie naar een vast adres (env var NOTIFY_EMAIL) bij elke nieuwe Submission, via Resend of vergelijkbaar (gebruik de gratis/test-modus als er geen API-key is, documenteer dit in de README).
- PWA-manifest zodat de cadeaupagina op het beginscherm gezet kan worden.
- Simpele, mobiel-eerste Tailwind-styling.
- Schrijf een README: lokale opstartinstructies, benodigde env vars (DATABASE_URL, DASHBOARD_PASSWORD, NOTIFY_EMAIL, evt. Blob/Resend-keys), korte architectuuruitleg.

AFRONDING:
- Draai zelf `npm run build` en los eventuele compilatiefouten zelf op vóór je dit als afgerond beschouwt.
- Sluit af met een beknopte samenvatting: welke aannames je maakte bij onderspecificeerde punten, en welke env vars ik nog moet invullen voordat de app lokaal draait.
```

---

## Kan dit echt in één keer, zonder tussenvragen?

Grotendeels ja, met drie voorwaarden:

1. **Model**: gebruik Fable of Opus voor deze ene grote opdracht — bij een lange, aaneengesloten bouwsessie wil je de sterkste denkkracht, niet halverwege een fout die zich opstapelt.
2. **Permissiemodus**: zet Claude Code vóór je begint op **acceptEdits** (Shift+Tab in de sessie) — dan hoef je bestandsbewerkingen niet één voor één goed te keuren.
3. **Bash-commando's blijven om toestemming vragen**, ook in acceptEdits-modus (npm install, prisma migrate, npm run build). Wil je dat ook wegnemen: zet in `.claude/settings.json` vooraf een paar regels klaar, bijvoorbeeld:
   ```json
   {
     "permissions": {
       "allow": ["Bash(npm install)", "Bash(npm run *)", "Bash(npx prisma *)"]
     }
   }
   ```
   Zonder dat zal Claude Code bij elk van die commando's nog even om een klik vragen — geen inhoudelijke vraag, maar wel een onderbreking.

Met beide dingen ingesteld is de kans groot dat de hele opdracht in één ononderbroken sessie doorloopt: Claude Code test zichzelf (via `npm run build`) en lost fouten zelf op, zonder jou daarvoor lastig te vallen. Wat overblijft aan werk voor jou ná afloop: de env vars invullen (wachtwoord kiezen, database-url, eventueel een Resend-key) — dat kan geen enkele AI voor je verzinnen.

**Tijdsinschatting: 10-14 uur mensentijd-equivalent aan bouwwerk**, maar in de praktijk voltrekt Claude Code dat vaak in een veel kortere aaneengesloten sessie (typisch 1-3 uur wandkloktijd) omdat het razendsnel typt en zichzelf test. Reken er wel op dat je zelf ná afloop nog even alles doorloopt en test — "in één keer gebouwd" is niet hetzelfde als "gegarandeerd foutloos"; de bevestiging daarvan blijft mensenwerk.
