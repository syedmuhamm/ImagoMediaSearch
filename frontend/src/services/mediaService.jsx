// src/services/mediaService.js
import { BASE_URL, PAGE_SIZE } from '../config';

export async function fetchMedia({
  searchQuery,
  pageNumber = 1,
  searchType = '',
  startDate = '',
  endDate = '',
  searchAfterCursor = null,
  autoScroll = true
}) {
  if (searchType !== 'date' && !searchQuery) return { error: 'Empty query', data: null };

  let endpoint = '';

  if (searchType === 'bildnummer') {
    endpoint = `${BASE_URL}/search/by-bildnummer/?bildnummer=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${PAGE_SIZE}`;
  } else if (searchType === 'photographer') {
    endpoint = `${BASE_URL}/search/by-fotograf/?fotograf=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${PAGE_SIZE}`;
  } else if (searchType === 'date') {
    endpoint = `${BASE_URL}/search/by-datum/?datum_von=${startDate}&datum_bis=${endDate}&page=${pageNumber}&page_size=${PAGE_SIZE}`;
  } else {
    endpoint = `${BASE_URL}/search/?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}&page_size=${PAGE_SIZE}`;
    if (autoScroll && searchAfterCursor) {
      endpoint += `&search_after=${searchAfterCursor}`;
    }
  }

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { error: err.message || 'Something went wrong.', data: null };
  }
}
