// Init Gun
const gun = Gun(['http://localhost:8765/gun']);
const user = gun.user();

// State
let currentUser = { id: null, role: null };
let currentRoom = null;
let currentChatListener = null;

const views = {
    login: document.getElementById('login-view'),
    home: document.getElementById('home-view'),
    inbox: document.getElementById('inbox-view'),
    chat: document.getElementById('chat-view'),
    connect: document.getElementById('connect-view'),
    notifications: document.getElementById('notifications-view')
};

// --- Navigation ---
function showView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');

    if (viewName === 'inbox') loadInbox();
    if (viewName === 'notifications') loadNotifications();
    if (viewName === 'home') document.getElementById('main-nav').classList.remove('hidden');
}
window.showView = showView;

// --- Login & Registration ---
document.getElementById('login-btn').addEventListener('click', async () => {
    const id = document.getElementById('user-id-input').value.trim();
    const role = document.getElementById('user-role-input').value.trim();

    if (!id || !role) return alert("Enter ID and Role");

    // Use a unique alias for this system version to avoid old insecure account collisions
    const alias = `forge_secure_${id}`;
    const gunPass = `pass_${id}_for_startup_forge_2025`; // Long and deterministic

    user.auth(alias, gunPass, (ack) => {
        if (ack.err) {
            // Try creating if it doesn't exist
            user.create(alias, gunPass, (reg) => {
                if (reg.err) {
                    // If wrong password for existing user, we might be stuck
                    // In a demo, we tell the user or just use a fallback
                    console.error("Gun registration/auth error:", reg.err);
                    if (reg.err.includes("already exists")) {
                        alert("User exists with different password. Try a new ID for the demo.");
                    } else {
                        alert("Login Error: " + reg.err);
                    }
                    return;
                }
                user.auth(alias, gunPass, startApp);
            });
        } else {
            startApp();
        }
    });

    function startApp() {
        currentUser = { id, role };
        document.getElementById('user-info').innerText = `#${id}`;
        document.getElementById('role-badge').innerText = role;
        document.getElementById('main-nav').classList.remove('hidden');
        showView('home');
        checkNotificationsLoop();
    }
});

// --- Inbox ---
async function loadInbox() {
    try {
        const res = await fetch('http://localhost:3000/inbox', {
            headers: {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role
            }
        });
        const data = await res.json();
        renderInbox(data.connections);
    } catch (err) {
        console.error(err);
    }
}

function renderInbox(connections) {
    const list = document.getElementById('connection-list');
    list.innerHTML = '';

    if (!connections || connections.length === 0) {
        list.innerHTML = '<p class="text-center text-muted">No accepted connections yet.</p>';
        return;
    }

    connections.forEach(conn => {
        const el = document.createElement('div');
        el.className = 'connection-item glass';
        el.innerHTML = `
            <div>
                <h3>User ${conn.other_user_id} (${conn.other_user_role})</h3>
                <small>Established</small>
            </div>
            <button class="btn-primary" onclick="openChat(${JSON.stringify(conn).replace(/"/g, '&quot;')})">Chat</button>
        `;
        list.appendChild(el);
    });
}
window.openChat = openChat;

// --- Chat Logic ---
async function openChat(connection) {
    try {
        const res = await fetch(`http://localhost:3000/chat/init/${connection.connection_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, userRole: currentUser.role })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setupChatUI(data.roomKey, connection);
    } catch (err) {
        alert(err.message);
    }
}

function setupChatUI(roomKey, connection) {
    currentRoom = roomKey;
    document.getElementById('chat-title').innerText = `Conversation with ${connection.other_user_role} #${connection.other_user_id}`;
    document.getElementById('public-key-display').innerText = `Your PubKey: ${user.is.pub.substring(0, 12)}...`;

    const msgsDiv = document.getElementById('messages');
    msgsDiv.innerHTML = '';

    // Cleanup previous listener
    if (currentChatListener) {
        gun.get('chats').get(currentRoom).off();
    }

    showView('chat');

    // Subscribe
    currentChatListener = gun.get('chats').get(roomKey).map().on(async (data, id) => {
        if (!data || !data.text) return;

        let decrypted = data.text;
        if (data.text.startsWith('SEA')) {
            try {
                decrypted = await Gun.SEA.decrypt(data.text, roomKey);
            } catch (e) { console.error('Decrypt error', e); }
        }

        addMessageUI(decrypted, data.sender === user.is.pub, data.type, data.info, data.ts);
    });
}

function addMessageUI(text, isSent, type, info, ts) {
    const list = document.getElementById('messages');
    const el = document.createElement('div');
    el.className = `message ${isSent ? 'sent' : 'received'}`;

    const time = new Date(ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let contentHtml = '';

    if (type === 'file') {
        if (info && info.type.startsWith('image/')) {
            contentHtml = `<img src="${text}" style="max-width:200px; border-radius:4px;" /><br><small>${info.name}</small>`;
            if (info.caption) contentHtml += `<br><span>${info.caption}</span>`;
        } else {
            contentHtml = `<a href="${text}" download="${info?.name || 'file'}" style="color:white; text-decoration:none; display:flex; align-items:center;">
                <span style="font-size:24px; margin-right:8px;">📄</span> ${info?.name || 'File'}
            </a>`;
            if (info.caption) contentHtml += `<br><span>${info.caption}</span>`;
        }
    } else {
        contentHtml = `<span>${text}</span>`;
    }

    // Append Meta (Time + Tick)
    el.innerHTML = `
        ${contentHtml}
        <span class="msg-meta">
            ${time}
            ${isSent ? '<span class="tick tick-single"></span>' : ''}
        </span>
    `;

    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
}

// --- Send & Input Logic ---
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

// Toggle Send Button Style
msgInput.addEventListener('input', () => {
    if (msgInput.value.trim().length > 0) {
        sendBtn.classList.add('has-text');
    } else {
        sendBtn.classList.remove('has-text');
    }
});

document.getElementById('send-btn').addEventListener('click', async () => {
    const text = msgInput.value.trim();
    if (!text || !currentRoom) return;

    const encrypted = await Gun.SEA.encrypt(text, currentRoom);

    gun.get('chats').get(currentRoom).set({
        sender: user.is.pub,
        text: encrypted,
        type: 'text',
        ts: Date.now()
    });

    msgInput.value = '';
    sendBtn.classList.remove('has-text');
});

// GMeet Integration
document.getElementById('gmeet-btn').addEventListener('click', () => {
    window.open('https://meet.google.com/new', '_blank');
});

// --- Connections ---
document.getElementById('send-req-btn').addEventListener('click', async () => {
    const targetId = document.getElementById('target-id').value.trim();
    const targetRole = document.getElementById('target-role').value;
    const msg = document.getElementById('connect-msg').value.trim();

    if (!targetId) return alert("Enter Target ID");

    try {
        const res = await fetch('http://localhost:3000/connections/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: currentUser.id,
                sender_role: currentUser.role,
                receiver_id: targetId,
                receiver_role: targetRole,
                message: msg
            })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Request Sent Successfully!');
            document.getElementById('connect-msg').value = '';
            document.getElementById('target-id').value = '';
        } else {
            alert(data.error || "Failed to send request");
        }
    } catch (e) {
        console.error("Request Error:", e);
        alert("Server connection failed. Is the backend running?");
    }
});

async function loadNotifications() {
    try {
        const res = await fetch(`http://localhost:3000/connections/requests/incoming`, {
            headers: { 'x-user-id': currentUser.id }
        });
        const data = await res.json();

        const badge = document.getElementById('notif-badge');
        if (data.length > 0) {
            badge.innerText = data.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        const list = document.getElementById('notif-list');
        list.innerHTML = '';

        data.forEach(req => {
            const div = document.createElement('div');
            div.className = `connection-item glass notif-pending`;
            div.innerHTML = `
                <div>
                    <p><strong>Connection Request by User ID ${req.sender_id}</strong></p>
                    <p>"${req.message}"</p>
                </div>
                <button class="btn-primary" onclick="acceptRequest(${req.id})">Accept</button>
            `;
            list.appendChild(div);
        });
    } catch (err) { }
}

async function acceptRequest(id) {
    try {
        const res = await fetch(`http://localhost:3000/connections/accept/${id}`, {
            method: 'POST',
            headers: { 'x-user-id': currentUser.id }
        });
        if (res.ok) {
            alert('Connected!');
            loadNotifications();
        }
    } catch (e) { }
}
window.acceptRequest = acceptRequest;

function checkNotificationsLoop() {
    setInterval(loadNotifications, 5000);
    loadNotifications();
}

document.getElementById('back-btn').addEventListener('click', () => showView('inbox'));
