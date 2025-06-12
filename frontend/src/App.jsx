import React, { useState, useEffect, useRef } from 'react';
import './App.scss';
import Pagination from './components/pagination';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(false);

  const pageSize = 10;
  const observer = useRef();

  const fetchResults = async (searchQuery, pageNumber = 1, append = false) => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/media/search/?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(data.page);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults(query, 1);
  };

  // Infinite scroll
  const lastItemRef = useRef();
  useEffect(() => {
    if (!autoScroll || loading || page >= totalPages) return;

    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchResults(query, page + 1, true);
      }
    };

    observer.current = new IntersectionObserver(handleObserver);
    if (lastItemRef.current) observer.current.observe(lastItemRef.current);
    return () => observer.current?.disconnect();
  }, [loading, page, autoScroll]);

  const handlePageChange = (newPage) => {
    fetchResults(query, newPage);
  };

  const handleModeToggle = () => {
    const nextMode = !autoScroll;

    // Switching from infinite scroll to pagination
    if (!nextMode) {
      const start = 0;
      const end = pageSize;
      setResults((prev) => prev.slice(start, end));
      setPage(1);
    }

    setAutoScroll(nextMode);
  };

  return (
    <div className="app">
      <h1>📸 Media Search</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search media..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
        <button
          type="button"
          style={{ marginLeft: '1rem' }}
          onClick={handleModeToggle}
        >
          {autoScroll ? '🔢 Switch to Pagination' : '🔁 Switch to Auto Scroll'}
        </button>

      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results-grid">
        {results.map((item, idx) => {
          const isLast = results.length === idx + 1;
          return (
            <div
              key={item.bildnummer || "Contact support for image number"}
              className="card"
              style={{ border: '1px solid #ccc', padding: '1rem' }}
              ref={isLast && autoScroll ? lastItemRef : null} // Attach ref only to last item in infinite scroll mode
            >
              <img
                src={item.thumbnail_url || "/placeholder.jpg"}
                alt={item.suchtext || "Kein Bildtext"}
                style={{ width: '100%', objectFit: 'cover', height: '200px' }}
                onError={(e) => {
                  if (e.target.src !== window.location.origin + "/placeholder.jpg") {
                    e.target.src = "/placeholder.jpg";
                  }
                }}
              />
              <p><strong>{item.bildnummer || "Unbekannt"}</strong></p>
              <p>{item.datum ? item.datum.slice(0, 10) : "Datum unbekannt"}</p>
              <p>{item.fotografen || "Fotograf nicht angegeben"}</p>
              <p style={{ fontSize: '0.9rem' }}>
                {(item.suchtext && item.suchtext.length > 0)
                  ? `${item.suchtext.slice(0, 100)}...`
                  : "Keine Beschreibung verfügbar"}
              </p>
            </div>
          );
        })}
      </div>

      {!autoScroll && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default App;
