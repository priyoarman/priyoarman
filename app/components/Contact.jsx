import {FaLocationDot} from "react-icons/fa6";

export default function ContactSection() {

  const formsKey = process.env.WEB3FORMS_API_KEY;

  return (
    <section
      id="contact"
      className="max-w-7xl min-h-dvh bg-gray-950 mx-auto px-4 py:20 lg:py-28 text-center"
    >
      <h2 className="text-3xl md:text-4xl font-bold pb-4 text-center">Get In Touch</h2>

      <p className="flex flex-col justify-center items-center text-lg text-neutral-300 text-center mx-auto pb-4 max-w-2xl">
        Have a project in mind? Lets create something amazing together.
      </p>

      <a
        href="https://www.google.dk/maps/place/Hedehusene/@55.6475611,12.1973063,16.8z/data=!4m6!3m5!1s0x46525ed3c59192f3:0x5c6d5684785a77c2!8m2!3d55.6489628!4d12.1973597!16s%2Fg%2F1tk8m60q?entry=ttu&g_ep=EgoyMDI1MTExMS4wIKXMDSoASAFQAw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-row justify-center items-center text-md text-neutral-300 text-center mx-auto pt-4 pb-4 gap-2 max-w-2xl"
      >
        <FaLocationDot /> Copenhagen, Denmark
      </a>

      <form
        className="flex flex-col mx-auto space-y-6 max-w-xl"
        action="https://api.web3forms.com/submit"
        method="POST"
      >
        <input
          type="hidden"
          name="access_key"
          value={formsKey}
        />
        <div>
          <label
            htmlFor="name"
            className="sr-only"
          ></label>
          <input
            type="text"
            id="name"
            name="name"
            className="shadow appearance-none border border-gray-900 rounded-xl w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="sr-only"
          ></label>
          <input
            type="email"
            id="email"
            name="email"
            className="shadow appearance-none border border-gray-900 rounded-xl w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="sr-only"
          ></label>
          <textarea
            id="message"
            name="message"
            rows="6"
            className="shadow appearance-none border border-gray-900 rounded-xl w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Type your message"
            required
          ></textarea>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-linear-to-r from-blue-700 to-purple-600 hover:bg-blue-500 cursor-pointer text-white font-bold py-3 px-8 rounded-4xl focus:outline-none focus:shadow-outline transition-colors duration-200 text-lg"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
