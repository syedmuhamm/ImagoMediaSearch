/**
 * MediaCard component displays a single media item's thumbnail and metadata.
 * 
 * Props:
 * - item: object containing media details like thumbnail_url, bildnummer, datum, fotografen, suchtext
 * - setRef: optional ref callback for the card container (used for infinite scroll intersection)
 * 
 * Features:
 * - Shows placeholder image if thumbnail is missing or fails to load
 * - Highlights card border red if setRef is provided (indicating it may be observed)
 * - Truncates description text to 100 characters with ellipsis
 * - Displays fallback text for missing metadata fields
 */

export default function MediaCard({ item, setRef }) {
  return (
    <div
      className={`card ${setRef ? 'observed' : ''}`}
      ref={setRef || null}
    >
      <img
        src={item.thumbnail_url || "/placeholder.jpg"}
        alt={item.suchtext || "Kein Bildtext"}
        // On image load error, fallback to placeholder (prevents broken images)
        onError={(e) => {
          if (e.target.src !== window.location.origin + "/placeholder.jpg") {
            e.target.src = "/placeholder.jpg";
          }
        }}
      />
      <p><strong>{item.bildnummer || "Unbekannt"}</strong></p>
      <p>{item.datum ? item.datum.slice(0, 10) : "Datum unbekannt"}</p>
      <p>{item.fotografen || "Fotograf nicht angegeben"}</p>
      <p className="description">
        {(item.suchtext && item.suchtext.length > 0)
          ? `${item.suchtext.slice(0, 100)}...`
          : "Keine Beschreibung verfügbar"}
      </p>
    </div>
  );
}
