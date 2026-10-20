# BookWise AI — Book Recommendation System

A beginner-friendly college project with a web frontend and a Python recommendation backend.

## Features
- Search by a book title, author, or topic
- Filter by genre
- Pick a book to discover similar books
- Content-based recommendations using TF-IDF and cosine similarity
- Responsive layout for desktop and mobile
- 36 sample books stored locally in `books.json`

## Requirements
- Python 3.10 or newer recommended
- Internet connection for the first package installation
- VS Code (recommended)

## Run on Windows

1. Extract this ZIP file.
2. Open the extracted `ai_book_recommender` folder in VS Code.
3. Open the VS Code terminal: **Terminal → New Terminal**.
4. Create a virtual environment:

   ```powershell
   py -m venv .venv
   ```

5. Activate it:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

   If PowerShell blocks activation, you can use Command Prompt terminal instead:
   ```bat
   .venv\Scripts\activate.bat
   ```

6. Install dependencies:

   ```powershell
   python -m pip install -r requirements.txt
   ```

7. Start the app:

   ```powershell
   python app.py
   ```

8. Open the local address shown in the terminal, normally:
   `http://127.0.0.1:5000`

Important: This is a Flask app. Open the `http://127.0.0.1:5000` address, not the HTML file directly and not Live Server.

## How the recommendation logic works
The backend combines each book's title, author, genre, and description into text. `TfidfVectorizer` converts the text into numerical features. Cosine similarity ranks books with related terms. This is a content-based recommendation baseline, not a trained large language model.

## Project structure

```text
ai_book_recommender/
├── app.py
├── books.json
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## Current limitations
- Sample book data only; no external catalogue or live cover images.
- No login, database, saved user profile, or online purchasing.
- Ratings and book descriptions are sample project data, not live review data.
- Demo recommendation results are based on text similarity.
