import type { Metadata } from "next";
import Galeri from "./galeri";

export const metadata: Metadata = {
  title: "Lab Galeri",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Galeri />;
}
