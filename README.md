# St. Louis Ambush — PWA

The official fan app for the St. Louis Ambush, built as a Progressive Web App. Installable to your home screen, works offline, ships to GitHub Pages for free.

This README walks you through the full setup from zero to "the app is running on my phone." Read it top-to-bottom; don't skip steps.

---

## Part 1 — One-time setup (only do this once, ever)

### 1.1 Make sure Node.js is installed

Open Terminal (Mac: ⌘+Space, type "Terminal", hit Enter).

Run this command:

```bash
node --version
```

**If you see something like `v18.x.x` or `v20.x.x` or higher**, you're set. Skip to step 1.2.

**If you see `command not found` or a version below 18**, install Node:

1. Go to https://nodejs.org
2. Download the **LTS** version (the green button on the left)
3. Open the downloaded `.pkg` file and follow the installer
4. Close and reopen Terminal
5. Run `node --version` again — you should now see a version number

### 1.2 Make sure Git is installed

```bash
git --version
```

Mac usually has Git pre-installed. If not, you'll be prompted to install Xcode Command Line Tools — just click "Install" and wait.

### 1.3 Make sure you have a GitHub account

If you don't already have one, go to https://github.com and sign up. You said your portfolio is at `dyllanleehaggard.github.io`, so you should already have an account. Sign in.

---

## Part 2 — Get the project running locally

### 2.1 Unzip the project

You should have a folder called `stl-ambush` somewhere on your computer (probably Downloads). Move it to wherever you keep code projects. For example:

```bash
mv ~/Downloads/stl-ambush ~/Documents/
```

### 2.2 Open the project in Terminal

```bash
cd ~/Documents/stl-ambush
```

(Adjust the path if you put it somewhere else.)

You should now be inside the project. Run `ls` and you should see files like `package.json`, `vite.config.js`, `index.html`, etc.

### 2.3 Install dependencies

This downloads all the libraries the app needs (React, Vite, Tailwind, etc.). It only needs to happen once.

```bash
npm install
```

This takes 1–3 minutes. You'll see a lot of output; that's normal. When it's done, you'll see something like `added 200 packages` and a final progress bar.

If you see any **red errors**, don't panic — copy them and we'll work through them. **Yellow warnings are fine**, ignore those.

### 2.4 Run the app locally

```bash
npm run dev
```

You'll see output like:

```
  VITE v5.x.x  ready in 432 ms

  ➜  Local:   http://localhost:5173/stl-ambush/
  ➜  press h + enter to show help
```

Open that `http://localhost:5173/stl-ambush/` URL in your browser. The Ambush app should load — same as what you saw in the Claude prototype.

**To stop the server**: go back to Terminal and press `Ctrl+C`.

---

## Part 3 — Push to GitHub and go live

### 3.1 Create the repository on GitHub

1. Go to https://github.com/new
2. Repository name: **`stl-ambush`** (must be exactly this — it matters for deploy paths)
3. Description: "Fan app for the St. Louis Ambush"
4. Visibility: **Public** (required for free GitHub Pages)
5. **Do NOT** check "Add a README", "Add .gitignore", or "Add a license" — we already have those
6. Click **"Create repository"**

You'll land on a page with setup instructions. Keep that tab open — you'll need the URL it shows.

### 3.2 Initialize Git in the project

Back in Terminal, in the `stl-ambush` directory:

```bash
git init
git add .
git commit -m "Initial commit: Ambush PWA"
git branch -M main
```

### 3.3 Connect the local project to your GitHub repo

Replace `YOUR_USERNAME` with your actual GitHub username (probably `dyllanleehaggard` based on your portfolio URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/stl-ambush.git
git push -u origin main
```

You may be prompted to log in. If your GitHub asks for a password, it actually wants a **Personal Access Token**, not your password. If that's the case:

1. Go to https://github.com/settings/tokens/new
2. Give it a name like "Ambush deploy"
3. Expiration: 90 days (or longer)
4. Check the **`repo`** scope (top checkbox)
5. Scroll down, click **"Generate token"**
6. **Copy the token immediately** — you won't see it again
7. Paste it as the password in Terminal

### 3.4 Enable GitHub Pages

1. Go to your repo: `https://github.com/YOUR_USERNAME/stl-ambush`
2. Click **Settings** (top right tab)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment" → "Source", select **"GitHub Actions"**

That's it. The deploy workflow we shipped will fire automatically. You don't need to upload anything else.

### 3.5 Watch it deploy

1. Click the **Actions** tab on your repo
2. You'll see a workflow run named "Deploy to GitHub Pages" — it should be running (yellow circle) or queued
3. Click on it to watch the build progress
4. Wait 1–3 minutes for both the **build** and **deploy** jobs to show green checkmarks ✅

### 3.6 Visit your live URL

Once deploy is green, your app is live at:

**`https://YOUR_USERNAME.github.io/stl-ambush/`**

(Again, replace `YOUR_USERNAME` with yours.)

---

## Part 4 — Install the app on your phone

This is the moment of truth. The PWA install flow is slightly different by platform.

### iPhone (Safari)

1. Open the URL in **Safari** (must be Safari, not Chrome on iOS)
2. Tap the **Share** icon (the box with an arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Confirm the name (default is "Ambush") and tap **"Add"**

The app icon appears on your home screen. Tapping it launches the app full-screen with no browser chrome.

### Android (Chrome)

1. Open the URL in Chrome
2. You may see an install banner at the bottom — tap **"Install"**
3. If you don't see the banner, tap the **three-dot menu** in Chrome's top right
4. Tap **"Install app"** or **"Add to Home screen"**

---

## Part 5 — Making changes

Whenever you want to update the app:

1. Edit files in the `src` folder (mainly `src/AmbushApp.jsx`)
2. Run `npm run dev` to preview locally
3. When happy, push:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

GitHub Actions will auto-rebuild and re-deploy. New version is live in 1–3 minutes. Users with the app already installed will get the update next time they open it (no reinstall needed — that's PWA magic).

---

## Troubleshooting

**`npm install` fails with permission errors**
Run `sudo npm install -g npm` first to update npm itself, then try again.

**Local preview shows a blank white page**
Open the browser's developer console (right-click → Inspect → Console). Copy any red errors and share them.

**GitHub Action fails on the build step**
Click into the failed run, expand the failed step, and look for the actual error message. Most common cause: a typo in `vite.config.js` or a missing dependency.

**Deployed URL shows 404**
The `base` path in `vite.config.js` must exactly match your repo name. If you renamed the repo from `stl-ambush` to something else, update `base: '/stl-ambush/'` to `base: '/your-new-name/'` in `vite.config.js`.

**Site loads but is unstyled (no colors, broken layout)**
Tailwind didn't compile. Run `npm install` again to make sure `tailwindcss`, `postcss`, and `autoprefixer` are present.

---

## What's in this project

```
stl-ambush/
├── .github/workflows/deploy.yml    GitHub Actions auto-deploy config
├── public/                         Static assets (icons, favicon)
├── src/
│   ├── AmbushApp.jsx               The full app (5 tabs + player profiles)
│   ├── main.jsx                    React entry point
│   └── index.css                   Tailwind imports
├── index.html                      HTML shell
├── package.json                    Dependencies
├── vite.config.js                  Build + PWA config
├── tailwind.config.js              Tailwind config
└── postcss.config.js               PostCSS config
```

---

## What's next

Once this is live, the next workstream is **wiring up real Ambush data** — scraping schedule, roster, and news from `stlambush.com` and feeding it into the app instead of the placeholder data. That's the next conversation.
