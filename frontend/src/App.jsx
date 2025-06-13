import { useState, useEffect } from 'react';
import './App.scss';
import Pagination from './components/Pagination';
import SearchControl from './components/SearchControls';
import MediaCard from './components/MediaCard';
import { PAGE_SIZE } from './config';
import { fetchMedia } from './services/mediaService';

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

  const handleFetch = async (
    searchQuery,
    pageNumber = 1,
    append = false,
    type = '',
    startDate = '',
    endDate = '',
    cursor = null
  ) => {
    setLoading(true);
    setError(null);

    const { data, error } = await fetchMedia({
      searchQuery,
      pageNumber,
      append,
      searchType: type,
      startDate,
      endDate,
      searchAfterCursor: cursor,
      autoScroll,
    });

    if (error) {
      setError(error);
    } else if (data) {
      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(data.page);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      setSearchAfter(data.next_search_after || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!autoScroll || loading || !searchAfter || !lastElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('🚀 Fetching more via infinite scroll...');
          handleFetch(query, 1, true, searchType, '', '', searchAfter);
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
    handleFetch(query, newPage, false, searchType);
  };

  const handleModeToggle = () => {
    const nextMode = !autoScroll;
    if (!nextMode) {
      setResults((prev) => prev.slice(0, PAGE_SIZE));
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
            handleFetch(null, 1, false, type, q.startDate, q.endDate);
          } else {
            setQuery(q);
            handleFetch(q, 1, false, type);
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
              key={`${item.db}-${item.bildnummer}`}
              item={item}
              setRef={isLast && autoScroll ? (node) => setLastElement(node) : undefined}
            />
          );
        })}
      </div>

      {!autoScroll && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

export default App;
