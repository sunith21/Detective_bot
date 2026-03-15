# Detective Bot

A simple murder mystery game played in the terminal/browser. You interrogate a glitchy, corrupted AI witness to figure out who committed a murder.

You have a limited number of questions and hints. If you use them all up without solving the case, or if you guess wrong at the end, your detective grade drops. 

## Features
* **Terminal Interface**: A green-on-black CRT styled design with procedurally generated sound effects (typing blips, warning glitches, background hum).
* **Local LLM Integration**: Uses Ollama running locally (Llama 3 by default) to roleplay the broken AI witness.
* **Math-based Scoring**: The backend calculates your final score and rank based on how many clues you correctly guess when you submit your final dossier, penalizing you for asking too many questions or using hints.

## How to Run
1. Make sure you have Node.js installed.
2. Make sure you have [Ollama](https://ollama.com/) running locally with the model it needs (e.g. `ollama run llama3:8b`).
3. Clone this repo and run `npm install` inside the folder.
4. Start the server with `node server.js` or `npm start`.
5. Open your browser to `http://localhost:3000`.

## Tech Stack
* Vanilla JS, HTML, CSS for the frontend
* Web Audio API for sound
* Node/Express for the backend API route
