export default function MediaCard({ item, setRef }) {
  return (
    <div
      className="card"
      ref={setRef || null}
      style={{ border: setRef ? '2px solid red' : undefined }}
    >
      <img
        src={item.thumbnail_url || "/placeholder.jpg"}
        alt={item.suchtext || "Kein Bildtext"}
        style={{ width: '100%', objectFit: 'cover', height: '200px' }}
        onError={(e) => {
          if (e.target.src !== window.location.origin + "/placeholder.jpg") {
            e.target.src = "/placeholder.jpg";
          }
        }}
      />
      <p><strong>{item.bildnummer || "Unbekannt"}</strong></p>
      <p>{item.datum ? item.datum.slice(0, 10) : "Datum unbekannt"}</p>
      <p>{item.fotografen || "Fotograf nicht angegeben"}</p>
      <p style={{ fontSize: '0.9rem' }}>
        {(item.suchtext && item.suchtext.length > 0)
          ? `${item.suchtext.slice(0, 100)}...`
          : "Keine Beschreibung verfügbar"}
      </p>
    </div>
  );
}
