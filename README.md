# Portfolio Website

A modern, dark editorial portfolio for video editors, audio engineers, and podcast producers. Built as a static site — no server, no database, fully compatible with **GitHub Pages**.

---

## 🚀 Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `yourusername.github.io` for a root site, or any name for a project site)
2. Upload all files from this folder to the repo
3. Go to **Settings → Pages**
4. Under "Source", select **Deploy from a branch → main → / (root)**
5. Click Save — your site will be live at `https://yourusername.github.io` within a few minutes

---

## ✏️ How to Update Your Content

**Everything is controlled from one file: `data/portfolio.json`**

Open it in any text editor (Notepad, VS Code, etc.) and update the values. No coding knowledge needed.

---

### Your Profile

```json
"profile": {
  "name": "Your Name",
  "tagline": "Video Editor · Audio Engineer · Podcast Producer",
  "location": "Kathmandu, Nepal",
  "bio": "Your bio here...",
  "email": "your@email.com",
  "instagram": "https://instagram.com/yourhandle",
  "youtube": "https://youtube.com/yourchannel"
}
```

---

### Adding a Video Project

Add an object to the `"video"` array inside `"work"`:

```json
{
  "id": "v3",
  "title": "My New Project",
  "client": "Client Name",
  "description": "Short description of the work.",
  "thumbnail": "assets/thumbnails/v3.jpg",
  "type": "youtube",
  "url": "https://youtube.com/watch?v=YOUR_VIDEO_ID",
  "tags": ["Interview", "Corporate"]
}
```

**For `type`:** use `"youtube"` for YouTube links. The site auto-extracts the video ID and embeds it.

**Thumbnails:** Put a JPG image in `assets/thumbnails/` and reference it. If you skip the thumbnail field, a placeholder icon shows instead.

---

### Adding an Audio Sample

Add to the `"audio"` array:

```json
{
  "id": "a3",
  "title": "Mix Title",
  "client": "Client Name",
  "description": "What was done — EQ, compression, mastering etc.",
  "type": "audio",
  "url": "assets/audio/mysample.mp3",
  "duration": "4:22",
  "tags": ["Dialogue", "Mastering"]
}
```

**Audio files:** Put MP3 files in `assets/audio/`. Keep file sizes reasonable for web — 128kbps MP3 is fine for portfolio samples.

---

### Adding a Podcast Episode

Add to the `"podcast"` array. Two options:

**Option A — Spotify/Anchor embed:**
```json
{
  "id": "p3",
  "title": "Episode Title",
  "client": "Show Name",
  "description": "Episode description.",
  "type": "embed",
  "url": "https://open.spotify.com/embed/episode/YOUR_EPISODE_ID",
  "tags": ["Healthcare", "Interview"]
}
```

To get the Spotify embed URL: open the episode in Spotify → click ··· → Share → Embed → copy the `src` URL from the iframe code.

**Option B — Direct MP3:**
```json
{
  "id": "p3",
  "title": "Episode Title",
  "client": "Show Name",
  "description": "Episode description.",
  "type": "audio",
  "url": "assets/audio/episode-clip.mp3",
  "duration": "12:30",
  "tags": ["Podcast"]
}
```

---

### Updating Gear & Software Lists

Simple arrays — just add or remove items:

```json
"gear": [
  "Sony a6700",
  "Sigma 16mm f/1.4",
  "Your new lens here"
],
"software": [
  "DaVinci Resolve",
  "iZotope RX"
]
```

---

## 📬 Setting Up the Contact Form

The form uses **Formspree** (free tier: 50 submissions/month) — no backend needed.

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form — it gives you a form ID like `xpzvwkqr`
3. In `js/main.js`, find this line:
   ```js
   form.action = `https://formspree.io/f/YOUR_FORM_ID`;
   ```
4. Replace `YOUR_FORM_ID` with your actual ID
5. Also update in `index.html`:
   ```html
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```

You'll receive contact form submissions directly to your email.

---

## 📁 File Structure

```
portfolio/
├── index.html              ← Main page (rarely needs editing)
├── css/
│   └── style.css           ← All styles
├── js/
│   └── main.js             ← All functionality
├── data/
│   └── portfolio.json      ← YOUR CONTENT — edit this file
├── assets/
│   ├── thumbnails/         ← Put video thumbnail JPGs here
│   │   └── v1.jpg
│   └── audio/              ← Put MP3 sample files here
│       └── sample1.mp3
├── _config.yml             ← GitHub Pages config
└── README.md               ← This file
```

---

## 💡 Tips

- **Keep audio samples short** — 2–5 minute clips are ideal for portfolio. Full episodes make the site slow to load.
- **Compress thumbnails** — Use [squoosh.app](https://squoosh.app) to compress JPGs before uploading. Aim for under 150KB per thumbnail.
- **Use a custom domain** — In GitHub Pages settings, you can add a custom domain (e.g. `yourname.com`) for free.
- **Update frequently** — GitHub Pages redeploys automatically within ~30 seconds of pushing changes to the repo.

---

## 🎨 Customising the Design

All colours are CSS variables at the top of `css/style.css`:

```css
:root {
  --accent: #d4a853;    /* Gold — change to any colour */
  --bg:     #0a0a08;    /* Main background */
  --text:   #e8e4dc;    /* Main text */
}
```

Change `--accent` to match your personal brand colour.
