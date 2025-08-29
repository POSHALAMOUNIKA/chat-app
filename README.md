# CODTECH - Real-time Chat (Frontend only)

This repo contains only **frontend** code (static): `index.html`, `styles.css`, `script.js`.
The client connects to a WebSocket server (replace the URL in the form). Default demo uses `wss://echo.websocket.events`.

## Quick steps to publish on GitHub (static site / GitHub Pages)

1. Create a repo on GitHub (e.g. `codtech-chat-frontend`).

2. Locally:
```bash
# in the folder containing index.html, styles.css, script.js, README.md
git init
git add .
git commit -m "feat: frontend chat client"
git branch -M main
git remote add origin https://github.com/<YOUR-USER>/codtech-chat-frontend.git
git push -u origin main
