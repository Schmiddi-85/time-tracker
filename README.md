# Time-Tracker (React + Vite + Tailwind)

Einfache, moderne Zeiterfassung mit 2 Dropdown-Ebenen und einer Freitext-Ebene, Start/Stop-Button und n8n-Anbindung. Deutschsprachige UI. PWA-fähig (installierbar auf iPhone & Mac).

## Voraussetzungen
- Node.js LTS (inkl. npm)
- Optional: n8n (Cloud oder eigener Server)
- Google Account + Google Sheet (wenn du in Sheets protokollierst)

## Los geht's
```bash
npm install
cp .env.example .env.local
# Trage in .env.local deinen Webhook ein:
# VITE_N8N_WEBHOOK_URL=https://...
npm run dev
```

Öffne die Dev-URL (z. B. http://localhost:5173).

## Webhook (n8n)
- Im Code wird die URL **nicht** hart codiert, sondern aus `VITE_N8N_WEBHOOK_URL` gelesen.
- Beim Stop wird ein JSON-Body gesendet:
```json
{
  "level1": "Homeoffice|OnSite",
  "level2": "Vertrieb|Projekt-Extern|Projekt-Intern",
  "level3": "Freitext (Projekt)",
  "start": "ISO-String",
  "end": "ISO-String",
  "duration_sec": 123,
  "userAgent": "Browser UA"
}
```

## Build & Deployment
```bash
npm run build
# Ergebnis liegt in dist/
```
Für Hosting (z. B. Netlify, Vercel) `VITE_N8N_WEBHOOK_URL` als Environment Variable setzen.

## PWA
- `vite-plugin-pwa` ist konfiguriert (Service Worker nach erstem Build aktiv).
- Icons liegen in `public/`.

## Anpassungen
- Werte der Ebenen anpassen in `src/App.jsx` (Optionen) bzw. Freitext bleibt frei.
- Design via Tailwind-Klassen verfeinerbar.
