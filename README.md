# Detective Bot

A simple murder mystery game played in the terminal/browser. You interrogate a glitchy, corrupted AI witness to figure out who committed a murder.

You have a limited number of questions and hints. If you use them all up without solving the case, or if you guess wrong at the end, your detective grade drops. 

## Features
* **Terminal Interface**: A green-on-black CRT styled design with procedurally generated sound effects (typing blips, warning glitches, background hum).
* **Local LLM Integration**: Uses Ollama running locally (Llama 3 by default) to roleplay the broken AI witness.
* **Math-based Scoring**: The backend calculates your final score and rank based on how many clues you correctly guess when you submit your final dossier, penalizing you for asking too many questions or using hints.
* **Web Admin Dashboard**: Built-in visual control panel to approve or deny incoming player connections securely.

## How to Play & Host

### Step 1: Start the Local Network (AI Core)
1. Ensure Node.js and [Ollama](https://ollama.com/) (running `llama3:8b`) are installed.
2. Clone this repo and run `npm install`.
3. Start the server with `node server.js`.
4. *Your browser will automatically open the **Admin Control Panel** at `http://localhost:3000/admin.html`. Keep this tab open!*

### Step 2: Invite Friends (Optional)
If you want others to play on their phones or remotely:
1. Open a second terminal window.
2. Run `npx localtunnel --port 3000`.
3. Give the generated `loca.lt` URL to your friends.
4. *(Note: localtunnel requires a "Password" on the first visit. Find your password by running `curl https://loca.lt/mytunnelpassword` or Googling "What is my IP").*

### Step 3: Approve Connections
1. When players open the game URL, they hit an "UNAUTHORIZED ACCESS" lobby.
2. They must enter a Callsign (e.g. `Detective01`).
3. Look at your **Admin Control Panel** tab. They will instantly appear under **PENDING REQUESTS**.
4. Click **[APPROVE]**. Their screen will unlock and the game will begin!

## Tech Stack
* Vanilla JS, HTML, CSS for the frontend
* Web Audio API for sound
* Node/Express for the backend API route
