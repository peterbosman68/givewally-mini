# GiveWally-mini

Een MVP-webapp om iemand een geldcadeau te geven dat naar eigen wens besteed kan worden — zonder Stripe en zonder gebruikersaccounts.

- **Gever (jij)**: beheert cadeaus achter één wachtwoord op `/dashboard`.
- **Ontvanger**: heeft geen account; de unieke, niet-raadbare link (`/cadeau/<secretSlug>`) is de toegang.
- De ontvanger betaalt aankopen zelf voor, uploadt een bonfoto, en jij betaalt terug. Het saldo telt direct af bij elke inzending; jij markeert inzendingen als "vergoed".

## Stack

Next.js 15 (App Router, TypeScript, server actions) · Prisma + PostgreSQL · Tailwind CSS · Vercel Blob (foto's) · Resend (e-mail, optioneel).

## Lokaal opstarten

1. **Dependencies installeren**

   ```bash
   npm install
   ```

2. **Env vars invullen** — open `.env` en vul in:

   | Variabele | Verplicht | Uitleg |
   |---|---|---|
   | `DATABASE_URL` | ja | PostgreSQL-connectiestring (bijv. Neon, Supabase of lokale Postgres) |
   | `DASHBOARD_PASSWORD` | ja | Het ene wachtwoord voor jouw dashboard |
   | `NOTIFY_EMAIL` | nee | E-mailadres dat een melding krijgt bij elke nieuwe inzending |
   | `RESEND_API_KEY` | nee | Resend API-key; zonder key wordt de notificatie alleen in de serverlog geschreven |
   | `BLOB_READ_WRITE_TOKEN` | nee | Vercel Blob token; zonder token gaan foto's naar `public/uploads/` (alleen geschikt voor development) |

3. **Database aanmaken**

   ```bash
   npm run db:migrate
   ```

   (draait `prisma migrate deploy` met de meegeleverde migratie in `prisma/migrations/`)

4. **Starten**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 — je wordt naar `/login` gestuurd.

## Architectuur in het kort

- **`app/dashboard/*`** — gever-schermen (overzicht, nieuw cadeau, detail met inzendingshistorie en "Markeer als vergoed"). Beveiligd via `lib/auth.ts`: na login wordt een httpOnly-cookie gezet met een HMAC-token afgeleid van `DASHBOARD_PASSWORD` (stateless; wachtwoord wijzigen logt iedereen uit).
- **`app/cadeau/[secretSlug]`** — ontvangerpagina: foto, boodschap, saldo, inzendingsformulier en historie. Geen login; de lange random slug (32 tekens, `crypto.randomBytes`) is de sleutel. Per cadeau wordt een eigen PWA-manifest geserveerd zodat "zet op beginscherm" direct op de juiste pagina opent.
- **Server actions** (`app/*/actions.ts`) — alle mutaties: inloggen, cadeau aanmaken, inzending indienen (met transactie + voorwaardelijke decrement zodat het saldo nooit onder nul kan), vergoeden.
- **`lib/storage.ts`** — foto-opslag met random bestandsnamen: Vercel Blob als er een token is, anders lokaal in `public/uploads/` (dev-fallback).
- **`lib/email.ts`** — notificatie via Resend; zonder API-key wordt de melding naar de serverlog geschreven zodat niets blokkeert. Het afzenderadres is `onboarding@resend.dev` (Resend testmodus); met een eigen geverifieerd domein pas je dat aan in `lib/email.ts`.
- **Privacy**: `robots.txt` blokkeert alles, er is geen sitemap, en alle pagina's hebben een `noindex`-meta.
- **Bedragen** worden overal als centen (integers) opgeslagen; invoer accepteert `12,50` en `12.50`.

## Scripts

| Script | Doel |
|---|---|
| `npm run dev` | Development-server |
| `npm run build` | Productie-build (incl. `prisma generate`) |
| `npm run start` | Productie-server |
| `npm run db:migrate` | Migraties uitvoeren (`prisma migrate deploy`) |
| `npm run gen:icons` | PWA-iconen opnieuw genereren |

## Deployen (bijv. Vercel)

1. Zet het project op Vercel, koppel een Postgres-database en Vercel Blob.
2. Vul dezelfde env vars in bij de projectinstellingen.
3. Draai eenmalig `npx prisma migrate deploy` tegen de productiedatabase.
