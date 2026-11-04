const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format angka ke Rupiah, contoh: 1500000 -> "Rp 1.500.000". */
export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount).replace(/\u00a0/g, " ");
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

/** Format Date/ISO string ke tanggal & jam WIB, contoh: "30 Okt 2026, 13.55". */
export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value));
}
