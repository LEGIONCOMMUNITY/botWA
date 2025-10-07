const { makeTextDraw } = require('./textDraw');

function createMenu() {
    return `
╭━━━〔 ✨ We-Bot AI 〕━━━╮
┃ 📅 Tanggal : Selasa, 7 Oktober 2025
┃ ⚡ Speed   : 0.00 ms
┃ 🕒 Uptime  : 0d 0h 0m 11s
┃ 🤖 AI Mode : Aktif ✅
┃ 💻 Platform: android
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭─🎨 *STICKER MENU* ───
│ • !stiker — Gambar ke stiker
│ • !s — Shortcut stiker
╰───────────────────────

╭─🌟 *BOT INFO* ───────
│ • !ping — Cek status
│ • !runtime — Waktu aktif
│ • !speedtest — Tes kecepatan
│ • !owner — Info pembuat
╰───────────────────────

╭─🔍 *SEARCH MENU* ────
│ • !ytsearch — Cari YouTube
│ • !pinterest — Gambar random
│ • !wallpaper — Wallpaper HD
│ • !playstore — Cari aplikasi
╰───────────────────────

╭─📥 *DOWNLOAD MENU* ─
│ • !ytaudio — Audio YouTube
│ • !ytvideo — Video YouTube
│ • !tiktok — Download TikTok
│ • !instagram — Download IG
╰───────────────────────

╭─🛠️ *TOOLS / CONVERTER* ─
│ • !toimage — Stiker ke gambar
│ • !toaudio — Video ke audio
│ • !tourl — Media ke URL
│ • !ssweb — Screenshot web
╰───────────────────────

╭─🎮 *GAME MENU* ───────
│ • !tebakgambar
│ • !tebakkata
│ • !suit
│ • !tebakbendera
╰───────────────────────

╭─😄 *FUN MENU* ───────
│ • !joke — Cerita lucu
│ • !faktaunik — Fakta menarik
│ • !quotes — Kata bijak
│ • !rate — Nilai sesuatu
╰───────────────────────

╭─🤖 *AI MENU* ────────
│ • !gpt — ChatGPT
│ • !gemini — AI Google
│ • !dalle — Generate gambar
│ • !ai — Asisten pintar
╰───────────────────────

╭─📊 *GROUP MENU* ─────
│ • !groupinfo
│ • !linkgc
│ • !tagall
│ • !hidetag
╰───────────────────────

╭─⚙️ *OTHERS* ─────────
│ • !menu — Tampilkan menu
│ • !help — Bantuan
│ • !infobot — Info bot
│ • !donasi — Support bot
╰───────────────────────

💬 Ketik perintah dengan awalan "!"
✨ *Semoga harimu menyenangkan!* 🥰
    `;
}

function createSimpleMenu() {
    return `
PERINTAH TIDAK ADA KETIK: !menu UNTUK MELIHAT DAFTAR MENU!!
    `;
}

module.exports = { createMenu, createSimpleMenu };