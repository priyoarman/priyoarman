import React from "react";
import FadeIn from "./FadeIn";
import BackgroundCarousel from "./BackgroundCarousel";

const Background = () => {
  const experiences = [
    {
      id: "aaveq",
      img: "/aaveq_robotics_logo.jpeg",
      imgAlt: "Aaveq Robotics",
      title: "Aaveq Robotics ApS",
      subtitle: "Internship - Frontend Developer",
      location: "Odense",
      date: "Feb 2026 - Jul 2026",
      description:
        "Job: To translate Figma design to a mobile-first frontend, deploy, and maintain",
    },
    {
      id: "redi-dk",
      img: "/ReDI.png",
      imgAlt: "ReDI",
      title: "ReDI School Denmark",
      subtitle: "Teaching Assistant",
      location: "Copenhagen",
      date: "Sep 2025 - Present",
      description:
        "Job: To teach Frontend Development with React using hands-on projects",
    },
    {
      id: "upwork",
      img: "/up-work.png",
      imgAlt: "Upwork",
      title: "Upwork",
      subtitle: "Freelance Developer",
      location: "Remote",
      date: "Sep 2024 - Present",
      description:
        "Job: To build responsive websites and apps with TypeScript, React, and Tailwind CSS",
    },
  ];

  const education = [
    {
      id: "hyf",
      img: "/hyfdanmark.avif",
      imgAlt: "HackYourFuture",
      title: "HackYourFuture Denmark",
      subtitle: "Backend Specialization",
      location: "Copenhagen",
      date: "Sep 2025 - Jul 2026",
      description:
        "Projects: AI Powered Travel Assistant, Event Booking App Backend",
    },
    {
      id: "redi-de",
      img: "/ReDI.png",
      imgAlt: "ReDI",
      title: "ReDI School Germany",
      subtitle: "Full Stack Development",
      location: "Hamburg",
      date: "Feb 2025 - Jul 2025",
      description: "Projects: Social Media App, E-Commerce App with RAG Chatbot",
    },
    {
      id: "sdu",
      img: "/sdu.jpeg",
      imgAlt: "SDU",
      title: "Syddansk Universitet",
      subtitle: "Bachelor of Science",
      location: "Odense",
      date: "Feb 2024 - Aug 2026",
      description:
        "Coursework: Ethnographic interviews, SPSS analysis, Thesis on AI integration",
    },
  ];

  return (
    <section
      id="background"
      className="max-w-7xl mx-auto h-dvh w-full overflow-hidden px-4 pt-20 md:pt-28 pb-6 md:pb-8 flex items-start text-center"
    >
      <div className="w-full px-0 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div>
            <FadeIn delay={300}>
              <h2 className="text-2xl md:text-3xl text-gray-100 font-bold pb-6 md:pt-4">
                Experiences<span className="hidden md:inline"> & Volunteering</span>
              </h2>
            </FadeIn>
            <FadeIn delay={400} direction="left">
              <BackgroundCarousel
                items={experiences}
                label="Experiences & Volunteering"
              />
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={300}>
              <h2 className="text-2xl md:text-3xl text-gray-100 font-bold pb-6 md:pt-4">
                Education<span className="hidden md:inline"> & Training</span>
              </h2>
            </FadeIn>
            <FadeIn delay={400} direction="right">
              <BackgroundCarousel
                items={education}
                label="Education & Training"
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Background;
