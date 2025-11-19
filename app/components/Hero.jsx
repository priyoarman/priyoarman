"use client";

import { useEffect, useRef } from "react";
import Typewriter from "./Typewriter";
import { FaFacebook } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import FadeIn from "./FadeIn";

export default function Hero() {
  const h1Ref = useRef(null);
  const isHoverRef = useRef(true);

  const currentAngle = useRef(0);
  const currentStop1 = useRef(30);
  const currentStop2 = useRef(70);
  const currentHue = useRef(0);

  const maxDistance = 300;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      const el = h1Ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const gradientSpread = Math.min(distance / maxDistance, 1);

      currentAngle.current = lerp(currentAngle.current, targetAngle, 0.1);
      currentStop1.current = lerp(
        currentStop1.current,
        30 + gradientSpread * 20,
        0.1
      );
      currentStop2.current = lerp(
        currentStop2.current,
        70 + gradientSpread * 20,
        0.1
      );

      const targetHue = (((currentAngle.current + 180) * 360) / 360) % 360;
      currentHue.current = lerp(currentHue.current, targetHue, 0.1);

      const color1 = `hsl(${currentHue.current.toFixed(2)}, 70%, 60%)`;
      const color2 = `hsl(${((currentHue.current + 60) % 360).toFixed(
        2
      )}, 70%, 60%)`;

      requestAnimationFrame(() => {
        el.style.setProperty("--gradient-angle", `${currentAngle.current + 90}deg`);
        el.style.setProperty("--gradient-stop-1", `${currentStop1.current}%`);
        el.style.setProperty("--gradient-stop-2", `${currentStop2.current}%`);
        el.style.setProperty("--gradient-color-1", color1);
        el.style.setProperty("--gradient-color-2", color2);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const gradientBackgroundStyle = {
    background:
      "linear-gradient(var(--gradient-angle, 90deg), var(--gradient-color-1, #60A5FA) var(--gradient-stop-1, 30%), var(--gradient-color-2, #C084FC) var(--gradient-stop-2, 70%))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    transitionTimingFunction: "ease-in-out",
  };

  const typewriterWords = [
    "Full Stack Developer",
    "Frontend Engineer",
    "React & Next.js Developer",
    "WordPress & Shopify Developer",
  ];

  const typewriterColors = [
    "text-green-400",
    "text-yellow-400",
    "text-sky-500",
    "text-pink-500",
  ];

  return (
      <div className="flex flex-col min-h-dvh w-full overflow-hidden items-center bg-gray-900">
      <section
        id="home"
        className="flex-1 flex flex-col w-full justify-center items-center text-center px-4 pt-6"
      >
        <FadeIn delay={200}>
          <h1
          ref={h1Ref}
          className="text-5xl md:text-6xl font-bold cursor-default hover:scale-105 transition duration-300 ease-in-out"
          style={gradientBackgroundStyle}
          onMouseEnter={() => {
            isHoverRef.current = true;
            const el = h1Ref.current;
            if (el) {
              el.style.setProperty("--gradient-angle", "90deg");
              el.style.setProperty("--gradient-stop-1", "30%");
              el.style.setProperty("--gradient-stop-2", "70%");
              el.style.setProperty("--gradient-color-1", "hsl(200,70%,60%)");
              el.style.setProperty("--gradient-color-2", "hsl(260,70%,60%)");
            }
          }}
          onMouseLeave={() => {
            isHoverRef.current = false;
          }}
        >
          Arman Hossain
        </h1>
        </FadeIn>
        
        <FadeIn delay={300}>
          <Typewriter
          words={typewriterWords}
          colors={typewriterColors}
          typingSpeed={50}
          deletingSpeed={30}
          pause={2000}
          className="text-lg md:text-xl my-4 transition duration-300 ease-in-out"
        />
        </FadeIn>
        
        <FadeIn delay={400}>
          <div className="flex flex-row gap-4 text-3xl pt-2">
          <a
            href="https://facebook.com/me.priyo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[27px] hover:text-blue-600  hover:scale-150 focus:scale-150 focus:text-blue-600 transition duration-300 ease-in-out cursor-pointer"
          >
            <FaFacebook />
          </a>
          <a
            href="https://x.com/arman_priyo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 hover:scale-150 focus:scale-150 focus:text-neutral-300 transition duration-300 ease-in-out cursor-pointer"
          >
            <FaSquareXTwitter />
          </a>
          <a
            href="https://linkedin.com/in/priyoarman"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 hover:scale-150 focus:scale-150 focus:text-blue-500 transition duration-300 ease-in-out cursor-pointer"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/priyoarman"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 hover:scale-150 focus:scale-150 focus:text-neutral-300 transition duration-300 ease-in-out cursor-pointer"
          >
            <FaGithub />
          </a>
        </div>
        </FadeIn>
        
      </section>
        <a
        href="#skills"
        className="text-3xl text-gray-50/40 rounded-[100%] px-3 mb-4 shadow-gray-50 animate-[bounce_3s] [animation-iteration-count:infinite] transition duration-300 ease-in-out hover:cursor-pointer"
      >
        ↓
      </a>
      
    </div>
    
  );
}
