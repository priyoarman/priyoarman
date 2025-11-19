import Image from "next/image";
import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Background from "./components/Background";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <NavBar/>
      <Hero/>
      <Skills/>
      <Projects/>
      <Background/>
      <Contact/>
    </div>
  );
}
