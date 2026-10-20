from flask import Flask, render_template, jsonify, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
from pathlib import Path

app = Flask(__name__)
BOOKS = json.loads(Path(__file__).with_name("books.json").read_text(encoding="utf-8"))

def book_text(book):
    return f"{book['title']} {book['author']} {book['genre']} {book['description']}"

VECTORIZER = TfidfVectorizer(stop_words="english")
MATRIX = VECTORIZER.fit_transform([book_text(book) for book in BOOKS])
BOOK_BY_ID = {book["id"]: i for i, book in enumerate(BOOKS)}

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/books")
def get_books():
    return jsonify(BOOKS)

@app.get("/api/genres")
def get_genres():
    return jsonify(sorted({book["genre"] for book in BOOKS}))

@app.post("/api/recommend")
def recommend():
    payload = request.get_json(silent=True) or {}
    query = (payload.get("query") or "").strip()
    genre = (payload.get("genre") or "All").strip()
    selected_id = payload.get("book_id")
    limit = 6

    if selected_id is not None:
        try:
            selected_id = int(selected_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Please choose a valid book."}), 400
        if selected_id not in BOOK_BY_ID:
            return jsonify({"error": "Book not found."}), 404
        source_index = BOOK_BY_ID[selected_id]
        scores = cosine_similarity(MATRIX[source_index], MATRIX).flatten()
        ranked = sorted(
            [(i, float(score)) for i, score in enumerate(scores) if i != source_index],
            key=lambda pair: pair[1],
            reverse=True
        )
        reason_prefix = f"Similar to {BOOKS[source_index]['title']}"
    elif query:
        query_vector = VECTORIZER.transform([query])
        scores = cosine_similarity(query_vector, MATRIX).flatten()
        ranked = sorted(enumerate(scores), key=lambda pair: pair[1], reverse=True)
        reason_prefix = f"Matched to your search: “{query}”"
    else:
        ranked = [(i, 0.0) for i in range(len(BOOKS))]
        reason_prefix = "Popular picks to explore"

    results = []
    for index, score in ranked:
        book = BOOKS[index]
        if genre != "All" and book["genre"] != genre:
            continue
        item = dict(book)
        if query and score > 0:
            item["reason"] = f"Content match based on title, genre, and description ({round(score * 100)}% similarity score)."
        elif selected_id is not None:
            item["reason"] = f"Shares related themes or vocabulary with {BOOKS[BOOK_BY_ID[selected_id]]['title']}."
        else:
            item["reason"] = reason_prefix
        results.append(item)
        if len(results) >= limit:
            break

    return jsonify({"recommendations": results, "message": reason_prefix})

if __name__ == "__main__":
    app.run(debug=True)
