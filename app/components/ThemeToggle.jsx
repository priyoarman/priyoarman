"use client";

import { FaMoon, FaSun } from "react-icons/fa6";

const REVEAL_MS = 700;

export default function ThemeToggle({ className = "" }) {
  const toggle = (event) => {
    const root = document.documentElement;

    const applyTheme = () => {
      const isLight = root.classList.toggle("light");
      try {
        localStorage.setItem("theme", isLight ? "light" : "dark");
      } catch {}
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) {
      // Fallback: plain color fade from the CSS transitions in globals.css
      applyTheme();
      return;
    }

    // Circular reveal of the new theme, growing out of the toggle button
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // Freeze per-element color transitions so the revealed area shows the final colors
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(applyTheme);

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: REVEAL_MS,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });

    transition.finished.finally(() => root.classList.remove("theme-switching"));
  };

  // Both icons are always rendered and swapped with CSS (light: variant),
  // so server and client markup match and the swap can animate.
  const iconBase =
    "theme-icon absolute text-xl md:text-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className={`fixed top-4 md:top-[25px] left-6 z-40 flex items-center justify-center
        w-13 h-13 rounded-full overflow-hidden
        bg-(--background)/60 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.15)] light:bg-white/10 light:shadow-none
        text-gray-50 hover:text-blue-400/90 light:text-gray-800 light:hover:text-blue-600
        transition active:scale-90 cursor-pointer ${className}`}
    >
      <FaSun
        className={`${iconBase} opacity-0 scale-0 rotate-90 light:opacity-100 light:scale-100 light:rotate-0`}
        aria-hidden
      />
      <FaMoon
        className={`${iconBase} opacity-100 scale-100 rotate-0 light:opacity-0 light:scale-0 light:-rotate-90`}
        aria-hidden
      />
    </button>
  );
}
