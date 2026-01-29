


export type SearchResult = {
  imdbID: string;
  Title: string;
  Year: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
  Watched: boolean;
  AverageRating: number;
};

type OmdbSearchMovie = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
};

type OmdbSearchSuccess = {
  Response: "True";
  Search: OmdbSearchMovie[];
  totalResults: string;
};

type OmdbSearchError = {
  Response: "False";
  Error: string;
};

export type Watchlist = {
  imdbID: string;
  Title: string;
  Year: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
  Watched: boolean;
  AverageRating?: number;
};


export type OmdbMovie = OmdbSearchSuccess | OmdbSearchError;

export type WatchlistType = "movie" | "series" | "episode";
export type WatchStatusFilter = "all" | "watched" | "unwatched";
export type Priority = "high" | "medium" | "low";
export type TypeFilter = "all" | "movie" | "series" | "episode";

export type SortOption =
  | "date_added_desc"
  | "date_added_asc"
  | "title_asc"
  | "title_desc"
  | "year_desc"
  | "year_asc"
  | "rating_desc"
  | "rating_asc";

export type WatchlistItem = {
  imdbID: string;
  Title: string;
  Year: string; // keep string from OMDb, parse when needed
  Type: WatchlistType;
  Poster: string;

  // module fields (required by your page)
  addedAt: string; // ISO string
  watched: boolean;
  priority: Priority;

  // optional stats fields
  rating?: number;         // 0..10 (IMDb-style)
  runtimeMinutes?: number; // minutes
};




