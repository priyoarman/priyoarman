import Link from "next/link";
import Image from "next/image";

export default function ProjectCard({ project, className = "" }) {
  const { title, description, image, viewProjectLink, githubLink } = project;

  return (
    <div
      className={`relative rounded-2xl shadow-lg overflow-hidden h-[420px] w-full hover:scale-105 transition duration-300 ease-in-out ${className}`}
    >
      {image && (
        <div className="relative w-full h-full">
          <Image src={image} alt={title} fill className="object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-gray-800 via-gray-800/20 to-transparent"
          />
        </div>
      )}

      <div className="absolute inset-0 z-10 p-6 flex flex-col h-full bg-gray-900/40">
        <div className="mt-auto">
          <h3 className="text-xl font-semibold text-gray-50  mb-2 text-start">
            {title}
          </h3>
          <p className="text-gray-100 text-md text-start mb-4">
            {description}
          </p>

          <div className="flex gap-2 mt-auto">
            {viewProjectLink && (
              <Link
                href={viewProjectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-700/30 text-white text-sm font-medium rounded-4xl hover:bg-neutral-700/70 transition-colors"
              >
                View Project
              </Link>
            )}
            {githubLink && (
              <Link
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700/30 text-gray-300 text-sm font-medium rounded-4xl hover:bg-gray-700/70 transition-colors"
              >
                GitHub
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
