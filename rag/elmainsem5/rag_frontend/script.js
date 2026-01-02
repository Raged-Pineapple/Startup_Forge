const API_BASE_URL = 'http://127.0.0.1:8000';

// DOM Elements
const queryInput = document.getElementById('queryInput');
const searchBtn = document.getElementById('searchBtn');
const chatHistory = document.getElementById('chatHistory');
const toggleBtns = document.querySelectorAll('.toggle-btn');

let currentMode = 'founders'; // 'founders' or 'investors'

// Focus input on load
queryInput.focus();

// Event Listeners
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update UI
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update State
        currentMode = btn.dataset.mode;

        // Update Placeholder
        queryInput.placeholder = currentMode === 'founders'
            ? "Ask about founders (e.g., 'Find AI experts')..."
            : "Ask about investors (e.g., 'Seed stage VCs')...";

        // Optional: Add a system message indicating mode switch
        // appendSystemMessage(`Switched to ${currentMode === 'founders' ? 'Founder' : 'Investor'} search mode.`);
    });
});

searchBtn.addEventListener('click', handleUserRequest);
queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserRequest();
});

async function handleUserRequest() {
    const query = queryInput.value.trim();
    if (!query) return;

    // 1. Add User Message
    appendMessage(query, 'user');
    queryInput.value = '';

    // 2. Show Typing Indicator
    const typingId = showTypingIndicator();

    try {
        const endpoint = currentMode === 'founders' ? '/search/founders' : '/search/investors';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, top_k: 4 })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // 3. Remove Typing Indicator
        removeTypingIndicator(typingId);

        // 4. Add Bot Response with Results
        appendBotResponse(data.results);

    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingId);
        appendMessage("Sorry, I encountered an error connecting to the server. Please make sure the backend is running.", 'bot');
    }
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerText = text;

    msgDiv.appendChild(contentDiv);
    chatHistory.appendChild(msgDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message message-bot';
    msgDiv.id = id;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;

    msgDiv.appendChild(contentDiv);
    chatHistory.appendChild(msgDiv);
    scrollToBottom();
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function appendBotResponse(documents) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message message-bot';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Header for the response
    const headerParams = currentMode === 'founders' ? 'Founders matching ' : 'Investors matching ';
    const headerP = document.createElement('p');
    headerP.innerHTML = documents.length > 0
        ? `Here are some ${headerParams} your request:`
        : `I couldn't find any specific ${currentMode} matching that. Try a broader search.`;
    contentDiv.appendChild(headerP);

    // Results Grid
    if (documents.length > 0) {
        const grid = document.createElement('div');
        grid.className = 'chat-results-grid';

        documents.forEach(doc => {
            const card = createResultCard(doc);
            grid.appendChild(card);
        });

        contentDiv.appendChild(grid);
    }

    msgDiv.appendChild(contentDiv);
    chatHistory.appendChild(msgDiv);
    scrollToBottom();
}

function createResultCard(docText) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const details = parseDocString(docText);

    let html = '';

    if (currentMode === 'founders') {
        html += `
            <div class="card-header">
                <div class="card-tag tag-founder"><i class="fa-solid fa-user-astronaut"></i> Founder</div>
            </div>
            <div class="card-content">
                ${details.Founder ? `<h3>${details.Founder}</h3>` : ''}
                ${details.Company ? `<div class="detail-row"><span class="label">Company:</span> <span class="value">${details.Company}</span></div>` : ''}
                ${details['Funding round'] ? `<div class="detail-row"><span class="label">Round:</span> <span class="value">${details['Funding round']}</span></div>` : ''}
            </div>
        `;
    } else {
        html += `
            <div class="card-header">
                <div class="card-tag tag-investor"><i class="fa-solid fa-hand-holding-dollar"></i> Investor</div>
            </div>
            <div class="card-content">
                ${details['Investor name'] ? `<h3>${details['Investor name']}</h3>` : ''}
                ${details.Firm ? `<div class="detail-row"><span class="label">Firm:</span> <span class="value">${details.Firm}</span></div>` : ''}
                ${details['Preferred stage'] ? `<div class="detail-row"><span class="label">Stage:</span> <span class="value">${details['Preferred stage']}</span></div>` : ''}
                ${details.Domain ? `<div class="detail-row"><span class="label">Domain:</span> <span class="value">${details.Domain}</span></div>` : ''}
            </div>
        `;
    }

    // Fallback
    if (Object.keys(details).length === 0) {
        html += `<p style="font-size: 0.9rem;">${docText}</p>`;
    }

    card.innerHTML = html;
    return card;
}

function parseDocString(text) {
    const obj = {};
    const regex = /([A-Za-z\s]+):\s(.*?)\./g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        obj[match[1].trim()] = match[2].trim();
    }

    if (Object.keys(obj).length === 0) {
        const parts = text.split('.');
        parts.forEach(part => {
            if (part.includes(':')) {
                const [key, val] = part.split(':');
                if (key && val) obj[key.trim()] = val.trim();
            }
        });
    }
    return obj;
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
