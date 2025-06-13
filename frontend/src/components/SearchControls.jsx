import React, { useState } from 'react';
import './SearchControl.scss';

function SearchControl({ onSearch, onToggleMode, autoScroll }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchType === 'date') {
      onSearch({ startDate, endDate }, 'date');
    } else {
      onSearch(query, searchType);
    }
  };

  return (
    <form className="search-control" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search media..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={searchType === 'date'}
      />

      <select
        value={searchType}
        onChange={(e) => {
          setSearchType(e.target.value);
          setQuery('');
          setStartDate('');
          setEndDate('');
        }}
      >
        <option value="">🔍 All Fields</option>
        <option value="bildnummer">Bildnummer</option>
        <option value="photographer">Photographer</option>
        <option value="date">Date Range</option>
      </select>

      {searchType === 'date' && (
        <div className="date-range">
          <label>
            From:
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label>
            To:
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
        </div>
      )}

      <button type="submit">Search</button>
      <button type="button" onClick={onToggleMode}>
        {autoScroll ? 'Switch to Pagination' : 'Switch to Infinite Scroll'}
      </button>
    </form>
  );
}

export default SearchControl;
