const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

// Fetch anime
async function fetchAnime(query) {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
        const data = await res.json();
        displayAnime(data.data);
    } catch (error) {
        console.log("Error fetching data:", error);
    }
}

// Display anime
function displayAnime(animeList) {
    results.innerHTML = "";

    animeList.slice(0, 12).forEach(anime => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="">
            <h3>${anime.title}</h3>
            <button class="toggleBtn">Synopsis</button>
            <p class="synopsis">${anime.synopsis ? anime.synopsis.substring(0, 100) + "..." : "No synopsis available"}</p>
        `;

        // Toggle synopsis
        const btn = card.querySelector(".toggleBtn");
        const synopsis = card.querySelector(".synopsis");

        btn.addEventListener("click", () => {
            synopsis.classList.toggle("show");
        });

        results.appendChild(card);
    });
}

// Event listener
searchBtn.addEventListener("click", () => {
    const query = searchInput.value;
    if(query) fetchAnime(query);
});

const trendingBtn = document.getElementById("trendingBtn");
const genreSelect = document.getElementById("genreSelect");

// Trending Anime
trendingBtn.addEventListener("click", async () => {
    try {
        const res = await fetch("https://api.jikan.moe/v4/top/anime");
        const data = await res.json();
        displayAnime(data.data);
    } catch (err) {
        console.log(err);
    }
});

// Genre-based search
genreSelect.addEventListener("change", async () => {
    const genreId = genreSelect.value;

    if (!genreId) return;

    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}`);
        const data = await res.json();
        displayAnime(data.data);
    } catch (err) {
        console.log(err);
    }
});