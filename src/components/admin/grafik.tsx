"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const konfigKehadiran = {
  tepat: { label: "Tepat waktu", color: "var(--st-tepat)" },
  telat: { label: "Terlambat", color: "var(--st-telat)" },
  izinSakit: { label: "Izin / sakit", color: "var(--st-izin)" },
  alpa: { label: "Alpa", color: "var(--st-alpa)" },
} satisfies ChartConfig;

/**
 * Batang bertumpuk per hari kerja. Sumbu Y selalu 0 sampai jumlah peserta aktif,
 * jadi tinggi batang di hari mana pun bisa dibandingkan apa adanya.
 */
export function GrafikKehadiran({
  data,
  jumlahPeserta,
}: {
  data: { label: string; tepat: number; telat: number; izinSakit: number; alpa: number }[];
  jumlahPeserta: number;
}) {
  return (
    <ChartContainer config={konfigKehadiran} className="aspect-auto h-56 w-full">
      <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis domain={[0, Math.max(jumlahPeserta, 1)]} allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="tepat" stackId="a" fill="var(--color-tepat)" isAnimationActive={false} />
        <Bar dataKey="telat" stackId="a" fill="var(--color-telat)" isAnimationActive={false} />
        <Bar dataKey="izinSakit" stackId="a" fill="var(--color-izinSakit)" isAnimationActive={false} />
        <Bar dataKey="alpa" stackId="a" fill="var(--color-alpa)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
