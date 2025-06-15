/**
 * SearchControl component provides UI for entering search queries,
 * selecting the type of search (all fields, bildnummer, photographer, date range),
 * and toggling between infinite scroll and pagination modes.
 * 
 * Handles input state internally and calls onSearch callback with appropriate
 * parameters on form submission. Shows date range inputs when 'date' search type is selected.
 */

import React, { useState } from 'react';
import './SearchControl.scss';

function SearchControl({ onSearch, onToggleMode, autoScroll }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handles form submission, dispatching search parameters based on type
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
        disabled={searchType === 'date'} // Disable text input if searching by date range
      />

      <select
        value={searchType}
        onChange={(e) => {
          // Reset all inputs when search type changes
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

      {/* Show date inputs only when 'date' search type is selected */}
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

      {/* Button toggles infinite scroll / pagination mode */}
      <button type="button" onClick={onToggleMode}>
        {autoScroll ? 'Switch to Pagination' : 'Switch to Infinite Scroll'}
      </button>
    </form>
  );
}

export default SearchControl;
