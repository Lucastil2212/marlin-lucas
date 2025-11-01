# Deployment Guide

## Recommended Hosting Options

### 🚀 **Option 1: Render.com (RECOMMENDED - Easiest)**
1. Sign up at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or push your code to GitHub first)
4. Configure:
   - **Name**: `marlin-lucas-music`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: Leave default (Render sets PORT automatically)
5. Add Environment Variables:
   - `TO_EMAIL` = lucastil622@gmail.com`
   - `TWITTER_URL = https://x.com/VPP_KING`
6. Click "Create Web Service"
7. Your site will be live at: `https://marlin-lucas-music.onrender.com`

**Free Tier**: 750 hours/month, auto-sleeps after 15 min inactivity (wakes on request)

---

### ⚡ **Option 2: Vercel (Best Performance)**
1. Sign up at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. In your project directory, run: `vercel`
4. Follow the prompts
5. Add environment variables in Vercel dashboard:
   - `TO_EMAIL = lucastil622@gmail.com`
   - `TWITTER_URL = https://x.com/VPP_KING`
   - `PORT = 3000` (optional)

**Note**: Vercel uses serverless functions. You may need to adapt your Express routes slightly.

---

### 🚂 **Option 3: Railway (Simple & Reliable)**
1. Sign up at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your repository
4. Railway auto-detects Node.js
5. Add environment variables:
   - `TO_EMAIL = lucastil622@gmail.com`
   - `TWITTER_URL = https://x.com/VPP_KING`
6. Deploy!

**Free Tier**: $5/month credit (plenty for this app)

---

### 🌐 **Option 4: Fly.io (Good Alternative)**
1. Sign up at [fly.io](https://fly.io)
2. Install flyctl: `curl -L https://fly.io/install.sh | sh`
3. Run: `fly launch`
4. Follow prompts
5. Set secrets:
   ```bash
   fly secrets set TO_EMAIL=lucastil622@gmail.com
   fly secrets set TWITTER_URL=https://x.com/VPP_KING
   ```
6. Deploy: `fly deploy`

---

## Environment Variables Needed

Make sure to set these in your hosting platform:

```
TO_EMAIL=lucastil622@gmail.com
TWITTER_URL=https://x.com/VPP_KING
PORT=3000 (usually auto-set by host)
```

---

## Pre-Deployment Checklist

- [ ] All `.wav` files are in the `chingon-full-album/` directory
- [ ] `node_modules/` is in `.gitignore` (already done)
- [ ] `.env` is in `.gitignore` (already done)
- [ ] Test locally: `npm start` and visit `http://localhost:3000`
- [ ] Push code to GitHub (recommended)

---

## Quick Start Commands

```bash
# Test locally first
npm install
npm start

# Visit http://localhost:3000
```

---

## Recommended: Render.com

**Why Render?**
- ✅ Free tier with auto-scaling
- ✅ Easy deployment from GitHub
- ✅ Supports Express.js perfectly
- ✅ Simple environment variable setup
- ✅ Custom domain support (free)
- ✅ Automatic HTTPS

**Deployment Time**: ~5 minutes

---

## Custom Domain Setup (Optional)

After deployment:
1. Get your hosting URL (e.g., `https://marlin-lucas-music.onrender.com`)
2. Add custom domain in hosting dashboard
3. Update DNS records:
   - Add CNAME: `www` → `your-app.onrender.com`
   - Add A record: `@` → (IP provided by host)

---

## Notes

- Large WAV files may require a service with good bandwidth (Render/Railway work well)
- The app auto-serves from the root directory, so no special config needed
- Email subscriptions are logged to console (you can add email service later)
- Twitter link should be updated in your HTML if you want it in the UI

