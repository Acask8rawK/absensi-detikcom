import { ImageResponse } from "next/og";
import { LogoIkon } from "@/components/logo-ikon";

// Ikon PNG untuk manifest PWA: /ikon/192, /ikon/512, dan /ikon/maskable.

const PILIHAN: Record<string, { ukuran: number; maskable: boolean }> = {
  "192": { ukuran: 192, maskable: false },
  "512": { ukuran: 512, maskable: false },
  maskable: { ukuran: 512, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(PILIHAN).map((ukuran) => ({ ukuran }));
}

export async function GET(_request: Request, { params }: RouteContext<"/ikon/[ukuran]">) {
  const { ukuran } = await params;
  const p = PILIHAN[ukuran];
  if (!p) return new Response("Ikon tidak ditemukan", { status: 404 });

  return new ImageResponse(<LogoIkon ukuran={p.ukuran} sudut={!p.maskable} ruangAman={p.maskable} />, {
    width: p.ukuran,
    height: p.ukuran,
    headers: { "Cache-Control": "public, max-age=604800" },
  });
}
