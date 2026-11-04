import { ImageResponse } from "next/og";
import { LogoIkon } from "@/components/logo-ikon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<LogoIkon ukuran={64} />, size);
}
