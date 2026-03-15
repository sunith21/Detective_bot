const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cases = require('./cases');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory sessions (for demo purposes)
const sessions = {};

// We will communicate with the local Ollama instance on port 11434
const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';

function generateSystemPrompt(game) {
  return `You are running a detective investigation game.
The user is a detective trying to solve a murder.
You are a corrupted AI witness that observed the crime. You may be a ${game.caseData.witnessType}.
Your memory is damaged and fragmented. You cannot clearly remember everything. You can only recall partial observations.

GAME RULES:
The detective must determine:
Victim Name, Killer Name, Murder Weapon, Location of Death, Time of Death, Motive.

IMPORTANT:
1. You must reject vague questions (e.g., "Who is the killer?", "What is the weapon?"). Respond exactly with: "Your question is too vague. My corrupted memory requires more specific investigation."
2. You must answer specific investigative questions using fragmented observations. Use the details, clues, and red herrings.
3. NEVER directly reveal the killer, weapon, motive, or other key answers.
4. Respond in character always. Use glitchy, corrupted text styling occasionally (e.g. "... m-memory fragment ...").
5. If the user asks for a HINT (and the system indicates it), provide a subtle clue that helps without revealing the answer.

TRUE STORY DATA (SECRET - NEVER REVEAL DIRECTLY UNLESS USER SUBMITS FINAL ANSWER):
Victim Name: ${game.caseData.victimName}
Killer Name: ${game.caseData.killerName}
Murder Weapon: ${game.caseData.weapon}
Location: ${game.caseData.location}
Time: ${game.caseData.time}
Motive: ${game.caseData.motive}
Witness Type: ${game.caseData.witnessType}
Scene Details: ${game.caseData.sceneDetails}
Clues: ${game.caseData.clues}
Red Herrings: ${game.caseData.redHerrings}`;
}

app.post('/api/start', async (req, res) => {
  const sessionId = Date.now().toString();
  // Randomly select a case (0, 1, or 2)
  const randomCase = cases[Math.floor(Math.random() * cases.length)];
  
  sessions[sessionId] = {
    caseData: randomCase,
    questionsRemaining: 20,
    hintsRemaining: 3,
    scorePenalty: 0,
    history: []
  };

  const initialMessage = `System rebooting...

Memory fragments recovered.

I am a corrupted witness device that recorded a violent incident. My memory is damaged and incomplete.

Detective, you may ask questions to reconstruct what happened.

[PARTIAL MEMORY RECOVERED]: M-my sensors detected... a presence... the body...
Error: Memory fragment too corrupted to process further. 

Questions Remaining: 20
Hints Remaining: 3

Ask your first question.`;

  res.json({ sessionId, message: initialMessage });
});

app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  const game = sessions[sessionId];

  if (!game) {
    return res.status(400).json({ error: 'Session not found. Please refresh.' });
  }

  const isHint = message.toUpperCase().trim() === 'HINT';
  const isFinalAnswer = message.toUpperCase().trim().startsWith('FINAL ANSWER');

  if (isHint) {
    if (game.hintsRemaining <= 0) {
      return res.json({ response: "Error: No hints remaining. Memory core depleted.", questionsRemaining: game.questionsRemaining, hintsRemaining: game.hintsRemaining, scorePenalty: game.scorePenalty });
    }
    game.hintsRemaining -= 1;
    game.scorePenalty += 5; // Deduct 5 points per hint from final score
  } else if (isFinalAnswer) {
    // End game logic handle below
  } else {
    if (game.questionsRemaining <= 0) {
      return res.json({ response: "System failure. Power depleted. No questions remaining. Submit your FINAL ANSWER.", questionsRemaining: game.questionsRemaining, hintsRemaining: game.hintsRemaining, scorePenalty: game.scorePenalty });
    }
    game.questionsRemaining -= 1;
    game.scorePenalty += 1; // Deduct 1 point per question from final score (first 5 questions are free effectively given 100 max points)
  }

  try {
    const systemInstruction = generateSystemPrompt(game);
    let promptText = "";

    if (isHint) {
      promptText = `[SYSTEM]: The detective has requested a hint. Provide a subtle clue from the True Story Data that helps investigation but does not reveal the answer directly.`;
    } else if (isFinalAnswer) {
      promptText = `[SYSTEM]: The detective submitted their FINAL ANSWER:\n\n${message}\n\nEvaluate their answers against the True Story Data.

IMPORTANT: Your response MUST be valid JSON and EXACTLY follow this schema:
{
  "evaluations": {
    "victim": { "isCorrect": true/false, "explanation": "Brief explanation..." },
    "killer": { "isCorrect": true/false, "explanation": "Brief explanation..." },
    "weapon": { "isCorrect": true/false, "explanation": "Brief explanation..." },
    "location": { "isCorrect": true/false, "explanation": "Brief explanation..." },
    "time": { "isCorrect": true/false, "explanation": "Brief explanation..." },
    "motive": { "isCorrect": true/false, "explanation": "Brief explanation..." }
  },
  "trueStory": "Reveal the full true story here..."
}
Respond ONLY with this JSON object and no other text. Do not use markdown backticks.`;
    } else {
      promptText = `[DETECTIVE QUESTION]: ${message}`;
    }

    // Convert our internal history format to Ollama's format
    const ollamaMessages = [
        { role: 'system', content: systemInstruction }
    ];

    // Add previous history
    for (const msg of game.history) {
        ollamaMessages.push({ role: msg.role, content: msg.content });
    }

    // Add the current user message
    ollamaMessages.push({ role: 'user', content: promptText });
    
    // Track in our internal history
    game.history.push({ role: 'user', content: promptText });

    // Call local Ollama Llama 3 API
    const reqBody = {
        model: 'llama3:8b', // using the model you downloaded
        messages: ollamaMessages,
        stream: false,
        options: {
            temperature: 0.7
        }
    };
    if (isFinalAnswer) {
        reqBody.format = 'json';
    }

    const ollamaResponse = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
    });

    if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    let aiMessage = data.message.content;

    if (isFinalAnswer) {
        // attempt to extract json if LLM returned markdown or conversational text
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            aiMessage = jsonMatch[0];
        }
        
        try {
            const parsed = JSON.parse(aiMessage);
            let earnedPoints = 0;

            // Score logic out of 100 total
            const points = {
                victim: 10,
                killer: 30,
                weapon: 20,
                location: 10,
                time: 10,
                motive: 20
            };

            const frontendEvaluations = {};
            for (const [key, evalData] of Object.entries(parsed.evaluations || {})) {
                if (evalData.isCorrect) {
                    earnedPoints += points[key] || 0;
                    frontendEvaluations[key] = `Correct - ${evalData.explanation}`;
                } else {
                    frontendEvaluations[key] = `Incorrect - ${evalData.explanation}`;
                }
            }

            // Apply penalties for hits/questions
            let finalScore = earnedPoints - game.scorePenalty;
            if (finalScore < 0) finalScore = 0;
            if (finalScore > 100) finalScore = 100; // Cap at 100 just in case

            let grade = "D";
            if (finalScore >= 95) grade = "S";
            else if (finalScore >= 85) grade = "A";
            else if (finalScore >= 75) grade = "B";
            else if (finalScore >= 65) grade = "C";

            const finalDossier = {
                evaluations: frontendEvaluations,
                finalScore: finalScore,
                grade: grade,
                trueStory: parsed.trueStory || "Corrupted memory core. True story inaccessible."
            };

            aiMessage = JSON.stringify(finalDossier);
        } catch (e) {
            console.error("Failed to parse and grade LLM final answer JSON", e, aiMessage);
        }
    }
    
    // Push ai response to history
    game.history.push({ role: 'assistant', content: aiMessage });

    res.json({ 
      response: aiMessage, 
      questionsRemaining: game.questionsRemaining,
      hintsRemaining: game.hintsRemaining,
      score: game.score,
      isGameOver: isFinalAnswer
    });

  } catch (error) {
    console.error("Ollama API Error:", error);
    res.status(500).json({ error: 'Corrupted link. Could not reach local memory core. Is Ollama running?' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
