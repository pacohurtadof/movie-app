import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OmdbMovie, Watchlist,SearchResult } from '../types/movies';
type WatchlistItem = {
  imdbID: string;
  title: string;
  year: string;
  poster?: string;
};

type ComparisonItem = {
  id: number;
  name?: string | null;
  createdAt: string; // ISO
  imdbIds: string[];
};
type Props = {
  watchlist: Watchlist[];
  setWatchlist: React.Dispatch<React.SetStateAction<Watchlist[]>>;
};



export default function HomePage({
  watchlist,
  setWatchlist,
}: Props) {
  const OMDB_KEY = "d065264e";
  const navigate = useNavigate();
  const [searchedMovies, setSearchedMovies] = useState<OmdbMovie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [movieError, setMovieError] = useState<string | null>(null);

    function addToWatchlist(movie: SearchResult) {
        setWatchlist((prev) => {
            if (prev.some((m) => m.imdbID === movie.imdbID)) {
                return prev;
            }

            return [
                ...prev,
                {
                    imdbID: movie.imdbID,
                    Title: movie.Title,
                    Year: movie.Year,
                    Type: movie.Type,
                    Poster: movie.Poster ?? "N/A",
                    Watched: movie.Watched
                },
            ];
        });
    }

  // For now these are mock previews.
  // Later, replace with fetch calls to your Node API:
  // GET /api/watchlist?limit=5
  // GET /api/comparisons?limit=5

  const [recentComparisons] = useState<ComparisonItem[]>([
    { id: 12, name: "Sci-Fi Night", createdAt: "2026-01-25T20:10:00Z", imdbIds: ["tt1375666", "tt0816692"] },
    { id: 11, name: "Classic Action", createdAt: "2026-01-22T18:45:00Z", imdbIds: ["tt0133093", "tt0110912"] },
  ]);

  // Hero search state (you can wire it to /compare or to a Search Results page)
  const [query, setQuery] = useState("");
  const queryTrimmed = useMemo(() => query.trim(), [query]);

  async function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = query.trim();
    if (!title) return;

    setLoadingMovie(true);
    setMovieError(null);
    setSearchedMovies(null);
    try {
      const BASE = "http://localhost:4000";
      const url = `${BASE}/?s=${encodeURIComponent(title)}`;
      const res = await fetch(url);
      const data: OmdbMovie = await res.json();
      if (data.Response === "False") {
        setMovieError(data.Error || "Movie not found.");
        return;
      }

      setSearchedMovies(data);
    } catch (err: any) {
      setMovieError(err?.message || "Failed to fetch movie.");
    } finally {
      setLoadingMovie(false);
    }
  }


  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, display: "grid", gap: 18 }}>
      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={{ display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1 }}>
            Movie Compare Dashboard
          </h1>

          <p style={{ margin: 0, opacity: 0.9, fontSize: 16, maxWidth: 720 }}>
            Search movies, build a watchlist, and compare titles side-by-side using IMDb rating,
            Metascore, runtime, and more. Save comparisons and revisit them anytime.
          </p>

          <form onSubmit={onSearchSubmit} style={styles.searchRow}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a movie (e.g., Inception, The Matrix...)"
              style={styles.searchInput}
            />
            <button type="submit" style={styles.primaryBtn} disabled={!queryTrimmed}>
              Search
            </button>
          </form>

          {/* Call to Action for comparing movies */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.primaryBtn} onClick={() => navigate("/compare")}>
              Compare Movies
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate("/watchlist")}>
              View Watchlist
            </button>
          </div>
        </div>

        {/* Optional right-side hero illustration placeholder */}
        <div style={styles.heroArt}>
          <div style={{ opacity: 0.7, textAlign: "center" }}>
            <div style={{ fontWeight: 700 }}>Hero Section</div>
            <div style={{ fontSize: 13 }}>With Search</div>
          </div>
        </div>

        {/* SEARCH RESULTS */}
        {searchedMovies?.Response === "True" && searchedMovies.Search.length > 0 && (
          <div style={styles.resultsGrid}>
            {searchedMovies.Search.slice(0, 10).map((movie: any) => {
              const inWatchlist = watchlist.some(
                (m) => m.imdbID === movie.imdbID
              );
              return (
                <div key={movie.imdbID} style={styles.cardRow}>
                  {/* Poster */}
                  <div style={styles.posterWrap}>
                    {movie.Poster && movie.Poster !== "N/A" ? (
                      <img
                        src={movie.Poster}
                        alt={`${movie.Title} poster`}
                        style={styles.posterImg}
                      />
                    ) : (
                      <div style={styles.posterFallback}>No Image</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={styles.infoCol}>
                    <div style={styles.titleRow}>
                      <div style={styles.title}>{movie.Title}</div>

                      <span
                        style={{
                          ...styles.badge,
                          background: movie.Type === "movie" ? "#c6680aff" : "#172ad7ff",
                        }}
                      >
                        {movie.Type.toUpperCase()}
                      </span>
                    </div>

                    <div style={styles.subRow}>
                      <span style={styles.year}>{movie.Year}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={styles.actionsCol}>
                    <button
                        onClick={() =>
                                  setWatchlist((prev) =>
                                      prev.some((m) => m.imdbID === movie.imdbID)
                                          ? prev.filter((m) => m.imdbID !== movie.imdbID)
                                          : [
                                              ...prev,
                                              {
                                                  imdbID: movie.imdbID,
                                                  Title: movie.Title,
                                                  Year: movie.Year,
                                                  Type: movie.Type,
                                                  Poster: movie.Poster ?? "N/A",
                                                  Watched: movie.Watched
                                              },
                                          ]
                                  )
                              }
                          >
                              {inWatchlist ? "❤️" : "🤍"}
                    </button>

                    <button
                      style={styles.addBtn}
                      disabled={inWatchlist}
                      onClick={() =>
                        setWatchlist((prev) => {
                          if (prev.some((m) => m.imdbID === movie.imdbID)) {
                            return prev;
                          }

                          return [
                            ...prev,
                            {
                              imdbID: movie.imdbID,
                              Title: movie.Title,
                              Year: movie.Year,
                              Type: movie.Type ?? "movie",
                              Poster: movie.Poster ?? "N/A",
                              Watched: movie.Watched
                            },
                          ];
                        })
                      }
                    >
                      {inWatchlist ? "Added" : "+ Watchlist"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* WATCHLIST PREVIEW SECTION  */}
      
        {/* WATCHLIST PREVIEW SECTION (Set<Watchlist>) */}
      <section style={wlStyles.section}>
        <div style={wlStyles.headerRow}>
          <div>
            <h2 style={wlStyles.title}>
              Watchlist <span style={wlStyles.count}>({watchlist.length})</span>
            </h2>
            <p style={wlStyles.subtitle}>
              Quickly access saved titles and jump into comparisons.
            </p>
          </div>

          <button style={wlStyles.viewAllBtn} onClick={() => navigate("/watchlist")}>
            View Full Watchlist →
          </button>
        </div>
        { watchlist.length === 0 ? (
          <div style={wlStyles.emptyState}>
            <div style={{ fontWeight: 900, marginBottom: 4 }}>Your watchlist is empty</div>
            <div style={{ opacity: 0.85 }}>
              Use the <b>+ Watchlist</b> button in search results to add movies here.
            </div>
          </div>
        ) : (
          <div style={wlStyles.list}>
            {Array.from(watchlist)
              .slice(0, 5)
              .map((m) => (
                <div key={m.imdbID} style={wlStyles.rowCard}>
                  {/* Poster */}
                  <div style={wlStyles.posterWrap}>
                    {m.Poster && m.Poster !== "N/A" ? (
                      <img
                        src={m.Poster}
                        alt={`${m.Title} poster`}
                        style={wlStyles.posterImg}
                      />
                    ) : (
                      <div style={wlStyles.posterFallback}>No Image</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={wlStyles.infoCol}>
                    <div style={wlStyles.titleRow}>
                      <div style={wlStyles.movieTitle}>{m.Title}</div>

                      <span
                        style={{
                          ...wlStyles.badge,
                          background: m.Type === "movie" ? "#bc6b10ff" : "#0928c4ff",
                        }}
                      >
                        {(m.Type ?? "movie").toUpperCase()}
                      </span>
                    </div>

                    <div style={wlStyles.meta}>
                      <span style={wlStyles.year}>{m.Year}</span>
                      <span style={wlStyles.dot}>•</span>
                      <span style={wlStyles.note}>Saved for later</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={wlStyles.actionsCol}>
                    <button
                      style={wlStyles.primaryBtn}
                      onClick={() => navigate(`/compare?imdb=${encodeURIComponent(m.imdbID)}`)}
                      title="Compare this title"
                    >
                      Compare
                    </button>

                    <button
                      style={wlStyles.iconBtn}
                      onClick={() => {
                        // remove by imdbID from Set<Watchlist>
                        setWatchlist((prev) => {
                          return Array.from(prev).filter((x) => x.imdbID !== m.imdbID)
                        });
                      }}
                      title="Remove from watchlist"
                      aria-label="Remove from watchlist"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>


      {/* RECENT COMPARISONS PREVIEW SECTION */}
      <section style={styles.cardRow}>
        <div style={{ flex: 1 }}>
          <h2 style={styles.sectionTitle}>Recent Comparisons</h2>
          <p style={styles.sectionSubtitle}>
            Your latest side-by-side matchups.
          </p>

          <RecentComparisonsPreview items={recentComparisons} />
        </div>

        {/* Action button to go to comparison page */}
        <div style={styles.actionCol}>
          <button style={styles.iconBtn} onClick={() => navigate("/compare")} aria-label="Go to Compare">
            ⚖️
          </button>
          <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>
            Compare movies
          </div>
        </div>
      </section>

    </div>
  );
}

function WatchlistPreview({ items }: { items: WatchlistItem[] }) {
  if (!items.length) {
    return <EmptyState text="Your watchlist is empty. Add a movie to get started." />;
  }

  return (
    <div style={styles.previewGrid}>
      {items.slice(0, 5).map((m) => (
        <div key={m.imdbID} style={styles.previewItem}>
          <div style={styles.posterStub}>
            {m.poster ? <img src={m.poster} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "Poster"}
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 700 }}>{m.title}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{m.year}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentComparisonsPreview({ items }: { items: ComparisonItem[] }) {
  if (!items.length) {
    return <EmptyState text="No comparisons yet. Compare two or three movies to create one." />;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.slice(0, 5).map((c) => (
        <div key={c.id} style={styles.comparisonRow}>
          <div style={{ display: "grid", gap: 3 }}>
            <div style={{ fontWeight: 700 }}>{c.name || `Comparison #${c.id}`}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Movies: {c.imdbIds.join(" vs ")}
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {new Date(c.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: 14, border: "1px dashed #cfcfcf", borderRadius: 12, opacity: 0.9 }}>
      {text}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 18,
    border: "1px solid #ddd",
    borderRadius: 16,
    padding: 16,
    alignItems: "stretch",
  },
  heroArt: {
    border: "1px solid #eee",
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    minHeight: 180,
  },
  searchRow: {
    display: "flex",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 240,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #cfcfcf",
    outline: "none",
  },
  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #cfcfcf",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontWeight: 700,
  },
  cardRow: {
    display: "flex",
    gap: 14,
    border: "1px solid #ddd",
    borderRadius: 16,
    padding: 16,
    alignItems: "stretch",
  },
  actionCol: {
    width: 120,
    display: "grid",
    gap: 10,
    justifyItems: "center",
    alignContent: "center",
  },
  iconBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    border: "1px solid #cfcfcf",
    background: "#fff",
    cursor: "pointer",
    fontSize: 20,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
  },
  sectionSubtitle: {
    marginTop: 6,
    marginBottom: 12,
    opacity: 0.85,
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  previewItem: {
    display: "flex",
    gap: 10,
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  posterStub: {
    width: 54,
    height: 72,
    borderRadius: 10,
    border: "1px solid #eee",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    opacity: 0.8,
    overflow: "hidden",
  },
  comparisonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  resultsGrid: {
    marginTop: 12,
    display: "grid",
    gap: 10,
  },

  posterWrap: {
    width: 60,
    height: 86,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #eee",
    background: "#fafafa",
    display: "grid",
    placeItems: "center",
  },

  posterImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  posterFallback: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    padding: 6,
  },

  infoCol: {
    display: "grid",
    gap: 6,
    minWidth: 0,
  },

  titleRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    minWidth: 0,
  },

  title: {
    fontWeight: 800,
    fontSize: 15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  subRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    opacity: 0.85,
    fontSize: 13,
  },

  year: {
    fontWeight: 600,
  },

  badge: {
    padding: "3px 8px",
    borderRadius: 999,
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.4,
    flexShrink: 0,
  },

  actionsCol: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  heartBtn: {
    background: "transparent",
    border: "1px solid #e6e6e6",
    borderRadius: 12,
    width: 40,
    height: 40,
    cursor: "pointer",
    fontSize: 18,
    display: "grid",
    placeItems: "center",
  },

  addBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cfcfcf",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },

};

const wlStyles: Record<string, React.CSSProperties> = {
  section: {
    border: "1px solid #ddd",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    display: "grid",
    gap: 14,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 0,
    opacity: 0.85,
    maxWidth: 720,
  },

  viewAllBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cfcfcf",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  emptyState: {
    padding: 14,
    borderRadius: 14,
    border: "1px dashed #cfcfcf",
    background: "#fafafa",
  },

  list: {
    display: "grid",
    gap: 10,
  },

  rowCard: {
    display: "grid",
    gridTemplateColumns: "60px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 14,
    background: "#fff",
  },

  posterWrap: {
    width: 60,
    height: 86,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #eee",
    background: "#fafafa",
    display: "grid",
    placeItems: "center",
  },

  posterImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  posterFallback: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    padding: 6,
  },

  infoCol: {
    display: "grid",
    gap: 6,
    minWidth: 0,
  },

  movieTitle: {
    fontWeight: 900,
    fontSize: 15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  meta: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 13,
    opacity: 0.85,
    minWidth: 0,
    flexWrap: "wrap",
  },

  year: {
    fontWeight: 700,
  },

  dot: {
    opacity: 0.6,
  },

  note: {
    whiteSpace: "nowrap",
  },

  actionsCol: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid #e6e6e6",
    background: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
  },
};

