import React, { useMemo, useState } from "react";
import type { Watchlist } from "../types/movies"; // <-- adjust path if needed

type Props = {
    watchlist: Watchlist[];
    setWatchlist: React.Dispatch<React.SetStateAction<Watchlist[]>>;
};

type TypeFilter = "all" | "movie" | "series" | "episode";
type SortOption = "title_asc" | "title_desc" | "year_desc" | "year_asc";

export default function WatchlistPage({ watchlist, setWatchlist }: Props) {
    // header search (wireframe: search icon on the right)
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");

    // filters block
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [sort, setSort] = useState<SortOption>("title_asc");

    const [infoOpenIds, setInfoOpenIds] = useState<Set<string>>(new Set());

    function toggleInfo(imdbID: string) {
        setInfoOpenIds((prev) => {
            const next = new Set(prev);
            next.has(imdbID) ? next.delete(imdbID) : next.add(imdbID);
            return next;
        });
    }


    // stats (only based on fields you actually have)
    const stats = useMemo(() => {
        const total = watchlist.length;
        const movies = watchlist.filter((i) => i.Type === "movie").length;
        const series = watchlist.filter((i) => i.Type === "series").length;
        const episodes = watchlist.filter((i) => i.Type === "episode").length;
        const watched = watchlist.filter((i) => i.Watched).length;
        const averageRating = watchlist.filter((i) => i.AverageRating).length;
        return { total, movies, series, episodes, watched, averageRating };
    }, [watchlist]);

    // filter + sort + search
    const visibleItems = useMemo(() => {
        let list = [...watchlist];

        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter((i) => i.Title.toLowerCase().includes(q));
        }

        if (typeFilter !== "all") {
            list = list.filter((i) => i.Type === typeFilter);
        }

        list.sort((a, b) => sortCompare(a, b, sort));
        return list;
    }, [watchlist, search, typeFilter, sort]);

    function removeItem(imdbID: string) {
        setWatchlist((prev) => prev.filter((i) => i.imdbID !== imdbID));
    }

    return (
        <div style={st.page}>
            {/* HEADER BAR */}
            <header style={st.headerBar}>
                <div style={st.headerTitle}>
                    Watchlist <span style={st.headerCount}>({watchlist.length})</span>
                </div>

                <div style={st.headerRight}>
                    {searchOpen && (
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search watchlist..."
                            style={st.searchInput}
                            autoFocus
                        />
                    )}

                    <button
                        style={st.searchIconBtn}
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Search"
                        title="Search"
                    >
                        🔍
                    </button>
                </div>
            </header>

            {/* STATISTICS DASHBOARD BLOCK */}
            <section style={st.block}>
                <div style={st.blockTitle}>Statistics Dashboard</div>

                <div style={st.statsGrid}>
                    <Stat label="Total" value={stats.total} />
                    <Stat label="Movies" value={stats.movies} />
                    <Stat label="Series" value={stats.series} />
                    <Stat label="Episodes" value={stats.episodes} />
                    <Stat label="Watched" value={stats.watched} />
                    <Stat label="Average Rating" value={stats.averageRating} />

                    <div style={st.progressWrap}>
                        <div style={st.progressText}>Progress: N/A</div>
                        <div style={st.progressBar}>
                            <div style={{ ...st.progressFill, width: "0%" }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* FILTERS SECTION BLOCK */}
            <section style={st.block}>
                <div style={st.blockTitle}>Filters Section</div>

                <div style={st.filtersRow}>
                    <FilterSelect
                        label="Type"
                        value={typeFilter}
                        onChange={(v) => setTypeFilter(v as TypeFilter)}
                        options={[
                            ["all", "All (default)"],
                            ["movie", "Movies only"],
                            ["series", "Series only"],
                            ["episode", "Episodes only"],
                        ]}
                    />

                    <FilterSelect
                        label="Sort"
                        value={sort}
                        onChange={(v) => setSort(v as SortOption)}
                        options={[
                            ["title_asc", "Title (A–Z)"],
                            ["title_desc", "Title (Z–A)"],
                            ["year_desc", "Year (newest first)"],
                            ["year_asc", "Year (oldest first)"],
                        ]}
                    />
                </div>
            </section>

            {/* WATCHLIST ITEMS SECTION BLOCK */}
            <section style={st.block}>
                <div style={st.blockTitle}>Watchlist Items Section</div>

                {visibleItems.length === 0 ? (
                    <div style={st.empty}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>No items found</div>
                        <div style={{ opacity: 0.85 }}>Try searching or changing filters.</div>
                    </div>
                ) : (
                    <div style={st.itemsGrid}>
                        {visibleItems.map((m) => {
                            const isInfo = infoOpenIds.has(m.imdbID);

                            return (
                                <div key={m.imdbID} style={st.tile}>
                                    {!isInfo ? (
                                        // DEFAULT LOOK: Poster + action bar
                                        <div style={st.tileFront}>
                                            <div style={st.posterBox}>
                                                {m.Poster && m.Poster !== "N/A" ? (
                                                    <img
                                                        src={m.Poster}
                                                        alt={`${m.Title} poster`}
                                                        style={st.posterImg}
                                                    />
                                                ) : (
                                                    <div style={st.posterFallback}>No Image</div>
                                                )}
                                            </div>

                                            <div style={st.actionBar}>
                                                <button
                                                    style={st.iconAction}
                                                    onClick={() => toggleInfo(m.imdbID)}
                                                    title="View info"
                                                    aria-label="View info"
                                                >
                                                    ℹ️
                                                </button>

                                                <button
                                                    style={st.iconAction}
                                                    onClick={() => {
                                                        // replace with your real navigation to compare page
                                                        // navigate(`/compare?imdb=${encodeURIComponent(m.imdbID)}`);
                                                        alert(`Compare: ${m.Title}`);
                                                    }}
                                                    title="Compare"
                                                    aria-label="Compare"
                                                >
                                                    ⚖️
                                                </button>

                                                <button
                                                    style={st.iconAction}
                                                    onClick={() => removeItem(m.imdbID)}
                                                    title="Delete"
                                                    aria-label="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // INFO VIEW: Title / Year·Type / ratings / watched + action bar
                                        <div style={st.tileBack}>
                                            <div style={st.infoBody}>
                                                <div style={st.infoTitle} title={m.Title}>
                                                    {m.Title}
                                                </div>

                                                <div style={st.infoMeta}>
                                                    <span>{m.Year}</span>
                                                    <span style={st.dot}>•</span>
                                                    <span style={st.typeBadge}>{(m.Type ?? "").toUpperCase()}</span>
                                                </div>

                                                <div style={st.infoRow}>
                                                    <span style={st.star}>★</span>
                                                    <span style={st.infoText}>
                                                        {typeof (m as any).imdbRating === "number"
                                                            ? (m as any).imdbRating.toFixed(1)
                                                            : (m as any).imdbRating ?? "N/A"}{" "}
                                                        (IMDB)
                                                    </span>
                                                </div>

                                                <div style={st.infoRow}>
                                                    <span style={st.star}>★</span>
                                                    <span style={st.infoText}>
                                                        {typeof (m as any).yourRating === "number"
                                                            ? (m as any).yourRating.toFixed(1)
                                                            : (m as any).yourRating ?? "N/A"}{" "}
                                                        (You)
                                                    </span>
                                                </div>

                                                {"watched" in (m as any) && (
                                                    <label style={st.checkboxRow}>
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean((m as any).watched)}
                                                            onChange={() => {
                                                                // optional: implement if you add watched in type
                                                                // toggleWatched(m.imdbID)
                                                            }}
                                                            disabled
                                                        />
                                                        <span style={st.checkboxText}>Watched</span>
                                                    </label>
                                                )}
                                            </div>

                                            <div style={st.actionBar}>
                                                <button
                                                    style={st.iconAction}
                                                    onClick={() => toggleInfo(m.imdbID)}
                                                    title="Back to poster"
                                                    aria-label="Back"
                                                >
                                                    ↩️
                                                </button>

                                                <button
                                                    style={st.iconAction}
                                                    onClick={() => {
                                                        // navigate(`/compare?imdb=${encodeURIComponent(m.imdbID)}`);
                                                        alert(`Compare: ${m.Title}`);
                                                    }}
                                                    title="Compare"
                                                    aria-label="Compare"
                                                >
                                                    ⚖️
                                                </button>

                                                <button
                                                    style={st.iconAction}
                                                    onClick={() => removeItem(m.imdbID)}
                                                    title="Delete"
                                                    aria-label="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                )}
            </section>
        </div>
    );
}

/* -------- small components -------- */

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={st.statCard}>
            <div style={st.statLabel}>{label}</div>
            <div style={st.statValue}>{value}</div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Array<[string, string]>;
}) {
    return (
        <div style={st.filterGroup}>
            <label style={st.filterLabel}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} style={st.select}>
                {options.map(([v, text]) => (
                    <option key={v} value={v}>
                        {text}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* -------- helpers -------- */

function safeUpper(v: string | undefined) {
    return (v ?? "").toUpperCase();
}

function sortCompare(a: Watchlist, b: Watchlist, sort: SortOption) {
    const aTitle = a.Title.toLowerCase();
    const bTitle = b.Title.toLowerCase();
    const aYear = parseYear(a.Year);
    const bYear = parseYear(b.Year);

    switch (sort) {
        case "title_asc":
            return aTitle.localeCompare(bTitle);
        case "title_desc":
            return bTitle.localeCompare(aTitle);
        case "year_desc":
            return bYear - aYear;
        case "year_asc":
            return aYear - bYear;
        default:
            return 0;
    }
}

function parseYear(y: string) {
    const n = Number(String(y).slice(0, 4));
    return Number.isFinite(n) ? n : -Infinity;
}

/* -------- styles: matches wireframe layout -------- */

const st: Record<string, React.CSSProperties> = {
    page: {
        maxWidth: 1100,
        margin: "0 auto",
        padding: 16,
        display: "grid",
        gap: 14,
    },

    headerBar: {
        border: "1px solid #ddd",
        borderRadius: 16,
        padding: "14px 16px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    headerTitle: { fontSize: 26, fontWeight: 900 },
    headerCount: { fontSize: 18, opacity: 0.75, fontWeight: 900, marginLeft: 6 },
    headerRight: { display: "flex", alignItems: "center", gap: 10 },

    searchInput: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #ddd",
        outline: "none",
        minWidth: 240,
    },
    searchIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontSize: 18,
    },

    block: {
        border: "1px solid #ddd",
        borderRadius: 16,
        padding: 16,
        background: "#fff",
        display: "grid",
        gap: 12,
    },
    blockTitle: { fontWeight: 900, opacity: 0.75 },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
    },
    statCard: { border: "1px solid #eee", borderRadius: 14, padding: 12 },
    statLabel: { fontSize: 12, opacity: 0.75, fontWeight: 900, marginBottom: 6 },
    statValue: { fontSize: 16, fontWeight: 900 },

    progressWrap: { gridColumn: "1 / -1", display: "grid", gap: 8, marginTop: 2 },
    progressText: { fontWeight: 900, opacity: 0.85 },
    progressBar: { height: 12, borderRadius: 999, background: "#eee", overflow: "hidden" },
    progressFill: { height: "100%", background: "#111", borderRadius: 999 },

    filtersRow: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
    },
    filterGroup: { display: "grid", gap: 6 },
    filterLabel: { fontSize: 12, fontWeight: 900, opacity: 0.75 },
    select: { padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" },

    empty: { border: "1px dashed #cfcfcf", borderRadius: 16, padding: 16, background: "#fafafa" },

    itemsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 14,
    },

    posterCard: {
        border: "1px solid #eee",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        display: "grid",
        gridTemplateRows: "200px 1fr",


    },

    tile: {
        border: "1px solid #eee",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        display: "grid",
        gridTemplateRows: "1fr auto",
        minHeight: 260,
    },

    tileFront: {
        display: "grid",
        gridTemplateRows: "1fr auto",
    },

    tileBack: {
        display: "grid",
        gridTemplateRows: "1fr auto",
    },

    posterBox: {
        background: "#fafafa",
        display: "grid",
        placeItems: "center",
        padding: 12,
    },

    posterImg: {
        width: "100%",
        height: 200,
        objectFit: "cover",
        borderRadius: 16,
        display: "block",
    },

    posterFallback: {
        width: "100%",
        height: 200,
        borderRadius: 16,
        border: "1px dashed #cfcfcf",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        opacity: 0.7,
        background: "#fff",
    },

    actionBar: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        padding: 10,
        borderTop: "1px solid #eee",
        background: "#fff",
    },

    iconAction: {
        height: 42,
        borderRadius: 12,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontSize: 16,
        fontWeight: 900,
    },

    infoBody: {
        padding: 12,
        display: "grid",
        gap: 10,
    },

    infoTitle: {
        fontWeight: 900,
        fontSize: 14,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    infoMeta: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        opacity: 0.85,
        flexWrap: "wrap",
    },

    typeBadge: {
        fontWeight: 900,
    },

    infoRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },

    star: {
        fontSize: 16,
        lineHeight: 1,
    },

    infoText: {
        fontSize: 13,
        opacity: 0.9,
        fontWeight: 700,
    },

    checkboxRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 800,
        opacity: 0.85,
    },

    checkboxText: {
        marginTop: 1,
    },


    posterArea: { background: "#fafafa", borderBottom: "1px solid #eee" },


    cardBody: { padding: 12, display: "grid", gap: 8 },
    cardTitle: {
        fontWeight: 900,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    cardMeta: { display: "flex", gap: 8, alignItems: "center", fontSize: 13, opacity: 0.85, flexWrap: "wrap" },
    dot: { opacity: 0.6 },

    cardActions: { marginTop: 2 },
    removeBtn: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontWeight: 900,
    },
};
