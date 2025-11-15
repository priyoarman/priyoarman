"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProjectCard from "./ProjectCard";
import socialImg from "../assets/Portfolio-Project-1-SS1.png"
import ecomImg from "../assets/ashop-home-dark.png"
import bsnLandingImg from "../assets/aaveq-home.png"
import stpLandingImg from "../assets/waveriders-home.png"

const slides = [
  {
    id: 1,
    title: "Social Media Application",
    description:
      "Features: User Authentication, Interactivity (Post, Like, Comment), Real time news API fetch",
    image: socialImg,
    viewProjectLink: "https://redilink.vercel.app",
    githubLink: "https://github.com/priyoarman/redilink",
  },
  {
    id: 2,
    title: "E-Commerce Platform",
    description:
      "Features: Product listing, Categorising, Search filter, Shopping cart and Checkout flow",
    image: ecomImg,
    viewProjectLink: "https://anothershop.vercel.app",
    githubLink: "https://github.com/priyoarman/anothershop",
  },
  {
    id: 3,
    title: "Business Landing Page",
    description:
      "Features: Content migration, SEO, Performance tweaks, Deployment, Maintenance",
    image: bsnLandingImg,
    viewProjectLink: "https://aaveqrobotics.com/",
    githubLink: "https://github.com/priyoarman/aaveqrobotics-website",
  },
  {
    id: 4,
    title: "Startup Landing Page",
    description:
      "Features: Simple landing page, Content management, Navigation, Theme toggler",
    image: stpLandingImg,
    viewProjectLink: "https://codepen.io/priyoarman/full/VYvBxyB",
    githubLink: "https://codepen.io/priyoarman/pen/VYvBxyB",
  },
];

const ChevronLeftIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getSlidePosition = (index) => {
    const totalSlides = slides.length;

    if (index === activeIndex) {
      return "transform translate-x-0 opacity-100 z-20 scale-100";
    }

    const prevIndex = (activeIndex - 1 + totalSlides) % totalSlides;
    if (index === prevIndex) {
      return "transform -translate-x-1/2 md:-translate-x-1/3 scale-90 opacity-40 z-10 blur-sm";
    }

    const nextIndex = (activeIndex + 1) % totalSlides;
    if (index === nextIndex) {
      return "transform translate-x-1/2 md:translate-x-1/3 scale-90 opacity-40 z-10 blur-sm";
    }

    return "transform translate-x-0 opacity-0 z-0 scale-75 blur-md";
  };

  return (
    <section
      id="projects"
      className="max-w-7xl bg-gray-950 mx-auto min-h-dvh px-4 py-12 md:py-28 text-center"
    >
      <h2 className="text-3xl md:text-4xl text-gray-100 font-bold pt-4">
        Featured Projects
      </h2>
      <div className="bg-gray-950 w-full flex items-center justify-center font-sans text-white overflow-hidden">
        <div className="relative w-full max-w-4xl h-[540px]">
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute top-0 w-full h-full transition-all duration-500 ease-in-out ${getSlidePosition(
                  index
                )}`}
              >

                <div className="flex flex-col md:flex-row items-center justify-center w-full h-full p-8 md:p-16 rounded-lg shadow-2xl">
                  <ProjectCard
                    project={slide}
                    className="w-full max-w-3xl h-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToPrev}
            className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-16 z-30 p-3 bg-gray-100/20 rounded-full text-white transition-all duration-300 hover:bg-gray-100/50 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="md:pt-1 md:pl-0.5 w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-16 z-30 p-3 bg-gray-100/20 rounded-full text-white transition-all duration-300 hover:bg-gray-100/50 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="md:pt-1 md:pl-1 mx-auto w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>
      </div>
    </section>
  );
}