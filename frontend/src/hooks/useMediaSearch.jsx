/**
 * Custom React hook to manage media search state and behavior.
 * Handles query, search type, results, loading/error states,
 * pagination, infinite scroll with search_after cursor, and date range filtering.
 * Provides handlers for page changes, mode toggle (pagination vs infinite scroll),
 * and search submission.
 */

import { useState, useEffect } from 'react';
import { searchMedia } from '../services/searchService';
import { PAGE_SIZE } from '../config';

export default function useMediaSearch(autoScrollInitial = true) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(autoScrollInitial);
  const [searchAfter, setSearchAfter] = useState(null);
  const [lastElement, setLastElement] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch search results from API with options for pagination, infinite scroll append,
  // and filtering by date range.
  const fetchResults = async ({
    searchQuery,
    pageNumber = 1,
    append = false,
    searchType,
    startDate = '',
    endDate = '',
    searchAfterCursor = null
  }) => {
    // Skip fetch if query empty for all types except 'date' search
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

      setResults((prev) => {
        // Normalize results to array, since some searches return single object
        const newResults = Array.isArray(data.results) ? data.results : [data.results];
        // Append or replace results depending on mode
        return append ? [...prev, ...newResults] : newResults;
      });
      setPage(data.page || 1);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      setSearchAfter(data.next_search_after ?? null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect hook to implement infinite scroll behavior:
   * Sets up IntersectionObserver to watch last element visible on screen
   * and fetch next batch of results using search_after cursor.
   */
  useEffect(() => {
    if (!autoScroll || loading || !searchAfter || !lastElement) return;
    if (searchType === 'bildnummer') return; // no infinite scroll for unique id searches

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(lastElement);

    return () => {
      if (lastElement) observer.unobserve(lastElement);
      observer.disconnect();
    };
  }, [autoScroll, loading, searchAfter, lastElement, query, page, searchType]);

  // Handler to change page in pagination mode
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

  // Handler to toggle between infinite scroll and pagination modes
  const handleModeToggle = () => {
    const nextMode = !autoScroll;
    setLastElement(null); // reset ref to avoid duplicate triggers

    if (!nextMode) {
      // When switching to pagination, trim results to first page
      setResults((prev) => prev.slice(0, PAGE_SIZE));
      setPage(1);
    }

    setAutoScroll(nextMode);
  };

  // Handler to initiate a new search with given query and type
  const handleSearch = (q, type) => {
    setPage(1);
    setSearchAfter(null);
    setResults([]);
    setSearchType(type);
    setLastElement(null);

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

  return {
    query,
    searchType,
    results,
    loading,
    page,
    totalPages,
    error,
    autoScroll,
    lastElement,
    setLastElement,
    handlePageChange,
    handleModeToggle,
    handleSearch,
  };
}
