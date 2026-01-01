
This assumes:

* Docker + Docker Compose installed
* Your images are on Docker Hub under `anirudhc2402`
* Data is restored from backups (Postgres SQL + Neo4j volumes)

---

# 🚀 StartupForge – Full Local Setup (Docker)

This repository contains instructions to run the **StartupForge backend stack** locally using Docker.

---

## 🧰 Prerequisites

Install the following:

* **Docker Desktop**
  [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
* **Docker Compose** (comes with Docker Desktop)

Verify:

```bash
docker --version
docker compose version
```

---

## 📦 Docker Images Used

* PostgreSQL
  `anirudhc2402/startupforge-postgres:base`
* Neo4j
  `anirudhc2402/startupforge-neo4j:base`

---

## 📁 Folder Structure (recommended)

```
startupforge/
├── docker-compose.yml
├── backups/
│   ├── startupforge_db.sql
│   ├── neo4j_volume1.tar.gz
│   └── neo4j_volume2.tar.gz
└── README.md
```

---

## 🧩 Step 1: Create `docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: anirudhc2402/startupforge-postgres:base
    container_name: startupforge-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: startupforge_db
    volumes:
      - pgdata:/var/lib/postgresql/data

  neo4j:
    image: anirudhc2402/startupforge-neo4j:base
    container_name: startupforge-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/password
    volumes:
      - neo4j_volume1:/data
      - neo4j_volume2:/logs

volumes:
  pgdata:
  neo4j_volume1:
  neo4j_volume2:
```

---

## ▶️ Step 2: Start Containers

From the project root:

```bash
docker compose up -d
```

Check status:

```bash
docker ps
```

---

## 🐘 Step 3: Restore PostgreSQL Data

Make sure `startupforge_db.sql` is inside `backups/`.

### Linux / macOS

```bash
docker exec -i startupforge-postgres psql -U postgres -d startupforge_db < backups/startupforge_db.sql
```

### Windows (PowerShell)

```powershell
Get-Content backups\startupforge_db.sql | docker exec -i startupforge-postgres psql -U postgres -d startupforge_db
```

Verify:

```bash
docker exec -it startupforge-postgres psql -U postgres -d startupforge_db -c "\dt"
```

---

## 🧠 Step 4: Restore Neo4j Data (Volumes)

### Stop Neo4j first

```bash
docker stop startupforge-neo4j
```

### Restore volume 1

```bash
docker run --rm \
  -v neo4j_volume1:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/neo4j_volume1.tar.gz -C /
```

### Restore volume 2

```bash
docker run --rm \
  -v neo4j_volume2:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/neo4j_volume2.tar.gz -C /
```

### Start Neo4j again

```bash
docker start startupforge-neo4j
```

---

## 🌐 Step 5: Access Services

### PostgreSQL

* Host: `localhost`
* Port: `5432`
* User: `postgres`
* Password: `postgres`
* Database: `startupforge_db`

### Neo4j Browser

* URL: [http://localhost:7474](http://localhost:7474)
* Username: `neo4j`
* Password: `password`

---

## 🛑 Stop Everything

```bash
docker compose down
```

(Data remains safe in volumes)

---

## 🧠 Notes

* Docker images contain **runtime only**
* All **data is restored via backups**
* This setup is safe to run on any machine
* Containers are disposable, data is not

---

## ✅ One-Command Summary (after setup)

```bash
docker compose up -d
```

---

## 📌 Maintained by

**Anirudh C**
StartupForge Project

---

If you want, next I can:

* Convert this into a **single setup script**
* Add backend + frontend containers
* Optimize Neo4j → PostgreSQL graph migration
* Make an evaluator-friendly version

Just tell me.
