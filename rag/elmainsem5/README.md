# Secure Decentralized Chat

Using Node.js, gun.js, and PostgreSQL to create a secure, peer-to-peer chat system where the backend acts only as a permission gatekeeper.

## Quick Start

### 1. Database (Postgres)
Ensure the Docker container is running:
```powershell
docker start startupforge-postgres
```

### 2. Backend API
Acts as the permission gatekeeper (Port 3000).
```powershell
cd backend
npm install
node server.js
```

### 3. Gun.js Relay Server
Handles decentralized message storage (Port 8765).
```powershell
cd gun_server
npm install
node gun.js
```

### 4. Frontend Client
Simple UI to test the chat (Port 8001).
```powershell
npx http-server frontend -p 8001
```

### 5. Use the App
1. Open [http://localhost:8001](http://localhost:8001) in your browser.
2. Enter **Connection ID: 1** (This connection is pre-seeded as ACCEPTED in the DB).
3. Click **Initialize Chat**.
4. Start chatting!

## Architecture
- **Postgres**: Stores `connection_requests` and `chat_rooms` (room keys).
- **Backend**: Checks `status='ACCEPTED'` before issuing a room key.
- **Gun.js**: Stores the actual encrypted chat messages in a graph structure.
