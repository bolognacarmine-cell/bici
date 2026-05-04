# Pannello Admin — Problemi e criteri di fix Responsive/Usabilità Mobile

## 1) Obiettivo
Migliorare fruibilità e resa **mobile** (e small tablet) del pannello admin, intervenendo **solo su UI/layout/CSS/comportamenti di presentazione**.

## 2) Vincoli (NON fare)
- Nessuna modifica a: **logica di business**, **CRUD**, **backend/API**, **validazioni**, permessi/ruoli.
- Non cambiare regole di calcolo, stati, workflow o campi obbligatori; solo come vengono **visualizzati**.

## 3) Target & breakpoint (desktop-first)
- Breakpoint di riferimento: **≤480px**, **481–768px**, **769–1024px**, **>1024px**.
- Touch: target min **44×44px**; spaziatura tra controlli ≥ **8px**.

## 4) Problemi tipici da cercare (categorie)
1. **Navigazione**: sidebar non usabile su mobile, overlay non chiudibile, mancanza di “indietro”, breadcrumb troppo lungo.
2. **Tabelle**: colonne fuori schermo, scroll orizzontale “nascosto”, azioni per riga troppo piccole, header non sticky.
3. **Form**: label/campi compressi, tastiera che copre CTA, errori non visibili senza scroll, input type errati.
4. **Filtri/ricerca**: pannelli filtri troppo larghi, non chiara applicazione/reset, chip non scrollabili.
5. **Modali/Drawer**: modali fuori viewport, doppio scroll, chiusura difficile, focus perso.
6. **CTA e azioni**: pulsanti sovrapposti, “azioni pericolose” troppo vicine, dropdown che esce dallo schermo.
7. **Feedback**: toast che copre elementi, loader che blocca senza messaggio, stati vuoti non chiari.
8. **Layout**: padding inconsistenti, griglie rigide, testo troncato senza alternativa, overflow nascosti.
9. **Accessibilità mobile**: focus non visibile, contrasto insufficiente, elementi non raggiungibili con tastiera.

## 5) Criteri di fix (Definition of Done UI)
- Nessun overflow orizzontale involontario (eccetto tabelle con scroll esplicito).
- Navigazione mobile: menu **collassato** (hamburger) con **overlay** e chiusura via “X” + tap fuori + ESC.
- CTA principali sempre raggiungibili: su mobile usare **barra sticky** o CTA in fondo pagina quando necessario.
- Tabelle: offrire una delle soluzioni seguenti (in ordine di preferenza):
  1) **Card list** per riga (stack verticale) su ≤768px
  2) Tabella con **colonne prioritarie** + “Dettagli”
  3) Scroll orizzontale con indicatore visivo e header/azioni accessibili
- Azioni per riga: raggruppare in **menu kebab** (≥44px) su mobile; conferma per azioni distruttive invariata.
- Form: layout a colonna singola su ≤768px; label leggibili; errori visibili vicino al campo e riepilogo in alto se necessario.
- Modali: su mobile preferire **full-screen dialog** o **bottom sheet**; niente contenuti tagliati; una sola area scroll.
- Coerenza: spaziatura e gerarchia tipografica uniforme; componenti riutilizzati.

## 6) Requisiti per componenti (checklist rapida)
### 6.1 Header / Toolbar pagina
- Titolo su 1–2 righe max; azioni secondarie nel menu “altro”.
- Breadcrumb: comprimere (es. ultimo livello + back) su mobile.

### 6.2 Sidebar / Navigazione
- Collassata su mobile; apertura/chiusura animata <200ms.
- Voce attiva evidente; area tappabile ampia.

### 6.3 Tabelle / Liste
- Colonna “azioni” sempre accessibile (kebab) e non micro-icona.
- Paginazione: controlli grandi; mostra conteggio in forma compatta.

### 6.4 Filtri
- Su mobile: filtri in **drawer** (da destra o bottom sheet) con CTA “Applica” e “Reset”.
- Stato filtri attivi mostrato con chip scrollabili.

### 6.5 Form
- Input type corretti (email, number, tel, date) per tastiera mobile.
- Gruppi di campi con separatori e titoli; CTA “Salva” visibile senza caccia allo scroll.

### 6.6 Modali / Conferme
- Dimensione e padding adattivi; pulsanti full-width su mobile.
- Focus trap e chiusura chiara.

## 7) Checklist per schermi (da usare in QA)
### A) Dashboard / Home admin
- Card responsive 1-col (mobile), 2-col (tablet), griglia (desktop).
- Grafici/metriche: legenda comprimibile, tooltips leggibili.

### B) Schermo Lista (con tabella + filtri)
- Ricerca e filtri accessibili entro 1 tap.
- Ogni riga: azioni raggiungibili, testi non tagliati senza possibilità di vedere completo.
- Stati: loading/empty/error non rompono layout.

### C) Schermo Dettaglio
- Sezioni a fisarmonica su mobile se molto lunghe.
- Azioni principali chiaramente separate da azioni distruttive.

### D) Schermo Crea/Modifica (Form)
- Nessun campo “incollato”; errori visibili; scrolling fluido.
- Tastiera non copre CTA (CTA sticky o auto-scroll al campo attivo).

## 8) Criteri di accettazione (misurabili)
- Tutti i controlli interattivi rispettano **44×44px**.
- Su viewport 375×667 e 390×844: nessun elemento essenziale fuori schermo senza scroll verticale naturale.
- Nessun testo critico troncato senza alternativa (tooltip, espansione, dettagli).
- Lighthouse (mobile): nessun errore bloccante di accessibilità legato a focus/aria-label per icone.

## 9) Non-regression
- Verificare che layout desktop (>1024px) resti invariato salvo miglioramenti di spaziatura.
- Verificare che i flussi CRUD e le validazioni si comportino esattamente come prima (solo presentazione).