import React, { useState, useEffect } from 'react';
import './App.scss';
import Pagination from './components/Pagination';
import SearchControl from './components/SearchControls';
import MediaCard from './components/MediaCard';
import { searchMedia } from './services/searchService';
import { PAGE_SIZE } from './config';

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
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchResults = async ({
    searchQuery,
    pageNumber = 1,
    append = false,
    searchType,
    startDate = '',
    endDate = '',
    searchAfterCursor = null
  }) => {
    if (searchType !== 'date' && !searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchMedia({
        searchQuery,
        page: pageNumber,
        searchType,
        startDate,
        endDate,
        searchAfter: searchAfterCursor,
        autoScroll,
        retries: 2
      });

      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setPage(data.page || 1);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      setSearchAfter(data.next_search_after || null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!autoScroll || loading || !searchAfter || !lastElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('👀 Last element visible - loading more');
          fetchResults({
            searchQuery: query,
            pageNumber: 1,
            append: true,
            searchType,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            searchAfterCursor: searchAfter
          });
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observer.observe(lastElement);

    return () => {
      if (lastElement) observer.unobserve(lastElement);
      observer.disconnect();
    };
  }, [autoScroll, loading, searchAfter, lastElement, query, page, searchType]);

  const handlePageChange = (newPage) => {
    fetchResults({
      searchQuery: query,
      pageNumber: newPage,
      append: false,
      searchType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  };

  const handleModeToggle = () => {
    const nextMode = !autoScroll;

    if (!nextMode) {
      setResults((prev) => prev.slice(0, PAGE_SIZE));
      setPage(1);
    }

    setAutoScroll(nextMode);
  };

  const handleSearch = (q, type) => {
    setPage(1);
    setSearchAfter(null);
    setResults([]);
    setSearchType(type);

    if (type === 'date') {
      setDateRange({ startDate: q.startDate, endDate: q.endDate });
      fetchResults({
        searchQuery: '',
        pageNumber: 1,
        append: false,
        searchType: type,
        startDate: q.startDate,
        endDate: q.endDate
      });
    } else {
      setQuery(q);
      setDateRange({ startDate: '', endDate: '' });
      fetchResults({
        searchQuery: q,
        pageNumber: 1,
        append: false,
        searchType: type
      });
    }
  };

  return (
    <div className="app">
      <h1>📸 Media Search</h1>

      <SearchControl
        onSearch={handleSearch}
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
              key={`${item.db}-${item.bildnummer}`} // ensure uniqueness
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
