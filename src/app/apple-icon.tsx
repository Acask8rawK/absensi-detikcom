import { ImageResponse } from "next/og";
import { LogoIkon } from "@/components/logo-ikon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS membulatkan sudut ikon sendiri, jadi gambarnya dibuat penuh tanpa sudut.
export default function AppleIcon() {
  return new ImageResponse(<LogoIkon ukuran={180} sudut={false} />, size);
}
