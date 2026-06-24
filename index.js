/* ============================================
   AniWatch — Premium Anime Discovery Platform
   Enhanced JavaScript Engine
   ============================================ */

// ========== DOM Elements ==========
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const genreChips = document.getElementById("genreChips");
const sortSelect = document.getElementById("sortSelect");
const typeSelect = document.getElementById("typeSelect");
const themeToggle = document.getElementById("themeToggle");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const clearSearchBtn = document.getElementById("clearSearch");
const resetFiltersBtn = document.getElementById("resetFilters");
const loader = document.getElementById("loader");
const noResults = document.getElementById("noResults");
const emptyFavs = document.getElementById("emptyFavs");
const detailModal = document.getElementById("detailModal");
const modalClose = document.getElementById("modalClose");
const favCountEl = document.getElementById("favCount");
const statsBar = document.getElementById("statsBar");

// ========== State ==========
let masterList = [];
let filteredList = [];
let visibleCount = 12;
let currentTab = "trending";
let currentGenre = "";
let favorites = JSON.parse(localStorage.getItem("aniwatch_favs")) || [];
let searchDebounce = null;

// ========== Particle Background ==========
function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    const PARTICLE_COUNT = 50;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            const isLight = document.documentElement.getAttribute("data-theme") === "light";
            const color = isLight ? `rgba(0,0,0,${this.opacity * 0.5})` : `rgba(255,255,255,${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const lineColor = isLight ? "0,0,0" : "255,255,255";
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${lineColor},${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    }
    animate();
}

// ========== API Fetch ==========
async function fetchAnime(endpoint, params = "") {
    showLoader();
    noResults.style.display = "none";
    emptyFavs.style.display = "none";

    try {
        const res = await fetch(`https://api.jikan.moe/v4/${endpoint}${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        masterList = data.data || [];
        applyAllControls();
    } catch (error) {
        console.error("Error fetching data:", error);
        hideLoader();
        results.innerHTML = "";
        noResults.querySelector("h3").textContent = "Failed to load data";
        noResults.querySelector("p").textContent = "Please check your connection and try again.";
        noResults.style.display = "flex";
    }
}

// ========== Filtering & Sorting ==========
function applyAllControls() {
    const query = searchInput.value.toLowerCase().trim();
    let processed = masterList.filter(anime =>
        anime.title.toLowerCase().includes(query) ||
        anime.title_japanese?.toLowerCase().includes(query) ||
        (anime.synopsis && anime.synopsis.toLowerCase().includes(query))
    );

    if (currentGenre) {
        processed = processed.filter(anime =>
            anime.genres.some(g => g.mal_id == currentGenre)
        );
    }

    const typeVal = typeSelect.value;
    if (typeVal) {
        processed = processed.filter(anime => anime.type?.toLowerCase() === typeVal);
    }

    const sortVal = sortSelect.value;
    processed.sort((a, b) => {
        if (sortVal === "az") return a.title.localeCompare(b.title);
        if (sortVal === "za") return b.title.localeCompare(a.title);
        if (sortVal === "score") return (b.score || 0) - (a.score || 0);
        if (sortVal === "popular") return (b.members || 0) - (a.members || 0);
        if (sortVal === "newest") return (b.year || 0) - (a.year || 0);
        return 0;
    });

    filteredList = processed;
    visibleCount = 12;
    hideLoader();
    render();
    updateStats();
}

// ========== Render ==========
function render() {
    results.innerHTML = "";

    if (currentTab === "favorites") {
        renderFavorites();
        return;
    }

    if (filteredList.length === 0) {
        noResults.style.display = "flex";
        viewMoreBtn.style.display = "none";
        return;
    }

    noResults.style.display = "none";
    const toDisplay = filteredList.slice(0, visibleCount);
    toDisplay.forEach(anime => results.appendChild(createCard(anime)));
    viewMoreBtn.style.display = (visibleCount < filteredList.length) ? "flex" : "none";
}

function renderFavorites() {
    if (favorites.length === 0) {
        emptyFavs.style.display = "flex";
        viewMoreBtn.style.display = "none";
        updateStats();
        return;
    }
    emptyFavs.style.display = "none";

    const favAnime = masterList.filter(a => favorites.includes(a.mal_id));
    const toDisplay = favAnime.slice(0, visibleCount);
    toDisplay.forEach(anime => results.appendChild(createCard(anime)));
    viewMoreBtn.style.display = (visibleCount < favAnime.length) ? "flex" : "none";
    updateStats();
}

// ========== Card Creation ==========
function createCard(anime) {
    const isFav = favorites.includes(anime.mal_id);
    const card = document.createElement("div");
    card.classList.add("card");

    const score = anime.score ? anime.score.toFixed(1) : "N/A";
    const episodes = anime.episodes ? `${anime.episodes} eps` : "Unknown";
    const type = anime.type || "Unknown";
    const year = anime.year || anime.aired?.prop?.from?.year || "?";
    const genres = (anime.genres || []).slice(0, 3);
    const genreTags = genres.map(g => `<span class="genre-tag">${g.name}</span>`).join("");

    card.innerHTML = `
        <div class="card-image-wrap">
            <img src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''}" 
                 alt="${anime.title}" loading="lazy">
            <span class="card-score">
                <span class="star">★</span> ${score}
            </span>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${anime.mal_id}" title="Toggle favorite">
                ${isFav ? '❤️' : '🤍'}
            </button>
            <span class="card-type-badge">${type}</span>
        </div>
        <div class="card-body">
            <h3>${anime.title}</h3>
            <div class="card-meta">
                <span class="card-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z"/></svg>
                    ${episodes}
                </span>
                <span class="card-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    ${year}
                </span>
            </div>
            <div class="card-genres">${genreTags}</div>
        </div>
    `;

    const favBtn = card.querySelector(".card-fav-btn");
    favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(anime.mal_id, favBtn);
    });

    card.addEventListener("click", (e) => {
        if (e.target.closest(".card-fav-btn")) return;
        openDetailModal(anime);
    });

    return card;
}

// ========== Favorites ==========
function toggleFavorite(id, btn) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        if (btn) {
            btn.textContent = "🤍";
            btn.classList.remove("active");
        }
    } else {
        favorites.push(id);
        if (btn) {
            btn.textContent = "❤️";
            btn.classList.add("active");
        }
    }
    localStorage.setItem("aniwatch_favs", JSON.stringify(favorites));
    updateFavCount();
    updateStats();
}

function updateFavCount() {
    favCountEl.textContent = favorites.length;
    favCountEl.style.display = favorites.length > 0 ? "flex" : "none";
}

// ========== Stats ==========
function updateStats() {
    const list = currentTab === "favorites"
        ? masterList.filter(a => favorites.includes(a.mal_id))
        : filteredList;

    document.getElementById("statTotal").textContent = list.length.toLocaleString();

    const scored = list.filter(a => a.score);
    const avg = scored.length
        ? (scored.reduce((s, a) => s + a.score, 0) / scored.length).toFixed(1)
        : "0";
    document.getElementById("statAvgScore").textContent = avg;

    document.getElementById("statFavs").textContent = favorites.length.toLocaleString();
}

// ========== Detail Modal ==========
function openDetailModal(anime) {
    const isFav = favorites.includes(anime.mal_id);

    document.getElementById("modalImage").src = anime.images?.jpg?.large_image_url || "";
    document.getElementById("modalTitle").textContent = anime.title;
    document.getElementById("modalScore").textContent = anime.score ? `★ ${anime.score}` : "N/A";
    document.getElementById("modalEpisodes").textContent = anime.episodes ? `${anime.episodes} Episodes` : "Unknown Eps";
    document.getElementById("modalYear").textContent = anime.year || anime.aired?.prop?.from?.year || "Unknown";
    document.getElementById("modalType").textContent = anime.type || "Unknown";
    document.getElementById("modalStatus").textContent = anime.status || "Unknown";

    const genresEl = document.getElementById("modalGenres");
    genresEl.innerHTML = (anime.genres || []).map(g =>
        `<span class="genre-tag">${g.name}</span>`
    ).join("");

    document.getElementById("modalMembers").textContent = formatNumber(anime.members || 0);
    document.getElementById("modalRanked").textContent = anime.rank ? `#${anime.rank}` : "N/A";
    document.getElementById("modalPopularity").textContent = anime.popularity ? `#${anime.popularity}` : "N/A";

    document.getElementById("modalSynopsis").textContent =
        anime.synopsis || "No synopsis available for this anime.";

    const modalFavBtn = document.getElementById("modalFavBtn");
    const modalFavIcon = document.getElementById("modalFavIcon");
    const modalFavText = document.getElementById("modalFavText");
    modalFavBtn.className = `modal-fav-btn ${isFav ? 'active' : ''}`;
    modalFavIcon.textContent = isFav ? "❤️" : "🤍";
    modalFavText.textContent = isFav ? "Remove from Favorites" : "Add to Favorites";
    modalFavBtn.onclick = () => {
        toggleFavorite(anime.mal_id, null);
        const nowFav = favorites.includes(anime.mal_id);
        modalFavBtn.className = `modal-fav-btn ${nowFav ? 'active' : ''}`;
        modalFavIcon.textContent = nowFav ? "❤️" : "🤍";
        modalFavText.textContent = nowFav ? "Remove from Favorites" : "Add to Favorites";
        const cardBtn = document.querySelector(`.card-fav-btn[data-id="${anime.mal_id}"]`);
        if (cardBtn) {
            cardBtn.textContent = nowFav ? "❤️" : "🤍";
            cardBtn.classList.toggle("active", nowFav);
        }
    };

    const malLink = document.getElementById("modalMalLink");
    malLink.href = anime.url || "#";

    const trailerSection = document.getElementById("modalTrailer");
    const trailerContainer = document.getElementById("trailerContainer");
    if (anime.trailer?.embed_url) {
        trailerSection.style.display = "block";
        trailerContainer.innerHTML = `<iframe src="${anime.trailer.embed_url}" 
            allowfullscreen loading="lazy" title="Anime Trailer"></iframe>`;
    } else {
        trailerSection.style.display = "none";
    }

    detailModal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeDetailModal() {
    detailModal.classList.remove("open");
    document.body.style.overflow = "";
    const iframe = document.querySelector("#trailerContainer iframe");
    if (iframe) iframe.src = "";
}

// ========== Skeleton Loading ==========
function showSkeletons(count = 12) {
    results.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const skel = document.createElement("div");
        skel.classList.add("skeleton");
        skel.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-body">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
            </div>
        `;
        results.appendChild(skel);
    }
}

function showLoader() {
    loader.style.display = "flex";
    results.innerHTML = "";
    viewMoreBtn.style.display = "none";
    showSkeletons(12);
}

function hideLoader() {
    loader.style.display = "none";
}

// ========== Utility ==========
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}

// ========== Event Listeners ==========

searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        if (searchInput.value.trim()) {
            fetchAnime("anime", `?q=${encodeURIComponent(searchInput.value.trim())}&limit=25`);
        } else {
            loadTab(currentTab);
        }
    }, 400);
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        clearTimeout(searchDebounce);
        const query = searchInput.value.trim();
        if (query) {
            fetchAnime("anime", `?q=${encodeURIComponent(query)}&limit=25`);
        }
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    if (e.key === "Escape") {
        if (detailModal.classList.contains("open")) {
            closeDetailModal();
        } else if (document.activeElement === searchInput) {
            searchInput.blur();
        }
    }
});

clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    loadTab(currentTab);
});

genreChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    genreChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentGenre = chip.dataset.genre;
    applyAllControls();
});

sortSelect.addEventListener("change", applyAllControls);
typeSelect.addEventListener("change", applyAllControls);

resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "default";
    typeSelect.value = "";
    currentGenre = "";
    genreChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    genreChips.querySelector('[data-genre=""]').classList.add("active");
    loadTab(currentTab);
});

themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isLight = html.getAttribute("data-theme") === "light";
    html.setAttribute("data-theme", isLight ? "dark" : "light");
    themeToggle.querySelector(".theme-icon").textContent = isLight ? "🌓" : "🌙";
    localStorage.setItem("aniwatch_theme", isLight ? "dark" : "light");
});

(function restoreTheme() {
    const saved = localStorage.getItem("aniwatch_theme");
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
        themeToggle.querySelector(".theme-icon").textContent = saved === "light" ? "🌓" : "🌙";
    }
})();

viewMoreBtn.addEventListener("click", () => {
    visibleCount += 12;
    if (currentTab === "favorites") {
        renderFavorites();
    } else {
        render();
    }
});

window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 500);
});

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

modalClose.addEventListener("click", closeDetailModal);
detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) closeDetailModal();
});

document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.dataset.tab;
        searchInput.value = "";
        currentGenre = "";
        genreChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        genreChips.querySelector('[data-genre=""]').classList.add("active");
        sortSelect.value = "default";
        typeSelect.value = "";
        loadTab(currentTab);
    });
});

// ========== Tab Loading ==========
function loadTab(tab) {
    noResults.style.display = "none";
    emptyFavs.style.display = "none";

    switch (tab) {
        case "trending":
            fetchAnime("top/anime", "?filter=airing&limit=25");
            break;
        case "top":
            fetchAnime("top/anime", "?limit=25");
            break;
        case "seasonal":
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const season = month <= 3 ? "winter" : month <= 6 ? "spring" : month <= 9 ? "summer" : "fall";
            fetchAnime("seasons", `/${year}/${season}?limit=25`);
            break;
        case "favorites":
            if (masterList.length === 0) {
                fetchAnime("top/anime", "?limit=25").then(() => {});
            } else {
                render();
                updateStats();
            }
            break;
    }
}

// ========== Init ==========
updateFavCount();
initParticles();
loadTab("trending");