import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProjectProvider } from "@/store/project";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

const display = localFont({ src: "../fonts/zapf-humanist-601-demi.otf", variable: "--font-display", display: "swap", weight: "600" });
const serif = Cormorant_Garamond({ weight: ["300", "400", "500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "BORN CINEMA — Where cinema is born.",
  description: "Give your imagination a place to become a story, and discover which stories deserve to become cinema.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('bc-theme');if(t){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${serif.variable} ${sans.variable}`}>
        <ThemeProvider>
          <ProjectProvider>
            <SmoothScroll />
            <SiteChrome>{children}</SiteChrome>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
