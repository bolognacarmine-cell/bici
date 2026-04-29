import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vincenzobike.example"),
  title: {
    default: "VincenzoBike — Officina biciclette a Marcianise",
    template: "%s — VincenzoBike",
  },
  description:
    "Officina per manutenzione e riparazioni bici muscolari, elettriche e a pedalata assistita. Su richiesta, riparazioni a domicilio. Pompa gratuita e vendita accessori e ricambi.",
  applicationName: "VincenzoBike",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VincenzoBike" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "VincenzoBike — Officina biciclette a Marcianise",
    description:
      "Manutenzione e riparazioni per bici muscolari, elettriche e a pedalata assistita. Su richiesta, riparazioni a domicilio.",
    siteName: "VincenzoBike",
    images: [{ url: "/bici1.jpg", width: 1600, height: 900, alt: "Officina biciclette" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VincenzoBike — Officina biciclette a Marcianise",
    description:
      "Manutenzione e riparazioni per bici muscolari, elettriche e a pedalata assistita. Su richiesta, riparazioni a domicilio.",
    images: ["/bici1.jpg"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#050608" },
    { media: "(prefers-color-scheme: dark)", color: "#050608" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
