import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Response Quality Analyzer",
  description: "Visual lab for exploring how LLM sampling parameters influence answer quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans bg-background text-foreground antialiased`}>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`(function(){try{const root=document.documentElement;const apply=(isDark)=>{root.classList.toggle('dark',isDark);root.dataset.theme=isDark?'dark':'light';root.style.colorScheme=isDark?'dark':'light';};const media=window.matchMedia('(prefers-color-scheme: dark)');apply(media.matches);media.addEventListener('change',event=>apply(event.matches));}catch(e){console.warn('Theme detection failed',e);}})();`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
