import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

function omdbError(message) {
  return { Response: "False", Error: message };
}

function toSearchItem(row) {
  return {
    Title: row.title,
    Year: row.year ? String(row.year) : "N/A",
    imdbID: row.imdb_id,
    Type: row.type,
    Poster: row.poster || "N/A",
  };
}

function toDetailItem(row) {
  return {
    Response: "True",
    Title: row.title,
    Year: row.year ? String(row.year) : "N/A",
    imdbID: row.imdb_id,
    Type: row.type,
    Poster: row.poster || "N/A",
    imdbRating: row.imdb_rating != null ? String(row.imdb_rating) : "N/A",
    Runtime: row.runtime_minutes != null ? `${row.runtime_minutes} min` : "N/A",
  };
}


app.get("/", async (req, res) => {
  try {
    const { s, i, t, page } = req.query;
    

    if (i) {
      const imdbID = String(i).trim();
      const [rows] = await pool.query(
        `SELECT * FROM movies WHERE imdb_id = ? LIMIT 1`,
        [imdbID]
      );
      const row = rows[0];
      if (!row) return res.json(omdbError("Movie not found!"));
      return res.json(toDetailItem(row));
    }

    if (t) {
      const title = String(t).trim();
      const [rows] = await pool.query(
        `SELECT * FROM movies WHERE title = ? LIMIT 1`,
        [title]
      );
      const row = rows[0];
      if (!row) return res.json(omdbError("Movie not found!"));
      return res.json(toDetailItem(row));
    }

    if (s) {
      const query = String(s).trim();
      if (!query) return res.json(omdbError("Movie not found!"));

      // OMDb supports pagination via page, default 1. We'll implement it.
      const pageNum = Math.max(1, Number(page || 1) || 1);
      const limit = 10;
      const offset = (pageNum - 1) * limit;

      // simple LIKE search (upgrade to FULLTEXT later)
      const like = `%${query}%`;

      const [[countRow]] = await pool.query(
        `SELECT COUNT(*) as total FROM movies WHERE title LIKE ?`,
        [like]
      );

      const [rows] = await pool.query(
        `SELECT imdb_id, title, year, type, poster
         FROM movies
         WHERE title LIKE ?
         ORDER BY year DESC, title ASC
         LIMIT ? OFFSET ?`,
        [like, limit, offset]
      );

      if (!rows.length) return res.json(omdbError("Movie not found!"));

      return res.json({
        Response: "True",
        Search: rows.map(toSearchItem),
        totalResults: String(countRow.total || 0),
      });
    }

    // If no recognized param
    return res.json(omdbError("Invalid request. Use ?s=, ?i=, or ?t=."));
  } catch (err) {
    console.error(err);
    return res.status(500).json(omdbError("Server error"));
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`);
});
