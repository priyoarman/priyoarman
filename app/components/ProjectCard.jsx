"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProjectCard({
  project,
  isActive = true,
  className = "",
}) {
  const { title, description, image, mobileImage, video, viewProjectLink, githubLink } =
    project;
  const desktopHidden = mobileImage ? "hidden md:block" : "";
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const shouldPlay = isActive && inView;

  // Track whether the video is on screen (at least half visible).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [video]);

  // Play only while this slide is in front and on screen; otherwise stop and
  // rewind so it starts from 0:00 the next time it comes into view.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (shouldPlay) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [shouldPlay]);

  return (
    <div
      className={`relative rounded-2xl shadow-lg overflow-hidden h-full w-full hover:scale-105 transition duration-300 ease-in-out ${className}`}
    >
      {image && (
        <div className="relative w-full h-full">
          {mobileImage && (
            <Image
              src={mobileImage}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover object-top md:hidden"
            />
          )}
          {video ? (
            <video
              ref={videoRef}
              src={video}
              poster={image.src}
              loop
              muted
              playsInline
              preload="auto"
              aria-label={`${title} walkthrough`}
              className={`absolute inset-0 h-full w-full object-cover object-top ${desktopHidden}`}
            />
          ) : (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className={`object-cover ${desktopHidden}`}
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-gray-950 from-15% via-gray-950/85 via-50% to-gray-950/20 light:from-[#f6f0e6]/85 light:from-0% light:via-[#f6f0e6]/55 light:via-35% light:to-transparent light:to-60%"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden light:block backdrop-blur-[6px] mask-[linear-gradient(to_top,black_40%,transparent_62%)]"
          />
        </div>
      )}

      <div className="absolute inset-0 z-10 p-6 flex flex-col h-full">
        <div className="mt-auto">
          <h3 className="text-xl font-semibold text-gray-50 light:text-gray-900 mb-2 text-start">
            {title}
          </h3>
          <p className="text-gray-100 light:text-gray-800 text-md text-start mb-4">{description}</p>

          <div className="flex gap-2 mt-auto">
            {viewProjectLink && (
              <Link
                href={viewProjectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-700/30 text-white text-sm font-medium rounded-4xl hover:bg-neutral-700/70 light:bg-[#2a241f]/10 light:text-gray-900 light:hover:bg-[#2a241f]/20 transition-colors"
              >
                See Live
              </Link>
            )}
            {githubLink && (
              <Link
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700/30 text-gray-300 text-sm font-medium rounded-4xl hover:bg-gray-700/70 light:bg-[#2a241f]/10 light:text-gray-700 light:hover:bg-[#2a241f]/20 transition-colors"
              >
                GitHub
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
