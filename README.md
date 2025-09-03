# Pratham Codes — Static Portfolio (Vanilla HTML/CSS/JS)

This repo contains a modern, accessible, and responsive static portfolio for **Pratham Codes**. It's built with **vanilla HTML, CSS, and JavaScript** (no frameworks). Replace placeholder images and links with your content.

## Files
- `index.html` — Home / Hero / Featured projects preview
- `projects.html` — Full projects list with client-side filters and search
- `chess.html` — Chess gallery + timeline + lightbox
- `contact.html` — Contact cards + contact form (frontend-only, placeholder)
- `style.css` — Single stylesheet (theme variables at the top)
- `script.js` — All interactive behaviors (menu, typing, tilt, lightbox, toast, filters)
- `assets/` — Place project & profile images here (placeholder paths used in HTML)

## How to run
1. Clone / download the files.
2. Place your images in `assets/` as:
   - `assets/profile.jpg`
   - `assets/projects/project1.jpg`, `project2.jpg`, ...
   - `assets/chess/chess1.jpg`, `chess2.jpg`, ...
3. Open `index.html` in any modern browser.

_No build step required — static files only._

## Customize
### Colors
Open `style.css` and edit the CSS variables at the top (accent, background, etc.):
```css
:root {
  --accent: #f0c330; /* change this to your accent color */
  --bg: #121212;
}
