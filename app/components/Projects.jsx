"use client";

import React, { useEffect, useRef, useState } from "react";
import ProjectCard from "./ProjectCard";
import sayvoyaImg from "../assets/sayvoya.png";
import socialImg from "../assets/mig33.png";
import ecomImg from "../assets/anothershop02.png";
import jobradarImg from "../assets/jobradar.png";
import sayvoyaMobileImg from "../assets/sayvoya-mobile.png";
import socialMobileImg from "../assets/mig33-mobile.png";
import ecomMobileImg from "../assets/anothershop-mobile.png";
import jobradarMobileImg from "../assets/jobradar-mobile.jpg";
import bsnLandingImg from "../assets/aaveq-home.png";
import stpLandingImg from "../assets/waveriders-home.png";
import FadeIn from "./FadeIn";

const slides = [
  {
    id: 1,
    title: "Sayvoya - AI-Powered Travel Assistant",
    description:
      "AI travel assistant that finds and compares real-time flights in plain language. Built with Next.js, Express, PostgreSQL and Groq AI. Presented at Microsoft Copenhagen.",
    image: sayvoyaImg,
    mobileImage: sayvoyaMobileImg,
    viewProjectLink: "https://sayvoya.onrender.com/",
    githubLink: "https://github.com/priyoarman/sayvoya",
  },
  {
    id: 2,
    title: "E-Commerce App with RAG Chatbot",
    description:
      "Online shop with search, filters, cart and checkout, plus a RAG chatbot that answers from real product data. Built with React, Tailwind CSS, Groq AI and OpenAI.",
    image: ecomImg,
    mobileImage: ecomMobileImg,
    viewProjectLink: "https://anothershop.vercel.app/",
    githubLink: "https://github.com/priyoarman/anothershop",
  },
  {
    id: 3,
    title: "mig33 - A Social Media App",
    description:
      "Social media app with OAuth login, follows, posts, likes, comments, live news feed, notifications, and messaging. Built with Next.js, MongoDB, and Tailwind CSS. Presented at Jakala in Hamburg.",
    image: socialImg,
    mobileImage: socialMobileImg,
    viewProjectLink: "https://mig33.vercel.app/install",
    githubLink: "https://github.com/priyoarman/mig33",
  },
  {
    id: 4,
    title: "Job Radar DK - A Personal Job Alert System",
    description:
      "Reads Danish tech companies' job feeds every 3 hours, filters new jobs by title and emails me the matches. Built with Node.js, TypeScript, Postgres and GitHub Actions.",
    image: jobradarImg,
    mobileImage: jobradarMobileImg,
    viewProjectLink:
      "https://github.com/priyoarman/job-radar-dk/actions/workflows/pipeline.yml",
    githubLink: "https://github.com/priyoarman/job-radar-dk",
  },

  // {
  //   id: 5,
  //   title: "Business Landing Page",
  //   description:
  //     "Features: Content migration, SEO, Performance tweaks, Deployment, Maintenance",
  //   image: bsnLandingImg,
  //   viewProjectLink: "https://aaveqrobotics.com/",
  //   githubLink: "https://github.com/priyoarman/aaveqrobotics-website",
  // },
  // {
  //   id: 6,
  //   title: "Startup Landing Page",
  //   description:
  //     "Features: Simple landing page, Content management, Navigation, Theme toggler",
  //   image: stpLandingImg,
  //   viewProjectLink: "https://codepen.io/priyoarman/full/VYvBxyB",
  //   githubLink: "https://codepen.io/priyoarman/pen/VYvBxyB",
  // },
];

const createCursor = (svgMarkup) =>
  `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}") 16 16, pointer`;

const pauseCursor = createCursor(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="9" y="7" width="5" height="18" rx="1.5" fill="white"/><rect x="18" y="7" width="5" height="18" rx="1.5" fill="white"/></svg>',
);

const playCursor = createCursor(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M12 8.5L23 16L12 23.5V8.5Z" fill="white"/></svg>',
);

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gestureRef = useRef({
    pointerId: null,
    startX: 0,
    hasDragged: false,
  });
  const isPaused = manualPaused || hoverPaused || isDragging;

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1,
      );
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  const goToPrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const togglePlayback = () => {
    setManualPaused((previous) => !previous);
  };

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (event.target.closest("a")) {
      return;
    }

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      hasDragged: false,
    };

    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (gestureRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gestureRef.current.startX;

    if (!gestureRef.current.hasDragged && Math.abs(deltaX) > 6) {
      gestureRef.current.hasDragged = true;
    }

    if (gestureRef.current.hasDragged) {
      setDragOffset(deltaX);
    }
  };

  const finishDrag = (event) => {
    if (gestureRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gestureRef.current.startX;
    const shouldAdvance = Math.abs(deltaX) > 70;

    if (shouldAdvance) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    gestureRef.current = {
      pointerId: null,
      startX: 0,
      hasDragged: false,
    };

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleClick = (event) => {
    if (gestureRef.current.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.target.closest("a")) {
      return;
    }

    togglePlayback();
  };

  const getSlidePosition = (index) => {
    const totalSlides = slides.length;

    if (index === activeIndex) {
      return "transform translate-x-0 opacity-100 z-20 scale-100";
    }

    const prevIndex = (activeIndex - 1 + totalSlides) % totalSlides;
    if (index === prevIndex) {
      return "transform -translate-x-1/2 md:-translate-x-1/3 scale-80 opacity-0 md:opacity-20 z-10 blur-sm";
    }

    const nextIndex = (activeIndex + 1) % totalSlides;
    if (index === nextIndex) {
      return "transform translate-x-1/2 md:translate-x-1/3 scale-80 opacity-0 md:opacity-20 z-10 blur-sm";
    }

    return "transform translate-x-0 opacity-0 z-0 scale-75 blur-md";
  };

  return (
    <section
      id="projects"
      className="max-w-7xl mx-auto min-h-[85dvh] w-full overflow-hidden py-10 md:py-28 text-center"
    >
      <FadeIn delay={200}>
        <h2 className="text-3xl md:text-4xl text-gray-100 font-bold py-4 md:pb-0">
          Featured Projects
        </h2>
      </FadeIn>
      <FadeIn delay={300}>
        <div className="bg-gray-900 w-full px-4 md:px-0 flex items-center justify-center font-sans text-white overflow-hidden">
          <div
            className="relative w-full max-w-4xl h-[520px]"
            style={{ cursor: isPaused ? playCursor : pauseCursor }}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onPointerLeave={finishDrag}
          >
            <div
              className="relative w-full h-full"
              style={{ touchAction: "pan-y" }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute top-0 w-full h-full transition-all duration-400 ease-in-out ${getSlidePosition(
                    index,
                  )}`}
                  style={
                    index === activeIndex
                      ? {
                          transform: `translateX(${dragOffset}px)`,
                          transition: isDragging ? "none" : undefined,
                        }
                      : undefined
                  }
                >
                  <div className="flex flex-col md:flex-row items-center justify-center w-full h-full px-0.5 py-6 md:px-16 md:pb-18 md:pt-10">
                    <ProjectCard
                      project={slide}
                      className="w-full max-w-3xl h-full"
                      onControlHoverChange={setHoverPaused}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
