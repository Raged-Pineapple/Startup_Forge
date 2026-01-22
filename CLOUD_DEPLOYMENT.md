# ☁️ Cloud Deployment Guide (Public Link)
<!-- Trigger Deployment -->

To get a link that anyone can open, you need to host your application on the cloud. We will use **Render** for the backends/database and **Vercel** for the frontend.

## Prerequisites
1.  **GitHub Account**: Your code must be pushed to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

---

## Part 1: Deploy Backends & Database (Render)

We have created a `render.yaml` file that automates this.

1.  **Push your code** to GitHub.
2.  Log in to **Render dashboard**.
3.  Click **"New +"** -> **"Blueprint"**.
4.  Connect your GitHub repository.
5.  Render will detect the `render.yaml` file.
6.  Click **"Apply"**.
7.  **Important**: It will ask for `MISTRAL_API_KEY`. Enter your key there.

Render will now deploy:
*   PostgreSQL Database
*   Node.js Backend
*   RAG AI Backend
*   Prediction Backend
*   Gun Relay Server

Once finished, copy the URL for the **Node.js Backend** (e.g., `https://startupforge-backend.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploy Frontend (Vercel)

1.  Log in to **Vercel**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Select "Vite".
5.  **Root Directory**: Click "Edit" and select `frontend`.
6.  **Environment Variables**:
    Add the following variable so your frontend knows where the backend is:
    *   **Name**: `VITE_API_URL`
    *   **Value**: Your Render Backend URL (e.g., `https://startupforge-backend.onrender.com`) - *Do not include the trailing slash*.

7.  Click **"Deploy"**.

---

## 🎉 Success!

Vercel will give you a public domain (e.g., `https://startup-forge.vercel.app`).
**Share this link with anyone!**

### Troubleshooting
*   **Database Data**: The cloud database starts empty. You will need to run your seed scripts or manually add data.
*   **Cold Starts**: On the free tier, services spin down after inactivity. The first request might take 30-50 seconds.
