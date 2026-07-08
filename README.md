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

## 🗺️ 4. Peta Arsitektur Logika Sistem (Overview & Flowcharts)

Bagian ini menyajikan peta hubungan alur (overview) antar-proses dalam ekosistem NAYAKA, diikuti oleh 9 diagram alur logika detail yang memetakan aktivitas User, Admin, dan Server secara mendalam.

### 🗺️ A. Overview: Peta Alur Hubungan Antar-Proses
```mermaid
graph TD
    %% Styling node
    classDef admin fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff;
    classDef user fill:#2563EB,stroke:#1D4ED8,stroke-width:2px,color:#fff;
    classDef system fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff;

    %% 1. Onboarding & Account Management
    subgraph Onboarding ["1. Pendaftaran dan Autentikasi"]
        Reg["Registrasi oleh Admin (Diagram 6)"]:::admin --> Login{"Login Pertama? (Diagram 1)"}:::user
        Login -- Ya --> GantiPass["Wajib Ganti Password (Diagram 1)"]:::user
        Login -- Tidak --> Dashboard["Dashboard Utama NAYAKA"]:::user
        GantiPass --> Dashboard
        Forgot["Lupa Password (Diagram 2)"]:::user -. OTP/SMS .-> Dashboard
    end

    %% 2. Daily Activities
    subgraph DailyActivity ["2. Menu dan Aktivitas Utama"]
        Dashboard --> ChooseAction{"Pilih Menu?"}:::user
        
        %% Path Absensi
        ChooseAction --> |Absensi Harian| Absen["Absensi QR (Diagram 3)"]:::user
        Absen --> WifiCheck{"Cek WiFi dan GPS Radius"}:::system
        WifiCheck -- Lolos --> PresenceOk["Presensi Tercatat (Hadir)"]:::system
        
        %% Path Izin Tanpa Tracking
        ChooseAction --> |Izin Ketidakhadiran| IzinSakit["Izin Ketidakhadiran (Diagram 7)"]:::user
        IzinSakit --> UploadBukti["Unggah Bukti dan Submit"]:::user
        UploadBukti --> AdminReview1["Review dan Approval Admin (Diagram 8)"]:::admin
        AdminReview1 -- Disetujui --> RekapOk["Rekap Kehadiran Terupdate"]:::system
        
        %% Path Izin Outing dengan Tracking
        ChooseAction --> |Izin Keluar Sementara| IzinOuting["Izin Istirahat/Jalan (Diagram 4)"]:::user
        IzinOuting --> AdminReview2["Review dan Approval Admin (Diagram 8)"]:::admin
    end

    %% 3. GPS Tracking Cycle
    subgraph TrackingSession ["3. Pelacakan dan Siklus GPS"]
        AdminReview2 -- Disetujui --> SelectDuration["Pilih Durasi dan Setujui GPS (Diagram 4)"]:::user
        SelectDuration --> LiveTrack["Mulai Tracking GPS (Diagram 4 / 5)"]:::system
        LiveTrack --> AdminMonitor["Live Monitoring Admin (Diagram 9)"]:::admin
        LiveTrack --> TimeCheck{"Cek Sisa Waktu dan Countdown"}:::system
        
        %% Normal Completion
        TimeCheck -- Kembali Sebelum Selesai --> ScanReturn["Scan QR dan Foto Kembali (Diagram 4)"]:::user
        ScanReturn --> Completed["Status COMPLETED (Selesai Tracking)"]:::system
        
        %% Overdue & Escalation
        TimeCheck -- Durasi Habis --> Overdue["Status OVERDUE dan Eskalasi (Diagram 5 / 9)"]:::system
        Overdue --> ContactUser["Hubungi Pegawai / Tutup Manual"]:::admin
        ContactUser --> Completed
    end
```

---

### 🗺️ B. Diagram Alur Detail (9 Flowcharts)

Berikut adalah 9 diagram alur logika detail yang memetakan aktivitas sistem NAYAKA secara spesifik:

### 1. Diagram Alur: Login & Ganti Password
```mermaid
graph TD
    Start([Mulai]) --> Input["Input NRP dan Password"]
    Input --> Valid{"NRP dan Password valid?"}
    Valid -- Tidak --> Err["Tampilkan pesan error"]
    Err --> Input
    Valid -- Ya --> LogDevice["Catat device_id ke Device Log"]
    LogDevice --> Default{"Password masih default?"}
    Default -- Ya --> ForceInput["Paksa input password baru"]
    ForceInput --> Policy{"Password baru valid dan sesuai kebijakan?"}
    Policy -- Tidak --> ForceInput
    Policy -- Ya --> Save["Simpan password baru"]
    Save --> Home["Masuk ke Home"]
    Default -- Tidak --> Home
```

### 2. Diagram Alur: Lupa Password
```mermaid
graph TD
    Start([Mulai]) --> Input["Input NRP"]
    Input --> Reg{"NRP terdaftar?"}
    Reg -- Tidak --> Err["Tampilkan error"]
    Err --> End([Selesai])
    Reg -- Ya --> OTP["Kirim OTP ke no. HP terdaftar (ASUMSI)"]
    OTP --> InputOTP["Input OTP"]
    InputOTP --> OTPValid{"OTP valid?"}
    OTPValid -- Tidak --> InputOTP
    OTPValid -- Ya --> InputNew["Input password baru"]
    InputNew --> Save["Simpan password baru"]
    Save --> End
```

### 3. Diagram Alur: Absensi QR
```mermaid
graph TD
    Start([Mulai Absensi]) --> Wifi{"Terhubung WiFi gedung - BSSID cocok?"}
    Wifi -- Tidak --> RejectWifi["Tolak: harus di area gedung"]
    RejectWifi --> End([Selesai])
    Wifi -- Ya --> Scan["Scan QR Code (rotating)"]
    Scan --> QRValid{"QR valid dan belum expired?"}
    QRValid -- Tidak --> RejectQR["Tolak: QR tidak valid / kadaluarsa"]
    RejectQR --> End
    QRValid -- Ya --> Liveness["Ambil foto (liveness check)"]
    Liveness --> Attest{"Foto dan device attestation lolos?"}
    Attest -- Tidak --> RejectAttest["Tolak: gagal verifikasi (cek batas retry)"]
    RejectAttest --> End
    Attest -- Ya --> Save["Simpan data absensi: foto, GPS, timestamp, BSSID"]
    Save --> End
```

### 4. Diagram Alur: Izin Istirahat-Jalan (dengan Tracking GPS)
```mermaid
graph TD
    Start([Mulai]) --> Form["Isi form izin: jenis, keterangan, bukti foto/PDF"]
    Form --> Send["Kirim ke Admin"]
    Send --> Approve{"Admin approve?"}
    Approve -- Tidak --> NotifReject["Notifikasi ditolak ke user"]
    NotifReject --> End([Selesai])
    Approve -- Ya --> ChooseDur["User pilih durasi (kelipatan 30 menit s.d. 3 jam)"]
    ChooseDur --> Consent["User setujui GPS always-on"]
    Consent --> StartTrack["Mulai tracking GPS kontinu"]
    StartTrack --> CheckTime{"Sisa waktu = 15/10/5/1 menit? (server-side scheduler)"}
    CheckTime -- Ya --> SendCountdown["Kirim notifikasi countdown"]
    SendCountdown --> CheckReturn
    CheckTime -- Tidak / belum waktunya --> CheckReturn{"User sudah kembali ke gedung?"}
    CheckReturn -- Ya, sebelum durasi habis --> RequestApproval["User request approval kembali"]
    RequestApproval --> ScanReturn["Scan QR + foto bukti kembali (sama seperti absensi)"]
    ScanReturn --> Verify{"Verifikasi lolos?"}
    Verify -- Tidak --> ScanReturn
    Verify -- Ya --> Completed["Status: Completed, stop tracking"]
    Completed --> End
    CheckReturn -- Tidak, durasi habis --> Overdue["Durasi habis, belum kembali"]
    Overdue --> StatusOverdue["Status: Overdue + Eskalasi alert ke admin (ASUMSI)"]
    StatusOverdue --> End
```

### 5. Diagram State: Siklus Izin
```mermaid
stateDiagram-v2
    [*] --> Diajukan
    Diajukan --> Ditolak : admin reject
    Ditolak --> [*]
    Diajukan --> Disetujui : admin approve
    Disetujui --> Tracking_Aktif : user pilih durasi, GPS always-on disetujui
    
    state Tracking_Aktif {
        [*] --> Tracking
        Tracking --> Tracking : notifikasi countdown 15/10/5/1 menit
    }
    
    Tracking_Aktif --> GPS_Terputus : user cabut izin lokasi
    GPS_Terputus --> Tracking_Aktif : user aktifkan lagi sebelum durasi habis
    GPS_Terputus --> Dieskalasi : tidak diaktifkan lagi (ASUMSI - eskalasi langsung)
    
    Tracking_Aktif --> Menunggu_Verifikasi : user request kembali, sebelum durasi habis
    Menunggu_Verifikasi --> Menunggu_Verifikasi : verifikasi gagal (retry)
    Menunggu_Verifikasi --> Selesai : verifikasi lolos
    
    Tracking_Aktif --> Overdue : durasi habis, belum request kembali
    Overdue --> Dieskalasi : alert dikirim ke admin
    
    Dieskalasi --> Ditutup_Manual : admin tutup manual dengan keterangan
    Ditutup_Manual --> [*]
    Selesai --> [*]
```

### 6. Diagram Alur: Registrasi User oleh Admin
```mermaid
graph TD
    Start([Mulai]) --> Input["Admin input data: NRP, Nama KTP, Nama Kesatuan, Alamat, No. HP"]
    Input --> Reg{"NRP sudah terdaftar?"}
    Reg -- Ya --> ErrReg["Tampilkan error: NRP duplikat"]
    ErrReg --> Input
    Reg -- Tidak --> ValidateHP{"Validasi format No. HP dan kelengkapan data?"}
    ValidateHP -- Tidak valid --> ErrValidate["Tampilkan error field tidak valid"]
    ErrValidate --> Input
    ValidateHP -- Valid --> GeneratePass["Generate password default acak (mencegah predictable password)"]
    GeneratePass --> Save["Simpan data user ke database (set is_default_password = true)"]
    Save --> SendSMS["Kirim NRP + password default ke No. HP terdaftar (SMS) (ASUMSI: metode distribusi kredensial)"]
    SendSMS --> End([Selesai])
```

### 7. Diagram Alur: Izin Ketidakhadiran (Tanpa Tracking)
```mermaid
graph TD
    Start([Mulai]) --> Choose["Pilih jenis: Sakit / Izin / Musibah"]
    Choose --> Fill["Isi keterangan & rentang tanggal"]
    Fill --> Upload["Unggah bukti foto / PDF"]
    Upload --> Proof{"Bukti wajib dan terisi?"}
    Proof -- Tidak --> ErrProof["Tampilkan error: bukti wajib diisi"]
    ErrProof --> Upload
    Proof -- Ya --> Send["Kirim ke Admin"]
    Send --> Approve{"Admin approve?"}
    Approve -- Tidak --> Reject["Reject + input alasan wajib"]
    Reject --> End([Selesai])
    Approve -- Ya --> Save["Catat: Disetujui — Tanpa Tracking (Update rekap kehadiran)"]
    Save --> End
```

### 8. Diagram Alur: Admin - Review Keputusan Izin
```mermaid
graph TD
    Start([Mulai - Admin buka daftar pengajuan pending]) --> Choose["Pilih satu pengajuan, lihat detail & bukti"]
    Choose --> Type{"Jenis = Ketidakhadiran (sakit/izin/musibah)?"}
    Type -- Ya --> ShowAbsence["Tampilkan opsi: Approve / Reject (tanpa setting durasi)"]
    Type -- Tidak --> ShowOuting["Tampilkan opsi: Approve / Reject (approve = user boleh pilih durasi)"]
    ShowAbsence --> Decide["Admin pilih keputusan"]
    ShowOuting --> Decide
    Decide --> Reject{"Reject?"}
    Reject -- Ya --> InputReject["Input alasan penolakan (wajib)"]
    Reject -- No --> InputApprove["Input catatan (opsional)"]
    InputReject --> Save["Simpan keputusan, kirim notifikasi ke user"]
    InputApprove --> Save
    Save --> End([Selesai])
```

### 9. Diagram Alur: Admin - Monitoring Tracking GPS
```mermaid
graph TD
    Start([Mulai - Admin buka menu Monitoring]) --> ShowList["Tampilkan daftar user berstatus 'Tracking Aktif'"]
    ShowList --> Select["Admin pilih salah satu user"]
    Select --> ShowDetails["Tampilkan peta lokasi terakhir, waktu update, sisa durasi"]
    ShowDetails --> Overdue{"Sisa durasi = 0 dan belum ada bukti kembali?"}
    Overdue -- Tidak --> Refresh["Auto-refresh berkala, tetap di layar monitoring"]
    Refresh --> ShowDetails
    Overdue -- Ya --> Highlight["Highlight sebagai Overdue. Tampilkan aksi: Hubungi user / Tutup manual"]
    Highlight --> ManualClose{"Admin pilih 'Tutup manual'?"}
    ManualClose -- Tidak --> ShowList
    ManualClose -- Ya --> InputNotes["Input keterangan (wajib)"]
    InputNotes --> Save["Ubah status ke selesai/ditutup manual"]
    Save --> End([Selesai])
```

### 🔍 Catatan Verifikasi Alur & Keselarasan Kode Mockup

1. **Sinkronisasi Desain vs Mockup (First Iteration):**
   * Sesuai dengan batasan mockup saat ini, data durasi izin keluar dan persetujuan GPS sudah diisi langsung oleh user pada form pengajuan (sebelum disetujui Admin). Di production kelak, alur dapat diselaraskan dengan Diagram 4 di mana penentuan durasi dilakukan pasca-persetujuan agar waktu durasi tidak berkurang selama menunggu *approval* komandan.
2. **Mitigasi GPS Terputus (Diagram 5 - State `s5`):**
   * Penanganan state `GPS_Terputus` (seperti saat user mematikan GPS di tengah sesi) merupakan bagian penting yang diidentifikasi dalam flowchart. Pada iterasi ini, logika tersebut dirancang sebagai *business logic* yang wajib diimplementasikan pada backend production untuk mencegah celah manipulasi kehadiran.
3. **Mekanisme OTP & Distribusi Kredensial:**
   * Fitur Lupa Password (Diagram 2) dan Registrasi Admin (Diagram 6) masih berstatus simulasi/asumsi (*mock*) pada antarmuka frontend, dan akan membutuhkan integrasi dengan SMS/WhatsApp Gateway API untuk implementasi backend penuh.


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
