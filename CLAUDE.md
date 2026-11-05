# Hinweise für Claude

Lies zuerst **PROJEKT.md** – dort stehen alle fachlichen Entscheidungen, Rollen, Regeln,
Datenmodell, Betrieb (Render/GitHub) und offene Punkte.

Arbeitsweise mit dem Nutzer (Leiter der Drohnengruppe, kein Programmierer):
- Deutsch, einfach erklären, keine Fachbegriffe ohne Erklärung.
- Änderungen lokal mit PocketBase + Playwright testen, dann auf `main` pushen und bei Render
  einen Deploy auslösen; vorher Service-Worker-Cache-Version in `pb_public/sw.js` erhöhen.
- Größere Gestaltungsänderungen (z. B. Symbole) erst als Entwürfe zeigen und nach Freigabe einspielen.
- Keine Geheimnisse (z. B. SETUP_CODE) ins Repository schreiben – es ist öffentlich.
- PROJEKT.md bei jeder Änderung aktualisieren.
