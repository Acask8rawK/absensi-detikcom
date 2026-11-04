// Ikon aplikasi untuk ImageResponse (favicon, ikon PWA, ikon iOS).
// Huruf H digambar dari tiga balok, bukan dari font, supaya hasilnya sama
// persis di semua ukuran dan tidak bergantung pada font yang tersedia.

export function LogoIkon({ ukuran, sudut = true, ruangAman = false }: { ukuran: number; sudut?: boolean; ruangAman?: boolean }) {
  // Ikon maskable dipotong launcher sampai lingkaran 80%, jadi hurufnya diperkecil.
  const tinggi = ukuran * (ruangAman ? 0.36 : 0.5);
  const lebar = tinggi * 0.82;
  const tebal = tinggi * 0.22;
  const warna = "#E3ECE6";

  return (
    <div
      style={{
        width: ukuran,
        height: ukuran,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1E4636",
        borderRadius: sudut ? ukuran * 0.22 : 0,
      }}
    >
      <div style={{ width: lebar, height: tinggi, display: "flex", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: tebal, height: tinggi, background: warna }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: tebal, height: tinggi, background: warna }} />
        <div style={{ position: "absolute", left: 0, top: (tinggi - tebal) / 2, width: lebar, height: tebal, background: warna }} />
      </div>
    </div>
  );
}
