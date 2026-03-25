# Bici Vincenzo – Tradizione e Passione su Due Ruote

Benvenuti nel repository ufficiale di **Bici Vincenzo**. Questo progetto è un sito web moderno sviluppato con **Next.js 16**, **Tailwind CSS 4** e **GSAP**, progettato per riflettere i trend UI del 2026 e offrire un'esperienza utente premium su dispositivi mobile e desktop.

## 🚀 Caratteristiche Tecniche

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) con Glassmorphism 2.0
- **Animazioni**: [GSAP](https://greensock.com/gsap/) (Scroll-triggered) e [Framer Motion](https://www.framer.com/motion/) (3D Tilt effects)
- **PWA**: Configurazione Progressive Web App con supporto Offline e Safe-area per iOS/Android
- **AI Integration**: Chatbot "Vincenzo AI" integrato con supporto Voice Search (Web Speech API)
- **Admin Panel**: Pannello di amministrazione dedicato per la gestione dinamica di Promozioni e Prodotti

## 🛠 Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/bolognacarmine-cell/bici.git
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
4. Visita `http://localhost:3000` per vedere il sito o `http://localhost:3000/admin` per il pannello admin.

## 📱 Ottimizzazione Mobile 2026

Il sito è ottimizzato per **iOS Safari** e **Android Chrome**, includendo:
- Gestione della **Dynamic Island** e dei Notch tramite `safe-area-inset`.
- Touch targets minimi di **48x48px**.
- Feedback aptico (**Haptics**) sulle interazioni principali.
- Performance Lighthouse puntate al **100/100**.

## 🎨 Design System

- **Palette**: Gradienti Blue/Cyan (`#0a75ad` → `#00d4ff`) con accenti Orange meccanico.
- **Tipografia**: *Plus Jakarta Sans* (Sans) e *Space Grotesk* (Display).

## 🌐 Deployment su Render

Il sito è ottimizzato per il deployment su **Render.com**.

1. Crea un nuovo **Web Service**.
2. Collega il repository GitHub.
3. Imposta il **Name** come `bicivincenzo` per ottenere l'URL `bicivincenzo.onrender.com`.
4. Configura:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

---
© 2026 Ciclofficina Vincenzo – Marcianise (CE). Tutti i diritti riservati.
