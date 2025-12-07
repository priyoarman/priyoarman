import React from "react";
import FadeIn from "./FadeIn";
import {FaLocationDot} from "react-icons/fa6";
import Image from "next/image";

const Background = () => {
  return (
    <section
      id="background"
      className="max-w-7xl bg-gray-900 mx-auto min-h-dvh w-full overflow-hidden px-4 py-12 md:py-28 text-center"
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
                Volunteering & Experiences
              </h2>
            </FadeIn>
            <ul className="flex flex-col gap-4">
              <FadeIn delay={400} direction={"left"}>
                <li className="flex flex-col border-2 py-2 gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                  <div className="flex flex-row w-full h-full justify-between px-4">
                    <div className="flex flex-row gap-3">
                      <div className="relative w-11 h-11 mt-1 rounded-4xl">
                        <Image
                          src="/ReDI.png"
                          fill
                          alt="ReDI"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start text-start">
                        <h2 className="flex font-bold text-gray-50 text-lg md:text-xl">
                          ReDI School Denmark
                        </h2>
                        <p className="flex text-gray-300 text-sm md:text-[17px]">
                          Volunteer Teacher
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                      <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                        <FaLocationDot /> Aarhus
                      </h2>
                      <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          Sep 2025 - Present
                        </p>
                    </div>
                  </div>
                  <div className="flex mx-4 text-gray-400">
                    <p className="flex justify-start text-start text-xs md:text-sm">
                      Job: To teach React and Frontend Development using hands-on projects
                    </p>
                  </div>
                </li>
              </FadeIn>
              <FadeIn delay={500} direction={"left"}>
                <li className="flex flex-col border-2 py-2 gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                  <div className="flex flex-row w-full h-full justify-between px-4">
                    <div className="flex flex-row gap-3">
                      <div className="relative w-11 h-11 mt-1 rounded-4xl">
                        <Image
                          src="/aaveq_robotics_logo.jpeg"
                          fill
                          alt="ReDI"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start text-start">
                        <h2 className="flex font-bold text-gray-50 text-lg md:text-xl">
                          Aaveq Robotics ApS
                        </h2>
                        <p className="flex text-gray-300 text-sm md:text-[17px]">
                          Frontend Developer Intern
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                      <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                        <FaLocationDot /> Odense
                      </h2>
                      <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          Jan 2025 - Jun 2025
                        </p>
                    </div>
                  </div>
                  <div className="flex mx-4 text-gray-400">
                    <p className="flex justify-start text-start text-xs md:text-sm">
                      Job: To translate Figma design to a mobile-first frontend, deploy, and maintain
                    </p>
                  </div>
                </li>
              </FadeIn>
              <FadeIn delay={600} direction={"left"}>
                <li className="flex flex-col border-2 py-2 gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                  <div className="flex flex-row w-full h-full justify-between px-4">
                    <div className="flex flex-row gap-3">
                      <div className="relative w-11 h-11 mt-1 rounded-4xl">
                        <Image
                          src="/up-work.png"
                          fill
                          alt="Upwork"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start text-start">
                        <h2 className="flex font-bold text-gray-50 text-lg md:text-xl">
                          Upwork
                        </h2>
                        <p className="flex text-gray-300 text-sm md:text-[17px]">
                          Freelance Web Developer
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                      <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                        <FaLocationDot /> Remote
                      </h2>
                      <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          Sep 2024 - Present
                        </p>
                    </div>
                  </div>
                  <div className="flex mx-4 text-gray-400">
                    <p className="flex justify-start text-start text-xs md:text-sm">
                      Jobs: To build responsive websites and apps with HTML, CSS, JS, and React
                    </p>
                  </div>
                </li>
              </FadeIn>
            </ul>
          </li>
          <li>
            <FadeIn delay={300}>
              <h2 className="text-xl md:text-2xl text-gray-100 font-bold pb-4">
                Education & Training
              </h2>
            </FadeIn>
            <ul className="flex flex-col gap-4">
              <FadeIn delay={400} direction={"right"}>
                <li className="flex flex-col border-2 py-2 gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                  <div className="flex flex-row w-full h-full justify-between px-4">
                    <div className="flex flex-row gap-3">
                      <div className="relative w-11 h-11 mt-1 rounded-4xl">
                        <Image
                          src="/hyfdanmark.avif"
                          fill
                          alt="HackYourFuture"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start text-start">
                        <h2 className="flex font-bold text-gray-50 text-lg md:text-xl">
                          HackYourFuture
                        </h2>
                        <p className="flex text-gray-300 text-[11px] md:text-[17px]">
                          Web Development Bootcamp
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                      <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                        <FaLocationDot /> Copenhagen
                      </h2>
                      <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          Sep 2025 - Present
                        </p>
                    </div>
                  </div>
                  <div className="flex mx-4 text-gray-400">
                    <p className="flex justify-start text-start text-xs md:text-sm">
                      Capstone Projects: Online Banking System, Ride-Sharing Application Backend
                    </p>
                  </div>
                </li>
              </FadeIn>
              <FadeIn delay={500} direction={"right"}>
                <li className="flex flex-col border-2 py-2 gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                  <div className="flex flex-row w-full h-full justify-between px-4">
                    <div className="flex flex-row gap-3">
                      <div className="relative w-11 h-11 mt-1 rounded-4xl">
                        <Image
                          src="/ReDI.png"
                          fill
                          alt="ReDI"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start text-start">
                        <h2 className="flex font-bold text-gray-50 text-[12px] md:text-xl">
                          ReDI School of Digital Integration
                        </h2>
                        <p className="flex text-gray-300 text-sm md:text-[17px]">
                          Full Stack Development
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                      <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                        <FaLocationDot /> Hamburg
                      </h2>
                      <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          Feb 2025 - Jul 2025
                        </p>
                    </div>
                  </div>
                  <div className="flex mx-4 text-gray-400">
                    <p className="flex justify-start text-start text-xs md:text-sm">
                      Capstone Projects: Social Media App, E-commerce Frontend
                    </p>
                  </div>
                </li>
              </FadeIn>
              <FadeIn delay={600} direction={"right"}>
                <li className="flex flex-col border-2 py-2 gap-4 bg-blue-950/40 border-gray-800/20 rounded-xl justify-center text-gray-100 cursor-default hover:scale-105 transition duration-300 ease-in-out">
                  <div className="flex flex-row w-full h-full justify-between px-4">
                    <div className="flex flex-row gap-3">
                      <div className="relative w-12 h-12 mt-1 rounded-4xl">
                        <Image
                          src="/sdu.jpeg"
                          fill
                          alt="SDU"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex flex-col items-start justify-start text-start">
                        <h2 className="flex font-bold text-gray-50 text-[12px] md:text-xl">
                          University of Southern Denmark
                        </h2>
                        <p className="flex text-gray-300 text-sm md:text-[17px]">
                          Bachelor of Science
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end text-end px-0 mx-0">
                      <h2 className="flex flex-row gap-1 justify-center text-center items-center text-gray-400 text-md md:text-lg pt-1 md:pt-0">
                        <FaLocationDot /> Odense
                      </h2>
                      <p className="hidden md:flex text-gray-400 md:text-[17px]">
                          Sep 2023 - Jun 2026
                        </p>
                    </div>
                  </div>
                  <div className="flex mx-4 text-gray-400">
                    <p className="flex justify-start text-start text-xs md:text-sm">
                      Coursework: Ethnographic interviews, SPSS analysis, Thesis on digital integration
                    </p>
                  </div>
                </li>
              </FadeIn>
            </ul>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Background;
