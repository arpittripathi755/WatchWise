import { API_KEY } from "./config.js";

const container = document.getElementById("movies");
const searchInput = document.getElementById("search");
const searchToggle = document.getElementById("searchToggle");
const searchPopover = document.getElementById("searchPopover");
const genreFilter = document.getElementById("genreFilter");
const sortFilter = document.getElementById("sortFilter");
const clearBtn = document.getElementById("clearFilters");
const loading = document.getElementById("loadingState");
const scrollSentinel = document.getElementById("scrollSentinel");

let allMovies = [];
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let isSearchMode = false;

/* FETCH */
async function getMovies(page = 1) {
  if (isLoading) return;

  isLoading = true;
  loading.innerText = "Loading...";

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`,
    );

    const data = await res.json();

    if (!data.results) {
      console.error(data);
      loading.innerText = "Error loading movies";
      return;
    }

    totalPages = data.total_pages || 1;
    currentPage = data.page + 1;

    if (page === 1) {
      allMovies = data.results;
    } else {
      const seen = new Set(allMovies.map((m) => m.id));
      const incoming = data.results.filter((m) => !seen.has(m.id));
      allMovies = [...allMovies, ...incoming];
    }

    applyFilters();

    if (currentPage > totalPages && !isSearchMode) {
      loading.innerText = "You've reached the end.";
    } else {
      loading.innerText = "";
    }
  } catch (error) {
    console.error("Error loading movies", error);
    loading.innerText = "Error loading movies";
  } finally {
    isLoading = false;
  }
}

/* SEARCH */
async function searchMovies(q) {
  if (isLoading) return;

  isLoading = true;
  loading.innerText = "Searching...";

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`,
    );

    const data = await res.json();

    if (!data.results) {
      loading.innerText = "";
      return;
    }

    allMovies = data.results;
    applyFilters();
    loading.innerText = "";
  } catch (error) {
    console.error("Search failed", error);
    loading.innerText = "Search failed";
  } finally {
    isLoading = false;
  }
}

/* FILTER + SORT */
function applyFilters() {
  let filtered = [...allMovies];

  const selectedGenre = Number(genreFilter.value);

  if (genreFilter.value) {
    filtered = filtered.filter((movie) =>
      movie.genre_ids.includes(selectedGenre),
    );
  }

  if (sortFilter.value === "rating") {
    filtered.sort((a, b) => b.vote_average - a.vote_average);
  }

  if (sortFilter.value === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  displayMovies(filtered);
}

/* DISPLAY */
function displayMovies(movies) {
  container.innerHTML = movies
    .map(
      (movie) => `
    <div class="movie">
      <img src="${
        movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : "https://via.placeholder.com/300x450"
      }" />
      <div class="movie-overlay">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-rating">⭐ ${movie.vote_average}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

/* EVENTS */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();

  if (q === "") {
    isSearchMode = false;
    currentPage = 1;
    totalPages = 1;
    getMovies(1);
  } else {
    isSearchMode = true;
    searchMovies(q);
  }
});

if (searchToggle && searchPopover) {
  searchToggle.addEventListener("click", () => {
    searchPopover.classList.toggle("open");

    if (searchPopover.classList.contains("open")) {
      searchInput.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !searchPopover.contains(event.target) &&
      !searchToggle.contains(event.target)
    ) {
      searchPopover.classList.remove("open");
    }
  });
}

genreFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    genreFilter.value = "";
    sortFilter.value = "default";

    isSearchMode = false;
    currentPage = 1;
    totalPages = 1;
    getMovies(1);
  });
}

/* INFINITE SCROLL */
const observer = new IntersectionObserver(
  (entries) => {
    const [entry] = entries;

    if (
      entry.isIntersecting &&
      !isSearchMode &&
      !isLoading &&
      currentPage <= totalPages
    ) {
      getMovies(currentPage);
    }
  },
  {
    root: null,
    rootMargin: "300px 0px",
    threshold: 0,
  },
);

if (scrollSentinel) {
  observer.observe(scrollSentinel);
}

/* INIT */
getMovies(1);
