import "@/app/globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const fontSans = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-app-sans",
});
const fontMono = Geist_Mono({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-app-mono",
});

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Page not found",
};

/**
 * The same pre-paint theme read next-themes performs in the site layout, so
 * a dark-mode visitor does not get a light flash: `theme` in localStorage,
 * else the system preference.
 */
const themeScript = `try{var t=localStorage.getItem("theme"),d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark")}document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}`;

/**
 * URLs that never reach the site layout — dotted paths such as `/about.html`
 * or a dead asset link — and a `notFound()` thrown from the layout itself
 * land here. Root params are unavailable, so the copy is English and the
 * home link is a plain path the proxy resolves against the request host.
 */
const GlobalNotFound = () => (
  <html
    className={`${fontSans.variable} ${fontMono.variable}`}
    lang="en"
    suppressHydrationWarning
  >
    <head>
      {/* oxlint-disable-next-line react/no-danger -- a fixed string, no user input; runs before paint like next-themes' own script */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </head>
    <body className="font-sans antialiased">
      <main className="min-h-dvh" id="main">
        <section className="block-section">
          <div className="container grid max-w-2xl justify-items-center gap-8 py-24 text-center">
            <span className="border-border inline-flex items-center gap-2.5 border px-3 py-1.5 font-mono text-sm tracking-[0.28px] uppercase">
              <span className="bg-highlight size-2 shrink-0" />
              Not found
            </span>
            <h1 className="text-[clamp(6rem,26vw,15rem)] leading-[0.8] font-normal tracking-tighter">
              404
            </h1>
            <h2 className="max-w-2xl text-3xl font-normal tracking-tight text-balance sm:text-4xl">
              The page you are looking for does not exist.
            </h2>
            {/* oxlint-disable-next-line next/no-html-link-for-pages -- no root params or router tree here; the proxy resolves "/" against the request host */}
            <a
              className="focus-ring border-border hover-surface inline-flex items-center border px-5 py-2.5 text-base"
              href="/"
            >
              Return home
            </a>
          </div>
        </section>
      </main>
    </body>
  </html>
);

export default GlobalNotFound;
