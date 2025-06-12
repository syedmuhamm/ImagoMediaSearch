import React from 'react';
import './Pagination.scss';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxPagesToShow = 7;
  const pageNumbers = [];

  let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let end = start + maxPagesToShow - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-numbers">
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)}>← Prev</button>
      )}

      {start > 1 && <span>...</span>}
      {pageNumbers.map((num) => (
        <button
          key={num}
          className={num === currentPage ? 'active' : ''}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}
      {end < totalPages && <span>...</span>}

      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)}>Next →</button>
      )}
    </div>
  );
}

export default Pagination;
