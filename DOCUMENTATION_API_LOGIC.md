# Dokumentasi Logika Pemanggilan API Kondisional

Dokumen ini menjelaskan strategi dan implementasi pemanggilan API secara kondisional pada aplikasi frontend Stelkbook. Tujuannya adalah untuk mengoptimalkan kinerja aplikasi dengan mengurangi beban server, latensi, dan penggunaan bandwidth.

## 1. Prinsip Dasar
Endpoint API hanya boleh dipanggil jika:
1.  Data yang diminta **belum tersedia** di state lokal (cache klien).
2.  Data tersebut **sedang dibutuhkan** oleh tampilan aktif (misalnya, tab yang sedang dibuka).
3.  Pengguna memiliki **hak akses** yang sesuai.

## 2. Implementasi pada Komponen

### A. Data Siswa (`/admin/Data_Siswa`)
-   **Endpoint Target**: `/api/siswa-sd`, `/api/siswa-smp`, `/api/siswa-smk`
-   **Trigger**: Tab navigasi (SD, SMP, SMK).
-   **Logika**:
    -   Saat halaman dimuat, tab default adalah "SD".
    -   Cek apakah `siswaSdData` sudah ada di context/state.
    -   Jika kosong, panggil `fetchAllSiswaSd()`.
    -   Jika pengguna berpindah ke tab "SMP", cek `siswaSmpData`.
    -   Jika `siswaSmpData` kosong, panggil `fetchAllSiswaSmp()`.
    -   Jika pengguna kembali ke tab "SD", **JANGAN** panggil API lagi (gunakan data cache), kecuali ada aksi refresh eksplisit (misal: setelah delete/update).

### B. Data Guru (`/admin/Data_Guru`)
-   **Endpoint Target**: `/api/guru-sd`, `/api/guru-smp`, `/api/guru-smk`
-   **Trigger**: Tab navigasi (SD, SMP, SMK).
-   **Logika**:
    -   Sama seperti Data Siswa. Menggunakan state `activeTab` untuk menentukan endpoint mana yang dipanggil.

### C. Data Perpus (`/admin/Data_perpus`)
-   **Endpoint Target**: `/api/perpus`
-   **Trigger**: Halaman dimuat.
-   **Logika**:
    -   Cek apakah `perpusData` sudah ada.
    -   Jika sudah ada, skip request.
    -   Jika belum, panggil `fetchAllPerpus()`.

## 3. Flowchart Decision Table

Berikut adalah logika keputusan untuk memanggil endpoint:

```mermaid
graph TD
    A[Start: Komponen/Tab Aktif] --> B{Data sudah ada di State?}
    B -- Ya --> C[Gunakan Data Lokal]
    B -- Tidak --> D{User Authorized?}
    D -- Tidak --> E[Stop / Redirect]
    D -- Ya --> F[Panggil API Endpoint]
    F --> G{Response Sukses?}
    G -- Ya --> H[Simpan ke State]
    G -- Tidak (404) --> I[Set State Kosong (cegah fetch ulang loop)]
    G -- Tidak (Error Lain) --> J[Tampilkan Error]
```

## 4. Penanganan Empty State & Loading
-   **Loading**: Set state `loading = true` sebelum fetch, dan `false` di `finally`. Tampilkan spinner saat loading.
-   **Empty Data**: Jika API return 404 atau array kosong, set state data menjadi `[]` (array kosong) agar UI merender pesan "Tidak ada data" dan tidak mencoba fetch ulang terus menerus.

## 5. Referensi Kode
-   `src/context/authContext.js`: Menyediakan fungsi fetch (`fetchAllSiswaSd`, dll) dan state global.
-   `src/app/admin/Data_Siswa/page.tsx`: Implementasi tab logic untuk Siswa.
-   `src/app/admin/Data_Guru/page.tsx`: Implementasi tab logic untuk Guru.
-   `src/app/admin/Data_perpus/page.tsx`: Implementasi check-before-fetch untuk Perpus.
