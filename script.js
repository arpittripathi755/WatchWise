const API_KEY = "Your_Api_Key";

const container = document.getElementById("movies");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genreFilter");

let allMovies = []; // store fetched movies

// 🎬 Fetch Popular Movies
async function getMovies() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`,
    );

    const data = await res.json();

    if (!data.results) {
      console.error("API Error:", data);
      return;
    }

    allMovies = data.results;
    displayMovies(allMovies);
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// 🔍 Search Movies
async function searchMovies(query) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`,
    );

    const data = await res.json();

    if (!data.results) {
      console.error("Search Error:", data);
      return;
    }

    allMovies = data.results; // update base data
    applyFilters();
  } catch (error) {
    console.error("Error searching:", error);
  }
}

// 🎯 Apply Filter (IMPORTANT)
function applyFilters() {
  const selectedGenres = Array.from(genreFilter.selectedOptions).map((option) =>
    Number(option.value),
  );

  let filtered = [...allMovies];

  if (selectedGenres.length > 0) {
    filtered = filtered.filter((movie) =>
      selectedGenres.some((genre) => movie.genre_ids.includes(genre)),
    );
  }

  displayMovies(filtered);
}

// 🎬 Display Movies
function displayMovies(movies) {
  container.innerHTML = movies
    .map(
      (movie) => `
    <div class="movie">
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" />
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average}</p>
    </div>
  `,
    )
    .join("");
}

// 🔍 Search Event
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  if (query === "") {
    getMovies();
  } else {
    searchMovies(query);
  }
});

// 🎭 Filter Event
genreFilter.addEventListener("change", applyFilters);

// 🚀 Initial Load
getMovies();
