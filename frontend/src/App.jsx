import React, { useState, useEffect } from 'react';
import './App.scss';
import Pagination from './components/Pagination';
import SearchControl from './components/SearchControls';
import MediaCard from './components/MediaCard';

function App() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchAfter, setSearchAfter] = useState(null);
  const [lastElement, setLastElement] = useState(null);

  const pageSize = 10;

  const fetchResults = async (
    searchQuery,
    pageNumber = 1,
    append = false,
    searchType = '',
    startDate = '',
    endDate = '',
    searchAfterCursor = null
  ) => {
    if (searchType !== 'date' && !searchQuery) return;
    setLoading(true);
    setError(null);

    let endpoint = '';
    const base = 'http://localhost:8000/api/media';

    if (searchType === 'bildnummer') {
      endpoint = `${base}/search/by-bildnummer/?bildnummer=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`;
    } else if (searchType === 'photographer') {
      endpoint = `${base}/search/by-fotograf/?fotograf=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`;
    } else if (searchType === 'date') {
      endpoint = `${base}/search/by-datum/?datum_von=${startDate}&datum_bis=${endDate}&page=${pageNumber}&page_size=${pageSize}`;
    } else {
      endpoint = `${base}/search/?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${pageSize}`;
      if (autoScroll && searchAfterCursor) {
        endpoint += `&search_after=${searchAfterCursor}`;
      }
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();

      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(data.page);
      setTotalPages(Math.ceil(data.count / pageSize));
      setSearchAfter(data.next_search_after || null);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll logic with callback ref
  useEffect(() => {
    if (!autoScroll || loading || !searchAfter || !lastElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('🚀 Last element visible - triggering fetch...');
          fetchResults(query, 1, true, searchType, '', '', searchAfter);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(lastElement);

    return () => {
      if (lastElement) observer.unobserve(lastElement);
      observer.disconnect();
    };
  }, [autoScroll, loading, searchAfter, lastElement, query, page, searchType]);

  const handlePageChange = (newPage) => {
    fetchResults(query, newPage);
  };

  const handleModeToggle = () => {
    const nextMode = !autoScroll;

    if (!nextMode) {
      setResults((prev) => prev.slice(0, pageSize));
      setPage(1);
    }

    setAutoScroll(nextMode);
  };

  return (
    <div className="app">
      <h1>📸 Media Search</h1>

      <SearchControl
        onSearch={(q, type) => {
          setPage(1);
          setSearchAfter(null);
          setResults([]);
          setSearchType(type);

          if (type === 'date') {
            fetchResults(null, 1, false, type, q.startDate, q.endDate);
          } else {
            setQuery(q);
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
            <MediaCard
              key={item.bildnummer || `media-${idx}`}
              item={item}
              setRef={isLast && autoScroll ? (node) => setLastElement(node) : undefined}
            />
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
