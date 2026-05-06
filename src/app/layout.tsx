import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileContactBar } from "@/components/mobile-contact-bar";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://vincenzobike.it"),
  title: {
    default: "VincenzoBike — Officina bici a Marcianise (CE)",
    template: "%s — VincenzoBike",
  },
  description:
    "Officina bici a Marcianise (CE): manutenzione e riparazioni per bici muscolari ed e-bike. Disponibilità e dettagli via telefono o WhatsApp. Ritiro in sede e interventi su richiesta.",
  applicationName: "VincenzoBike",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VincenzoBike" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/logo-vincenzobike.png" }],
    apple: [{ url: "/logo-vincenzobike.png" }],
  },
  openGraph: {
    type: "website",
    title: "VincenzoBike — Officina bici a Marcianise (CE)",
    description:
      "Officina bici a Marcianise (CE): manutenzione e riparazioni per bici muscolari ed e-bike. Contatto diretto via telefono o WhatsApp.",
    siteName: "VincenzoBike",
    images: [{ url: "/bici1.jpg", width: 1600, height: 900, alt: "Officina biciclette" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VincenzoBike — Officina bici a Marcianise (CE)",
    description:
      "Officina bici a Marcianise (CE): manutenzione e riparazioni per bici muscolari ed e-bike. Contatto diretto via telefono o WhatsApp.",
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
          <MobileContactBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
