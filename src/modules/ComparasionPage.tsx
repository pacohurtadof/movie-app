import React, { useEffect, useMemo, useState } from "react";
import type { Watchlist } from "../types/movies";
import { BarChart, Bar } from 'recharts';
import { XAxis, YAxis } from 'recharts';

type Props = {
  watchlist: Watchlist[];
};

type OmdbDetailSuccess = {
  Response: "True";
  imdbID: string;
  Title: string;
  Year: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
  imdbRating?: string; // OMDb returns string
  Runtime?: string;    // e.g. "148 min"
  Genre?: string;
  Metascore?: string;
};

type OmdbDetailError = {
  Response: "False";
  Error: string;
};

type OmdbDetail = OmdbDetailSuccess | OmdbDetailError;

const OMDB_KEY = "d065264e";

export default function ComparisonPage({ watchlist }: Props) {
  // selected imdb IDs for comparison row
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // details cache for selected movies
  const [details, setDetails] = useState<Record<string, OmdbDetailSuccess>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  // pager for bottom row like wireframe
  const pageSize = 4;
  const [page, setPage] = useState(0);

  const data = [
  {
    name: 'Page A',
    score: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    score: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    score: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    score: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    score: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    score: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    score: 3490,
    pv: 4300,
    amt: 2100,
  },
];


  // fetch details when a new ID is selected
  useEffect(() => {
    const idsToFetch = selectedIds.filter((id) => !details[id] && !loadingIds.has(id));
    if (idsToFetch.length === 0) return;

    idsToFetch.forEach(async (id) => {
      setLoadingIds((prev) => new Set(prev).add(id));
      try {
        const url = `https://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=${OMDB_KEY}`;
        const res = await fetch(url);
        const data: OmdbDetail = await res.json();

        if (data.Response === "True") {
          setDetails((prev) => ({ ...prev, [id]: data }));
        } else {
          // if it fails, keep a minimal fallback from watchlist
          const fallback = watchlist.find((w) => w.imdbID === id);
          if (fallback) {
            setDetails((prev) => ({
              ...prev,
              [id]: {
                Response: "True",
                imdbID: fallback.imdbID,
                Title: fallback.Title,
                Year: fallback.Year,
                Type: fallback.Type,
                Poster: fallback.Poster,
              },
            }));
          }
        }
      } catch {
        // ignore for now
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  }, [selectedIds, details, loadingIds, watchlist]);

  // derived list of selected movie objects for UI
  const selectedMovies = useMemo(() => {
    return selectedIds
      .map((id) => details[id] || watchlist.find((w) => w.imdbID === id))
      .filter(Boolean) as Array<OmdbDetailSuccess | Watchlist>;
  }, [selectedIds, details, watchlist]);

  // keep page in bounds
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(selectedIds.length / pageSize) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [selectedIds.length, page]);

  const pageItems = selectedMovies.slice(page * pageSize, page * pageSize + pageSize);

  function addMovie(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      // optional cap like wireframe row
      if (prev.length >= 12) return prev;
      return [...prev, id];
    });
    setPickerOpen(false);
  }

  function removeMovie(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  // simple “graph area” values (placeholder)
  const graphData = useMemo(() => {
    // Use imdbRating + runtime if available
    const points = selectedIds
      .map((id) => details[id])
      .filter(Boolean)
      .map((d) => ({
        id: d.imdbID,
        title: d.Title,
        rating: parseFloatSafe(d.imdbRating),
        runtime: parseRuntimeMinutes(d.Runtime),
      }));
    return points;
  }, [selectedIds, details]);

  return (
    <div style={cs.page}>
      {/* GRAPH AREA */}
      <section style={cs.graphArea}>
        <div style={cs.graphTitle}>Graph Area</div>
              <BarChart
                  style={{ width: '100%', maxWidth: '100%', maxHeight: '400px', aspectRatio: 1.618 }}
                  responsive
                  data={graphData}
              >
                  <XAxis dataKey="title" />
                  <YAxis dataKey="rating" />
                  <Bar dataKey="rating" fill="#8884d8" />
              </BarChart>
        {selectedIds.length === 0 ? (
          <div style={cs.graphEmpty}>Add movies to compare</div>
        ) : (
          <div style={cs.graphGrid}>
            {graphData.map((p) => (
              <div key={p.id} style={cs.graphCard}>
                <div style={cs.graphName} title={p.title}>
                  {p.title}
                </div>
                <div style={cs.graphLine}>
                  <span style={cs.graphLabel}>IMDb</span>
                  <span style={cs.graphValue}>{Number.isFinite(p.rating) ? p.rating.toFixed(1) : "N/A"}</span>
                </div>
                <div style={cs.graphLine}>
                  <span style={cs.graphLabel}>Runtime</span>
                  <span style={cs.graphValue}>
                    {Number.isFinite(p.runtime) ? `${p.runtime} min` : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ADD MOVIE BUTTON */}
      <div style={cs.addRow}>
        <button style={cs.addBtn} onClick={() => setPickerOpen(true)}>
          <span style={{ fontSize: 18, fontWeight: 900 }}>＋</span> Add Movie
        </button>
      </div>

      {/* PICKER MODAL */}
      {pickerOpen && (
        <div style={cs.modalOverlay} onMouseDown={() => setPickerOpen(false)}>
          <div style={cs.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={cs.modalHeader}>
              <div style={cs.modalTitle}>Select a movie from your Watchlist</div>
              <button style={cs.modalClose} onClick={() => setPickerOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div style={cs.modalEmpty}>Your watchlist is empty.</div>
            ) : (
              <div style={cs.modalList}>
                {watchlist.map((m) => {
                  const disabled = selectedIds.includes(m.imdbID);
                  return (
                    <button
                      key={m.imdbID}
                      style={{ ...cs.modalItem, ...(disabled ? cs.modalItemDisabled : {}) }}
                      onClick={() => !disabled && addMovie(m.imdbID)}
                      disabled={disabled}
                      title={disabled ? "Already added" : "Add"}
                    >
                      <div style={cs.modalPosterWrap}>
                        {m.Poster && m.Poster !== "N/A" ? (
                          <img src={m.Poster} alt={m.Title} style={cs.modalPoster} />
                        ) : (
                          <div style={cs.modalPosterFallback}>No Image</div>
                        )}
                      </div>
                      <div style={cs.modalInfo}>
                        <div style={cs.modalName}>{m.Title}</div>
                        <div style={cs.modalMeta}>
                          {m.Year} • {m.Type.toUpperCase()}
                        </div>
                      </div>
                      <div style={cs.modalAdd}>{disabled ? "Added" : "Add"}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELECTED MOVIES ROW */}
      <section style={cs.rowArea}>
        <button
          style={{ ...cs.pagerBtn, ...(page === 0 ? cs.pagerDisabled : {}) }}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label="Previous"
        >
          ‹
        </button>

        <div style={cs.row}>
          {pageItems.map((m) => {
            const id = "imdbID" in m ? m.imdbID : "";
            const title = "Title" in m ? m.Title : "Unknown";
            const poster = "Poster" in m ? m.Poster : "N/A";

            return (
              <div key={id} style={cs.miniCard}>
                <button style={cs.removeX} onClick={() => removeMovie(id)} aria-label="Remove">
                  ✕
                </button>

                <div style={cs.miniPosterWrap}>
                  {poster && poster !== "N/A" ? (
                    <img src={poster} alt={title} style={cs.miniPoster} />
                  ) : (
                    <div style={cs.miniPosterFallback}>No Image</div>
                  )}
                </div>

                <div style={cs.miniName} title={title}>
                  {title}
                </div>
              </div>
            );
          })}

          {Array.from({ length: Math.max(0, pageSize - pageItems.length) }).map((_, idx) => (
            <div key={`empty-${idx}`} style={cs.miniCardEmpty}>
              <div style={cs.miniEmptyBox}>Movie Poster</div>
              <div style={cs.miniEmptyName}>Movie Name</div>
            </div>
          ))}
        </div>

        <button
          style={{
            ...cs.pagerBtn,
            ...(page >= Math.ceil(selectedIds.length / pageSize) - 1 ? cs.pagerDisabled : {}),
          }}
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(selectedIds.length / pageSize) - 1}
          aria-label="Next"
        >
          ›
        </button>
      </section>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function parseFloatSafe(v?: string) {
  if (!v) return Number.NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseRuntimeMinutes(v?: string) {
  // "148 min"
  if (!v) return Number.NaN;
  const match = v.match(/(\d+)/);
  if (!match) return Number.NaN;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : Number.NaN;
}

/* ---------------- styles (wireframe layout) ---------------- */

const cs: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 16,
    display: "grid",
    gap: 14,
  },

  graphArea: {
    border: "1px solid #ddd",
    borderRadius: 16,
    background: "#fff",
    padding: 16,
    minHeight: 260,
    display: "grid",
    gap: 12,
  },
  graphTitle: { fontWeight: 900, opacity: 0.75 },
  graphEmpty: { opacity: 0.75, fontWeight: 800, display: "grid", placeItems: "center", minHeight: 180 },

  graphGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  graphCard: { border: "1px solid #eee", borderRadius: 14, padding: 12, display: "grid", gap: 8 },
  graphName: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  graphLine: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, opacity: 0.9 },
  graphLabel: { fontWeight: 800, opacity: 0.75 },
  graphValue: { fontWeight: 900 },

  addRow: { display: "grid", placeItems: "center" },
  addBtn: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  rowArea: {
    border: "1px solid #ddd",
    borderRadius: 16,
    background: "#fff",
    padding: 14,
    display: "grid",
    gridTemplateColumns: "48px 1fr 48px",
    alignItems: "center",
    gap: 12,
  },

  pagerBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 24,
    fontWeight: 900,
  },
  pagerDisabled: { opacity: 0.4, cursor: "not-allowed" },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },

  miniCard: {
    position: "relative",
    border: "1px solid #eee",
    borderRadius: 16,
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "120px auto",
    background: "#fff",
  },
  removeX: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  miniPosterWrap: { background: "#fafafa" },
  miniPoster: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  miniPosterFallback: { width: "100%", height: "100%", display: "grid", placeItems: "center", opacity: 0.7, fontWeight: 900 },

  miniName: {
    padding: 10,
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  miniCardEmpty: {
    border: "1px solid #eee",
    borderRadius: 16,
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "120px auto",
    background: "#fff",
    opacity: 0.6,
  },
  miniEmptyBox: {
    background: "#fafafa",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 12,
  },
  miniEmptyName: {
    padding: 10,
    fontWeight: 900,
    fontSize: 12,
  },

  /* modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: "min(900px, 100%)",
    maxHeight: "80vh",
    overflow: "auto",
    borderRadius: 18,
    background: "#fff",
    border: "1px solid #ddd",
  },
  modalHeader: {
    padding: 14,
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: { fontWeight: 900 },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 900,
  },
  modalEmpty: { padding: 16, opacity: 0.8, fontWeight: 800 },

  modalList: { padding: 14, display: "grid", gap: 10 },
  modalItem: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "52px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    border: "1px solid #eee",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },
  modalItemDisabled: { opacity: 0.5, cursor: "not-allowed" },

  modalPosterWrap: {
    width: 52,
    height: 74,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #eee",
    background: "#fafafa",
    display: "grid",
    placeItems: "center",
  },
  modalPoster: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  modalPosterFallback: { fontSize: 11, opacity: 0.7, fontWeight: 800 },

  modalInfo: { minWidth: 0, display: "grid", gap: 4 },
  modalName: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  modalMeta: { fontSize: 12, opacity: 0.8, fontWeight: 700 },

  modalAdd: { fontWeight: 900, opacity: 0.85 },
};
