"use client";

import React, { useState, useEffect } from "react";

export default function Typewriter({
  words = ["Full Stack Developer", "UI/UX Enthusiast"],
  colors = ["text-gray-300"],
  typingSpeed = 100,
  deletingSpeed = 50,
  pause = 3000,
  className = "",
}) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const current = words[index];
    let timeoutId = null;

    if (!isDeleting && subIndex === current.length) {
      timeoutId = setTimeout(() => setIsDeleting(true), pause);
      return () => clearTimeout(timeoutId);
    }

    if (isDeleting && subIndex === 0) {
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }, 80);
      return () => clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeoutId);
  }, [subIndex, index, isDeleting, words, typingSpeed, deletingSpeed, pause]);

  const text = words.length ? words[index].slice(0, subIndex) : "";

  const currentColor = colors[index % colors.length];

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className={currentColor}>{text}</span>
      <span className="ml-1 mb-0.5 text-gray-300 animate-pulse">|</span>
    </div>
  );
}
