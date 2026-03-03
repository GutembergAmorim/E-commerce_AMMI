import { useEffect, useState, useRef, useCallback } from "react";
import "./Banner.css";
import Foto_1 from "../../assets/Banner/Foto 1.png";
import Foto_2 from "../../assets/Banner/Foto 2.png";

const images = [
  { id: 1, img: Foto_1 },
  { id: 2, img: Foto_2 },
];

const AUTO_PLAY_MS = 5000;

export default function Banner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartRef = useRef(0);
  const touchDeltaRef = useRef(0);

  // ── Auto-play (pausa ao interagir) ──
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const goTo = useCallback((i) => {
    setIndex(i);
    setPaused(true);
    // Retoma auto-play após 8s de inatividade
    setTimeout(() => setPaused(false), 8000);
  }, []);

  const goPrev = () => goTo((index - 1 + images.length) % images.length);
  const goNext = () => goTo((index + 1) % images.length);

  // ── Touch / Swipe ──
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
    touchDeltaRef.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaRef.current = e.touches[0].clientX - touchStartRef.current;
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaRef.current;
    if (delta > 50) goPrev();
    else if (delta < -50) goNext();
  };

  return (
    <div
      className="banner"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className="banner-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <img key={img.id} src={img.img} alt={`Banner ${i + 1}`} />
        ))}
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            className="banner-arrow banner-arrow--prev"
            onClick={goPrev}
            aria-label="Slide anterior"
            type="button"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            className="banner-arrow banner-arrow--next"
            onClick={goNext}
            aria-label="Próximo slide"
            type="button"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="banner-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`banner-dot ${index === i ? "banner-dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
}