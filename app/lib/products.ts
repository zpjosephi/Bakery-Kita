export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image: string;
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
