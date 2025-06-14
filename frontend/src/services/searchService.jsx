// This module exports the `searchMedia` function which performs 
// media searches against different backend endpoints depending on 
// search type. It supports pagination, infinite scroll via search_after,
// request cancellation, and retry with exponential backoff.

import {  PAGE_SIZE } from '../config';

const controllerMap = new Map();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function searchMedia({
  searchQuery,
  page = 1,
  searchType = '',
  startDate = '',
  endDate = '',
  searchAfter = null,
  autoScroll = true,
  retries = 2
}) {
  // Unique key to identify each request for aborting duplicates
  const key = `${searchType}-${searchQuery}-${page}-${startDate}-${endDate}-${searchAfter}`;

  // Abort existing request with same key to avoid race conditions
  if (controllerMap.has(key)) {
    controllerMap.get(key).abort();
  }

  const controller = new AbortController();
  controllerMap.set(key, controller);

  let url = '';

  // Build API URL depending on searchType and parameters
  if (searchType === 'bildnummer') {
    url = `${BASE_URL}/search/by-bildnummer/?bildnummer=${encodeURIComponent(searchQuery)}`;
  } else if (searchType === 'photographer') {
    url = `${BASE_URL}/search/by-fotograf/?fotograf=${encodeURIComponent(searchQuery)}&page=${page}&page_size=${PAGE_SIZE}`;
    // Append search_after param only if autoScroll enabled and cursor present
    if (autoScroll && searchAfter) {
      url += `&search_after=${encodeURIComponent(JSON.stringify(searchAfter))}`;
    }
  } else if (searchType === 'date') {
    url = `${BASE_URL}/search/by-datum/?datum_von=${startDate}&datum_bis=${endDate}&page=${page}&page_size=${PAGE_SIZE}`;
    if (autoScroll && searchAfter) {
      url += `&search_after=${encodeURIComponent(JSON.stringify(searchAfter))}`;
    }
  } else {
    url = `${BASE_URL}/search/?q=${encodeURIComponent(searchQuery)}&page=${page}&page_size=${PAGE_SIZE}`;
    if (autoScroll && searchAfter) {
      url += `&search_after=${encodeURIComponent(JSON.stringify(searchAfter))}`;
    }
  }

  // Attempt fetch with retry and exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

      const data = await res.json();

      // Clean up the controller for this request key once successful
      controllerMap.delete(key);

      return data;
    } catch (err) {
      // Throw immediately if fetch was aborted
      if (err.name === 'AbortError') {
        console.warn('Fetch aborted:', key);
        throw err;
      }

      // If last attempt, throw error upwards
      if (attempt === retries) {
        console.error(`Fetch failed after ${retries + 1} attempts`, err);
        throw err;
      }

      // Wait with exponential backoff before retrying
      await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt)));
    }
  }
}
