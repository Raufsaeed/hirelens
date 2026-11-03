import { Manrope } from "next/font/google";
import "./globals.css";

// Manrope is the only font (weights 400, 500, 700, 800), as the design guidelines say.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata = {
  title: "HireLens",
  description: "AI-powered hiring: AI screens and ranks CVs, HR makes every decision.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.className} antialiased`}>
      <body className="body min-h-dvh">{children}</body>
    </html>
  );
}
