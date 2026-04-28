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
  metadataBase: new URL("https://voltbike.example"),
  title: {
    default: "VOLTBIKE — Bici elettriche premium",
    template: "%s — VOLTBIKE",
  },
  description:
    "Bici elettriche premium con autonomia fino a 150km, design italiano e tecnologia connessa. Urban, Mountain, Cargo, Folding: scegli la tua prossima libertà.",
  applicationName: "VOLTBIKE",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VOLTBIKE" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "VOLTBIKE — Bici elettriche premium",
    description:
      "Autonomia fino a 150km, motore silenzioso e connettività App. Design minimal con anima futuristica.",
    siteName: "VOLTBIKE",
    images: [{ url: "/bici1.jpg", width: 1600, height: 900, alt: "VOLTBIKE e-bike" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VOLTBIKE — Bici elettriche premium",
    description:
      "Autonomia fino a 150km, motore silenzioso e connettività App. Design minimal con anima futuristica.",
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
      className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
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
