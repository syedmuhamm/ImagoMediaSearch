import React, { useState, useEffect, useRef } from 'react';
import './App.scss';
import Pagination from './components/Pagination';
import SearchControl from './components/SearchControls';

function App() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(false);

  const pageSize = 10;
  const observer = useRef();

  const fetchResults = async (
    searchQuery,
    pageNumber = 1,
    append = false,
    searchType = '',
    startDate = '',
    endDate = ''
  ) => {
    if (searchType !== 'date' && !searchQuery) return;
    setLoading(true);
    setError(null);

    let endpoint = '';

    if (searchType === 'bildnummer') {
      endpoint = `http://localhost:8000/api/media/search/by-bildnummer/?bildnummer=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`;
    } else if (searchType === 'photographer') {
      endpoint = `http://localhost:8000/api/media/search/by-fotograf/?fotograf=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`;
    } else if (searchType === 'date') {
      endpoint = `http://localhost:8000/api/media/search/by-datum/?datum_von=${startDate}&datum_bis=${endDate}&page=${pageNumber}&page_size=${pageSize}`;
    } else {
      endpoint = `http://localhost:8000/api/media/search/?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`;
    }

    try {
      const response = await fetch(endpoint);
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

    <SearchControl
  onSearch={(q, type) => {
    if (type === 'date') {
      setSearchType(type);
      fetchResults(null, 1, false, type, q.startDate, q.endDate);
      } else {
          setQuery(q);
          setSearchType(type);
          fetchResults(q, 1, false, type);
        }
    }}
      onToggleMode={handleModeToggle}
      autoScroll={autoScroll}
    />

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results-grid">
        {results.map((item, idx) => {
          const isLast = results.length === idx + 1;
          return (
            <div
              key={item.bildnummer || "Contact support for image number"}
              className="card"
              ref={isLast && autoScroll ? lastItemRef : null}
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
