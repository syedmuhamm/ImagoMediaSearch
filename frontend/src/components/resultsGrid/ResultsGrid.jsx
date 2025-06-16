import MediaCard from '../mediaCard/MediaCard';
import './ResultsGrid.scss'

export default function ResultsGrid({ results, autoScroll, setLastElement, onCardClick }) {
  return (
    <div className="results-grid">
      {(results || []).map((item, idx) => {
        if (!item) return null;

        const isLast = results.length === idx + 1;
        const dbKey = item.db ?? 'unknown-db';
        const bildnummerKey = item.bildnummer ?? 'unknown-bildnummer';

        return (
          <MediaCard
            key={`${dbKey}-${bildnummerKey}-${idx}`}
            item={item}
            setRef={isLast && autoScroll ? (node) => setLastElement(node) : undefined}
            onClick={() => onCardClick(idx)}
          />
        );
      })}
    </div>
  );
}
