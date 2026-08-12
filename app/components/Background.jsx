import React from "react";
import FadeIn from "./FadeIn";
import { FaLocationDot } from "react-icons/fa6";
import Image from "next/image";

const Background = () => {
  const experiences = [
    {
      id: "redi-dk",
      img: "/ReDI.png",
      imgAlt: "ReDI",
      title: "ReDI School",
      subtitle: "Volunteer Teacher",
      location: "Copenhagen",
      date: "Sep 2025 - Present",
      description:
        "Job: To teach React and Frontend Development using hands-on projects",
      direction: "left",
    },
    {
      id: "aaveq",
      img: "/aaveq_robotics_logo.jpeg",
      imgAlt: "Aaveq Robotics",
      title: "Aaveq Robotics ApS",
      subtitle: "Frontend Developer Intern",
      location: "Odense",
      date: "Sep 2025 - Feb 2026",
      description:
        "Job: To translate Figma design to a mobile-first frontend, deploy, and maintain",
      direction: "left",
    },
    {
      id: "upwork",
      img: "/up-work.png",
      imgAlt: "Upwork",
      title: "Upwork",
      subtitle: "Freelance Web Developer",
      location: "Remote",
      date: "Sep 2024 - Present",
      description:
        "Jobs: To build responsive websites and apps with HTML, CSS, JS, and React",
      direction: "left",
    },
  ];

  const education = [
    {
      id: "hyf",
      img: "/hyfdanmark.avif",
      imgAlt: "HackYourFuture",
      title: "HackYourFuture",
      subtitle: "Backend Specialization",
      location: "Copenhagen",
      date: "Sep 2025 - Jul 2026",
      description:
        "Capstone Projects: Event Booking App, AI assisted Travel Booking Backend",
      direction: "right",
    },
    {
      id: "redi-de",
      img: "/ReDI.png",
      imgAlt: "ReDI",
      title: "ReDI School Germany",
      subtitle: "Full Stack Development",
      location: "Hamburg",
      date: "Feb 2025 - Jul 2025",
      description: "Capstone Projects: Social Media Application, E-Commerce with RAG Chatbot",
      direction: "right",
    },
    {
      id: "sdu",
      img: "/sdu.jpeg",
      imgAlt: "SDU",
      title: "University of Southern Denmark",
      subtitle: "Bachelor of Science",
      location: "Odense",
      date: "Feb 2024 - Present",
      description:
        "Coursework: Ethnographic interviews, SPSS analysis, Thesis on digital integration",
      direction: "right",
      imgSize: "w-12 h-12",
    },
  ];

  return (
    <section
      id="background"
      className="max-w-7xl mx-auto min-h-dvh w-full overflow-hidden px-4 py-12 md:py-28 text-center"
    >
      <FadeIn delay={200}>
        <h2 className="text-3xl md:text-4xl text-gray-100 font-bold py-4 pb-8">
          Professional Background
        </h2>
      </FadeIn>
      <div className="text-gray-400 text-sm md:text-lg px-4 md:px-8 py-4">
        <ul className="grid grid-flow-row md:grid-cols-2 gap-6 md:gap-12">
          <li>
            <FadeIn delay={300}>
              <h2 className="text-xl md:text-2xl text-gray-100 font-bold pb-4">
                Experiences & Volunteering
              </h2>
            </FadeIn>

            <ul className="flex flex-col gap-4">
              {experiences.map((item, idx) => (
                <FadeIn
                  key={item.id}
                  delay={400 + idx * 100}
                  direction={item.direction}
                >
                  <li className="flex flex-col border-2 md:py-2 gap-2 md:gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                    <div className="flex flex-row w-full h-full justify-between px-4">
                      <div className="flex flex-row gap-3">
                        <div
                          className={`relative ${item.imgSize ? item.imgSize : "w-11 h-11"} mt-1 rounded-4xl`}
                        >
                          <Image
                            src={item.img}
                            fill
                            alt={item.imgAlt}
                            className="object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex flex-col items-start justify-start text-start">
                          <h2 className="flex font-bold text-gray-50 text-lg md:text-xl">
                            {item.title}
                          </h2>
                          <p className="flex text-gray-300 text-sm md:text-[17px]">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                        <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                          <FaLocationDot /> {item.location}
                        </h2>
                        <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex mx-4 text-gray-400">
                      <p className="hidden md:flex justify-start text-start md:text-sm">
                        {item.description}
                      </p>
                    </div>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </li>

          <li>
            <FadeIn delay={300}>
              <h2 className="text-xl md:text-2xl text-gray-100 font-bold pb-4">
                Education & Training
              </h2>
            </FadeIn>

            <ul className="flex flex-col gap-4">
              {education.map((item, idx) => (
                <FadeIn
                  key={item.id}
                  delay={400 + idx * 100}
                  direction={item.direction}
                >
                  <li className="flex flex-col border-2 md:py-2 gap-2 md:gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                    <div className="flex flex-row w-full h-full justify-between px-4">
                      <div className="flex flex-row gap-3">
                        <div
                          className={`relative ${item.imgSize ? item.imgSize : "w-11 h-11"} mt-1 rounded-4xl`}
                        >
                          <Image
                            src={item.img}
                            fill
                            alt={item.imgAlt}
                            className="object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex flex-col items-start justify-start text-start">
                          <h2 className="flex font-bold text-gray-50 text-lg md:text-xl">
                            {item.title}
                          </h2>
                          <p className="flex text-gray-300 text-sm md:text-[17px]">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                        <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                          <FaLocationDot /> {item.location}
                        </h2>
                        <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex mx-4 text-gray-400">
                      <p className="hidden md:flex justify-start text-start md:text-sm">
                        {item.description}
                      </p>
                    </div>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Background;
