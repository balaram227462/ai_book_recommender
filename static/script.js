const grid = document.getElementById("bookGrid");
const form = document.getElementById("recommendForm");
const queryInput = document.getElementById("query");
const genreSelect = document.getElementById("genre");
const bookSelect = document.getElementById("bookSelect");
const statusBox = document.getElementById("status");
const resultCount = document.getElementById("resultCount");
const resultsTitle = document.getElementById("resultsTitle");

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
}

function createBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const cover = document.createElement("div");
  cover.className = "cover";
  cover.textContent = book.cover || "📚";

  const content = document.createElement("div");
  content.className = "book-content";

  const genre = document.createElement("div");
  genre.className = "genre-line";
  genre.textContent = book.genre;

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = "by " + book.author;

  const rating = document.createElement("div");
  rating.className = "rating";
  rating.textContent = "★ " + book.rating + " / 5";

  const description = document.createElement("p");
  description.className = "description";
  description.textContent = book.description;

  const reason = document.createElement("p");
  reason.className = "reason";
  reason.textContent = book.reason || "A book picked for you to explore.";

  const button = document.createElement("button");
  button.className = "recommend-btn";
  button.textContent = "Find similar books →";
  button.addEventListener("click", () => {
    bookSelect.value = String(book.id);
    queryInput.value = "";
    form.requestSubmit();
    window.scrollTo({top: 0, behavior: "smooth"});
  });

  content.append(genre, title, author, rating, description, reason, button);
  card.append(cover, content);
  return card;
}

function renderBooks(books) {
  grid.replaceChildren();
  resultCount.textContent = `${books.length} recommendation${books.length === 1 ? "" : "s"}`;

  if (!books.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No matching books found. Try a different topic or genre.";
    grid.appendChild(empty);
    return;
  }
  books.forEach(book => grid.appendChild(createBookCard(book)));
}

async function loadInitialData() {
  try {
    const [booksResponse, genresResponse] = await Promise.all([
      fetch("/api/books"), fetch("/api/genres")
    ]);
    if (!booksResponse.ok || !genresResponse.ok) throw new Error("Could not load data.");
    const books = await booksResponse.json();
    const genres = await genresResponse.json();

    genres.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      genreSelect.appendChild(option);
    });

    books.forEach(book => {
      const option = document.createElement("option");
      option.value = book.id;
      option.textContent = `${book.title} — ${book.author}`;
      bookSelect.appendChild(option);
    });

    const initial = books.slice(0, 6).map(book => ({
      ...book,
      reason: "A reader favourite to explore."
    }));
    renderBooks(initial);
  } catch (error) {
    setStatus("Could not connect to the backend. Start the Flask server and refresh.", true);
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const query = queryInput.value.trim();
  const bookId = bookSelect.value;
  const genre = genreSelect.value;

  if (!query && !bookId && genre === "All") {
    setStatus("Showing some books to get you started.");
  } else {
    setStatus("Finding books for you…");
  }

  resultsTitle.textContent = bookId ? "Books similar to your pick" :
    query ? "Recommendations for your search" :
    genre !== "All" ? `${genre} books for you` : "Recommended for you";

  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        query,
        book_id: bookId || null,
        genre
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Recommendation request failed.");
    renderBooks(data.recommendations || []);
    setStatus(data.message || "Here are your recommendations.");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", true);
  }
});

loadInitialData();
