/*
 *
 * mengambil objek WPP dari browser
 *
 * agar typescript tidak error saat memanggil properti yang tidak ada di definisi window (objek global di browser)
 *
 */

export function getWPP(): any {
  return (window as any).WPP;
}
