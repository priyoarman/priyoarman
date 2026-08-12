import "./globals.css";

export const metadata = {
  title: "Arman Hossain",
  description: "Arman Hossain - Full-Stack Developer based in Denmark",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body className="overflow-x-hidden antialiased w-full">
        {children}
      </body>
    </html>
  );
}
