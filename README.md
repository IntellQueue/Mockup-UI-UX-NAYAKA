# 🛡️ NAYAKA - Mobile Attendance & Work Tracking Mockup

Aplikasi **NAYAKA** adalah purwarupa (*interactive high-fidelity mockup*) sistem presensi berbasis *geofencing* keamanan tingkat tinggi yang dirancang untuk personel militer/satuan kerja (studi kasus: Brigif 87). Purwarupa ini mensimulasikan interaksi antara aplikasi mobile anggota, dashboard komando, serta simulator rekayasa lingkungan siber secara bersamaan dalam satu layar.

---

## 🚀 1. Cara Menjalankan Projek (Installation & Run)

### Prasyarat:
* Pastikan Anda sudah menginstal **Node.js** (versi terbaru direkomendasikan) di komputer Anda.

### Langkah-langkah:
1. **Instal Dependensi**:
   Buka terminal di dalam direktori projek dan jalankan:
   ```bash
   npm install
   ```
2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
3. **Akses Aplikasi**:
   Buka peramban (browser) dan buka alamat **[http://localhost:3000](http://localhost:3000)**.

> [!WARNING]
> ### Perhatian Pengguna Windows (Masalah Karakter `&` pada Path)
> Jika folder projek Anda saat ini bernama `presensi-&-track-kerja` atau berada di dalam folder yang mengandung simbol `&`, Windows (CMD/PowerShell) akan memperlakukannya sebagai pemisah perintah. Hal ini dapat menggagalkan eksekusi `npm run dev` dengan error:
> `'-track-kerja\node_modules\.bin\' is not recognized as an internal or external command`
>
> **Solusi:**
> * **Opsi A (Direkomendasikan):** Ubah nama folder projek Anda menjadi nama lain tanpa simbol khusus (misalnya: `presensi-dan-track-kerja` atau `nayaka-mockup`).
> * **Opsi B (Alternatif Tanpa Ubah Folder):** Jalankan server langsung menggunakan Node dengan memanggil path file Vite yang terbungkus tanda kutip:
>   ```powershell
>   node "c:\Users\HP\Downloads\testing2\presensi-&-track-kerja\node_modules\vite\bin\vite.js" --port 3000 --host 0.0.0.0
>   ```

---

## 🧪 2. Alur Pengujian UI/UX (Interactive Testing Flow)

Anda dapat menguji logika aplikasi dengan memanfaatkan panel simulator di sisi kiri layar untuk memicu respons reaktif pada antarmuka pengguna:

### Pengujian Skenario 1: Login Pertama & Kunci Perangkat
1. Masuk ke frame **Sisi User (Tengah)**, masukkan NRP default `123456` dan password `password123`.
2. Klik **Login**.
3. Sistem secara otomatis mendeteksi model/spesifikasi HP Anda di latar belakang (Hardware Fingerprint) dan menampilkan modal keamanan untuk **Wajib Ganti Password**.
4. Masukkan password baru (minimal 6 karakter) untuk mengubah status akun Anda dari `NEW` menjadi `ACTIVE`.

### Pengujian Skenario 2: Presensi Geofence QR
1. Pilih tab **Presensi** pada aplikasi anggota di tengah.
2. **Pengujian Gagal (WiFi Seluler):** Pada panel simulator (Kiri), set WiFi ke **Seluler (LTE)**. Coba klik tombol presensi. Sistem akan menolak presensi karena tidak terhubung WiFi resmi.
3. **Pengujian Gagal (Geofence GPS):** Pada panel simulator, set WiFi ke **WiFi Kantor** dan GPS ke **Luar Kantor (Outside)**. Coba klik presensi. Sistem akan memblokir karena Anda berada di luar radius 50m.
4. **Pengujian Gagal (Fake GPS/Spoofing):** Set GPS ke **Fake GPS / Mock Location**. Sistem akan langsung memblokir akses dan mencatat log manipulasi lokasi untuk dilaporkan ke komandan.
5. **Pengujian Sukses:** Set WiFi ke **WiFi Kantor** dan GPS ke **Kantor (Office)**. Lakukan swafoto lalu klik scan QR. Presensi Anda akan tercatat sukses di server.

### Pengujian Skenario 3: Siklus Izin Keluar Kantor (Outing Tracking)
1. Pada aplikasi anggota, pilih tab **Izin Keluar**. Isi tujuan (misal: "Beli Makan") dan durasi (misal: 30 menit), lalu setujui pelacakan GPS. Klik **Kirim Permohonan**.
2. Buka frame **Sisi Admin (Kanan)**, masuk ke tab **Persetujuan Izin**. Klik **Setujui** pada permohonan anggota tersebut. Status anggota akan berubah menjadi **Berizin Luar Kantor**.
3. Pada panel simulator (Kiri), ubah lokasi GPS menjadi **Luar Kantor (Outside)**. Anda dapat mengklik **Akselerasikan Waktu** untuk mensimulasikan countdown sisa waktu.
4. Perhatikan notifikasi push peringatan yang akan menyala otomatis di HP anggota ketika waktu tersisa **15 menit**, **10 menit**, **5 menit**, dan **1 menit**.
5. Di panel admin, Anda akan melihat histori pelacakan titik peta GPS (*breadcrumbs*) dari anggota tersebut secara real-time.
6. Untuk menyelesaikan sesi, ubah kembali koneksi di simulator ke **WiFi Kantor**, lalu pada aplikasi anggota klik **Konfirmasi Kembali**. Admin kemudian meninjau dan menyelesaikan izin tersebut.

---

## 📊 3. Skema Database (Entity Relationship Diagram - ERD)

Berikut adalah cetak biru skema relasi database relasional jika prototype ini diimplementasikan ke dalam production backend:

```mermaid
erDiagram
    USER_RECORD ||--o{ PRESENCE_LOG : "melakukan"
    USER_RECORD ||--o{ ABSENCE_REQUEST : "mengajukan"
    USER_RECORD ||--o{ OUTING_REQUEST : "mengajukan"
    OUTING_REQUEST ||--o{ GPS_TRACK : "merekam jejak"

    USER_RECORD {
        string nrp PK "NRP Pegawai / Kunci Utama"
        string nama "Nama Pegawai"
        string kesatuan "Kesatuan Militer"
        string alamat "Alamat Asrama/Tinggal"
        string noHp "No Telepon HP"
        string status "NEW / ACTIVE"
        string device "Device Fingerprint (Nullable)"
        string passwordHash "Password Hash"
    }

    PRESENCE_LOG {
        string id PK "Log ID"
        string nrp FK "NRP Pegawai"
        string nama "Nama Pegawai"
        string kesatuan "Kesatuan"
        string type "MASUK / KELUAR"
        string timestamp "Waktu Absen"
        string wifiSSID "SSID WiFi Terhubung"
        float lat "Latitude"
        float lng "Longitude"
        string photo "URL Swafoto"
        boolean fakeGpsDetected "Deteksi Mock GPS"
    }

    ABSENCE_REQUEST {
        string id PK "Request ID"
        string nrp FK "NRP Pegawai"
        string nama "Nama Pegawai"
        string kesatuan "Kesatuan"
        string keterangan "Sakit / Izin Darurat / Musibah / Lainnya"
        string detail "Alasan/Keterangan Detail"
        string filePhoto "URL Swafoto/Bukti"
        string filePdfName "Nama File PDF Bukti"
        string status "PENDING / APPROVED / REJECTED"
        string timestamp "Waktu Pengajuan"
        string approvedAt "Waktu Disetujui (Nullable)"
    }

    OUTING_REQUEST {
        string id PK "Outing ID"
        string nrp FK "NRP Pegawai"
        string nama "Nama"
        string kesatuan "Kesatuan"
        string keterangan "Istirahat / Izin Jalan"
        int durationMinutes "Durasi Keluar (Menit)"
        string startTime "Waktu Mulai"
        string endTime "Waktu Selesai"
        string status "PENDING / ACTIVE / RETURN_PENDING / COMPLETED / REJECTED"
        boolean consentGps "Persetujuan Pelacakan"
        string photoStart "Foto Bukti Keluar"
        string photoEnd "Foto Bukti Kembali (Nullable)"
        boolean fakeGpsDetected "Deteksi Mock GPS"
    }

    GPS_TRACK {
        string outing_id FK "Outing ID"
        float lat "Latitude"
        float lng "Longitude"
        string time "Waktu Rekam"
    }
```

---

## 🗺️ 4. Diagram Alur Logika (Flowcharts)

### A. Alur Verifikasi Geofence Presensi
```mermaid
graph TD
    Start([Mulai Absen]) --> Login[Input NRP & Password]
    Login --> ChkPass{Password Valid?}
    ChkPass -- Tidak --> ErrPass[Tampilkan: Password Salah]
    ChkPass -- Ya --> DevID[Deteksi Hardware ID]
    DevID --> ChkStatus{Status User NEW?}
    ChkStatus -- Ya --> ChangePass[Wajib Ganti Password]
    ChangePass --> SavePass[Simpan & Set ACTIVE]
    SavePass --> Dashboard
    ChkStatus -- Tidak --> Dashboard[Dashboard Utama]
    
    Dashboard --> ClickPresensi[Klik Presensi QR]
    ClickPresensi --> ChkWifi{Terhubung WiFi Kantor?}
    ChkWifi -- Tidak --> BlockWifi[Ditolak: Hubungkan WiFi Kantor]
    ChkWifi -- Ya --> ChkGPS{Koordinat GPS dalam Radius?}
    ChkGPS -- Tidak --> BlockGPS[Ditolak: Di Luar Geofence]
    ChkGPS -- Ya --> ChkMock{Fake GPS Terdeteksi?}
    ChkMock -- Ya --> BlockMock[Ditolak: Mock GPS Terdeteksi]
    ChkMock -- Tidak --> Success[Ambil Foto & Catat Absensi Sukses]
```

### B. Siklus Izin Keluar Kantor (Outing Tracking)
```mermaid
graph TD
    StartOuting([Pengajuan Izin Keluar]) --> InputForm[Input Tujuan & Durasi]
    InputForm --> CheckAcc{Persetujuan Komandan?}
    CheckAcc -- Ditolak --> RejectOut[Izin Ditolak & Selesai]
    CheckAcc -- Disetujui --> ActiveOut[Izin Aktif & GPS Live Mulai]
    
    ActiveOut --> Track[Kirim Koordinat GPS Berkala]
    Track --> ChkTime{Sisa Waktu <= 15m/10m/5m/1m?}
    ChkTime -- Ya --> SendAlert[Kirim Notifikasi Peringatan di HP]
    ChkTime -- Tidak --> Wait[Tunggu Sesi Selesai]
    
    SendAlert --> ReturnOffice[Kembali ke Kantor & Hubungkan WiFi]
    Wait --> ReturnOffice
    
    ReturnOffice --> ClickReturn[Klik Konfirmasi Kembali]
    ClickReturn --> AdminVerify{Verifikasi Komandan?}
    AdminVerify -- Tidak ACC --> ReturnOffice
    AdminVerify -- ACC --> Done[Status COMPLETED & Terhitung Hadir]
```

---

## 📦 5. Panduan Mengunggah ke GitHub (Git Push Guide)

Gunakan panduan berikut untuk mengunggah berkas projek lokal Anda ke repositori GitHub yang telah disiapkan secara manual (tidak dilakukan otomatis oleh asisten AI):

1. **Buka Terminal / Command Prompt** pada folder projek:
   ```bash
   cd c:\Users\HP\Downloads\testing2\presensi-&-track-kerja
   ```
2. **Inisialisasi Git Lokal** (jika belum pernah diinisialisasi):
   ```bash
   git init
   ```
3. **Tambahkan File ke Staging Area**:
   ```bash
   git add .
   ```
4. **Buat Commit Pertama**:
   ```bash
   git commit -m "Initial commit: Nayaka Mobile Attendance Mockup"
   ```
5. **Set Nama Branch Utama ke `main`**:
   ```bash
   git branch -M main
   ```
6. **Hubungkan dengan Repositori GitHub**:
   ```bash
   git remote add origin https://github.com/IntellQueue/Mockup-UI-UX-NAYAKA.git
   ```
   *(Catatan: Jika remote origin sudah ada, Anda dapat menghapusnya terlebih dahulu dengan `git remote remove origin` lalu menambahkannya kembali).*
7. **Unggah (Push) ke GitHub**:
   ```bash
   git push -u origin main
   ```
