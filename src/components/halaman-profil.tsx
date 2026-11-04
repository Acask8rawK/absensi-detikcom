import { FormGantiSandi } from "@/components/form-ganti-sandi";
import { KepalaKolom } from "@/components/rapor";
import { dariDate, formatTanggal } from "@/lib/waktu";

type Pengguna = {
  nama: string;
  email: string;
  peran: "ADMIN" | "PESERTA";
  kampus: string | null;
  role: string | null;
  tanggalMulai: Date | null;
  akunDemo: boolean;
};

/** Isi halaman Profil, sama untuk peserta dan admin. */
export function HalamanProfil({ pengguna }: { pengguna: Pengguna }) {
  const baris: [string, string][] = [
    ["Nama", pengguna.nama],
    ["Email", pengguna.email],
    ["Peran", pengguna.peran === "ADMIN" ? "Admin" : "Peserta magang"],
  ];
  if (pengguna.kampus) baris.push(["Kampus", pengguna.kampus]);
  if (pengguna.role) baris.push(["Role", pengguna.role]);
  if (pengguna.tanggalMulai) baris.push(["Mulai magang", formatTanggal(dariDate(pengguna.tanggalMulai))]);

  return (
    <div className="grid max-w-xl gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Profil</h1>

      <dl className="divide-y overflow-hidden rounded-[10px] border bg-card">
        {baris.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 px-4 py-2.5 text-sm">
            <dt>
              <KepalaKolom>{k}</KepalaKolom>
            </dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="grid gap-3" aria-labelledby="judul-sandi">
        <h2 id="judul-sandi" className="font-semibold">
          Ganti kata sandi
        </h2>
        <div className="rounded-[10px] border bg-card p-5">
          {pengguna.akunDemo ? (
            <p className="text-sm text-muted-foreground">Kata sandi akun demo tidak bisa diubah, supaya penguji lain tetap bisa masuk.</p>
          ) : (
            <FormGantiSandi />
          )}
        </div>
      </section>
    </div>
  );
}
