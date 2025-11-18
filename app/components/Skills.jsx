import {
  FaReact,
  FaShopify,
  FaWordpress,
  FaAws,
  FaGitAlt,
  FaHtml5,
} from "react-icons/fa";
import {RiNextjsLine, RiTailwindCssFill, RiNodejsFill} from "react-icons/ri";
import {
  SiTypescript,
  SiExpress,
  SiSocketdotio,
  SiMongodb,
  SiKubernetes,
  SiDocker,
} from "react-icons/si";
import {TbApi} from "react-icons/tb";
import {BiLogoPostgresql} from "react-icons/bi";
import {VscAzure} from "react-icons/vsc";
import {IoLogoJavascript, IoLogoCss3} from "react-icons/io5";
import FadeIn from "./FadeIn";

const skillsList = [
  {
    name: "React",
    icon: (
      <FaReact className="text-2xl text-sky-500 animate-[spin_3s_infinite]" />
    ),
  },
  {
    name: "Next.js",
    icon: (
      <RiNextjsLine className="text-3xl pb-0.5 text-neutral-100 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Tailwind CSS",
    icon: (
      <RiTailwindCssFill className="text-3xl text-sky-400 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "TypeScript",
    icon: (
      <SiTypescript className="text-2xl text-blue-600/90 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Node.js",
    icon: (
      <RiNodejsFill className="text-3xl pb-0.5 text-green-600/90 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Express",
    icon: (
      <SiExpress className="text-2xl mt-0.5 text-neutral-100 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "WebSocket",
    icon: (
      <SiSocketdotio className="text-2xl text-neutral-100 animate-[spin_3s_infinite]" />
    ),
  },
  {
    name: "RESTful API",
    icon: (
      <TbApi className="text-3xl text-blue-600 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "MongoDB",
    icon: (
      <SiMongodb className="text-2xl text-green-600 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "PostgreSQL",
    icon: (
      <BiLogoPostgresql className="text-3xl text-blue-600 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Shopify",
    icon: (
      <FaShopify className="text-2xl text-green-600 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "WordPress",
    icon: (
      <FaWordpress className="text-2xl text-neutral-100 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "AWS",
    icon: (
      <FaAws className="text-2xl text-orange-400/80 mt-0.5 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Azure",
    icon: (
      <VscAzure className="text-2xl text-sky-600 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Kubernetes",
    icon: (
      <SiKubernetes className="text-2xl text-blue-600 animate-[spin_3s_infinite]" />
    ),
  },
  {
    name: "Docker",
    icon: (
      <SiDocker className="text-2xl text-blue-600 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "Git",
    icon: (
      <FaGitAlt className="text-2xl text-orange-500/80 mt-0.5 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "JavaScript",
    icon: (
      <IoLogoJavascript className="text-2xl text-yellow-400 rounded-lg animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "HTML",
    icon: (
      <FaHtml5 className="text-2xl text-orange-500 animate-[pulse_3s_infinite]" />
    ),
  },
  {
    name: "CSS",
    icon: (
      <IoLogoCss3 className="text-2xl text-blue-600 animate-[pulse_3s_infinite]" />
    ),
  },
];

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="max-w-7xl bg-gray-900 mx-auto min-h-dvh px-4 py-12 md:py-28 text-center"
    >
      <FadeIn delay={100}>
        <h2 className="text-3xl md:text-4xl text-gray-100 font-bold py-4 pb-8">
        Skills & Technologies
      </h2>
      </FadeIn>
      <FadeIn delay={200}>
        <div className="text-gray-400 text-sm md:text-lg px-4 md:px-8 py-4">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {skillsList.map((skill, index) => (
            <FadeIn
              key={skill.name}
              direction={index % 2 === 0 ? "left" : "right"}
              
              delay={index * 30}
            ><li
              key={skill.name}
              className="flex border h-13 md:h-16 bg-blue-950/40 border-neutral-950 rounded-xl justify-center text-gray-100 cursor-default
                         transition duration-300 ease-in-out hover:bg-blue-950/60 focus:bg-blue-950/60"
            >
              <div className="flex w-full h-full items-center justify-center gap-2 focus:scale-150 hover:scale-150 transition duration-300 ease-in-out">
                {skill.icon}
                {skill.name}
              </div>
            </li>
            </FadeIn>
          ))}
        </ul>
      </div>
      </FadeIn>
      
    </section>
  );
}
