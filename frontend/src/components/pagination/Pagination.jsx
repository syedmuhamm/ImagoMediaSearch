/**
 * Pagination component renders page navigation controls for paginated results.
 * 
 * It shows a limited range of page numbers (up to maxPagesToShow) centered
 * around the current page, with "Prev" and "Next" buttons for navigation.
 * Ellipses ("...") indicate skipped pages when the range doesn't cover all pages.
 * 
 * Props:
 * - currentPage: current active page number
 * - totalPages: total number of pages available
 * - onPageChange: callback to change to a different page
 */

import './Pagination.scss';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxPagesToShow = 7;
  const pageNumbers = [];

  // Calculate start and end page numbers to show in pagination bar,
  // centering the range around the current page.
  let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let end = start + maxPagesToShow - 1;

  // Adjust start if end exceeds total pages
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxPagesToShow + 1);
  }

  // Populate pageNumbers array with calculated range
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-numbers">
      {/* Show 'Prev' button if not on first page */}
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)}>← Prev</button>
      )}

      {/* Show leading ellipsis if start page is greater than 1 */}
      {start > 1 && <span>...</span>}

      {/* Render page number buttons */}
      {pageNumbers.map((num) => (
        <button
          key={num}
          className={num === currentPage ? 'active' : ''}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}

      {/* Show trailing ellipsis if end page is less than totalPages */}
      {end < totalPages && <span>...</span>}

      {/* Show 'Next' button if not on last page */}
      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)}>Next →</button>
      )}
    </div>
  );
}

export default Pagination;
