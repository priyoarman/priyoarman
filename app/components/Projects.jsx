"use client";

import React, { useRef, useState } from "react";
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
import FadeIn from "./FadeIn";

const slides = [
  {
    id: 1,
    title: "Sayvoya - AI-Powered Travel Assistant",
    description:
      "AI travel assistant that finds and compares real-time flights in plain language. Built with Next.js, Express, PostgreSQL and Groq AI. Presented at Microsoft Copenhagen.",
    image: sayvoyaImg,
    mobileImage: sayvoyaMobileImg,
    video: "/videos/sayvoya-walkthrough.mp4",
    viewProjectLink: "https://sayvoya.onrender.com/",
    githubLink: "https://github.com/priyoarman/sayvoya",
  },
  {
    id: 2,
    title: "AnotherShop - E-Commerce with RAG Chatbot",
    description:
      "Online shop with search, filters, cart and checkout, plus a RAG chatbot that answers from real product data. Built with React, Tailwind CSS, Groq AI and OpenAI.",
    image: ecomImg,
    mobileImage: ecomMobileImg,
    video: "/videos/anothershop-walkthrough.mp4",
    viewProjectLink: "https://anothershop.vercel.app/",
    githubLink: "https://github.com/priyoarman/anothershop",
  },
  {
    id: 3,
    title: "mig33 - Full-StackSocial Media App",
    description:
      "Social media app with OAuth login, follows, posts, likes, comments, live news feed, notifications, and messaging. Built with Next.js, MongoDB, and Tailwind CSS. Presented at Jakala in Hamburg.",
    image: socialImg,
    mobileImage: socialMobileImg,
    video: "/videos/mig33-walkthrough.mp4",
    viewProjectLink: "https://mig33.vercel.app/install",
    githubLink: "https://github.com/priyoarman/mig33",
  },
  {
    id: 4,
    title: "JobRadarDK - A Personal Job Alert System",
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

const arrowButtonClass =
  "pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-gray-950/40 text-gray-100 backdrop-blur-sm transition-colors hover:bg-gray-950/70 light:border-[#2a241f]/15 light:bg-[#f6f0e6]/60 light:text-gray-900 light:hover:bg-[#f6f0e6]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gestureRef = useRef({
    pointerId: null,
    startX: 0,
    hasDragged: false,
  });

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

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (event.target.closest("a, button")) {
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
    }
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
      className="max-w-7xl mx-auto min-h-dvh md:min-h-[85dvh] w-full overflow-hidden pt-20 pb-6 md:py-28 text-center"
    >
      <FadeIn delay={200}>
        <h2 className="text-2xl md:text-4xl text-gray-100 light:text-gray-900 font-bold pb-6 md:py-4 md:pb-0">
          Featured Projects
        </h2>
      </FadeIn>
      <FadeIn delay={300}>
        <div className="w-full px-4 md:px-0 flex items-center justify-center font-sans text-white overflow-hidden">
          <div
            className="relative w-full max-w-4xl h-[calc(100dvh-10.5rem)] max-h-[680px] md:h-[520px] md:max-h-none"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
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
                  <div className="flex flex-col md:flex-row items-center justify-center w-full h-full px-0.5 py-2 md:px-16 md:pb-18 md:pt-10">
                    <ProjectCard
                      project={slide}
                      isActive={index === activeIndex}
                      className="w-full max-w-3xl h-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-2 md:px-0 md:pt-10 md:pb-18">
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous project"
                className={arrowButtonClass}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next project"
                className={arrowButtonClass}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
