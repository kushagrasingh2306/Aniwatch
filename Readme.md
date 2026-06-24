# ⚡ AniWatch — Discover Anime

A premium, visually stunning anime discovery platform built with vanilla HTML, CSS, and JavaScript. Powered by the [Jikan API](https://jikan.moe/) (Unofficial MyAnimeList API), AniWatch lets you browse, search, filter, and track your favorite anime — all in a single page with zero dependencies and zero build tools.

---

## 🖥️ Live Preview

Just open `index.html` in any modern browser. No server, no installation, no build step required.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic markup, accessibility attributes, keyboard navigation |
| **CSS3** | Custom properties, glassmorphism, `backdrop-filter`, CSS Grid, keyframe animations, `@media` responsive queries |
| **Vanilla JavaScript (ES6+)** | Async/await, DOM API, Canvas 2D, `localStorage`, `requestAnimationFrame`, event delegation |
| **Jikan API v4** | Free, RESTful anime data — top anime, seasonal, search, and full anime details including trailers |
| **Google Fonts** | [Outfit](https://fonts.google.com/specimen/Outfit) (body) + [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (data/numbers) |

> **Zero build tools.** No React, no bundler, no Node.js required. Pure client-side code.

---

## ✨ Features

### 🔍 Search & Discovery
- **Real-time debounced search** (400ms) — searches titles, Japanese titles, and synopsis text
- **Keyboard shortcut** — press `/` anywhere to instantly focus the search bar
- **Auto-clear button** — appears when the input has text

### 🎛️ Advanced Filtering
- **Genre chips** — 10 genres (Action, Adventure, Comedy, Drama, Fantasy, Romance, Supernatural, Sci-Fi, Mystery, Psychological) as interactive pill buttons
- **Sort options** — A→Z, Z→A, Top Rated, Most Popular, Newest
- **Type filter** — TV, Movie, OVA, ONA, Special
- **One-click reset** — clears all filters and reloads the current tab

### 📑 Four Navigation Tabs
| Tab | Description |
|---|---|
| 🔥 **Trending** | Currently airing top anime |
| 👑 **Top Rated** | All-time highest scored anime |
| 🌸 **Seasonal** | Auto-detects the current season and year, fetches that season's anime |
| ❤️ **Favorites** | Shows only anime you've favorited (persisted in `localStorage`) |

### 🃏 Anime Cards
- **Staggered entrance animations** with spring-eased card-in effects
- **3/4 aspect ratio posters** with smooth zoom on hover
- **Score badge** (gold star + rating) overlaid on each card
- **Heart favorite button** with heartbeat animation on toggle
- **Type badge** (TV, Movie, etc.) pinned to the bottom of the poster
- **Episode count and year** displayed as metadata with inline SVG icons
- **Genre tags** (up to 3) shown as subtle pills below the title
- **Click-to-open** — clicking any card opens the full detail modal

### 📋 Detail Modal
- **Full poster + info layout** (side-by-side on desktop, stacked on mobile)
- **Color-coded badges** — Score (gold), Episodes (cyan), Year (purple), Type (red), Status (green)
- **Full genre list** with pill tags
- **Stats row** — Members, Ranked, Popularity with formatted numbers (K/M suffix)
- **Complete synopsis**
- **Favorite toggle** — add/remove directly from the modal, synced with card state
- **MyAnimeList link** — opens the anime's MAL page in a new tab
- **Embedded YouTube trailer** — plays directly inside the modal (when available)
- **Close via** ✕ button, clicking outside, or pressing `Escape`

### ❤️ Favorites System
- Toggle favorites from cards or the detail modal
- **Persisted in `localStorage** — survives page reloads and browser restarts
- **Live counter badge** on the Favorites tab
- **Dedicated Favorites tab** shows only your saved anime

### 📊 Live Stats Bar
- **Results count** — how many anime match current filters
- **Average score** — mean rating of visible results
- **Favorites count** — total saved across all sessions

### 🎨 Visual Design
- **Animated gradient mesh background** — slowly shifting radial gradients (no video file needed)
- **Floating particle system** — Canvas 2D particles with connecting lines, adapts to dark/light theme
- **Floating orbs** — three large blurred color orbs with independent float animations
- **Glassmorphism** — frosted glass effects on navbar, cards, filters, search bar, and modals via `backdrop-filter`
- **Animated gradient logo** — multi-color gradient that shifts continuously
- **Pulsing logo glow** — subtle scale and drop-shadow animation
- **Neon glow borders** — cards glow red on hover
- **Skeleton loading** — shimmer placeholder cards while API data loads
- **Triple-ring spinner** — three concentric rings in primary, accent, and cyan
- **Custom scrollbar** — styled to match the dark/light theme
- **Smooth transitions** — cubic-bezier easing on every interactive element

### 🌗 Dark / Light Theme
- **One-click toggle** with smooth CSS variable transitions
- **Theme persistence** — saved to `localStorage`, restores on page load
- **Particle system adapts** — white particles in dark mode, dark particles in light mode
- **All components respond** — cards, badges, modals, scrollbars, backgrounds

### 📱 Fully Responsive
| Breakpoint | Behavior |
|---|---|
| > 1024px | Full modal side-by-side layout, 4–5 card columns |
| 768–1024px | Stacked modal, 3–4 card columns, scrollable nav tabs |
| 480–768px | Compact layout, 2–3 card columns, smaller typography |
| < 480px | Icon-only nav tabs, 2-column grid, hidden genre tags on cards |

### ⌨️ Keyboard Shortcuts
| Key | Action |
|---|---|
| `/` | Focus search bar |
| `Escape` | Close modal or blur search |
| `Enter` | Execute search |

### 📦 Load More
- Paginated display — 12 cards per batch
- **"Load More" button** with gradient sweep hover animation
- Appears only when more results are available

### ⬆️ Scroll to Top
- Floating glass button appears after scrolling 500px
- Smooth scroll to top with hover glow effect

---

## 📁 Project Structure

```
aniwatch/
├── index.html      ← Main HTML structure (semantic, accessible)
├── style.css       ← Complete design system (900+ lines)
└── index.js        ← Application logic (500+ lines)
```

No configuration files, no `package.json`, no `node_modules`. Copy the folder and it works.

---

## 🚀 Getting Started

1. **Clone or download** the three files into a folder
2. **Open `index.html`** in Chrome, Firefox, Safari, or Edge
3. That's it. Start browsing anime!

> **Note:** The Jikan API has a rate limit of ~3 requests/second. If you see loading errors, wait a moment and try again.

---

## 🎯 API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /v4/top/anime` | Fetch top-rated or currently airing anime |
| `GET /v4/seasons/{year}/{season}` | Fetch seasonal anime (auto-detected) |
| `GET /v4/anime?q={query}` | Search anime by keyword |
| Response data includes | Title, poster, score, episodes, genres, year, type, status, members, rank, popularity, synopsis, trailer URL, and MAL link |

---

## 🌐 Browser Compatibility

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

Requires `backdrop-filter` support (all modern browsers).

---

## 📄 License

This project is open source and free to use. The anime data is provided by the [Jikan API](https://jikan.moe/) under its own terms of service.

---

Built with ❤️ using nothing but HTML, CSS, and JavaScript.