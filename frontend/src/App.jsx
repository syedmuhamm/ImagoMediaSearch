import React, { useState } from 'react';
import './App.scss';
import AppHeader from './components/app/AppHeader';
import LoadingErrorState from './components/app/LoadingErrorState';
import useMediaSearch from './hooks/useMediaSearch';
import SearchControl from './components/searchControl/SearchControls';
import Pagination from './components/pagination/Pagination';
import ImageViewer from './components/imageViewer/ImageViewer';
import ResultsGrid from './components/resultsGrid/ResultsGrid';

function App() {
  
  // Existing hook and state management for media search
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

  // New state for fullscreen viewer
  const [viewerIndex, setViewerIndex] = useState(null);

  // Handlers for image viewer
  const openViewer = (idx) => setViewerIndex(idx);
  const closeViewer = () => setViewerIndex(null);
  const prevImage = () => setViewerIndex(i => (i === 0 ? results.length - 1 : i - 1));
  const nextImage = () => setViewerIndex(i => (i === results.length - 1 ? 0 : i + 1));

  return (
    <div className="app">
      <AppHeader />

      <SearchControl
        onSearch={handleSearch}
        onToggleMode={handleModeToggle}
        autoScroll={autoScroll}
      />

      <LoadingErrorState loading={loading} error={error} />

      <ResultsGrid
        results={results}
        autoScroll={autoScroll}
        setLastElement={setLastElement}
        onCardClick={openViewer}
      />

      {!autoScroll && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Image viewer modal */}
      <ImageViewer
        items={results}
        currentIndex={viewerIndex}
        onClose={closeViewer}
        onPrev={prevImage}
        onNext={nextImage}
      />
    </div>
  );
}

export default App;
