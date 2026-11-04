import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PenyediaTema } from "@/components/tema";
import { DaftarkanServiceWorker } from "@/components/service-worker";
import "./globals.css";

// Public Sans dirancang untuk formulir layanan publik dan punya angka tabular,
// cocok untuk aplikasi yang isinya jam, tanggal, dan tabel.
const fontSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Hadir · Absensi Magang", template: "%s · Hadir" },
  description: "Catat kehadiran peserta magang: check-in, check-out, izin, koreksi, dan laporan.",
  applicationName: "Hadir",
  appleWebApp: { capable: true, title: "Hadir", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e4636" },
    { media: "(prefers-color-scheme: dark)", color: "#10261d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fontSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <PenyediaTema>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </PenyediaTema>
        <DaftarkanServiceWorker />
      </body>
    </html>
  );
}
