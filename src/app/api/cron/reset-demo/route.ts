import { db } from "@/lib/db";
import { isiDataDemo } from "@/lib/data-demo";

// Dipanggil Vercel Cron setiap pagi (lihat vercel.json) supaya data demo selalu
// berisi dua minggu kerja terakhir. Tanpa ini, beberapa hari setelah dikumpulkan
// semua peserta akan terlihat alpa karena data contohnya berhenti di hari seed.
// Vercel mengirim header Authorization berisi CRON_SECRET; permintaan lain ditolak.

export const maxDuration = 60;

export async function GET(request: Request) {
  const rahasia = process.env.CRON_SECRET;
  if (!rahasia || request.headers.get("authorization") !== `Bearer ${rahasia}`) {
    return new Response("Tidak diizinkan", { status: 401 });
  }

  const { dari, sampai } = await isiDataDemo(db);
  return Response.json({ ok: true, dari, sampai });
}
