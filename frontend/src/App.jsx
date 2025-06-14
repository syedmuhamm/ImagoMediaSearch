import React from 'react';
import './App.scss';
import Pagination from './components/Pagination';
import SearchControl from './components/SearchControls';
import AppHeader from './components/app/AppHeader';
import LoadingErrorState from './components/app/LoadingErrorState';
import ResultsGrid from './components/app/ResultsGrid';
import useMediaSearch from './hooks/useMediaSearch';

function App() {
  // Use custom hook to manage all search logic and state
  const {
    results,
    loading,
    error,
    autoScroll,
    page,
    totalPages,
    setLastElement,
    handlePageChange,
    handleModeToggle,
    handleSearch
  } = useMediaSearch();

  return (
    <div className="app">
      {/* Page header with app title */}
      <AppHeader />

      {/* Search input and controls:
          handles user input and mode toggle (pagination vs infinite scroll) */}
      <SearchControl
        onSearch={handleSearch}
        onToggleMode={handleModeToggle}
        autoScroll={autoScroll}
      />

      {/* Displays loading spinner or error message based on state */}
      <LoadingErrorState loading={loading} error={error} />

      {/* Grid of media cards showing search results
          Includes infinite scroll logic with last element ref */}
      <ResultsGrid
        results={results}
        autoScroll={autoScroll}
        setLastElement={setLastElement}
      />

      {/* Pagination controls shown only when autoScroll is off and multiple pages exist */}
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
