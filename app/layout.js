import "./globals.css";

export const metadata = {
  title: "Arman Hossain",
  description: "Arman Hossain - Full-Stack Developer based in Denmark",
  viewport: "width=device-width, initial-scale=1",
};

const themeScript = `(function(){try{if(localStorage.getItem("theme")==="light"){document.documentElement.classList.add("light")}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="overflow-x-hidden antialiased w-full">
        {children}
      </body>
    </html>
  );
}
