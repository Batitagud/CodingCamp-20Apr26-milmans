---
inclusion: always
---

# Dashboard Project — Kiro Steering

## Project Overview
A vanilla JS personal dashboard (no frameworks, no backend).

## Tech Stack
- HTML / CSS / Vanilla JavaScript only
- Browser LocalStorage for all persistence
- No build tools, no npm, no dependencies

## Folder Rules
- Only **1 CSS file**: `css/style.css`
- Only **1 JS file**: `js/app.js`
- Entry point: `index.html`

## Code Style
- Use `const` / `let`, never `var`
- Keep functions small and focused
- Comment major sections with `/* ══ SECTION ══ */` banners
- No external libraries or CDN imports

## Features
- Greeting with live clock (updates every second)
- Custom user name stored in localStorage key `userName`
- Light/dark theme stored in localStorage key `theme`
- Focus timer — duration stored in localStorage key `pomodoroDuration`
- To-do list stored in localStorage key `todos` (array of `{ text, done }`)
- Quick links stored in localStorage key `quickLinks` (array of `{ label, url }`)

## Do Not
- Add a backend or any server-side code
- Add test files or test frameworks
- Create additional CSS or JS files
- Use React, Vue, or any other framework
