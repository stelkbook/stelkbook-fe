# Panduan Testing Responsif Buku (Stelkbook)

Dokumen ini menjelaskan cara menjalankan pengujian otomatis untuk memverifikasi tampilan buku pada berbagai ukuran layar, memastikan perbaikan responsif bekerja dengan baik.

## Prasyarat

Anda perlu menginstal Playwright untuk menjalankan tes ini.

```bash
npm install -D @playwright/test
npx playwright install
```

## Menjalankan Tes

Pastikan server pengembangan lokal berjalan:

```bash
npm run dev
```

Kemudian, di terminal baru, jalankan perintah berikut untuk memulai pengujian:

```bash
npx playwright test
```

Ini akan menjalankan tes yang didefinisikan di `e2e/book-visibility.spec.ts`.

## Apa yang Diuji?

Tes ini memverifikasi bahwa komponen buku (`PageFlipBook2`) terlihat dan dirender dengan benar pada 5 ukuran layar berikut:

1.  **Mobile Small (360x640)** - Menguji tampilan pada ponsel kecil.
2.  **Mobile Large (414x896)** - Menguji tampilan pada ponsel modern yang lebih besar.
3.  **Tablet (768x1024)** - Menguji tampilan tablet (iPad mode portrait).
4.  **Laptop (1366x768)** - Menguji resolusi laptop standar.
5.  **Desktop (1920x1080)** - Menguji tampilan monitor desktop full HD.

Untuk setiap ukuran layar dan halaman yang diuji, skrip akan:
1.  Mengubah ukuran viewport browser.
2.  Memuat halaman buku.
3.  Memeriksa apakah container buku (`.book-wrapper`) terlihat (visible) dan memiliki dimensi lebar > 0.
4.  Memeriksa apakah Canvas (PDF) berhasil dirender di dalam container.

## Melihat Laporan

Setelah tes selesai, Playwright akan membuat laporan HTML. Anda dapat melihatnya dengan menjalankan:

```bash
npx playwright show-report
```

## Struktur File Test

- `e2e/book-visibility.spec.ts`: Berisi logika pengujian utama.
- `playwright.config.ts`: Konfigurasi global Playwright.

## Catatan Perbaikan

Tes ini dibuat untuk memverifikasi perbaikan pada masalah "buku hilang di mode responsive inspect". Masalah tersebut disebabkan oleh container flexbox yang kekurangan properti `w-full`, menyebabkan width menjadi 0 pada kondisi tertentu. Tes ini memastikan width selalu > 0 di semua breakpoint.
