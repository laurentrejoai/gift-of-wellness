import "./globals.css";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--serif" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--sans" });

export const metadata = {
  title: "Give the Gift of Wellness | Abundant Life Wellness Center",
  description: "Nominate someone who deserves a little care this Christmas. Nominations are open December 8 to 16.",
  openGraph: {
    title: "Give the Gift of Wellness",
    description: "Nominate someone who deserves a little care this Christmas.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
