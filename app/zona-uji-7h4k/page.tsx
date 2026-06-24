import type { Metadata } from "next";
import HackLab from "./hack-lab";

// Halaman latihan pribadi. Sengaja noindex + tanpa link masuk dari mana pun,
// jadi cuma kebuka kalau URL-nya diketik manual.
export const metadata: Metadata = {
  title: "Zona Uji",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HackLab />;
}
