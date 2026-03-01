# Deployment Guide

## Quick Deploy (All Free)

### Step 1: Database - MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create account → Create Free Cluster
3. Create database user (username/password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xyz123.mongodb.net/tutorDB
   ```

### Step 2: Backend - Render (Free)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → Sign in with GitHub
3. New Web Service → Connect your GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `node server/server.js`
5. Environment Variables:
   - `MONGO_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: any random string (e.g., `your-secret-key-123`)
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
6. Deploy (takes 2-5 mins)

### Step 3: Frontend - Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. New Project → Import your GitHub repo
3. Settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: your Render backend URL (e.g., `https://your-app.onrender.com`)
5. Deploy

### Step 4: Update CORS
After deploying, add your Vercel URL to Render env vars:
- `CLIENT_URL`: `https://your-project.vercel.app`

---

## Alternative: Single Deploy (Render only)
Deploy both frontend and backend on Render:
- Build frontend: `cd client && npm install && npm run build`
- Serve frontend from backend (already configured in server.js)
