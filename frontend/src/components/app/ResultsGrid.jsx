/**
 * ResultsGrid component renders a grid of media items using MediaCard components.
 * 
 * Props:
 * - results: array of media item objects to display
 * - autoScroll: boolean indicating if infinite scroll mode is active
 * - setLastElement: callback ref setter to mark the last item for intersection observer (used for infinite scroll)
 * 
 * Features:
 * - Maps over results and renders a MediaCard for each item
 * - Assigns a unique key combining database, bildnummer, and index for stable rendering
 * - Attaches ref to the last item only if autoScroll is enabled, to trigger fetching more items on scroll
 */

import MediaCard from '../MediaCard';

export default function ResultsGrid({ results, autoScroll, setLastElement }) {
  return (
    <div className="results-grid">
      {(results || []).map((item, idx) => {
        if (!item) return null;

        // Check if this is the last item in the results array
        const isLast = results.length === idx + 1;

        // Create keys from db and bildnummer fields, fallback to placeholders
        const dbKey = item.db ?? 'unknown-db';
        const bildnummerKey = item.bildnummer ?? 'unknown-bildnummer';

        return (
          <MediaCard
            key={`${dbKey}-${bildnummerKey}-${idx}`}
            item={item}
            // Only set ref on the last item when autoScroll is active to detect scrolling near end
            setRef={isLast && autoScroll ? (node) => setLastElement(node) : undefined}
          />
        );
      })}
    </div>
  );
}
