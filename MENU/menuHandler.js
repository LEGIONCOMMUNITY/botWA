const { makeTextDraw } = require('./textDraw');
const setting = require("../setting");

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
│ • ${setting.bot.prefix}stiker — Gambar ke stiker
│ • ${setting.bot.prefix}s — Shortcut stiker
╰───────────────────────

╭─🌟 *BOT INFO* ───────
│ • ${setting.bot.prefix}ping — Cek status
│ • ${setting.bot.prefix}runtime — Waktu aktif
│ • ${setting.bot.prefix}speedtest — Tes kecepatan
│ • ${setting.bot.prefix}owner — Info pembuat
╰───────────────────────

╭─🔍 *SEARCH MENU* ────
│ • ${setting.bot.prefix}ytsearch — Cari YouTube
│ • ${setting.bot.prefix}pinterest — Gambar random
│ • ${setting.bot.prefix}wallpaper — Wallpaper HD
│ • ${setting.bot.prefix}playstore — Cari aplikasi
╰───────────────────────

╭─📥 *DOWNLOAD MENU* ─
│ • ${setting.bot.prefix}ytaudio — Audio YouTube
│ • ${setting.bot.prefix}ytvideo — Video YouTube
│ • ${setting.bot.prefix}tiktok — Download TikTok
│ • ${setting.bot.prefix}instagram — Download IG
╰───────────────────────

╭─🛠️ *TOOLS / CONVERTER* ─
│ • ${setting.bot.prefix}toimage — Stiker ke gambar
│ • ${setting.bot.prefix}toaudio — Video ke audio
│ • ${setting.bot.prefix}tourl — Media ke URL
│ • ${setting.bot.prefix}ssweb — Screenshot web
╰───────────────────────

╭─🎮 *GAME MENU* ───────
│ • ${setting.bot.prefix}tebakgambar
│ • ${setting.bot.prefix}tebakkata
│ • ${setting.bot.prefix}suit
│ • ${setting.bot.prefix}tebakbendera
╰───────────────────────

╭─😄 *FUN MENU* ───────
│ • ${setting.bot.prefix}joke — Cerita lucu
│ • ${setting.bot.prefix}faktaunik — Fakta menarik
│ • ${setting.bot.prefix}quotes — Kata bijak
│ • ${setting.bot.prefix}rate — Nilai sesuatu
╰───────────────────────

╭─🤖 *AI MENU* ────────
│ • ${setting.bot.prefix}gpt — ChatGPT
│ • ${setting.bot.prefix}gemini — AI Google
│ • ${setting.bot.prefix}dalle — Generate gambar
│ • ${setting.bot.prefix}ai — Asisten pintar
╰───────────────────────

╭─📊 *GROUP MENU* ─────
│ • ${setting.bot.prefix}groupinfo
│ • ${setting.bot.prefix}linkgc
│ • ${setting.bot.prefix}tagall
│ • ${setting.bot.prefix}hidetag
╰───────────────────────

╭─⚙️ *OTHERS* ─────────
│ • ${setting.bot.prefix}menu — Tampilkan menu
│ • ${setting.bot.prefix}help — Bantuan
│ • ${setting.bot.prefix}infobot — Info bot
│ • ${setting.bot.prefix}donasi — Support bot
╰───────────────────────

💬 Ketik perintah dengan awalan "!"
✨ *Semoga harimu menyenangkan!* 🥰
    `;
}

function createSimpleMenu() {
    return `
PERINTAH TIDAK ADA KETIK: ${setting.bot.prefix}menu UNTUK MELIHAT DAFTAR MENU!!
    `;
}

module.exports = { createMenu, createSimpleMenu };