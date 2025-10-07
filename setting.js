// ===============================
// 📁 FILE: setting.js
// ===============================

// Informasi dasar bot
const bot = {
    name: "We-Bot AI",       // Nama bot
    prefix: "!",             // Prefix default
    ownerName: "Varz Toretto", // Nama pemilik
    ownerNumber: "628xxxxxx",  // Nomor WhatsApp owner
    platform: "Android",     // Platform bot aktif
    version: "1.0.0",        // Versi bot
    aiMode: true,            // Mode AI aktif/tidak
    timezone: "Asia/Jakarta" // Zona waktu
};

// Pesan default
const messages = {
    success: "✅ Berhasil!",
    error: "❌ Terjadi kesalahan!",
    wait: "⏳ Tunggu sebentar...",
    onlyOwner: "🚫 Fitur ini hanya untuk owner!",
    onlyGroup: "👥 Fitur ini hanya bisa di grup!",
    onlyPrivate: "💬 Fitur ini hanya bisa di chat pribadi!",
    notRegistered: "⚠️ Kamu belum terdaftar di sistem!"
};

// Informasi tampilan menu
const display = {
    date: new Date().toLocaleDateString("id-ID", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    }),
    speed: "0.00 ms",
    uptime: "0d 0h 0m 0s",
};

// Fungsi runtime uptime
function getUptime() {
    const totalSeconds = process.uptime();
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Ekspor semua pengaturan biar bisa dipakai di file lain
module.exports = { bot, messages, display, getUptime };
