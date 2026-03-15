const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const hintBtn = document.getElementById('hint-btn');
const questionsLeft = document.getElementById('questions-left');
const hintsLeft = document.getElementById('hints-left');
const scoreDisplay = document.getElementById('score-display');
const processingIndicator = document.getElementById('processing-indicator');
const dossierModal = document.getElementById('dossier-modal');
const soundBtn = document.getElementById('sound-btn');

let sessionId = null;
let isGameOver = false;

// Audio toggle
soundBtn.addEventListener('click', () => {
    const isMuted = audioCore.toggleMute();
    soundBtn.textContent = isMuted ? "SOUND: OFF" : "SOUND: ON";
    if (!isMuted) {
        soundBtn.classList.add('active');
        audioCore.playBlip(); // feedback sound
    } else {
        soundBtn.classList.remove('active');
    }
});

function appendMessage(sender, text, type) {
    const div = document.createElement('div');
    div.classList.add('message');
    if (type) div.classList.add(type);
    
    if (type === 'ai-msg') {
        let i = 0;
        div.textContent = `${sender}: `;
        chatBox.appendChild(div);
        
        function typeWriter() {
            if (i < text.length) {
                div.textContent += text.charAt(i);
                
                // Only blip occasionally to avoid overwhelming the ear
                if (i % 3 === 0 && text.charAt(i).trim() !== "") {
                    audioCore.playBlip();
                }

                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(typeWriter, 10); // Typerwriter speed
            } else {
                if (!isGameOver) {
                    sendBtn.disabled = false;
                    userInput.disabled = false;
                    hintBtn.disabled = false;
                    userInput.focus();
                }
            }
        }
        sendBtn.disabled = true;
        userInput.disabled = true;
        hintBtn.disabled = true;
        typeWriter();
    } else {
        div.textContent = text ? `${sender}: ${text}` : text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function displayDossier(data) {
    const evals = document.getElementById('dossier-evaluations');
    evals.innerHTML = '';
    
    if (data.evaluations) {
        for (const [key, value] of Object.entries(data.evaluations)) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
            evals.appendChild(li);
        }
    }
    
    document.getElementById('dossier-score').textContent = data.finalScore || 'N/A';
    document.getElementById('dossier-grade').textContent = data.grade || 'N/A';
    document.getElementById('dossier-story').textContent = data.trueStory || 'Story data corrupted.';
    
    if (data.grade) {
        document.getElementById('dossier-grade').className = `grade-${data.grade}`;
    }
    
    audioCore.playStinger();
    dossierModal.style.display = 'flex';
}

function updateStats(q, h, s) {
    questionsLeft.textContent = `Questions Remaining: ${q}`;
    hintsLeft.textContent = `Hints Remaining: ${h}`;
    scoreDisplay.textContent = `Score: ${s}`;
}

async function startSession() {
    try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();
        sessionId = data.sessionId;
        updateStats(20, 3, 100);
        appendMessage('SYSTEM', data.message, 'ai-msg');
    } catch (err) {
        appendMessage('ERROR', 'Failed to connect to memory core.', 'system-msg');
    }
}

async function sendMessage(message) {
    if (!message || !sessionId || isGameOver) return;
    
    appendMessage('You', message, 'user-msg');
    
    processingIndicator.style.display = 'block';
    sendBtn.disabled = true;
    userInput.disabled = true;
    hintBtn.disabled = true;
    
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, message })
        });
        
        const data = await res.json();
        
        processingIndicator.style.display = 'none';
        
        if (data.error) {
            audioCore.playError();
            appendMessage('ERROR', data.error, 'system-msg');
            sendBtn.disabled = false;
            userInput.disabled = false;
            hintBtn.disabled = false;
            userInput.focus();
            return;
        }

        updateStats(data.questionsRemaining, data.hintsRemaining, data.score);
        
        if (data.isGameOver) {
            isGameOver = true;
            try {
                const dossierData = JSON.parse(data.response);
                displayDossier(dossierData);
            } catch (e) {
                audioCore.playError();
                appendMessage('Witness AI', "System Error: Dossier parsing failed. " + data.response, 'ai-msg');
            }
        } else {
            appendMessage('Witness AI', data.response, 'ai-msg');
        }

    } catch (err) {
        processingIndicator.style.display = 'none';
        audioCore.playError();
        appendMessage('ERROR', 'Transmission failed.', 'system-msg');
        sendBtn.disabled = false;
        userInput.disabled = false;
        hintBtn.disabled = false;
    }
}

const toggleFinalBtn = document.getElementById('toggle-final-btn');
const standardInputArea = document.getElementById('standard-input-area');
const finalInputArea = document.getElementById('final-input-area');
const cancelFinalBtn = document.getElementById('cancel-final-btn');
const submitFinalBtn = document.getElementById('submit-final-btn');

const fVictim = document.getElementById('final-victim');
const fKiller = document.getElementById('final-killer');
const fWeapon = document.getElementById('final-weapon');
const fLocation = document.getElementById('final-location');
const fTime = document.getElementById('final-time');
const fMotive = document.getElementById('final-motive');

sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) sendMessage(text);
    userInput.value = '';
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = userInput.value.trim();
        if (text) sendMessage(text);
        userInput.value = '';
    }
});

hintBtn.addEventListener('click', () => {
    sendMessage("HINT");
});

toggleFinalBtn.addEventListener('click', () => {
    standardInputArea.style.display = 'none';
    finalInputArea.style.display = 'flex';
    fVictim.focus();
});

cancelFinalBtn.addEventListener('click', () => {
    finalInputArea.style.display = 'none';
    standardInputArea.style.display = 'flex';
    userInput.focus();
});

submitFinalBtn.addEventListener('click', () => {
    const v = fVictim.value.trim() || "Unknown";
    const k = fKiller.value.trim() || "Unknown";
    const w = fWeapon.value.trim() || "Unknown";
    const l = fLocation.value.trim() || "Unknown";
    const t = fTime.value.trim() || "Unknown";
    const m = fMotive.value.trim() || "Unknown";

    const finalPayload = `FINAL ANSWER
Victim Name: ${v}
Killer Name: ${k}
Weapon: ${w}
Location: ${l}
Time: ${t}
Motive: ${m}`;

    finalInputArea.style.display = 'none';
    standardInputArea.style.display = 'flex';
    sendMessage(finalPayload);
});

window.onload = startSession;
