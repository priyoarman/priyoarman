import "./globals.css";

export const metadata = {
  title: "Arman Hossain",
  description: "Portfolio built with Next.js",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body className="overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
