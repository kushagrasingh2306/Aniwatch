
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const trendingBtn = document.getElementById("trendingBtn");
const genreSelect = document.getElementById("genreSelect");
const sortSelect = document.getElementById("sortSelect");
const themeToggle = document.getElementById("themeToggle");
const viewMoreBtn = document.getElementById("viewMoreBtn");


let masterList = [];
let filteredList = []; 
let visibleCount = 12; 
let favorites = JSON.parse(localStorage.getItem('aniwatch_favs')) || [];



async function fetchAnime(endpoint, params = "") {
    try {
        results.innerHTML = "<div class='loader'>Loading amazing anime...</div>";
        const res = await fetch(`https://api.jikan.moe/v4/${endpoint}${params}`);
        const data = await res.json();
        
        masterList = data.data || [];
        applyAllControls();
    } catch (error) {
        console.error("Error fetching data:", error);
        results.innerHTML = "<div class='error'>Failed to load data. Please try again.</div>";
    }
}



function applyAllControls() {
    
    const query = searchInput.value.toLowerCase().trim();
    let processed = masterList.filter(anime => 
        anime.title.toLowerCase().includes(query) || 
        (anime.synopsis && anime.synopsis.toLowerCase().includes(query))
    );

    
    const genreId = genreSelect.value;
    if (genreId) {
        processed = processed.filter(anime => 
            anime.genres.some(g => g.mal_id == genreId)
        );
    }

    
    const sortVal = sortSelect.value;
    processed.sort((a, b) => {
        if (sortVal === "az") return a.title.localeCompare(b.title);
        if (sortVal === "za") return b.title.localeCompare(a.title);
        if (sortVal === "score") return (b.score || 0) - (a.score || 0);
        if (sortVal === "popular") return (b.members || 0) - (a.members || 0);
        return 0; 
    });

    filteredList = processed;
    visibleCount = 12; 
    render();
}

function render() {
    results.innerHTML = "";
    
    
    const toDisplay = filteredList.slice(0, visibleCount);

    
    const cards = toDisplay.map(anime => {
        const isFav = favorites.includes(anime.mal_id);
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
            <h3>${anime.title}</h3>
            <p class="synopsis">${anime.synopsis ? anime.synopsis.substring(0, 150) + "..." : "No synopsis available."}</p>
            <div class="card-actions">
                <button class="toggle-btn">Synopsis</button>
                <button class="fav-btn" data-id="${anime.mal_id}">
                    ${isFav ? "❤️" : "🤍"}
                </button>
            </div>
        `;

       
        const toggleBtn = card.querySelector(".toggle-btn");
        const synopsis = card.querySelector(".synopsis");
        toggleBtn.addEventListener("click", () => {
            synopsis.classList.toggle("show");
            toggleBtn.textContent = synopsis.classList.contains("show") ? "Hide" : "Synopsis";
        });

        
        const favBtn = card.querySelector(".fav-btn");
        favBtn.addEventListener("click", () => toggleFavorite(anime.mal_id, favBtn));

        return card;
    });

    
    cards.forEach(card => results.appendChild(card));

    
    viewMoreBtn.style.display = (visibleCount < filteredList.length) ? "block" : "none";
    
    if (filteredList.length === 0) {
        results.innerHTML = "<div class='no-results'>No anime found matching your criteria.</div>";
    }
}

function toggleFavorite(id, btn) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        btn.textContent = "🤍";
    } else {
        favorites.push(id);
        btn.textContent = "❤️";
    }
    localStorage.setItem('aniwatch_favs', JSON.stringify(favorites));
}


const handleSearch = async () => {
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        await fetchAnime("anime", `?q=${query}`);
    } else {
        await fetchAnime("top/anime");
    }
};

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleSearch();
});

genreSelect.addEventListener("change", applyAllControls);
sortSelect.addEventListener("change", applyAllControls);

trendingBtn.addEventListener("click", () => {
    fetchAnime("top/anime");
});

viewMoreBtn.addEventListener("click", () => {
    visibleCount += 12;
    render();
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    themeToggle.textContent = isLight ? "🌙" : "🌓";
});


fetchAnime("top/anime");
