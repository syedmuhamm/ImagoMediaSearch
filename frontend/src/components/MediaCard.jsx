import './MediaCard.scss';

function boldFullyCapitalWords(text, maxLength = 100) {
  if (!text) return "Keine Beschreibung verfügbar";

  const trimmed = text.length > maxLength ? text.slice(0, maxLength) + "…" : text;

  return trimmed.split(/\s+/).map((word, i) => {
    // Match whole word if 2+ uppercase characters only (incl. German)
    if (/^[A-ZÄÖÜ]{2,}$/.test(word)) {
      return <strong key={i}>{word} </strong>;
    } else {
      return <span key={i}>{word} </span>;
    }
  });
}

export default function MediaCard({ item, setRef, onClick }) {
  return (
    <div
      className={`card ${setRef ? "observed" : ""}`}
      ref={setRef || null}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={item.thumbnail_url || "/placeholder.jpg"}
        alt={item.suchtext || "Kein Bildtext"}
        onError={(e) => {
          if (e.target.src !== window.location.origin + "/placeholder.jpg") {
            e.target.src = "/placeholder.jpg";
          }
        }}
      />
      <div className="meta">
        <p className="meta-item">
          <span className="label">Bildnummer: </span>
          <span className="value">{item.bildnummer || "Unbekannt"}</span>
        </p>
        <p className="meta-item">
          <span className="label">Datum: </span>
          <span className="value">
            {item.datum ? item.datum.slice(0, 10) : "Datum unbekannt"}
          </span>
        </p>
        <p className="meta-item">
          <span className="label">By: </span>
          <span className="value">{item.fotografen || "Nicht angegeben"}</span>
        </p>
      </div>

      <p className="description">{boldFullyCapitalWords(item.suchtext)}</p>
    </div>
  );
}
