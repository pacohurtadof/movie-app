# 🎬 Movie Dashboard App

A full-stack movie dashboard inspired by the OMDb API.

This project allows users to search movies, build a watchlist, and compare movies visually using charts — all powered by a custom **Node.js + Express API** backed by **MySQL**, replacing the public OMDb API.

---

## 🚀 Features

### 🔍 Movie Search
- Search movies by title
- Results limited to 10 (OMDb-style)
- Same response contract as OMDb API

### ❤️ Watchlist
- Add / remove movies
- Stored in React state
- Accessible across pages
- Poster-based grid layout

### ⚖️ Movie Comparison
- Select multiple movies from watchlist
- Compare:
  - IMDb rating
  - Runtime
- Visual comparison using **Recharts**
- Add / remove movies dynamically

### 🧠 OMDb-Compatible API
The backend mimics OMDb endpoints:

