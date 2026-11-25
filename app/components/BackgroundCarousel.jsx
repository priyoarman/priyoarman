"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaLocationDot, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const BackgroundCarousel = ({ items, label }) => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  // Keep the active index in sync with manual swipes / scrolls
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      setActive(Math.max(0, Math.min(items.length - 1, idx)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [items.length]);

  const goTo = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (idx + items.length) % items.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      className="relative w-full max-w-md md:max-w-[min(28rem,calc(100dvh-15rem))] mx-auto"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="snap-center shrink-0 w-full aspect-square"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${items.length}`}
          >
            <div className="flex flex-col h-full items-center justify-center gap-2 md:gap-3 p-6 md:p-8 border-2 bg-blue-950/40 border-gray-800/20 rounded-2xl text-gray-100 cursor-default">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src={item.img}
                  fill
                  alt={item.imgAlt}
                  className="object-cover rounded-xl"
                />
              </div>
              <h3 className="font-bold text-gray-50 text-xl md:text-2xl">
                {item.title}
              </h3>
              <p className="text-gray-300 text-base md:text-lg">
                {item.subtitle}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-gray-400 text-sm md:text-base">
                <span className="flex items-center gap-1">
                  <FaLocationDot /> {item.location}
                </span>
                <span>{item.date}</span>
              </div>
              <p className="text-gray-400 text-sm md:text-base max-w-xs">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(active - 1)}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900/60 text-gray-200 hover:bg-gray-800 transition"
      >
        <FaChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        aria-label="Next"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900/60 text-gray-200 hover:bg-gray-800 transition"
      >
        <FaChevronRight />
      </button>

      <div className="flex justify-center gap-2 pt-4">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === active ? "w-6 bg-gray-100" : "w-2 bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundCarousel;
