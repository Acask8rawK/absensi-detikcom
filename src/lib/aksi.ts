// Bentuk hasil yang dikembalikan setiap Server Action ke form.
export type HasilAksi = {
  ok: boolean;
  pesan: string;
  /** Data tambahan untuk ditampilkan sekali, misalnya kata sandi sementara. */
  data?: Record<string, string>;
} | null;

export const gagal = (pesan: string): HasilAksi => ({ ok: false, pesan });
export const berhasil = (pesan: string, data?: Record<string, string>): HasilAksi => ({ ok: true, pesan, data });

/** Prisma memberi kode P2002 saat sebuah constraint unik dilanggar. */
export function melanggarUnik(e: unknown) {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";
}

export function teks(formData: FormData, nama: string) {
  const nilai = formData.get(nama);
  return typeof nilai === "string" ? nilai : "";
}
