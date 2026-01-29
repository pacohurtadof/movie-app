import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import HomePage from "./modules/HomePage";
import WatchlistPage from "./modules/Watchlist";
import ComparisonPage from "./modules/ComparasionPage";
import { Watchlist } from "./types/movies";

export default function App() {
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              watchlist={watchlist}
              setWatchlist={setWatchlist}
            />
          }
        />

        <Route
          path="/watchlist"
          element={
            <WatchlistPage
              watchlist={watchlist}
              setWatchlist={setWatchlist}
            />
          }
        />

        <Route
          path="/compare"
          element={<ComparisonPage watchlist={watchlist} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
