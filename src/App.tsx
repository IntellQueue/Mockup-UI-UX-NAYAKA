/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Wifi, 
  MapPin, 
  UserPlus, 
  QrCode, 
  Camera, 
  FileText, 
  Clock, 
  User, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Bell, 
  Settings, 
  RefreshCw, 
  Search, 
  Map, 
  Check, 
  Lock, 
  FileUp, 
  Smartphone,
  Phone,
  FileCheck,
  ChevronRight,
  UserCheck,
  Zap,
  Info,
  Sliders,
  HelpCircle
} from 'lucide-react';

// ==========================================
// TYPES & ENUMS (TypeScript & Type Safety)
// ==========================================

export enum UserStatus {
  NEW = 'NEW',         // Belum ganti password default
  ACTIVE = 'ACTIVE',   // Sudah ganti password default
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum OutingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',            // Sedang izin keluar dilacak GPS
  RETURN_PENDING = 'RETURN_PENDING', // Menunggu acc kembali dari admin
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface UserRecord {
  nrp: string;
  nama: string;
  kesatuan: string;
  alamat: string;
  noHp: string;
  status: UserStatus;
  device: string | null; // Otomatis dicatat saat login pertama kali
  passwordHash: string; // Simulasi password
}

export interface PresenceLog {
  id: string;
  nrp: string;
  nama: string;
  kesatuan: string;
  type: 'MASUK' | 'KELUAR';
  timestamp: string;
  wifiSSID: string;
  lat: number;
  lng: number;
  photo: string;
  fakeGpsDetected: boolean;
}

export interface AbsenceRequest {
  id: string;
  nrp: string;
  nama: string;
  kesatuan: string;
  keterangan: 'Sakit' | 'Izin Darurat' | 'Musibah' | 'Lainnya';
  detail: string;
  filePhoto: string;
  filePdfName: string;
  status: RequestStatus;
  timestamp: string;
  approvedAt?: string;
}

export interface OutingRequest {
  id: string;
  nrp: string;
  nama: string;
  kesatuan: string;
  keterangan: 'Istirahat' | 'Izin Jalan';
  durationMinutes: number; // 30, 60, 90, 120, 150, 180
  startTime: string | null;
  endTime: string | null;
  status: OutingStatus;
  consentGps: boolean;
  photoStart: string;
  photoEnd?: string;
  fakeGpsDetected: boolean;
  gpsTrack: Array<{ lat: number; lng: number; time: string }>;
}

// Coordinate constants
const OFFICE_LAT = -6.17511;
const OFFICE_LNG = 106.82712;

// Custom NAYAKA SVG Logo Component (Modern Shield, Letter N + Checkmark)
export function NayakaLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Shield outline & background - Tactical deep green and military gold */}
        <path 
          d="M50 8 L88 20 C88 53 50 92 50 92 C50 92 12 53 12 20 L50 8 Z" 
          fill="#112A19" 
          stroke="#D4AF37" 
          strokeWidth="6.5" 
          strokeLinejoin="round"
        />
        {/* Inner gold shield dashed border */}
        <path 
          d="M50 15 L81 25 C81 50 50 83 50 83 C50 83 19 50 19 25 L50 15 Z" 
          stroke="#D4AF37" 
          strokeWidth="1.2" 
          strokeDasharray="4 2"
          opacity="0.6"
          strokeLinejoin="round"
        />
        {/* Letter N structure inside shield */}
        {/* Left Vertical Bar */}
        <path 
          d="M34 32 V64" 
          stroke="#FFFFFF" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        {/* Diagonal Bar */}
        <path 
          d="M34 32 L60 62" 
          stroke="#FFFFFF" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        {/* Right Vertical Bar */}
        <path 
          d="M60 32 V54" 
          stroke="#FFFFFF" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        {/* Verification Checkmark (✔) in emerald green representing validation and administration */}
        <path 
          d="M48 54 L58 64 L78 38" 
          stroke="#4ADE80" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Accent dots or small tech lines in Military Gold */}
        <circle cx="50" cy="80" r="3" fill="#D4AF37" />
      </svg>
    </div>
  );
}

export default function App() {
  // ==========================================
  // INITIALIZATIONS & SHARED DATABASE STATE
  // ==========================================

  // Mock Database - stored in State for real-time reactivity between frames
  const [users, setUsers] = useState<UserRecord[]>([
    {
      nrp: '123456',
      nama: 'Pratu Bagus Pratama',
      kesatuan: 'Kompi Senapan A Brigif 87',
      alamat: 'Asrama Brigif 87, Gedung Juang, Blitar',
      noHp: '081234567890',
      status: UserStatus.NEW,
      device: null, // first login will capture device automatically
      passwordHash: 'password123', // default
    },
    {
      nrp: '789012',
      nama: 'Sertu Ahmad Wijaya',
      kesatuan: 'Yonif Raider 1 Brigif 87',
      alamat: 'Asrama Batalyon Infanteri Raider, Blitar',
      noHp: '085678901234',
      status: UserStatus.ACTIVE,
      device: 'Samsung Galaxy S24 Ultra (Android 14)',
      passwordHash: 'rahasia123', // changed
    },
    {
      nrp: '345678',
      nama: 'Letda Inf. Dwi Cahyo',
      kesatuan: 'Staf Personel Denma Brigif 87',
      alamat: 'Ksatrian Markas Brigif 87, Blitar',
      noHp: '087711223344',
      status: UserStatus.ACTIVE,
      device: 'iPhone 15 Pro Max (iOS 17.5)',
      passwordHash: 'rahasia345',
    }
  ]);

  const [presenceLogs, setPresenceLogs] = useState<PresenceLog[]>([
    {
      id: 'log-1',
      nrp: '789012',
      nama: 'Sertu Ahmad Wijaya',
      kesatuan: 'Yonif Raider 1 Brigif 87',
      type: 'MASUK',
      timestamp: '2026-07-02 07:15:32',
      wifiSSID: 'NAYAKA-WIFI-SECURE',
      lat: OFFICE_LAT,
      lng: OFFICE_LNG,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      fakeGpsDetected: false
    }
  ]);

  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([
    {
      id: 'abs-1',
      nrp: '345678',
      nama: 'Letda Inf. Dwi Cahyo',
      kesatuan: 'Staf Personel Denma Brigif 87',
      keterangan: 'Sakit',
      detail: 'Demam tinggi dan sakit tenggorokan, perlu istirahat total berdasarkan surat dokter.',
      filePhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300',
      filePdfName: 'surat_dokter_dwicahyo.pdf',
      status: RequestStatus.PENDING,
      timestamp: '2026-07-02 08:05:00'
    }
  ]);

  const [outingRequests, setOutingRequests] = useState<OutingRequest[]>([
    {
      id: 'out-1',
      nrp: '789012',
      nama: 'Sertu Ahmad Wijaya',
      kesatuan: 'Yonif Raider 1 Brigif 87',
      keterangan: 'Istirahat',
      durationMinutes: 60,
      startTime: null,
      endTime: null,
      status: OutingStatus.PENDING,
      consentGps: true,
      photoStart: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      fakeGpsDetected: false,
      gpsTrack: []
    }
  ]);

  // ==========================================
  // PHYSICAL ENVIRONMENT SIMULATOR CONTROLS (State)
  // ==========================================
  const [flowchartTab, setFlowchartTab] = useState<'PRESENCE' | 'OUTING'>('PRESENCE');
  const [flowchartOpen, setFlowchartOpen] = useState<boolean>(true);

  const [simWifiConnected, setSimWifiConnected] = useState<boolean>(true); // true = NAYAKA-WIFI-SECURE, false = TELKOMSEL-LTE
  const [simLocationMode, setSimLocationMode] = useState<'OFFICE' | 'OUTSIDE' | 'FAKE_GPS'>('OFFICE'); 
  const [simCurrentPhoto, setSimCurrentPhoto] = useState<string>('https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=300&q=80'); // standard mock avatar selfie
  const [simTimeSecondsPassed, setSimTimeSecondsPassed] = useState<number>(0); // allows shifting time to trigger warnings

  // Derived mock environmental variables
  const currentWifiSSID = simWifiConnected ? 'NAYAKA-WIFI-SECURE' : 'TELKOMSEL-LTE';
  const getSimulatedCoordinates = () => {
    switch (simLocationMode) {
      case 'OFFICE':
        return { lat: OFFICE_LAT, lng: OFFICE_LNG, isFake: false };
      case 'OUTSIDE':
        // slightly shifted coordinates outside range
        return { lat: -6.18241, lng: 106.83945, isFake: false };
      case 'FAKE_GPS':
        // Coordinates set to office but marked/flagged as spoofed
        return { lat: OFFICE_LAT, lng: OFFICE_LNG, isFake: true };
    }
  };

  const currentCoords = getSimulatedCoordinates();

  // ==========================================
  // USER MOBILE FRAME STATES
  // ==========================================
  const [userLoggedIn, setUserLoggedIn] = useState<UserRecord | null>(null);
  const [userNrpInput, setUserNrpInput] = useState<string>('123456'); // Default set to the "NEW" user
  const [userPasswordInput, setUserPasswordInput] = useState<string>('password123');
  const [userForgotPasswordOpen, setUserForgotPasswordOpen] = useState<boolean>(false);
  const [userForgotNrp, setUserForgotNrp] = useState<string>('');
  const [userForgotPhone, setUserForgotPhone] = useState<string>('');
  const [userForgotSuccessMsg, setUserForgotSuccessMsg] = useState<string>('');
  
  // Login forced change password states
  const [userNewPassword, setUserNewPassword] = useState<string>('');
  const [userNewPasswordConfirm, setUserNewPasswordConfirm] = useState<string>('');
  const [userPasswordError, setUserPasswordError] = useState<string>('');

  // User App Inner Navigation
  const [userActiveTab, setUserActiveTab] = useState<'HOME' | 'PRESENCE' | 'IZIN' | 'OUTING'>('HOME');
  const [userSuccessNotification, setUserSuccessNotification] = useState<string | null>(null);
  const [userErrorNotification, setUserErrorNotification] = useState<string | null>(null);

  // User Forms inputs
  const [absenceKeterangan, setAbsenceKeterangan] = useState<'Sakit' | 'Izin Darurat' | 'Musibah' | 'Lainnya'>('Sakit');
  const [absenceDetail, setAbsenceDetail] = useState<string>('');
  const [absencePhotoFile, setAbsencePhotoFile] = useState<string>('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300');
  const [absencePdfName, setAbsencePdfName] = useState<string>('surat_keterangan.pdf');

  const [outingType, setOutingType] = useState<'Istirahat' | 'Izin Jalan'>('Istirahat');
  const [outingDuration, setOutingDuration] = useState<number>(60); // minutes
  const [outingGpsConsent, setOutingGpsConsent] = useState<boolean>(false);

  // Active Outing Real-time Clock Simulator
  // We compute time left based on simTimeSecondsPassed and active outing values
  const activeUserOuting = outingRequests.find(o => o.nrp === userLoggedIn?.nrp && (o.status === OutingStatus.ACTIVE || o.status === OutingStatus.RETURN_PENDING));
  const [activeOutingTimeLeft, setActiveOutingTimeLeft] = useState<number>(0); // in seconds
  const [activeOutingNotificationTriggered, setActiveOutingNotificationTriggered] = useState<{ [key: number]: boolean }>({});

  // Push notifications center inside user phone
  const [phoneNotifications, setPhoneNotifications] = useState<Array<{ id: string; title: string; message: string; timestamp: string; type: 'info' | 'warning' | 'danger' }>>([
    {
      id: 'notif-1',
      title: 'Selamat Datang',
      message: 'Gunakan WiFi gedung NAYAKA-WIFI-SECURE untuk melakukan presensi QR masuk & keluar.',
      timestamp: '08:00',
      type: 'info'
    }
  ]);

  // ==========================================
  // ADMIN MOBILE FRAME STATES
  // ==========================================
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(true); // default logged in for easy test
  const [adminNrpInput, setAdminNrpInput] = useState<string>('admin');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('adminpassword');
  const [adminError, setAdminError] = useState<string>('');
  const [adminActiveTab, setAdminActiveTab] = useState<'USERS' | 'PRESENCE_LOGS' | 'LEAVES_APPROVALS' | 'TRACKING_MAP'>('LEAVES_APPROVALS');

  // Admin register user states
  const [regNrp, setRegNrp] = useState<string>('');
  const [regNama, setRegNama] = useState<string>('');
  const [regKesatuan, setRegKesatuan] = useState<string>('');
  const [regAlamat, setRegAlamat] = useState<string>('');
  const [regNoHp, setRegNoHp] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string>('');
  const [regError, setRegError] = useState<string>('');

  // ==========================================
  // TIME CONTROLLER LOGIC (Countdown & GPS Track Simulator)
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeUserOuting && activeUserOuting.status === OutingStatus.ACTIVE) {
      // Set the duration initially if we just entered active status
      const totalSec = activeUserOuting.durationMinutes * 60;
      const computedLeft = Math.max(0, totalSec - simTimeSecondsPassed);
      setActiveOutingTimeLeft(computedLeft);

      // Trigger automatic warning notifications based on minutes left
      const minsLeft = Math.ceil(computedLeft / 60);

      // Check for countdown alerts: 15m, 10m, 5m, 1m
      const alertThresholds = [15, 10, 5, 1];
      alertThresholds.forEach(threshold => {
        if (minsLeft <= threshold && minsLeft > 0 && !activeOutingNotificationTriggered[threshold]) {
          // Trigger Notification
          const alertId = `countdown-alert-${threshold}-${Date.now()}`;
          const newNotif = {
            id: alertId,
            title: `Peringatan ${threshold} Menit!`,
            message: `Sisa waktu izin keluar Anda ${minsLeft} menit lagi. GPS melacak secara aktif, mohon segera kembali ke area WiFi KODAM Gedung!`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            type: threshold === 1 ? 'danger' : threshold <= 5 ? 'warning' : 'info' as any
          };

          setPhoneNotifications(prev => [newNotif, ...prev]);
          setActiveOutingNotificationTriggered(prev => ({ ...prev, [threshold]: true }));
        }
      });
    }
    return () => clearInterval(interval);
  }, [activeUserOuting, simTimeSecondsPassed, activeOutingNotificationTriggered]);

  // Handle GPS Path Generation when time passes or status is active
  useEffect(() => {
    if (activeUserOuting && activeUserOuting.status === OutingStatus.ACTIVE) {
      // Simulate GPS point breadcrumbs moving randomly outside
      const baseLat = -6.18241;
      const baseLng = 106.83945;
      
      // Seed breadcrumbs based on seconds passed
      const breadcrumbs = [];
      const numPoints = Math.min(8, 1 + Math.floor(simTimeSecondsPassed / 30));
      for (let i = 0; i < numPoints; i++) {
        breadcrumbs.push({
          lat: baseLat + (Math.sin(i) * 0.0015),
          lng: baseLng + (Math.cos(i) * 0.0015),
          time: `10:${30 + i}`
        });
      }

      // Update outing's tracking trace
      setOutingRequests(prev => prev.map(o => {
        if (o.id === activeUserOuting.id) {
          return {
            ...o,
            gpsTrack: breadcrumbs,
            fakeGpsDetected: currentCoords.isFake
          };
        }
        return o;
      }));
    }
  }, [simTimeSecondsPassed, activeUserOuting?.status, simLocationMode]);


  // ==========================================
  // AUTODETECT DEVICE SIMULATION ON LOGIN
  // ==========================================
  const simulateDeviceCapture = () => {
    // Standard beautiful devices
    const deviceModels = [
      'iPhone 15 Pro, iOS 17.5',
      'Samsung Galaxy S24 Ultra, Android 14',
      'Xiaomi 14 Pro, HyperOS 1.0',
      'Google Pixel 8 Pro, Android 14',
      'iPad Pro, iPadOS 17.2'
    ];
    // deterministic choice based on input NRP or random
    const idx = Math.floor(Math.random() * deviceModels.length);
    return deviceModels[idx];
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // User Login Handler
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessNotification(null);
    setUserErrorNotification(null);

    const matchedUser = users.find(u => u.nrp === userNrpInput.trim());

    if (!matchedUser) {
      setUserErrorNotification('NRP tidak terdaftar!');
      return;
    }

    if (matchedUser.passwordHash !== userPasswordInput) {
      setUserErrorNotification('Password salah!');
      return;
    }

    // Capture device automatically on first login
    let updatedUsers = [...users];
    let deviceCaptured = matchedUser.device;
    
    if (!matchedUser.device) {
      deviceCaptured = simulateDeviceCapture();
      updatedUsers = users.map(u => {
        if (u.nrp === matchedUser.nrp) {
          return { ...u, device: deviceCaptured };
        }
        return u;
      });
      setUsers(updatedUsers);
      
      // Admin Notification log simulation
      const newPresenceLog: PresenceLog = {
        id: `login-device-log-${Date.now()}`,
        nrp: matchedUser.nrp,
        nama: matchedUser.nama,
        kesatuan: matchedUser.kesatuan,
        type: 'MASUK',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        wifiSSID: 'DETEKSI-DEVICE-LOGIN',
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        photo: simCurrentPhoto,
        fakeGpsDetected: false
      };
      setPresenceLogs(prev => [newPresenceLog, ...prev]);
    }

    // Proceed
    setUserLoggedIn({ ...matchedUser, device: deviceCaptured });

    if (matchedUser.status === UserStatus.NEW) {
      // Force change password screen
      setUserActiveTab('HOME'); // will lock view on Force Change password
    } else {
      setUserActiveTab('HOME');
      // add success login notif
      const loginNotif = {
        id: `notif-login-${Date.now()}`,
        title: 'Login Berhasil',
        message: `Terdeteksi masuk menggunakan perangkat: ${deviceCaptured}.`,
        timestamp: 'Sekarang',
        type: 'info' as any
      };
      setPhoneNotifications(prev => [loginNotif, ...prev]);
    }
  };

  // Force Change Password Handler
  const handleForceChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPasswordError('');

    if (userNewPassword.length < 6) {
      setUserPasswordError('Password baru harus minimal 6 karakter!');
      return;
    }

    if (userNewPassword !== userNewPasswordConfirm) {
      setUserPasswordError('Konfirmasi password tidak cocok!');
      return;
    }

    // Update database
    const updatedUsers = users.map(u => {
      if (u.nrp === userLoggedIn?.nrp) {
        return { ...u, status: UserStatus.ACTIVE, passwordHash: userNewPassword };
      }
      return u;
    });

    setUsers(updatedUsers);
    
    // Update current logged in user context
    setUserLoggedIn(prev => prev ? { ...prev, status: UserStatus.ACTIVE, passwordHash: userNewPassword } : null);
    
    setUserSuccessNotification('Password default berhasil diubah! Selamat bekerja.');

    // Add push log
    setPhoneNotifications(prev => [{
      id: `pw-changed-${Date.now()}`,
      title: 'Password Diperbarui',
      message: 'Password default Anda berhasil diubah secara aman. Keamanan akun aktif.',
      timestamp: 'Sekarang',
      type: 'info'
    }, ...prev]);
  };

  // Forgot Password Handler
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserForgotSuccessMsg('');
    
    const matched = users.find(u => u.nrp === userForgotNrp && u.noHp === userForgotPhone);
    if (!matched) {
      setUserPasswordError('NRP dan No. HP tidak cocok atau tidak terdaftar!');
      return;
    }

    setUserForgotSuccessMsg(`Permohonan reset terkirim ke Admin. Password sementara Anda disetel ulang menjadi: password123. Silakan login kembali.`);
    
    // Reset back to default so they can login and change password
    setUsers(prev => prev.map(u => {
      if (u.nrp === userForgotNrp) {
        return { ...u, status: UserStatus.NEW, passwordHash: 'password123' };
      }
      return u;
    }));
  };

  // QR Attendance In/Out Submit
  const handlePresenceSubmit = (type: 'MASUK' | 'KELUAR') => {
    setUserErrorNotification(null);
    setUserSuccessNotification(null);

    // WiFi Building Constraint Check
    if (!simWifiConnected) {
      setUserErrorNotification('Presensi Gagal! Anda tidak terhubung ke WiFi area gedung (KODAM-WIFI-SECURE).');
      return;
    }

    // Fake GPS Protection Check
    if (currentCoords.isFake) {
      setUserErrorNotification('Presensi Ditolak! Terdeteksi aktivitas manipulasi lokasi (Fake GPS). Sistem keamanan melaporkan koordinat tidak valid.');
      return;
    }

    // Geolocation bounds Check (simulating 50m geofence radius)
    if (simLocationMode !== 'OFFICE') {
      setUserErrorNotification('Presensi Ditolak! Koordinat GPS Anda di luar batas toleransi area gedung (Radius > 50 meter).');
      return;
    }

    // Record Log
    const newLog: PresenceLog = {
      id: `log-${Date.now()}`,
      nrp: userLoggedIn!.nrp,
      nama: userLoggedIn!.nama,
      kesatuan: userLoggedIn!.kesatuan,
      type: type,
      timestamp: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID'),
      wifiSSID: currentWifiSSID,
      lat: currentCoords.lat,
      lng: currentCoords.lng,
      photo: simCurrentPhoto,
      fakeGpsDetected: false
    };

    setPresenceLogs(prev => [newLog, ...prev]);
    setUserSuccessNotification(`Presensi QR ${type} berhasil dicatat menggunakan jaringan gedung.`);

    setPhoneNotifications(prev => [{
      id: `pres-${Date.now()}`,
      title: `Presensi ${type} Berhasil`,
      message: `Presensi QR berhasil diverifikasi oleh WiFi Gedung KODAM pada pukul ${new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB.`,
      timestamp: 'Sekarang',
      type: 'info'
    }, ...prev]);
  };

  // Submit Leave Request (Izin Ketidakhadiran)
  const handleAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrorNotification(null);
    setUserSuccessNotification(null);

    if (!absenceDetail.trim()) {
      setUserErrorNotification('Mohon isi alasan / detail ketidakhadiran.');
      return;
    }

    const newRequest: AbsenceRequest = {
      id: `abs-${Date.now()}`,
      nrp: userLoggedIn!.nrp,
      nama: userLoggedIn!.nama,
      kesatuan: userLoggedIn!.kesatuan,
      keterangan: absenceKeterangan,
      detail: absenceDetail,
      filePhoto: simCurrentPhoto,
      filePdfName: absencePdfName,
      status: RequestStatus.PENDING,
      timestamp: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID'),
    };

    setAbsenceRequests(prev => [newRequest, ...prev]);
    setUserSuccessNotification(`Pengajuan Izin Ketidakhadiran (${absenceKeterangan}) berhasil diajukan. Menunggu verifikasi komandan.`);
    setAbsenceDetail('');

    setPhoneNotifications(prev => [{
      id: `absnot-${Date.now()}`,
      title: 'Izin Diajukan',
      message: `Permohonan Izin ${absenceKeterangan} sedang ditinjau oleh Admin. Bukti PDF: ${absencePdfName}.`,
      timestamp: 'Sekarang',
      type: 'info'
    }, ...prev]);
  };

  // Submit Outing Request (Izin Istirahat / Jalan)
  const handleOutingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrorNotification(null);
    setUserSuccessNotification(null);

    // MUST be in building WiFi to apply
    if (!simWifiConnected) {
      setUserErrorNotification('Pengajuan Izin Keluar Jam Kerja harus diajukan di dalam area WiFi Gedung Kantor!');
      return;
    }

    if (!outingGpsConsent) {
      setUserErrorNotification('Anda harus menyetujui pelacakan GPS Always-On selama berada di luar gedung.');
      return;
    }

    const newOuting: OutingRequest = {
      id: `out-${Date.now()}`,
      nrp: userLoggedIn!.nrp,
      nama: userLoggedIn!.nama,
      kesatuan: userLoggedIn!.kesatuan,
      keterangan: outingType,
      durationMinutes: outingDuration,
      startTime: null,
      endTime: null,
      status: OutingStatus.PENDING,
      consentGps: true,
      photoStart: simCurrentPhoto,
      fakeGpsDetected: false,
      gpsTrack: []
    };

    setOutingRequests(prev => [newOuting, ...prev]);
    setUserSuccessNotification(`Izin keluar selama ${outingDuration} menit berhasil dikirim. Menunggu persetujuan Admin.`);

    setPhoneNotifications(prev => [{
      id: `outnot-${Date.now()}`,
      title: 'Pengajuan Izin Keluar',
      message: `Izin keluar ${outingType} (${outingDuration} Menit) berhasil dikirim. Harap tunggu persetujuan.`,
      timestamp: 'Sekarang',
      type: 'info'
    }, ...prev]);
  };

  // User Request Return Confirm
  const handleReturnRequest = () => {
    setUserErrorNotification(null);
    setUserSuccessNotification(null);

    // Must be back in office wifi to request return approval
    if (!simWifiConnected) {
      setUserErrorNotification('Konfirmasi Kembali Gagal! Anda harus berada dalam area WiFi Gedung Kantor (KODAM-WIFI-SECURE) untuk melakukan check-in kembali!');
      return;
    }

    if (simLocationMode !== 'OFFICE') {
      setUserErrorNotification('Konfirmasi Kembali Gagal! Deteksi GPS menunjukkan Anda masih di luar jangkauan gedung kantor.');
      return;
    }

    if (currentCoords.isFake) {
      setUserErrorNotification('Konfirmasi Kembali Ditolak! Terdeteksi Fake GPS aktif.');
      return;
    }

    setOutingRequests(prev => prev.map(o => {
      if (o.nrp === userLoggedIn!.nrp && o.status === OutingStatus.ACTIVE) {
        return {
          ...o,
          status: OutingStatus.RETURN_PENDING,
          photoEnd: simCurrentPhoto
        };
      }
      return o;
    }));

    setUserSuccessNotification('Permintaan konfirmasi kembali diajukan. Admin sedang memverifikasi QR dan foto bukti kedatangan Anda.');
    
    setPhoneNotifications(prev => [{
      id: `retnot-${Date.now()}`,
      title: 'Check-In Kembali Diajukan',
      message: 'Permintaan verifikasi QR kembali sedang ditinjau Admin menggunakan WiFi Gedung Kantor.',
      timestamp: 'Sekarang',
      type: 'info'
    }, ...prev]);
  };

  // ==========================================
  // ADMIN SYSTEM ACTION HANDLERS
  // ==========================================

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (adminNrpInput.trim() === 'admin' && adminPasswordInput === 'adminpassword') {
      setAdminLoggedIn(true);
    } else {
      setAdminError('NRP Admin atau Password salah!');
    }
  };

  // Admin Register User
  const handleAdminRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regNrp || !regNama || !regKesatuan || !regAlamat || !regNoHp) {
      setRegError('Semua field registrasi harus diisi lengkap!');
      return;
    }

    // Check duplicate
    if (users.some(u => u.nrp === regNrp.trim())) {
      setRegError('NRP tersebut sudah terdaftar di sistem!');
      return;
    }

    const newUser: UserRecord = {
      nrp: regNrp.trim(),
      nama: regNama.trim(),
      kesatuan: regKesatuan.trim(),
      alamat: regAlamat.trim(),
      noHp: regNoHp.trim(),
      status: UserStatus.NEW,
      device: null,
      passwordHash: 'password123', // default password
    };

    setUsers(prev => [...prev, newUser]);
    setRegSuccess(`User NRP ${regNrp} atas nama ${regNama} berhasil didaftarkan. Password default: password123`);
    
    // Reset forms
    setRegNrp('');
    setRegNama('');
    setRegKesatuan('');
    setRegAlamat('');
    setRegNoHp('');
  };

  // Admin Action Absence (Approve / Reject)
  const handleAdminAbsenceAction = (id: string, action: RequestStatus) => {
    setAbsenceRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: action,
          approvedAt: new Date().toLocaleTimeString()
        };
      }
      return req;
    }));

    // If approved, notify user if logged in
    const req = absenceRequests.find(r => r.id === id);
    if (req) {
      const isApprove = action === RequestStatus.APPROVED;
      setPhoneNotifications(prev => [{
        id: `abs-eval-${Date.now()}`,
        title: isApprove ? 'Izin Disetujui' : 'Izin Ditolak',
        message: `Pengajuan izin ${req.keterangan} Anda telah ${isApprove ? 'DISETUJUI' : 'DITOLAK'} oleh Komandan.`,
        timestamp: 'Sekarang',
        type: isApprove ? 'info' : 'danger'
      }, ...prev]);
    }
  };

  // Admin Action Outing (Approve / Reject)
  const handleAdminOutingAction = (id: string, action: OutingStatus) => {
    setOutingRequests(prev => prev.map(out => {
      if (out.id === id) {
        const isApprove = action === OutingStatus.ACTIVE;
        return {
          ...out,
          status: action,
          startTime: isApprove ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
        };
      }
      return out;
    }));

    // Reset countdown and notification triggers
    setSimTimeSecondsPassed(0);
    setActiveOutingNotificationTriggered({});

    const out = outingRequests.find(o => o.id === id);
    if (out) {
      const isApprove = action === OutingStatus.ACTIVE;
      setPhoneNotifications(prev => [{
        id: `out-eval-${Date.now()}`,
        title: isApprove ? 'Izin Keluar AKTIF' : 'Izin Keluar Ditolak',
        message: `Izin keluar ${out.keterangan} (${out.durationMinutes} menit) Anda ${isApprove ? 'TELAH DISETUJUI. Pelacakan GPS Always-On Aktif!' : 'DITOLAK oleh komandan.'}`,
        timestamp: 'Sekarang',
        type: isApprove ? 'info' : 'danger'
      }, ...prev]);
    }
  };

  // Admin Action Return Approval
  const handleAdminReturnAction = (id: string, approve: boolean) => {
    setOutingRequests(prev => prev.map(out => {
      if (out.id === id) {
        return {
          ...out,
          status: approve ? OutingStatus.COMPLETED : OutingStatus.ACTIVE,
          endTime: approve ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
        };
      }
      return out;
    }));

    const out = outingRequests.find(o => o.id === id);
    if (out) {
      setPhoneNotifications(prev => [{
        id: `ret-eval-${Date.now()}`,
        title: approve ? 'Kembali Terverifikasi' : 'Kembali Ditolak',
        message: approve 
          ? `Selamat datang kembali di Gedung Kantor. Izin keluar selesai secara disiplin.` 
          : 'Persetujuan kembali ditolak. Admin meminta pengambilan foto bukti dan kesesuaian koordinat WiFi!',
        timestamp: 'Sekarang',
        type: approve ? 'info' : 'danger'
      }, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-warm-gray text-dark-charcoal pb-12">
      {/* HEADER UTAMA APP */}
      <header className="bg-gradient-to-r from-[#112a19] via-[#1A3E26] to-[#225031] text-white shadow-lg border-b-4 border-[#D4AF37] py-5 px-6 mb-6 rounded-b-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <NayakaLogo className="w-12 h-12 bg-white/10 p-1 rounded-xl border border-white/20 shadow-inner" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-wider text-white">NAYAKA</h1>
                <span className="text-[10px] bg-[#D4AF37] text-slate-900 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Brigif 87</span>
              </div>
              <p className="text-xs text-slate-100/95 font-medium tracking-wide">Navigasi Administrasi Yudha Anggota Kesatuan Aktif</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-mono py-1.5 px-3 rounded-full flex items-center gap-2 shadow-inner">
              <span className="w-2.5 h-2.5 bg-success-green rounded-full animate-ping"></span>
              Workspace Analyst Demo Active
            </span>
            <button 
              onClick={() => {
                // Quick Database Reset to initial
                if(window.confirm("Set ulang database simulasi ke kondisi awal?")) {
                  window.location.reload();
                }
              }}
              className="bg-danger-crimson/20 hover:bg-danger-crimson/40 text-white border border-danger-crimson/50 text-xs py-1.5 px-3 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Database
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* =========================================================
            PANEL KIRI: PERANGKAT & HARDWARE SIMULATOR (4 COLS)
            ========================================================= */}
        <section id="simulator-controls" className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Sliders className="w-5 h-5 text-military-green" />
              <h2 className="font-bold text-dark-charcoal text-base">Simulator Lingkungan</h2>
            </div>

            <p className="text-xs text-slate-gray mb-4 leading-relaxed">
              Gunakan kontrol di bawah ini untuk mensimulasikan perubahan WiFi, lokasi GPS, dan kamera pada handphone anggota.
            </p>

            {/* SIMULATOR: WIFI GEOMETRY */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-xs font-semibold text-slate-gray block mb-2 flex items-center justify-between">
                  <span>Hubungan Jaringan WiFi</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${simWifiConnected ? 'bg-success-green/10 text-success-green' : 'bg-danger-crimson/10 text-danger-crimson'}`}>
                    {simWifiConnected ? 'Connected to Building' : 'Cellular / Outside'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    id="wifi-on-btn"
                    onClick={() => setSimWifiConnected(true)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${simWifiConnected ? 'bg-military-green text-white border-military-green' : 'bg-white text-slate-gray border-slate-200 hover:bg-slate-100'}`}
                  >
                    <Wifi className="w-3.5 h-3.5" /> WiFi Gedung
                  </button>
                  <button 
                    id="wifi-off-btn"
                    onClick={() => setSimWifiConnected(false)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${!simWifiConnected ? 'bg-danger-crimson text-white border-danger-crimson' : 'bg-white text-slate-gray border-slate-200 hover:bg-slate-100'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Cellular LTE
                  </button>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500">
                  SSID Aktif: <strong className={simWifiConnected ? 'text-success-green' : 'text-danger-crimson'}>{currentWifiSSID}</strong>
                </div>
              </div>

              {/* SIMULATOR: GPS COORDINATE & FAKE GPS CHECK */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-xs font-semibold text-slate-gray block mb-2 flex items-center justify-between">
                  <span>GPS Geolocation Mode</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${simLocationMode === 'OFFICE' ? 'bg-success-green/10 text-success-green' : simLocationMode === 'OUTSIDE' ? 'bg-warning-amber/10 text-warning-amber' : 'bg-danger-crimson/10 text-danger-crimson font-bold animate-pulse'}`}>
                    {simLocationMode === 'OFFICE' ? 'Dalam Kantor' : simLocationMode === 'OUTSIDE' ? 'Diluar Kantor' : '🚨 Fake GPS!'}
                  </span>
                </label>
                <div className="space-y-1.5">
                  <button 
                    id="gps-office-btn"
                    onClick={() => setSimLocationMode('OFFICE')}
                    className={`w-full text-left py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${simLocationMode === 'OFFICE' ? 'bg-military-green/10 text-military-green border-military-green/30' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-success-green" /> Dalam Kantor (Lat: -6.1751)
                  </button>
                  <button 
                    id="gps-outside-btn"
                    onClick={() => setSimLocationMode('OUTSIDE')}
                    className={`w-full text-left py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${simLocationMode === 'OUTSIDE' ? 'bg-warning-amber/10 text-warning-amber border-warning-amber/30' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-warning-amber" /> Luar Kantor (Lat: -6.1824)
                  </button>
                  <button 
                    id="gps-fake-btn"
                    onClick={() => setSimLocationMode('FAKE_GPS')}
                    className={`w-full text-left py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${simLocationMode === 'FAKE_GPS' ? 'bg-danger-crimson/10 text-danger-crimson border-danger-crimson/30 animate-pulse' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-danger-crimson" /> Simulasikan Fake GPS
                  </button>
                </div>
              </div>

              {/* SIMULATOR: CAMERA CAPTURE SOURCE */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-xs font-semibold text-slate-gray block mb-2">Simulasi Kamera Selfie</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    {
                      name: 'Anggota A',
                      url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150'
                    },
                    {
                      name: 'Anggota B',
                      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
                    },
                    {
                      name: 'Surat Sakit',
                      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300'
                    }
                  ].map((imgOption, idx) => (
                    <button
                      key={idx}
                      id={`cam-option-${idx}`}
                      onClick={() => setSimCurrentPhoto(imgOption.url)}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${simCurrentPhoto === imgOption.url ? 'border-military-green scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={imgOption.url} alt={imgOption.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-dark-charcoal/80 text-[8px] text-white py-0.5 text-center truncate">
                        {imgOption.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SIMULATOR: TIME SKIP (EXCELLENT FOR COUNTDOWN DEMO) */}
              {activeUserOuting && activeUserOuting.status === OutingStatus.ACTIVE && (
                <div className="p-3 bg-military-green/5 rounded-xl border border-military-green/20">
                  <span className="text-xs font-bold text-military-green block mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-military-green" /> Akselerasi Waktu Pelacakan
                  </span>
                  <p className="text-[10px] text-slate-gray mb-3">
                    Gunakan tombol untuk mempercepat durasi izin keluar. Ini akan memicu notifikasi peringatan waktu sisa (15m, 10m, 5m, 1m).
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button 
                      id="time-skip-15"
                      onClick={() => {
                        const remainingMinutes = activeUserOuting.durationMinutes - (simTimeSecondsPassed / 60);
                        // skip so we have 16 minutes remaining (almost trigger 15)
                        const targetSeconds = (activeUserOuting.durationMinutes - 15.5) * 60;
                        setSimTimeSecondsPassed(Math.max(0, targetSeconds));
                      }}
                      className="py-1 px-2 bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold rounded"
                    >
                      Set Sisa 15 Menit
                    </button>
                    <button 
                      id="time-skip-5"
                      onClick={() => {
                        const targetSeconds = (activeUserOuting.durationMinutes - 5.5) * 60;
                        setSimTimeSecondsPassed(Math.max(0, targetSeconds));
                      }}
                      className="py-1 px-2 bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold rounded"
                    >
                      Set Sisa 5 Menit
                    </button>
                    <button 
                      id="time-skip-1"
                      onClick={() => {
                        const targetSeconds = (activeUserOuting.durationMinutes - 1.5) * 60;
                        setSimTimeSecondsPassed(Math.max(0, targetSeconds));
                      }}
                      className="py-1 px-2 bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold rounded"
                    >
                      Set Sisa 1 Menit
                    </button>
                    <button 
                      id="time-skip-expire"
                      onClick={() => {
                        const targetSeconds = activeUserOuting.durationMinutes * 60 + 5; // expired
                        setSimTimeSecondsPassed(targetSeconds);
                      }}
                      className="py-1 px-2 bg-danger-crimson/10 hover:bg-danger-crimson/20 border border-danger-crimson/20 text-danger-crimson text-[11px] font-bold rounded"
                    >
                      Habiskan Waktu
                    </button>
                  </div>
                  <div className="mt-2 text-center text-xs font-mono text-military-green font-bold">
                    Waktu Berjalan: +{Math.floor(simTimeSecondsPassed / 60)} Menit
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-dark-charcoal text-sm mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-olive-green" /> Petunjuk Pengujian
            </h3>
            <ul className="text-xs text-slate-gray space-y-2 leading-relaxed list-disc list-inside">
              <li>Pilih <strong className="text-military-green">NRP 123456</strong> di User Phone untuk demo <strong className="text-military-green">First Login (Ganti Password Default & Deteksi Device Otomatis)</strong>.</li>
              <li>Registrasi user baru dari Admin Phone, data langsung terupdate secara real-time.</li>
              <li>Matikan <strong className="text-danger-crimson">WiFi Gedung</strong> untuk melihat peringatan penolakan Presensi QR.</li>
              <li>Nyalakan <strong className="text-danger-crimson">Fake GPS</strong> untuk menguji ketahanan enkripsi geofence.</li>
            </ul>
          </div>
        </section>

        {/* =========================================================
            PANEL TENGAH: USER APP SMARTPHONE VIEW (4 COLS)
            ========================================================= */}
        <section className="lg:col-span-4 flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-xs font-extrabold text-white bg-gradient-to-r from-military-green to-olive-green py-1 px-3.5 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
              📱 Sisi User (Anggota Kesatuan)
            </span>
          </div>

          {/* PHONE FRAME wrapper */}
          <div className="w-full max-w-[360px] aspect-[9/16] bg-dark-charcoal rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
            
            {/* Phone Speaker Notch & Camera bar */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-50">
              <div className="bg-dark-charcoal w-36 h-5 rounded-b-xl flex items-center justify-around px-4">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950"></div>
              </div>
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="pt-2 pb-1 px-5 flex justify-between items-center bg-military-green text-white text-[10px] font-semibold select-none z-30">
              <span>08:15</span>
              <div className="flex items-center gap-1">
                {simWifiConnected ? <Wifi className="w-3 h-3 text-white" /> : <span className="text-[9px] font-bold">LTE</span>}
                <div className="flex items-center gap-0.5">
                  <MapPin className={`w-3 h-3 ${simLocationMode === 'OFFICE' ? 'text-white' : simLocationMode === 'OUTSIDE' ? 'text-warning-amber' : 'text-danger-crimson animate-pulse'}`} />
                </div>
                <div className="w-5 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* PUSH FLOATING NOTIFICATION BANNER (Real-time count alert simulator) */}
            {phoneNotifications.length > 0 && (
              <div className="absolute top-10 inset-x-3 z-50 pointer-events-none transition-all duration-300 transform translate-y-0">
                <div className={`p-2.5 rounded-xl shadow-xl border flex gap-2 items-start pointer-events-auto bg-white/95 backdrop-blur-md animate-bounce
                  ${phoneNotifications[0].type === 'danger' ? 'border-danger-crimson border-l-4' : phoneNotifications[0].type === 'warning' ? 'border-warning-amber border-l-4' : 'border-military-green border-l-4'}`}>
                  <Bell className={`w-5 h-5 shrink-0 ${phoneNotifications[0].type === 'danger' ? 'text-danger-crimson' : phoneNotifications[0].type === 'warning' ? 'text-warning-amber' : 'text-military-green'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-dark-charcoal">{phoneNotifications[0].title}</span>
                      <span className="text-[9px] text-slate-gray">{phoneNotifications[0].timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-700 leading-tight mt-0.5">{phoneNotifications[0].message}</p>
                  </div>
                  <button 
                    onClick={() => setPhoneNotifications(prev => prev.slice(1))}
                    className="text-xs text-slate-gray font-bold hover:text-dark-charcoal px-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* INNER APPLICATION CANVAS */}
            <div className="flex-1 bg-warm-gray rounded-[26px] overflow-hidden flex flex-col text-xs relative">
              
              {/* STATUS BANNER */}
              {userSuccessNotification && (
                <div className="bg-success-green text-white text-[10px] py-1.5 px-3 text-center flex items-center justify-between gap-1 animate-fadeIn font-medium">
                  <span>{userSuccessNotification}</span>
                  <button onClick={() => setUserSuccessNotification(null)} className="font-bold shrink-0">×</button>
                </div>
              )}
              {userErrorNotification && (
                <div className="bg-danger-crimson text-white text-[10px] py-1.5 px-3 text-center flex items-center justify-between gap-1 animate-fadeIn font-medium">
                  <span>{userErrorNotification}</span>
                  <button onClick={() => setUserErrorNotification(null)} className="font-bold shrink-0">×</button>
                </div>
              )}

              {/* 1. USER LOGGED OUT FLOW */}
              {!userLoggedIn ? (
                <div className="flex-1 flex flex-col justify-between p-5 bg-white">
                  
                  {/* FORGOT PASSWORD FORM */}
                  {userForgotPasswordOpen ? (
                    <div className="my-auto space-y-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-warning-amber/10 text-warning-amber rounded-full flex items-center justify-center mx-auto mb-2">
                          <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-dark-charcoal">Lupa Password Akun</h3>
                        <p className="text-[10px] text-slate-gray mt-1">Masukkan NRP & No HP aktif Anda untuk konfirmasi reset oleh Komandan.</p>
                      </div>

                      {userForgotSuccessMsg ? (
                        <div className="p-3 bg-success-green/10 border border-success-green/30 text-success-green rounded-lg text-[10px] leading-relaxed">
                          {userForgotSuccessMsg}
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 text-left">
                          <div>
                            <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">Nomor Registrasi Pokok (NRP)</label>
                            <input 
                              type="text" 
                              required
                              value={userForgotNrp}
                              onChange={(e) => setUserForgotNrp(e.target.value)}
                              placeholder="Contoh: 123456" 
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-military-green"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">No. HP Terdaftar</label>
                            <input 
                              type="text" 
                              required
                              value={userForgotPhone}
                              onChange={(e) => setUserForgotPhone(e.target.value)}
                              placeholder="Contoh: 081234567890" 
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-2 bg-warning-amber hover:bg-warning-amber/90 text-white font-bold rounded-lg transition-all"
                          >
                            Kirim Permohonan Reset
                          </button>
                        </form>
                      )}

                      <button 
                        onClick={() => {
                          setUserForgotPasswordOpen(false);
                          setUserForgotSuccessMsg('');
                          setUserPasswordError('');
                        }}
                        className="text-center w-full block text-[10px] text-military-green font-bold hover:underline mt-4"
                      >
                        Kembali ke Form Login
                      </button>
                    </div>
                  ) : (
                    /* USER STANDARD LOGIN FORM */
                    <div className="my-auto space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2">
                          <NayakaLogo className="w-full h-full" />
                        </div>
                        <h2 className="text-base font-extrabold text-dark-charcoal tracking-wide">NAYAKA MOBILE</h2>
                        <p className="text-[10px] text-slate-gray mt-1">Sistem Kehadiran & Administrasi Anggota Aktif</p>
                      </div>

                      <form onSubmit={handleUserLogin} className="space-y-3.5">
                        <div>
                          <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">Nomor Registrasi Pokok (NRP)</label>
                          <input 
                            id="user-nrp"
                            type="text" 
                            required
                            value={userNrpInput}
                            onChange={(e) => setUserNrpInput(e.target.value)}
                            placeholder="Contoh: 123456" 
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-military-green transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1 flex justify-between">
                            <span>Password</span>
                            <button 
                              type="button" 
                              onClick={() => setUserForgotPasswordOpen(true)}
                              className="text-olive-green hover:underline lowercase font-semibold"
                            >
                              Lupa?
                            </button>
                          </label>
                          <input 
                            id="user-password"
                            type="password" 
                            required
                            value={userPasswordInput}
                            onChange={(e) => setUserPasswordInput(e.target.value)}
                            placeholder="••••••" 
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green transition-all"
                          />
                        </div>

                        <button 
                          id="user-login-submit"
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-military-green to-olive-green hover:from-olive-green hover:to-military-green text-white font-bold rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer"
                        >
                          Masuk Aplikasi
                        </button>
                      </form>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-gray space-y-1">
                        <span className="font-bold text-dark-charcoal block">Petunjuk Login Pertama:</span>
                        <p>1. Gunakan NRP <code className="font-mono text-military-green font-bold bg-military-green/5 px-1 rounded">123456</code> & password <code className="font-mono text-military-green font-bold bg-military-green/5 px-1 rounded">password123</code></p>
                        <p>2. Sistem akan mendeteksi device & mewajibkan ganti password default.</p>
                      </div>
                    </div>
                  )}

                  {/* App Footprint */}
                  <div className="text-center text-[9px] text-slate-gray/80">
                    STAF PERSONEL BRIGIF 87 © 2026
                  </div>
                </div>
              ) : (
                /* 2. USER LOGGED IN FLOW */
                userLoggedIn.status === UserStatus.NEW ? (
                  /* FORCE CHANGE PASSWORD CONTAINER */
                  <div className="flex-1 bg-white p-5 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-danger-crimson/10 text-danger-crimson rounded-full flex items-center justify-center mx-auto mb-2">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-extrabold text-dark-charcoal">Wajib Ganti Password</h3>
                        <p className="text-[10px] text-slate-gray mt-1">Anda terdeteksi menggunakan password default. Demi keamanan, Anda harus mengganti password terlebih dahulu.</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-gray">
                        <div className="flex justify-between mb-1">
                          <span>Device Terdeteksi:</span>
                          <strong className="text-military-green truncate max-w-[140px]">{userLoggedIn.device}</strong>
                        </div>
                        <div className="text-[9px] text-slate-400">Pencatatan sidik jari perangkat ini dilakukan secara otomatis untuk mencegah multi-login.</div>
                      </div>

                      {userPasswordError && (
                        <div className="text-[10px] text-danger-crimson bg-danger-crimson/5 p-2 rounded-md border border-danger-crimson/20 font-bold">
                          ⚠️ {userPasswordError}
                        </div>
                      )}

                      <form onSubmit={handleForceChangePassword} className="space-y-3 text-left">
                        <div>
                          <label className="text-[9px] font-bold text-dark-charcoal uppercase block mb-1">Password Baru (Min 6 Karakter)</label>
                          <input 
                            id="new-password"
                            type="password" 
                            required
                            value={userNewPassword}
                            onChange={(e) => setUserNewPassword(e.target.value)}
                            placeholder="Password Baru Anda" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-dark-charcoal uppercase block mb-1">Konfirmasi Password Baru</label>
                          <input 
                            id="confirm-password"
                            type="password" 
                            required
                            value={userNewPasswordConfirm}
                            onChange={(e) => setUserNewPasswordConfirm(e.target.value)}
                            placeholder="Ketik ulang password baru" 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                          />
                        </div>

                        <button 
                          id="change-pw-btn"
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-military-green to-olive-green hover:from-olive-green hover:to-military-green text-white font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Simpan &amp; Aktifkan Akun
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* MAIN APP SCREEN (HOME, PRESENCE, LEAVE, OUTING) */
                  <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                    
                    {/* APPBAR HEADER */}
                    <div className="bg-gradient-to-r from-[#112A19] to-[#254F2E] border-b border-[#D4AF37]/30 text-white p-3 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase border border-white/20">
                          {userLoggedIn.nama.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-[10px] truncate max-w-[140px]">{userLoggedIn.nama}</div>
                          <div className="text-[8px] opacity-80 font-mono">NRP: {userLoggedIn.nrp} • {userLoggedIn.kesatuan}</div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setUserLoggedIn(null)}
                        className="p-1 bg-white/10 hover:bg-white/20 rounded text-white transition-all cursor-pointer border border-white/10"
                        title="Logout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* DYNAMIC SCENE CONTAINER */}
                    <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
                      
                      {/* ======================= TAB: HOME ======================= */}
                      {userActiveTab === 'HOME' && (
                        <>
                          {/* USER STATE CARD */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-gray">STATUS PRESENSI HARI INI</span>
                              <span className="bg-success-green/10 text-success-green font-bold text-[9px] py-0.5 px-2 rounded-full">
                                AKTIF DINAS
                              </span>
                            </div>

                            {/* Signal details */}
                            <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-slate-100">
                              <div className="flex items-center gap-1">
                                <Wifi className={`w-3.5 h-3.5 ${simWifiConnected ? 'text-success-green' : 'text-slate-gray'}`} />
                                <div className="text-[9px]">
                                  <div className="text-slate-400 leading-3">WiFi Gedung</div>
                                  <div className="font-bold text-[10px] truncate">{simWifiConnected ? 'NAYAKA-WIFI-SECURE' : 'Tidak Terhubung'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className={`w-3.5 h-3.5 ${simLocationMode === 'OFFICE' ? 'text-success-green' : simLocationMode === 'OUTSIDE' ? 'text-warning-amber' : 'text-danger-crimson animate-pulse'}`} />
                                <div className="text-[9px]">
                                  <div className="text-slate-400 leading-3">GPS Tracking</div>
                                  <div className="font-bold text-[10px] truncate">
                                    {simLocationMode === 'OFFICE' ? 'Markas Brigif 87' : simLocationMode === 'OUTSIDE' ? 'Diluar Area' : '🚨 Fake GPS!'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-gray leading-normal">
                              {simWifiConnected 
                                ? '✓ Terhubung ke WiFi terenkripsi gedung. Anda diizinkan melakukan presensi masuk/pulang serta pengajuan izin keluar.' 
                                : '⚠️ Anda menggunakan jaringan luar. Presensi QR dan pengajuan izin istirahat/jalan dinonaktifkan sementara.'}
                            </p>
                          </div>

                          {/* QUICK ACTION BUTTONS */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              id="btn-nav-presensi"
                              onClick={() => setUserActiveTab('PRESENCE')}
                              className="bg-gradient-to-br from-military-green to-olive-green text-white p-3 rounded-xl hover:from-olive-green hover:to-military-green transition-all shadow-sm flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <QrCode className="w-5 h-5 text-white" />
                              <span className="font-bold text-[10px]">Presensi QR</span>
                              <span className="text-[8px] opacity-80">Masuk &amp; Pulang</span>
                            </button>
                            <button
                              id="btn-nav-izin"
                              onClick={() => setUserActiveTab('IZIN')}
                              className="bg-white border border-slate-200 text-dark-charcoal p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-5 h-5 text-olive-green" />
                              <span className="font-bold text-[10px]">Ketidakhadiran</span>
                              <span className="text-[8px] text-slate-gray">Sakit / Musibah</span>
                            </button>
                          </div>

                          {/* OUTING / TRACKING SECTION BLOCK */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-gray">IZIN KELUAR JAM KERJA</span>
                              <span className="bg-olive-green/10 text-olive-green font-bold text-[9px] py-0.5 px-2 rounded-full">
                                TRACKING GPS
                              </span>
                            </div>

                            {activeUserOuting ? (
                              <div className="p-2.5 bg-military-green/5 rounded-lg border border-military-green/20 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-military-green text-[10px] flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-military-green animate-spin" />
                                    {activeUserOuting.keterangan} Aktif
                                  </span>
                                  <span className="bg-military-green text-white font-mono text-[9px] py-0.5 px-1.5 rounded">
                                    {activeUserOuting.status === OutingStatus.RETURN_PENDING ? 'MENUNGGU ACC' : 'SEDANG DILUAR'}
                                  </span>
                                </div>

                                <div className="text-[10px] text-slate-700">
                                  Durasi Izin: <strong>{activeUserOuting.durationMinutes} Menit</strong>
                                </div>

                                {/* Active countdown */}
                                {activeUserOuting.status === OutingStatus.ACTIVE && (
                                  <div className="py-2 px-1 text-center bg-military-green/10 rounded-md border border-military-green/10">
                                    <div className="text-[10px] text-slate-gray uppercase font-mono tracking-wider">Sisa Waktu Pelacakan</div>
                                    <div className={`text-base font-extrabold font-mono mt-0.5 ${activeOutingTimeLeft < 900 ? 'text-danger-crimson animate-pulse' : 'text-military-green'}`}>
                                      {Math.floor(activeOutingTimeLeft / 3600).toString().padStart(2, '0')}:
                                      {Math.floor((activeOutingTimeLeft % 3600) / 60).toString().padStart(2, '0')}:
                                      {Math.floor(activeOutingTimeLeft % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[8px] text-slate-gray mt-1 leading-normal flex items-center justify-center gap-0.5">
                                      <Zap className="w-2.5 h-2.5 text-warning-amber animate-bounce" /> Always-On GPS Tracking Aktif
                                    </div>
                                  </div>
                                )}

                                {/* User Request Return Check-In Buttons */}
                                {activeUserOuting.status === OutingStatus.ACTIVE ? (
                                  <button
                                    id="btn-return-request"
                                    onClick={handleReturnRequest}
                                    className="w-full mt-2 py-2 bg-military-green hover:bg-olive-green text-white font-bold rounded-lg text-[10px] shadow-sm transition-all"
                                  >
                                    Kembali ke Gedung (Request QR Bukti)
                                  </button>
                                ) : (
                                  <div className="text-center text-[10px] text-warning-amber bg-warning-amber/10 p-2 rounded-lg border border-warning-amber/20 font-semibold">
                                    Menunggu Persetujuan Masuk Gedung dari Admin...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-gray">
                                  Ajukan izin sementara (istirahat / dinas jalan luar) kelipatan 30 menit s.d 3 jam dengan pelacakan GPS otomatis.
                                </p>
                                <button
                                  id="btn-nav-outing"
                                  onClick={() => setUserActiveTab('OUTING')}
                                  disabled={!simWifiConnected}
                                  className={`w-full py-2 text-center text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${simWifiConnected ? 'bg-gradient-to-r from-olive-green to-military-green text-white shadow-sm hover:from-military-green hover:to-olive-green' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}`}
                                >
                                  <Map className="w-3.5 h-3.5" /> Ajukan Izin Keluar Kantor
                                </button>
                                {!simWifiConnected && (
                                  <span className="text-[8px] text-danger-crimson block text-center">
                                    ⚠️ Harus terhubung WiFi Gedung untuk mengajukan izin keluar kantor!
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* RECENT NOTIFICATIONS LOG INSIDE PHONE */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-gray block mb-2">PEMBERITAHUAN KEAMANAN</span>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {phoneNotifications.map(n => (
                                <div key={n.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px]">
                                  <div className="flex justify-between items-center font-bold">
                                    <span className="text-military-green">{n.title}</span>
                                    <span className="text-[8px] text-slate-gray">{n.timestamp}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">{n.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* ======================= TAB: PRESENCE (QR) ======================= */}
                      {userActiveTab === 'PRESENCE' && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setUserActiveTab('HOME')} className="text-military-green font-bold text-xs hover:underline">
                              ← Kembali
                            </button>
                            <span className="text-xs font-bold text-dark-charcoal">Presensi QR Geofence</span>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-3">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 max-w-[180px] mx-auto aspect-square flex flex-col items-center justify-center relative bg-slate-50">
                              
                              {/* QR CODE CAMERA LOOK */}
                              <Camera className="w-10 h-10 text-slate-400 mb-1" />
                              <div className="w-full bg-military-green/10 text-military-green text-[9px] py-1 px-1 rounded truncate leading-tight font-mono">
                                Foto Selfie Kamera Aktif
                              </div>
                              <img src={simCurrentPhoto} alt="Camera feed" className="absolute inset-0 w-full h-full object-cover rounded-xl border border-military-green opacity-30" />
                            </div>

                            <p className="text-[10px] text-slate-gray leading-normal">
                              Sistem memverifikasi WiFi <strong className="text-military-green">{currentWifiSSID}</strong>, foto selfie wajah, dan koordinat GPS anti-spoofing secara real-time.
                            </p>

                            <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-left space-y-1 font-mono">
                              <div className="flex justify-between">
                                <span>WiFi SSID:</span>
                                <span className={simWifiConnected ? 'text-success-green font-bold' : 'text-danger-crimson font-bold'}>
                                  {currentWifiSSID}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>GPS Coordinates:</span>
                                <span className={simLocationMode === 'OFFICE' ? 'text-success-green font-bold' : 'text-warning-amber font-bold'}>
                                  {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fake GPS Shield:</span>
                                <span className={!currentCoords.isFake ? 'text-success-green font-bold' : 'text-danger-crimson font-bold animate-pulse'}>
                                  {currentCoords.isFake ? 'MANIPULASI TERDETEKSI' : 'AMAN (No-Spoof)'}
                                </span>
                              </div>
                            </div>

                            {/* Attendance Controls */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                id="btn-presensi-masuk"
                                onClick={() => handlePresenceSubmit('MASUK')}
                                className="py-2.5 bg-military-green hover:bg-olive-green text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Absen Masuk
                              </button>
                              <button
                                id="btn-presensi-keluar"
                                onClick={() => handlePresenceSubmit('KELUAR')}
                                className="py-2.5 bg-danger-crimson hover:bg-danger-crimson/95 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                              >
                                <LogOut className="w-3.5 h-3.5" /> Absen Pulang
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================= TAB: LEAVE (KETIDAKHADIRAN) ======================= */}
                      {userActiveTab === 'IZIN' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setUserActiveTab('HOME')} className="text-military-green font-bold text-xs hover:underline">
                              ← Kembali
                            </button>
                            <span className="text-xs font-bold text-dark-charcoal">Pengajuan Ketidakhadiran</span>
                          </div>

                          <form onSubmit={handleAbsenceSubmit} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 text-left">
                            <div>
                              <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">Keterangan Izin</label>
                              <select
                                id="leave-category"
                                value={absenceKeterangan}
                                onChange={(e: any) => setAbsenceKeterangan(e.target.value)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                              >
                                <option value="Sakit">Sakit (Butuh Surat Dokter)</option>
                                <option value="Izin Darurat">Izin Darurat / Keperluan Dinas khusus</option>
                                <option value="Musibah">Musibah Keluarga / Kemalangan</option>
                                <option value="Lainnya">Lain-Lain (Keterangan Khusus)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">Alasan Detail</label>
                              <textarea
                                id="leave-reason"
                                rows={3}
                                required
                                value={absenceDetail}
                                onChange={(e) => setAbsenceDetail(e.target.value)}
                                placeholder="Tuliskan keterangan detail mengapa Anda tidak hadir dinas..."
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                              />
                            </div>

                            {/* UPLOAD SIMULATOR */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                <span className="text-[9px] font-bold text-slate-gray block mb-1">Foto Bukti (Selfie/Surat)</span>
                                <div className="text-[10px] text-military-green font-semibold truncate flex items-center justify-center gap-1">
                                  <Camera className="w-3 h-3" /> camera_img.jpg
                                </div>
                              </div>
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                <span className="text-[9px] font-bold text-slate-gray block mb-1">Lampiran PDF</span>
                                <input
                                  type="text"
                                  value={absencePdfName}
                                  onChange={(e) => setAbsencePdfName(e.target.value)}
                                  className="w-full p-1 bg-white border border-slate-200 rounded text-[9px] font-mono text-center text-slate-700"
                                />
                              </div>
                            </div>

                            <button
                              id="btn-submit-izin"
                              type="submit"
                              className="w-full py-2 bg-military-green hover:bg-olive-green text-white font-bold rounded-lg text-xs transition-all shadow-md"
                            >
                              Kirim Permohonan Izin
                            </button>
                          </form>
                        </div>
                      )}

                      {/* ======================= TAB: OUTING (IZIN KELUAR) ======================= */}
                      {userActiveTab === 'OUTING' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setUserActiveTab('HOME')} className="text-military-green font-bold text-xs hover:underline">
                              ← Kembali
                            </button>
                            <span className="text-xs font-bold text-dark-charcoal">Pengajuan Keluar Jam Kantor</span>
                          </div>

                          <form onSubmit={handleOutingSubmit} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 text-left">
                            <div className="p-2.5 bg-military-green/5 text-military-green rounded-lg text-[10px] leading-relaxed">
                              💡 <strong>Aturan GPS Always-On:</strong> Setelah izin disetujui, GPS handphone Anda akan melacak posisi Anda di luar gedung. Aplikasi tetap berjalan di latar belakang tanpa membutuhkan WiFi gedung sampai Anda check-in kembali.
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">Kategori Keluar</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setOutingType('Istirahat')}
                                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${outingType === 'Istirahat' ? 'bg-military-green text-white border-military-green' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                >
                                  Istirahat (Makan siang, dll)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOutingType('Izin Jalan')}
                                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${outingType === 'Izin Jalan' ? 'bg-military-green text-white border-military-green' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                >
                                  Izin Jalan (Keperluan Dinas luar)
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-dark-charcoal uppercase block mb-1">Durasi Keluar</label>
                              <select
                                id="outing-duration"
                                value={outingDuration}
                                onChange={(e: any) => setOutingDuration(Number(e.target.value))}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                              >
                                <option value={30}>30 Menit</option>
                                <option value={60}>1 Jam (60 Menit)</option>
                                <option value={90}>1.5 Jam (90 Menit)</option>
                                <option value={120}>2 Jam (120 Menit)</option>
                                <option value={150}>2.5 Jam (150 Menit)</option>
                                <option value={180}>3 Jam (180 Menit)</option>
                              </select>
                            </div>

                            <div className="flex items-start gap-2 pt-1">
                              <input
                                id="gps-consent-checkbox"
                                type="checkbox"
                                required
                                checked={outingGpsConsent}
                                onChange={(e) => setOutingGpsConsent(e.target.checked)}
                                className="mt-0.5 rounded text-military-green border-slate-300 focus:ring-military-green"
                              />
                              <label htmlFor="gps-consent-checkbox" className="text-[10px] text-slate-gray leading-tight">
                                Saya bersedia melacak GPS secara Always-On sampai kembali ke kantor. Saya menyetujui sanksi disiplin jika GPS dimatikan atau terdeteksi manipulasi lokasi.
                              </label>
                            </div>

                            <button
                              id="btn-submit-outing"
                              type="submit"
                              className="w-full py-2 bg-military-green hover:bg-olive-green text-white font-bold rounded-lg text-xs transition-all shadow-md"
                            >
                              Ajukan Izin Keluar Jam Kerja
                            </button>
                          </form>
                        </div>
                      )}

                    </div>

                    {/* BOTTOM NAV BAR */}
                    <nav className="bg-gradient-to-r from-[#112A19] via-[#1A3E26] to-[#112A19] border-t border-[#D4AF37]/30 grid grid-cols-4 py-2.5 select-none text-[10px] font-bold text-slate-300 shrink-0">
                      <button 
                        onClick={() => setUserActiveTab('HOME')}
                        className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${userActiveTab === 'HOME' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                      >
                        <Shield className={`w-4.5 h-4.5 transition-transform ${userActiveTab === 'HOME' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                        <span>Utama</span>
                      </button>
                      <button 
                        onClick={() => setUserActiveTab('PRESENCE')}
                        className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${userActiveTab === 'PRESENCE' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                      >
                        <QrCode className={`w-4.5 h-4.5 transition-transform ${userActiveTab === 'PRESENCE' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                        <span>Presensi</span>
                      </button>
                      <button 
                        onClick={() => setUserActiveTab('IZIN')}
                        className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${userActiveTab === 'IZIN' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                      >
                        <FileText className={`w-4.5 h-4.5 transition-transform ${userActiveTab === 'IZIN' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                        <span>Izin</span>
                      </button>
                      <button 
                        onClick={() => setUserActiveTab('OUTING')}
                        disabled={!simWifiConnected && !activeUserOuting}
                        className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${userActiveTab === 'OUTING' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'} disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        <Map className={`w-4.5 h-4.5 transition-transform ${userActiveTab === 'OUTING' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                        <span>Lacak Keluar</span>
                      </button>
                    </nav>

                  </div>
                )
              )}

            </div>
          </div>
        </section>

        {/* =========================================================
            PANEL KANAN: ADMIN DASHBOARD SMARTPHONE/TABLET (5 COLS)
            ========================================================= */}
        <section className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-xs font-extrabold text-white bg-gradient-to-r from-[#112A19] to-military-green py-1 px-3.5 rounded-full uppercase tracking-wider shadow-sm border border-[#D4AF37]/20">
              🛡️ Sisi Admin &amp; Pimpinan
            </span>
          </div>

          {/* PHONE FRAME wrapper for Admin */}
          <div className="w-full max-w-[360px] aspect-[9/16] bg-dark-charcoal rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
            
            {/* Phone Speaker Notch */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-50">
              <div className="bg-dark-charcoal w-36 h-5 rounded-b-xl flex items-center justify-around px-4">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950"></div>
              </div>
            </div>

            {/* Simulated Admin Status Bar */}
            <div className="pt-2 pb-1 px-5 flex justify-between items-center bg-dark-charcoal text-slate-300 text-[10px] font-semibold select-none z-30">
              <span>08:15</span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-success-green" />
                <span className="text-[8px] font-bold bg-success-green/20 text-success-green px-1.5 rounded-full">Secure Server</span>
              </div>
            </div>

            {/* INNER APPLICATION CANVAS */}
            <div className="flex-1 bg-warm-gray rounded-[26px] overflow-hidden flex flex-col text-xs relative">
              
              {!adminLoggedIn ? (
                /* ADMIN LOGIN VIEW */
                <div className="flex-1 bg-white p-5 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-military-green text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-extrabold text-dark-charcoal">Secure Admin Terminal</h3>
                      <p className="text-[10px] text-slate-gray mt-1">Verifikasi penanggung jawab komando kesatuan.</p>
                    </div>

                    {adminError && (
                      <div className="text-[10px] text-danger-crimson bg-danger-crimson/5 p-2 rounded-md border border-danger-crimson/20">
                        {adminError}
                      </div>
                    )}

                    <form onSubmit={handleAdminLogin} className="space-y-3 text-left">
                      <div>
                        <label className="text-[9px] font-bold text-dark-charcoal uppercase block mb-1">NRP / User Admin</label>
                        <input 
                          type="text" 
                          required
                          value={adminNrpInput}
                          onChange={(e) => setAdminNrpInput(e.target.value)}
                          placeholder="Masukkan NRP Admin" 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-military-green"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-dark-charcoal uppercase block mb-1">Password Admin</label>
                        <input 
                          type="password" 
                          required
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="••••••" 
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-military-green"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2 bg-military-green hover:bg-olive-green text-white font-bold rounded-lg transition-all"
                      >
                        Otorisasi Server Admin
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* ADMIN FULL PANEL VIEW */
                <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                  
                  {/* ADMIN HEADER */}
                  <div className="bg-gradient-to-r from-[#112A19] via-[#1A3E26] to-[#1E3F20] border-b border-[#D4AF37]/30 text-white p-3 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-1.5">
                      <NayakaLogo className="w-6 h-6" />
                      <div>
                        <div className="font-extrabold text-[10px] leading-3 uppercase tracking-wider text-white">Mayor Inf. Sugeng</div>
                        <div className="text-[8px] text-slate-300">Pasi Pers / Staf Adm Brigif 87</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAdminLoggedIn(false)}
                      className="text-[10px] text-danger-crimson bg-danger-crimson/10 border border-danger-crimson/20 px-2 py-0.5 rounded font-bold hover:bg-danger-crimson/20 transition-all cursor-pointer"
                    >
                      Keluar
                    </button>
                  </div>

                  {/* ADMIN MAIN DYNAMIC VIEW */}
                  <div className="flex-1 p-3 space-y-3.5 overflow-y-auto">
                    
                    {/* ===================== ADMIN TAB: REGISTER / LIST OF USERS ===================== */}
                    {adminActiveTab === 'USERS' && (
                      <div className="space-y-3">
                        {/* REGISTRATION FORM */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                          <span className="text-[10px] font-bold text-military-green block uppercase">Daftarkan Anggota Baru</span>
                          
                          {regSuccess && (
                            <div className="p-2 bg-success-green/10 text-success-green border border-success-green/20 rounded-lg text-[9px]">
                              {regSuccess}
                            </div>
                          )}
                          {regError && (
                            <div className="p-2 bg-danger-crimson/10 text-danger-crimson border border-danger-crimson/20 rounded-lg text-[9px]">
                              {regError}
                            </div>
                          )}

                          <form onSubmit={handleAdminRegisterUser} className="space-y-2 text-left">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">NRP</label>
                                <input 
                                  id="admin-reg-nrp"
                                  type="text" 
                                  required
                                  value={regNrp}
                                  onChange={(e) => setRegNrp(e.target.value)}
                                  placeholder="Contoh: 112233" 
                                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Nama Sesuai KTP</label>
                                <input 
                                  id="admin-reg-nama"
                                  type="text" 
                                  required
                                  value={regNama}
                                  onChange={(e) => setRegNama(e.target.value)}
                                  placeholder="Nama Lengkap" 
                                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Kesatuan</label>
                                <input 
                                  id="admin-reg-kesatuan"
                                  type="text" 
                                  required
                                  value={regKesatuan}
                                  onChange={(e) => setRegKesatuan(e.target.value)}
                                  placeholder="Yonif 1 / Markas Brigif" 
                                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">No. HP Aktif</label>
                                <input 
                                  id="admin-reg-phone"
                                  type="text" 
                                  required
                                  value={regNoHp}
                                  onChange={(e) => setRegNoHp(e.target.value)}
                                  placeholder="08123xxxx" 
                                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase block mb-0.5">Alamat</label>
                              <input 
                                id="admin-reg-alamat"
                                type="text" 
                                required
                                value={regAlamat}
                                onChange={(e) => setRegAlamat(e.target.value)}
                                placeholder="Alamat lengkap tinggal" 
                                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                              />
                            </div>

                            <button 
                              id="btn-register-submit"
                              type="submit"
                              className="w-full py-1.5 bg-military-green hover:bg-olive-green text-white text-[10px] font-bold rounded"
                            >
                              Daftarkan Personel & Set Password Default
                            </button>
                          </form>
                        </div>

                        {/* LIST OF REGISTERED USERS */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-gray block uppercase">Database Personel ({users.length})</span>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto">
                            {users.map(u => (
                              <div key={u.nrp} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] space-y-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <strong className="text-dark-charcoal block">{u.nama}</strong>
                                    <span className="font-mono text-[9px] text-slate-400">NRP {u.nrp} • {u.kesatuan}</span>
                                  </div>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${u.status === UserStatus.ACTIVE ? 'bg-success-green/10 text-success-green' : 'bg-warning-amber/10 text-warning-amber'}`}>
                                    {u.status === UserStatus.ACTIVE ? 'Aktif' : 'Default PW'}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-500 leading-tight">
                                  <div>HP: {u.noHp}</div>
                                  <div>Alamat: {u.alamat}</div>
                                  <div className="mt-1 p-1 bg-military-green/5 rounded text-military-green font-mono flex items-center gap-1 text-[8px] overflow-x-auto">
                                    <Smartphone className="w-2.5 h-2.5 shrink-0" />
                                    <span>Sidik Jari Perangkat: {u.device || 'Belum Login / Belum Dicatat'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===================== ADMIN TAB: PRESENCE LOGS ===================== */}
                    {adminActiveTab === 'PRESENCE_LOGS' && (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-gray uppercase">Log Presensi QR Gedung ({presenceLogs.length})</span>
                          </div>

                          <div className="space-y-2 max-h-[340px] overflow-y-auto">
                            {presenceLogs.map(log => (
                              <div key={log.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] space-y-1.5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <strong className="text-dark-charcoal block">{log.nama}</strong>
                                    <span className="text-[9px] text-slate-500">{log.kesatuan} • NRP {log.nrp}</span>
                                  </div>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${log.type === 'MASUK' ? 'bg-success-green/10 text-success-green' : 'bg-danger-crimson/10 text-danger-crimson'}`}>
                                    {log.type}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 py-1 text-[8px] font-mono border-t border-slate-100 mt-1">
                                  <div>
                                    <span className="text-slate-400">Waktu:</span> {log.timestamp}
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Jaringan:</span> <strong className="text-military-green">{log.wifiSSID}</strong>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                  <img src={log.photo} alt="Validation selfie" className="w-7 h-7 rounded object-cover border border-slate-300" />
                                  <div className="text-[8px] text-slate-500">
                                    <div className="text-slate-700">GPS: {log.lat.toFixed(5)}, {log.lng.toFixed(5)}</div>
                                    <div className="text-success-green font-bold">✓ Geofence Verified</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===================== ADMIN TAB: LEAVES & OUTING APPROVALS ===================== */}
                    {adminActiveTab === 'LEAVES_APPROVALS' && (
                      <div className="space-y-3.5">
                        
                        {/* ABSENCE REQUESTS LIST */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-gray block uppercase">Pengajuan Ketidakhadiran (Sakit/Izin)</span>
                          {absenceRequests.filter(r => r.status === RequestStatus.PENDING).length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-4">Tidak ada pengajuan izin ketidakhadiran pending.</p>
                          ) : (
                            <div className="space-y-2 max-h-[180px] overflow-y-auto">
                              {absenceRequests.filter(r => r.status === RequestStatus.PENDING).map(req => (
                                <div key={req.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[10px] space-y-2 text-left">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <strong className="text-dark-charcoal block">{req.nama}</strong>
                                      <span className="text-[9px] text-slate-500">NRP {req.nrp} • {req.kesatuan}</span>
                                    </div>
                                    <span className="bg-warning-amber text-white font-bold text-[8px] py-0.5 px-2 rounded-full">
                                      {req.keterangan}
                                    </span>
                                  </div>

                                  <p className="text-[9px] text-slate-600 bg-white p-1.5 rounded border border-slate-100 italic">
                                    "{req.detail}"
                                  </p>

                                  {/* Uploaded attachments preview mockup */}
                                  <div className="grid grid-cols-2 gap-2 text-[8px] font-mono py-1">
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <Camera className="w-3 h-3 text-military-green" /> Selfie_Bukti.jpg
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <FileText className="w-3 h-3 text-danger-crimson" /> {req.filePdfName}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                    <button
                                      id={`btn-approve-abs-${req.id}`}
                                      onClick={() => handleAdminAbsenceAction(req.id, RequestStatus.APPROVED)}
                                      className="py-1 bg-success-green hover:bg-success-green/90 text-white font-bold rounded text-[9px] flex items-center justify-center gap-0.5"
                                    >
                                      <Check className="w-3 h-3" /> Approve
                                    </button>
                                    <button
                                      id={`btn-reject-abs-${req.id}`}
                                      onClick={() => handleAdminAbsenceAction(req.id, RequestStatus.REJECTED)}
                                      className="py-1 bg-danger-crimson hover:bg-danger-crimson/90 text-white font-bold rounded text-[9px] flex items-center justify-center gap-0.5"
                                    >
                                      <XCircle className="w-3 h-3" /> Tolak
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* TEMPORARY OUTING DISPATCH & RETURN PENDING LIST */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-gray block uppercase">Persetujuan Keluar Kantor (Track GPS)</span>
                          
                          {outingRequests.filter(o => o.status === OutingStatus.PENDING || o.status === OutingStatus.RETURN_PENDING).length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-4">Tidak ada pengajuan izin keluar yang pending.</p>
                          ) : (
                            <div className="space-y-2 max-h-[180px] overflow-y-auto">
                              {outingRequests.filter(o => o.status === OutingStatus.PENDING || o.status === OutingStatus.RETURN_PENDING).map(out => (
                                <div key={out.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[10px] space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <strong className="text-dark-charcoal block">{out.nama}</strong>
                                      <span className="text-[9px] text-slate-500">NRP {out.nrp} • {out.kesatuan}</span>
                                    </div>
                                    <span className="bg-olive-green text-white font-bold text-[8px] py-0.5 px-2 rounded-full">
                                      {out.keterangan} • {out.durationMinutes}m
                                    </span>
                                  </div>

                                  {out.status === OutingStatus.PENDING ? (
                                    <div className="space-y-1.5">
                                      <div className="text-[8px] text-slate-500 flex items-center justify-between">
                                        <span>Persetujuan GPS Always-On:</span>
                                        <span className="text-success-green font-bold">✓ SETUJU</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                        <button
                                          id={`btn-approve-out-${out.id}`}
                                          onClick={() => handleAdminOutingAction(out.id, OutingStatus.ACTIVE)}
                                          className="py-1 bg-success-green hover:bg-success-green/90 text-white font-bold rounded text-[9px]"
                                        >
                                          Setujui Keluar
                                        </button>
                                        <button
                                          id={`btn-reject-out-${out.id}`}
                                          onClick={() => handleAdminOutingAction(out.id, OutingStatus.REJECTED)}
                                          className="py-1 bg-danger-crimson hover:bg-danger-crimson/90 text-white font-bold rounded text-[9px]"
                                        >
                                          Tolak
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* RETURN PENDING FLOW */
                                    <div className="space-y-1.5 p-1.5 bg-warning-amber/5 rounded border border-warning-amber/10">
                                      <span className="text-[9px] font-bold text-warning-amber block">REKUES SELESAI IZIN & MASUK KEMBALI</span>
                                      
                                      <div className="text-[8px] text-slate-500 font-mono">
                                        Check-In Jaringan: <strong className="text-success-green">WiFi Kantor Verified</strong>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 pt-1">
                                        <button
                                          id={`btn-approve-return-${out.id}`}
                                          onClick={() => handleAdminReturnAction(out.id, true)}
                                          className="py-1 bg-success-green hover:bg-success-green/90 text-white font-bold text-[8px] rounded"
                                        >
                                          Acc Masuk Gedung
                                        </button>
                                        <button
                                          id={`btn-reject-return-${out.id}`}
                                          onClick={() => handleAdminReturnAction(out.id, false)}
                                          className="py-1 bg-danger-crimson hover:bg-danger-crimson/90 text-white font-bold text-[8px] rounded"
                                        >
                                          Minta Foto Ulang
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ===================== ADMIN TAB: ACTIVE GPS LIVE MAP ===================== */}
                    {adminActiveTab === 'TRACKING_MAP' && (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-gray block uppercase">Peta Pelacakan GPS Prajurit Aktif</span>
                          
                          {outingRequests.filter(o => o.status === OutingStatus.ACTIVE).length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-8">Tidak ada prajurit yang sedang dalam pelacakan luar gedung saat ini.</p>
                          ) : (
                            <div className="space-y-3">
                              {outingRequests.filter(o => o.status === OutingStatus.ACTIVE).map(out => (
                                <div key={out.id} className="space-y-2 border-b border-slate-100 pb-3">
                                  <div className="flex justify-between text-[10px]">
                                    <strong>{out.nama}</strong>
                                    <span className="text-danger-crimson font-bold font-mono animate-pulse flex items-center gap-1">
                                      ● GPS LIVE TRACKING
                                    </span>
                                  </div>

                                  {/* MOCK MAP CONTAINER */}
                                  <div className="bg-slate-900 text-white h-[140px] rounded-lg p-2.5 relative flex flex-col justify-between font-mono text-[8px] overflow-hidden border border-slate-800">
                                    
                                    {/* Mock radar grid */}
                                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#5C7A4D_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                    
                                    {/* Map Details */}
                                    <div className="z-10 flex justify-between">
                                      <span className="bg-black/50 p-1 rounded">Scale: 1:5000</span>
                                      <span className="bg-military-green text-white p-1 rounded font-bold">KODAM-HQ GEODOME</span>
                                    </div>

                                    {/* Simulating live marker positions */}
                                    <div className="z-10 flex flex-col items-center justify-center flex-1 my-2">
                                      <div className="relative">
                                        <div className="w-4 h-4 bg-danger-crimson rounded-full animate-ping absolute -inset-0"></div>
                                        <div className="w-4 h-4 bg-danger-crimson rounded-full flex items-center justify-center relative border-2 border-white">
                                          <MapPin className="w-2.5 h-2.5 text-white" />
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-warning-amber mt-1 bg-black/60 px-1.5 py-0.5 rounded">
                                        {simLocationMode === 'FAKE_GPS' ? '⚠️ FAKE GPS DETECTED!' : 'Outside Building Range'}
                                      </span>
                                    </div>

                                    <div className="z-10 bg-black/60 p-1.5 rounded space-y-0.5">
                                      <div>Koordinat Terkini: Lat {currentCoords.lat.toFixed(5)}, Lng {currentCoords.lng.toFixed(5)}</div>
                                      <div className="flex justify-between">
                                        <span>Rute Breadcrumbs: {out.gpsTrack.length} node</span>
                                        <span className="text-success-green">Keamanan: Anti-Mock OK</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-2 bg-slate-50 rounded-lg text-[9px] text-slate-600 leading-normal">
                                    Anggota ini menyetujui pelacakan posisi berkelanjutan. Ponselnya terus memperbarui koordinat GPS setiap 30 detik ke server komando.
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* ADMIN BOTTOM NAVIGATION */}
                  <nav className="bg-gradient-to-r from-[#112A19] via-[#1A3E26] to-[#112A19] border-t border-[#D4AF37]/30 grid grid-cols-4 py-2.5 select-none text-[9px] font-bold text-slate-300 shrink-0">
                    <button 
                      onClick={() => setAdminActiveTab('USERS')}
                      className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${adminActiveTab === 'USERS' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                    >
                      <UserPlus className={`w-4.5 h-4.5 transition-transform ${adminActiveTab === 'USERS' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                      <span>Registrasi</span>
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('PRESENCE_LOGS')}
                      className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${adminActiveTab === 'PRESENCE_LOGS' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                    >
                      <QrCode className={`w-4.5 h-4.5 transition-transform ${adminActiveTab === 'PRESENCE_LOGS' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                      <span>Log Absen</span>
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('LEAVES_APPROVALS')}
                      className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${adminActiveTab === 'LEAVES_APPROVALS' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                    >
                      <FileCheck className={`w-4.5 h-4.5 transition-transform ${adminActiveTab === 'LEAVES_APPROVALS' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                      <span>Persetujuan</span>
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('TRACKING_MAP')}
                      className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${adminActiveTab === 'TRACKING_MAP' ? 'text-white scale-105 font-extrabold' : 'hover:text-white opacity-70 hover:opacity-100'}`}
                    >
                      <Map className={`w-4.5 h-4.5 transition-transform ${adminActiveTab === 'TRACKING_MAP' ? 'stroke-[2.5px] text-[#D4AF37]' : 'stroke-2'}`} />
                      <span>GPS Live</span>
                    </button>
                  </nav>

                </div>
              )}

            </div>
          </div>
        </section>

      </main>

      {/* =========================================================
          SECTION DIAGRAM ALIR & LOGIKA GEOFENCE SISTEM (ANALYSIS VIEW)
          ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          
          {/* HEADER SECTION */}
          <div className="bg-gradient-to-r from-[#112A19] via-[#1A3E26] to-[#254F2E] border-b-2 border-[#D4AF37]/30 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/10 border border-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[#D4AF37] shadow-inner">System Analyst Companion</span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-white">
                <Sliders className="w-5.5 h-5.5 text-[#D4AF37]" /> 
                Diagram Alir &amp; Validasi Keamanan Berlapis (Flowchart)
              </h2>
              <p className="text-xs text-slate-100/90 mt-1 max-w-2xl leading-relaxed">
                Visualisasi logika keputusan siber yang terjadi di latar belakang perangkat anggota. Status node diagram di bawah ini akan <strong>berubah secara real-time</strong> sesuai interaksi simulator Anda di atas.
              </p>
            </div>
            
            <button
              onClick={() => {
                const xmlContent = `<mxfile host="Electron" modified="2026-07-06T19:30:00.000Z" agent="5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" version="21.5.0" type="device">
  <diagram id="NayakaPresensiFlowchart" name="Flowchart Detail Penggunaan Aplikasi NAYAKA Presensi">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="start_node" value="MULAI" style="ellipse;whiteSpace=wrap;html=1;fillColor=#355E3B;textColor=#FFFFFF;strokeColor=#5C7A4D;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="365" y="40" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="login_input" value="User memasukkan NRP &amp; Password" style="shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;fillColor=#FFFFFF;strokeColor=#6B7280" vertex="1" parent="1">
          <mxGeometry x="345" y="140" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge1" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="start_node" target="login_input" />
        <mxCell id="check_user" value="Apakah NRP terdaftar?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#F5F5F2;strokeColor=#6B7280" vertex="1" parent="1">
          <mxGeometry x="365" y="240" width="120" height="100" as="geometry" />
        </mxCell>
        <mxCell id="edge2" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="login_input" target="check_user" />
        <mxCell id="err_nrp" value="Tampilkan: NRP Tidak Terdaftar!" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C62828;textColor=#FFFFFF;strokeColor=#C62828" vertex="1" parent="1">
          <mxGeometry x="180" y="260" width="130" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge3" value="TIDAK" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0" edge="1" parent="1" source="check_user" target="err_nrp" />
        <mxCell id="check_pass" value="Apakah Password cocok?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#F5F5F2;strokeColor=#6B7280" vertex="1" parent="1">
          <mxGeometry x="365" y="380" width="120" height="100" as="geometry" />
        </mxCell>
        <mxCell id="edge4" value="YA" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="check_user" target="check_pass" />
        <mxCell id="err_pass" value="Tampilkan: Password Salah!" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C62828;textColor=#FFFFFF;strokeColor=#C62828" vertex="1" parent="1">
          <mxGeometry x="180" y="400" width="130" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge5" value="TIDAK" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.5;entryDx=0;entryDy=0" edge="1" parent="1" source="check_pass" target="err_pass" />
        <mxCell id="device_detect" value="Sistem mendeteksi ID Perangkat otomatis" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#355E3B" vertex="1" parent="1">
          <mxGeometry x="345" y="520" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge6" value="YA" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="check_pass" target="device_detect" />
        <mxCell id="check_status" value="Apakah Status User = NEW?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#F5F5F2;strokeColor=#6B7280" vertex="1" parent="1">
          <mxGeometry x="360" y="620" width="130" height="110" as="geometry" />
        </mxCell>
        <mxCell id="edge7" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="device_detect" target="check_status" />
        <mxCell id="force_change" value="Wajib Ganti Password" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D4A017;textColor=#FFFFFF;strokeColor=#D4A017" vertex="1" parent="1">
          <mxGeometry x="580" y="645" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge8" value="YA (NEW)" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="check_status" target="force_change" />
        <mxCell id="save_pw" value="Simpan Password Baru" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#5C7A4D" vertex="1" parent="1">
          <mxGeometry x="580" y="740" width="160" height="65" as="geometry" />
        </mxCell>
        <mxCell id="edge9" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="force_change" target="save_pw" />
        <mxCell id="home_dashboard" value="Masuk ke Dashboard" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#355E3B;textColor=#FFFFFF;strokeColor=#5C7A4D" vertex="1" parent="1">
          <mxGeometry x="345" y="780" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="edge10" value="TIDAK" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="check_status" target="home_dashboard" />
        <mxCell id="action_presence" value="User klik tombol Presensi" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="345" y="890" width="160" height="50" as="geometry" />
        </mxCell>
        <mxCell id="check_wifi" value="Apakah terhubung WiFi resmi?" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="980" width="180" height="120" as="geometry" />
        </mxCell>
        <mxCell id="check_gps" value="Apakah GPS dalam Geofence?" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="335" y="1140" width="180" height="120" as="geometry" />
        </mxCell>
        <mxCell id="check_mock" value="Apakah terdeteksi Fake GPS?" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="1300" width="170" height="120" as="geometry" />
        </mxCell>
        <mxCell id="save_log" value="Presensi QR Sukses!" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#2E7D32;textColor=#FFFFFF;" vertex="1" parent="1">
          <mxGeometry x="345" y="1460" width="160" height="70" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

                const blob = new Blob([xmlContent], { type: 'text/xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'flowchart_presensi_nayaka.xml';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="bg-white text-military-green hover:bg-slate-100 font-bold text-xs py-2 px-4 rounded-xl border border-white shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-stretch md:self-auto justify-center cursor-pointer"
            >
              <FileUp className="w-4 h-4 rotate-180" />
              Unduh XML Flowchart (.drawio)
            </button>
          </div>

          {/* TAB BAR FOR FLOWCHARTS */}
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFlowchartTab('PRESENCE')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${flowchartTab === 'PRESENCE' ? 'bg-military-green text-white shadow-sm' : 'text-slate-gray hover:text-dark-charcoal bg-white border border-slate-200'}`}
            >
              <QrCode className="w-4 h-4" />
              1. Verifikasi Geofence Presensi QR
            </button>
            <button
              onClick={() => setFlowchartTab('OUTING')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${flowchartTab === 'OUTING' ? 'bg-military-green text-white shadow-sm' : 'text-slate-gray hover:text-dark-charcoal bg-white border border-slate-200'}`}
            >
              <Map className="w-4 h-4" />
              2. Siklus Izin Keluar &amp; Pelacakan GPS
            </button>
          </div>

          {/* FLOWCHART VIEWPORT */}
          <div className="p-6 bg-slate-50/50">
            {flowchartTab === 'PRESENCE' ? (
              /* TAB 1: PRESENCE FLOWCHART BUILDER */
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Validasi Berlapis Aktif:</strong> Sistem menyaring data hardware perangkat, koneksi BSSID WiFi, koordinat lintang/bujur GPS, hingga pengecekan manipulasi API <code>Mock Location</code> siber sebelum mencatat absensi.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
                  
                  {/* STEP 1: LOGIN */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${userLoggedIn ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 01</span>
                      <span className={`w-2 h-2 rounded-full ${userLoggedIn ? 'bg-success-green animate-pulse' : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Lock className={`w-4 h-4 ${userLoggedIn ? 'text-success-green' : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-xs">Autentikasi User</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Anggota memasukkan NRP &amp; Password. Autentikasi disaring ke server komando.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Status: <strong className={userLoggedIn ? 'text-success-green' : 'text-slate-400'}>{userLoggedIn ? 'ACTIVE' : 'MENUNGGU'}</strong>
                    </div>
                  </div>

                  {/* STEP 2: HARDWARE FINGERPRINT */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${userLoggedIn ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 02</span>
                      <span className={`w-2 h-2 rounded-full ${userLoggedIn ? 'bg-success-green animate-pulse' : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Smartphone className={`w-4 h-4 ${userLoggedIn ? 'text-success-green' : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-xs">Hardware Fingerprint</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Mendeteksi UUID/Model ponsel otomatis saat login pertama kali untuk mengunci akun.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono truncate">
                      Device: <strong className={userLoggedIn ? 'text-success-green' : 'text-slate-400'}>{userLoggedIn ? (userLoggedIn.device || 'Terdaftar') : 'MENUNGGU'}</strong>
                    </div>
                  </div>

                  {/* STEP 3: WIFI SSID CHECK */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${userLoggedIn && userActiveTab === 'PRESENCE' ? (simWifiConnected ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-red-50 border-red-500 shadow-sm') : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 03</span>
                      <span className={`w-2 h-2 rounded-full ${userLoggedIn && userActiveTab === 'PRESENCE' ? (simWifiConnected ? 'bg-success-green' : 'bg-danger-crimson animate-ping') : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Wifi className={`w-4 h-4 ${userLoggedIn && userActiveTab === 'PRESENCE' ? (simWifiConnected ? 'text-success-green' : 'text-danger-crimson') : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-xs">Cek WiFi Gedung</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Memeriksa apakah tersambung router NAYAKA-WIFI-SECURE. Bypass seluler ditolak!
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      WiFi SSID: <strong className={simWifiConnected ? 'text-success-green' : 'text-danger-crimson'}>{currentWifiSSID}</strong>
                    </div>
                  </div>

                  {/* STEP 4: GEOFENCE GPS RADIUS */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected ? (simLocationMode !== 'OUTSIDE' ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-red-50 border-red-500 shadow-sm') : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 04</span>
                      <span className={`w-2 h-2 rounded-full ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected ? (simLocationMode !== 'OUTSIDE' ? 'bg-success-green' : 'bg-danger-crimson animate-ping') : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className={`w-4 h-4 ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected ? (simLocationMode !== 'OUTSIDE' ? 'text-success-green' : 'text-danger-crimson') : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-xs">Geofence GPS (&lt;50m)</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Mencocokkan titik latitude/longitude. Harus berada dalam batas geofence markas.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono truncate">
                      GPS: <strong className={simLocationMode !== 'OUTSIDE' ? 'text-success-green' : 'text-danger-crimson'}>{simLocationMode === 'OFFICE' ? 'Dalam Radius' : simLocationMode === 'FAKE_GPS' ? 'Radius OK' : 'Di Luar Batas'}</strong>
                    </div>
                  </div>

                  {/* STEP 5: ANTI-SPOOFING FAKE GPS */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode !== 'OUTSIDE' ? (simLocationMode !== 'FAKE_GPS' ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-red-50 border-red-500 shadow-sm animate-pulse') : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 05</span>
                      <span className={`w-2 h-2 rounded-full ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode !== 'OUTSIDE' ? (simLocationMode !== 'FAKE_GPS' ? 'bg-success-green' : 'bg-danger-crimson animate-bounce') : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className={`w-4 h-4 ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode !== 'OUTSIDE' ? (simLocationMode !== 'FAKE_GPS' ? 'text-success-green' : 'text-danger-crimson') : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-xs">Anti-Spoofing Check</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Memeriksa parameter Mock Location API OS. Akses langsung diblokir jika spoofing terdeteksi!
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Siber API: <strong className={simLocationMode !== 'FAKE_GPS' ? 'text-success-green' : 'text-danger-crimson'}>{simLocationMode === 'FAKE_GPS' ? '⚠️ SPOOFED DETECTED' : 'SAFE / ORIGINAL'}</strong>
                    </div>
                  </div>

                  {/* STEP 6: PHOTO & LOG PRESENCE */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode === 'OFFICE' ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 06</span>
                      <span className={`w-2 h-2 rounded-full ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode === 'OFFICE' ? 'bg-success-green' : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Camera className={`w-4 h-4 ${userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode === 'OFFICE' ? 'text-success-green' : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-xs">Swafoto &amp; Log Sukses</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Mengambil swafoto bukti wajah &amp; menyimpan log absensi aman terenkripsi di database.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Database: <strong className={userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode === 'OFFICE' ? 'text-success-green' : 'text-slate-400'}>{userLoggedIn && userActiveTab === 'PRESENCE' && simWifiConnected && simLocationMode === 'OFFICE' ? 'LOG GENERATED' : 'WAITING'}</strong>
                    </div>
                  </div>

                </div>

                {/* VISUAL DECISION BRANCH SUMMARY FOR THE ANALYST */}
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold block mb-1">Hasil Evaluasi Logika Geofence Berjalan:</span>
                  <div className="flex flex-wrap gap-4 font-mono text-[10px] mt-2">
                    <span className={`px-2.5 py-1 rounded border ${simWifiConnected ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-danger-crimson/10 text-danger-crimson border-danger-crimson/20'}`}>
                      [WiFi Check] SSID: {currentWifiSSID} → {simWifiConnected ? 'PASSED (WiFi Cocok)' : 'BLOCKED (Bukan WiFi Kantor)'}
                    </span>
                    <span className={`px-2.5 py-1 rounded border ${simLocationMode !== 'OUTSIDE' ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-danger-crimson/10 text-danger-crimson border-danger-crimson/20'}`}>
                      [Geofence Coords] Radius 50m → {simLocationMode !== 'OUTSIDE' ? 'PASSED (Koordinat Sesuai)' : 'BLOCKED (Di Luar Jangkauan)'}
                    </span>
                    <span className={`px-2.5 py-1 rounded border ${simLocationMode !== 'FAKE_GPS' ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-danger-crimson/10 text-danger-crimson border-danger-crimson/20 animate-pulse'}`}>
                      [Anti-Spoofing] Mock Flag → {simLocationMode !== 'FAKE_GPS' ? 'PASSED (GPS Asli)' : 'ALERT! (Fake GPS Terdeteksi & Diblokir!)'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: OUTING FLOWCHART BUILDER */
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Siklus Hidup Pelacakan:</strong> Diaktifkan setelah persetujuan komandan. Ponsel anggota terus mengirim data GPS koordinat berkelanjutan selama di luar area, dan menghitung mundur waktu sisa secara real-time.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  
                  {/* STEP 1: REQUEST */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${activeUserOuting ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : (userLoggedIn && userActiveTab === 'OUTING' ? 'bg-amber-50 border-warning-amber border-dashed' : 'bg-white border-slate-200 opacity-60')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 01</span>
                      <span className={`w-2 h-2 rounded-full ${activeUserOuting ? 'bg-success-green' : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <h4 className="font-extrabold text-xs font-sans">Pengajuan Izin</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Anggota mengajukan izin keluar (memilih durasi &amp; menyetujui pelacakan GPS).
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Status: <strong>{activeUserOuting ? 'SUBMITTED' : 'READY'}</strong>
                    </div>
                  </div>

                  {/* STEP 2: ADMIN APPROVAL */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${activeUserOuting?.status === OutingStatus.PENDING ? 'bg-amber-50 border-warning-amber animate-pulse shadow-sm' : (activeUserOuting && activeUserOuting.status !== OutingStatus.PENDING ? 'bg-emerald-50/70 border-emerald-500' : 'bg-white border-slate-200 opacity-60')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 02</span>
                      <span className={`w-2 h-2 rounded-full ${activeUserOuting?.status === OutingStatus.PENDING ? 'bg-warning-amber animate-ping' : (activeUserOuting && activeUserOuting.status !== OutingStatus.PENDING ? 'bg-success-green' : 'bg-slate-300')}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileCheck className="w-4 h-4 text-slate-600" />
                      <h4 className="font-extrabold text-xs">Persetujuan Komandan</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Komandan memverifikasi alasan &amp; memberi persetujuan izin secara langsung di panel komando.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Status: <strong>{activeUserOuting ? activeUserOuting.status : 'WAITING'}</strong>
                    </div>
                  </div>

                  {/* STEP 3: LIVE GPS BREADCRUMBS */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${activeUserOuting?.status === OutingStatus.ACTIVE ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : (activeUserOuting?.status === OutingStatus.RETURN_PENDING || activeUserOuting?.status === OutingStatus.COMPLETED ? 'bg-emerald-50/70 border-emerald-500' : 'bg-white border-slate-200 opacity-60')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 03</span>
                      <span className={`w-2 h-2 rounded-full ${activeUserOuting?.status === OutingStatus.ACTIVE ? 'bg-success-green animate-pulse' : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Map className="w-4 h-4 text-slate-600" />
                      <h4 className="font-extrabold text-xs">GPS Live Tracking</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Ponsel mengirim koordinat GPS periodik setiap 30 detik untuk di-plot di peta komando.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono truncate">
                      Trace: <strong>{activeUserOuting ? `${activeUserOuting.gpsTrack.length} Breadcrumbs` : '-'}</strong>
                    </div>
                  </div>

                  {/* STEP 4: TIMER & ALERTS */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${activeUserOuting?.status === OutingStatus.ACTIVE && activeOutingTimeLeft < 900 ? 'bg-amber-50 border-warning-amber animate-bounce shadow-sm' : (activeUserOuting && activeUserOuting.status !== OutingStatus.PENDING && activeUserOuting.status !== OutingStatus.ACTIVE ? 'bg-emerald-50/70 border-emerald-500' : 'bg-white border-slate-200 opacity-60')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 04</span>
                      <span className={`w-2 h-2 rounded-full ${activeUserOuting?.status === OutingStatus.ACTIVE && activeOutingTimeLeft < 900 ? 'bg-warning-amber animate-pulse' : 'bg-slate-300'}`}>
                        {activeUserOuting?.status === OutingStatus.ACTIVE && activeOutingTimeLeft < 900 && '!'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <h4 className="font-extrabold text-xs font-sans">Alarm Limit Waktu</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Push alert visual dikirim otomatis di layar anggota pada sisa waktu 15m, 10m, 5m, dan 1m.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Waktu Sisa: <strong>{activeUserOuting && activeUserOuting.status === OutingStatus.ACTIVE ? `${Math.floor(activeOutingTimeLeft / 60)}m` : 'RESTING'}</strong>
                    </div>
                  </div>

                  {/* STEP 5: RETURN VERIFICATION */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${activeUserOuting?.status === OutingStatus.RETURN_PENDING ? 'bg-amber-50 border-warning-amber animate-pulse shadow-sm' : (activeUserOuting?.status === OutingStatus.COMPLETED ? 'bg-emerald-50/70 border-emerald-500' : 'bg-white border-slate-200 opacity-60')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 05</span>
                      <span className={`w-2 h-2 rounded-full ${activeUserOuting?.status === OutingStatus.RETURN_PENDING ? 'bg-warning-amber animate-bounce' : (activeUserOuting?.status === OutingStatus.COMPLETED ? 'bg-success-green' : 'bg-slate-300')}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Wifi className="w-4 h-4 text-slate-600" />
                      <h4 className="font-extrabold text-xs">Cek WiFi Kembali</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Anggota wajib terhubung ke WiFi gedung asrama kembali untuk melakukan sensor konfirmasi kedatangan.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Status: <strong>{activeUserOuting?.status === OutingStatus.RETURN_PENDING ? 'WAITING VERIFY' : activeUserOuting?.status === OutingStatus.COMPLETED ? 'DONE' : 'WAITING'}</strong>
                    </div>
                  </div>

                  {/* STEP 6: CLOSED & DONE */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${activeUserOuting?.status === OutingStatus.COMPLETED || outingRequests.some(o => o.nrp === userLoggedIn?.nrp && o.status === OutingStatus.COMPLETED) ? 'bg-emerald-50/70 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">STEP 06</span>
                      <span className={`w-2 h-2 rounded-full ${activeUserOuting?.status === OutingStatus.COMPLETED || outingRequests.some(o => o.nrp === userLoggedIn?.nrp && o.status === OutingStatus.COMPLETED) ? 'bg-success-green' : 'bg-slate-300'}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle className="w-4 h-4 text-slate-600" />
                      <h4 className="font-extrabold text-xs">Sesi Selesai (Hadir)</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Komandan menyetujui kembalinya anggota setelah memverifikasi jalur rute breadcrumbs GPS asli.
                    </p>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[9px] font-mono">
                      Kehadiran: <strong className={activeUserOuting?.status === OutingStatus.COMPLETED || outingRequests.some(o => o.nrp === userLoggedIn?.nrp && o.status === OutingStatus.COMPLETED) ? 'text-success-green' : 'text-slate-400'}>{activeUserOuting?.status === OutingStatus.COMPLETED || outingRequests.some(o => o.nrp === userLoggedIn?.nrp && o.status === OutingStatus.COMPLETED) ? 'TERTULIS HADIR' : 'PENDING'}</strong>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* SYSTEM DESCRIPTION FOOTER FOR ANALYSTS */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 text-[11px] text-slate-500 font-mono flex flex-wrap justify-between gap-2">
            <span>Enkripsi Log: SHA-256 (Salted NRP + Timestamp + Wifi BSSID)</span>
            <span>OS Geofence Service Provider: Fused Location API &amp; CoreLocation Framework</span>
          </div>

        </div>
      </section>

      {/* FOOTER DESKRIPTIF */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-200 text-center text-slate-gray space-y-2">
        <p className="text-xs">
          Aplikasi purwarupa ini sepenuhnya menggunakan standar keamanan siber militer: <strong>Hardware Fingerprinting</strong>, <strong>BSSID WiFi Geolocation Matching</strong>, dan <strong>Always-On GPS Breadcrumbs Trace</strong>.
        </p>
        <p className="text-[10px] text-slate-400">
          Dirancang untuk demo presentasi System Analyst. Dikembangkan menggunakan React, Tailwind CSS v4, dan TypeScript.
        </p>
      </footer>
    </div>
  );
}
