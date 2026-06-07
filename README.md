# Engineers Without Borders — Cornell University

The official website of the **Engineers Without Borders (EWB) Cornell University** chapter — an active chapter of EWB-USA, a 501(c)(3) nonprofit, since 2009.

The site showcases the chapter's five subteams (International, Domestic, Digital Agriculture, Software, and Business), its field projects in Bolivia, Tanzania, Austin, Pine Ridge, and Sub-Saharan Africa, and the sponsorship program that funds the work.

🔗 **Repository:** https://github.com/m3dh4n5h/ewb-cornell

---

## Tech Stack

This is a **static website** — plain HTML, CSS, and JavaScript with no build step, framework, or dependencies to install.

| Layer | Details |
|-------|---------|
| Markup | Hand-written HTML5 (`index.html` + `pages/`) |
| Styling | `css/style.css` (base), `css/home.css` (homepage), `css/pages.css` (inner pages) |
| Behavior | `js/script.js` (shared), `js/home.js` (homepage), `js/pages.js` (inner pages) |
| Fonts/Icons | Google Fonts (Work Sans + JetBrains Mono) and Tabler Icons, loaded via CDN |
| Theme | Light/dark toggle, saved to `localStorage` |

Because everything is static, the site can be hosted on any static host (GitHub Pages, Netlify, Vercel, or a plain web server).

---

## Project Structure

```
ewb-cornell/
├── index.html          # Homepage
├── pages/              # About, Teams, Projects, Gallery, Sponsors, Apply, + detail pages
├── css/                # style.css, home.css, pages.css
├── js/                 # script.js, home.js, pages.js
├── assets/img/         # Photos and the chapter logo
└── README.md
```

---

## Viewing the Website Locally

First, get the code onto your computer. You can either **download a ZIP** or **clone with Git** — instructions for both, on macOS and Windows, are below.

### Option A — Download the ZIP (no tools required)

1. Open https://github.com/m3dh4n5h/ewb-cornell in your browser.
2. Click the green **`< > Code`** button, then **Download ZIP**.
3. Unzip the downloaded file:
   - **macOS:** double-click the `.zip` in Finder.
   - **Windows:** right-click the `.zip` → **Extract All…**

### Option B — Clone with Git

> Requires Git. Get it from https://git-scm.com/downloads (or, on macOS, run `git --version` once to trigger the Xcode Command Line Tools installer).

```bash
git clone https://github.com/m3dh4n5h/ewb-cornell.git
cd ewb-cornell
```

---

### Running the Site

The site uses root-relative links (e.g. `/pages/about.html`), so for everything to work correctly you should serve it from a **local web server** rather than opening the files directly. The quickest way is Python's built-in server, which ships with macOS and is a one-click install on Windows.

#### macOS

macOS includes Python 3. In Terminal:

```bash
cd path/to/ewb-cornell      # the folder you cloned or unzipped
python3 -m http.server 3456
```

Then open **http://localhost:3456** in your browser. Press `Control + C` in Terminal to stop the server.

#### Windows

1. Install Python from https://www.python.org/downloads/ (during setup, tick **"Add Python to PATH"**).
2. Open **Command Prompt** or **PowerShell**:

```powershell
cd path\to\ewb-cornell      # the folder you cloned or unzipped
python -m http.server 3456
```

Then open **http://localhost:3456** in your browser. Press `Ctrl + C` to stop the server.

> **Don't have Python?** You can also use any static server, e.g. Node's `npx serve` (`npx serve -l 3456`) or the **Live Server** extension in VS Code (right-click `index.html` → *Open with Live Server*).

#### Quick look (no server)

You can double-click `index.html` to open it directly in a browser. Most pages render, but some root-relative links and assets may not resolve — using a local server (above) is recommended.

---

## Editing

There is no build step. Edit the HTML, CSS, or JS files directly and refresh the browser to see changes.

- Asset links use a `?v=NN` cache-busting suffix (e.g. `style.css?v=12`). When you change a CSS or JS file, bump that number so browsers load the new version.
- The theme defaults to light; the toggle in the navigation switches to dark and remembers the choice.

---

## Deployment

Any static host works. For **GitHub Pages**: push to `main`, then in the repository go to **Settings → Pages**, set the source to the `main` branch (root), and save. The site will be served from the provided `github.io` URL.

---

## Contact

**Engineers Without Borders at Cornell University**
📧 ewb@cornell.edu
📍 Cornell University, Ithaca, NY 14853

---

© 2026 Engineers Without Borders at Cornell University.
