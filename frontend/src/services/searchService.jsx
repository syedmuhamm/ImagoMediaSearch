import { BASE_URL, PAGE_SIZE } from '../config';

const controllerMap = new Map();

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
  const key = `${searchType}-${searchQuery}-${page}-${startDate}-${endDate}-${searchAfter}`;

  // Abort existing request with same key
  if (controllerMap.has(key)) {
    controllerMap.get(key).abort();
  }

  const controller = new AbortController();
  controllerMap.set(key, controller);

  let url = '';
  if (searchType === 'bildnummer') {
    url = `${BASE_URL}/search/by-bildnummer/?bildnummer=${encodeURIComponent(searchQuery)}`;
  } else if (searchType === 'photographer') {
    url = `${BASE_URL}/search/by-fotograf/?fotograf=${encodeURIComponent(searchQuery)}&page=${page}&page_size=${PAGE_SIZE}`;
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


    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
            const data = await res.json();

            controllerMap.delete(key);
            return data;
        } catch (err) {
            if (err.name === 'AbortError') {
            console.warn('Fetch aborted:', key);
            throw err;
            }

            if (attempt === retries) {
            console.error(`Fetch failed after ${retries + 1} attempts`, err);
            throw err;
            }

            // Exponential backoff before retry
            await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt)));
        }
    }
}
