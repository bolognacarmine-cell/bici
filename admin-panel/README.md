# Admin Panel (Node.js + MongoDB Atlas + Cloudinary)

Questo progetto ricostruisce un pannello admin moderno da zero, senza dipendenze legacy dal vecchio database PostgreSQL su Render (scaduto).  
Stack:

- Backend: Node.js + Express
- DB: MongoDB Atlas (cluster gratuito M0)
- Immagini: Cloudinary
- Frontend: HTML/CSS/JS vanilla (statico, deploy su Netlify)
- Deploy: API su Render, frontend su Netlify

## Prerequisiti

- Node.js 20+
- Account MongoDB Atlas
- Account Cloudinary

## Setup locale

1. Entra nella cartella:

   ```bash
   cd admin-panel
   ```

2. Installa dipendenze:

   ```bash
   npm install
   ```

3. Crea il file `.env` partendo da `.env.example` e valorizza:

   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `JWT_SECRET` (almeno 32 caratteri)

4. Avvia in dev:

   ```bash
   npm run dev
   ```

5. Apri:

   - Frontend: http://localhost:5000
   - Healthcheck: http://localhost:5000/health

## MongoDB Atlas (M0) — creazione rapida

1. Crea un progetto su MongoDB Atlas.
2. Crea un cluster gratuito (M0).
3. Crea un database user e salva username/password.
4. In “Network Access” abilita l’IP (per sviluppo rapido puoi usare `0.0.0.0/0`, poi restringi).
5. Copia la connection string SRV e inseriscila in `MONGODB_URI`.

## Cloudinary — setup rapido

1. Crea un account Cloudinary.
2. Recupera `Cloud name`, `API Key`, `API Secret`.
3. Inseriscili nel file `.env`.

## Deploy API su Render

1. Crea un nuovo servizio Web su Render collegando la repo.
2. Imposta come Root Directory `admin-panel` (se stai deployando dalla root del repo).
3. Build Command:

   ```bash
   npm install
   ```

4. Start Command:

   ```bash
   node server.js
   ```

5. Aggiungi le env vars richieste:

   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `JWT_SECRET`
   - `NODE_ENV=production`

Il file [render.yaml](file:///c:/Users/Acer/bici/admin-panel/render.yaml) è pronto come riferimento.

## Deploy Frontend su Netlify

Il frontend è statico e si trova in `admin-panel/public`.

1. Crea un nuovo sito su Netlify collegando la repo.
2. Imposta come Base directory `admin-panel`.
3. Publish directory: `public`
4. Build command: nessuno (puoi lasciare quello nel file `netlify.toml`).

### Proxy API (consigliato)

Per evitare URL hardcoded nel frontend, il client chiama `/api/...` in relativo.  
Configura Netlify per inoltrare `/api/*` al dominio Render:

- Modifica [netlify.toml](file:///c:/Users/Acer/bici/admin-panel/netlify.toml) e sostituisci:

  `https://REPLACE_WITH_YOUR_RENDER_DOMAIN`

con il tuo dominio effettivo Render (es. `https://admin-panel-api.onrender.com`).

## API Endpoints

### Auth (`/api/auth`)

- `POST /register` — `{ email, password }` → `{ token, user }`
- `POST /login` — `{ email, password }` → `{ token, user }`
- `GET /me` — header `Authorization: Bearer <token>` → `{ user }`

### Products (`/api/products`)

- `GET /` — query: `page`, `limit`, `q`
- `GET /:id`
- `POST /` (protetta) — `{ name, description?, price, category?, stock?, active?, images? }`
- `PUT /:id` (protetta)
- `DELETE /:id` (protetta) — elimina anche le immagini Cloudinary del prodotto

### Upload (`/api/upload`)

- `POST /image` (protetta) — form-data `image`
- `POST /images` (protetta) — form-data `images[]`
- `DELETE /image/:public_id` (protetta)

### Admin (`/api/admin`)

- `GET /stats` (protetta) — `{ productsTotal, ordersTotal, revenue }`

## Troubleshooting

- 401 “Token invalid”:
  - assicurati di inviare `Authorization: Bearer <token>`
  - verifica che `JWT_SECRET` sia impostato e identico in dev/prod
- 500 upload immagini:
  - controlla credenziali Cloudinary in `.env`
- CORS:
  - opzionale: imposta `CORS_ORIGIN` con domini separati da virgola (Netlify + localhost)

