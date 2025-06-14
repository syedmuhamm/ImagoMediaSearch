import React, { useEffect, useState } from "react";
import "./ImageViewer.scss";
import { ChevronLeft, ChevronRight, X, Copy } from "lucide-react";

export default function ImageViewer({ items, currentIndex, onClose, onNext, onPrev }) {
  const [transition, setTransition] = useState("");
  const currentItem = items[currentIndex];

  useEffect(() => {
    const timeout = setTimeout(() => setTransition(""), 300);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  if (currentIndex === null || !currentItem) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentItem.image_url || currentItem.thumbnail_url);
      alert("Bild-URL kopiert!");
    } catch (err) {
      alert("Kopieren fehlgeschlagen.");
    }
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={28} /></button>
        <button className="copy-btn" onClick={handleCopy}><Copy size={20} /></button>

        <button className="nav-btn prev" onClick={() => {
          setTransition("slide-left");
          onPrev();
        }}>
          <ChevronLeft size={32} />
        </button>

        <img
          src={currentItem.image_url || currentItem.thumbnail_url || "/placeholder.jpg"}
          alt={currentItem.suchtext || "Kein Bild"}
          className={transition}
        />

        <button className="nav-btn next" onClick={() => {
          setTransition("slide-right");
          onNext();
        }}>
          <ChevronRight size={32} />
        </button>

        <div className="image-info">
          <p><strong>Bildnummer:</strong> {currentItem.bildnummer || "Unbekannt"}</p>
          <p><strong>Datum:</strong> {currentItem.datum?.slice(0, 10) || "Unbekannt"}</p>
          <p><strong>Fotograf:</strong> {currentItem.fotografen || "Nicht angegeben"}</p>
          <p><strong>Beschreibung:</strong> {currentItem.suchtext || "Keine Beschreibung verfügbar"}</p>
        </div>
      </div>
    </div>
  );
}
