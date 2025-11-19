"use client";

import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#home", label: "Home" },
    { href: "#skills", label: "Skills" },
    { href: "#projects", label: "Projects" },
    { href: "#background", label: "Background" },
    { href: "#contact", label: "Contact" },
  ];

  const navClasses = `
    fixed top-2 z-50 mt-2
    bg-[#141414]/20 backdrop-blur-md border border-gray-900/10
    rounded-4xl md:rounded-full px-4 py-2 md:px-18 md:py-5 left-2 right-2
    md:w-fit md:left-1/2 md:-translate-x-1/2 md:right-auto
    ${open ? 'mx-4 w-auto' : 'w-fit ml-auto mx-4'}
  `;

  return (
    <nav className={navClasses}>
      <div className="flex items-center justify-end md:justify-between">

        <ul className="hidden md:flex space-x-8 font-semibold text-sm md:text-lg">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-gray-50 hover:text-blue-400/90">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden py-2"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6 L18 18 M6 18 L18 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"} md:hidden mt-2`}>
        <ul className="flex flex-col space-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-gray-200 py-2 px-2 rounded-3xl text-center hover:bg-neutral-50/5 transition"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
