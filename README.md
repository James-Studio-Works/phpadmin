# phpadmin

A clean, modern pastebin-style website. Paste anything and get a unique link to review it anytime.

**Features**
- Create pastes with optional title + language
- Unique short URLs (`/p/xxxxx`)
- Syntax highlighting
- Recent pastes list
- Copy content / link buttons
- Dark, beautiful UI
- No accounts required

## Live Demo

After deploying to Render you will get a live URL like:  
`https://phpadmin-xxxx.onrender.com`

## Deploy to Render (Free)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) and sign in (or create a free account).
2. Click **New +** → **Web Service**.
3. Connect the GitHub repo: `James-Studio-Works/phpadmin`
4. Settings:
   - **Name**: `phpadmin` (or anything)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click **Create Web Service**.

Render will build and deploy. After a couple of minutes you’ll get a live public URL.

> **Note on free tier**: The filesystem is ephemeral. Pastes are stored in a local JSON file and will be lost when the service restarts or sleeps. For permanent storage you can later add a free Postgres (Neon, Supabase, Render Postgres) and update the storage layer.

## Local Development

```bash
git clone https://github.com/James-Studio-Works/phpadmin.git
cd phpadmin
npm install
npm start
```

Open http://localhost:3000

## Tech Stack

- Node.js + Express
- Vanilla HTML/JS + Tailwind CSS (CDN)
- Highlight.js for syntax
- nanoid for short IDs

## License

MIT
