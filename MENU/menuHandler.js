const os = require('os');
const { performance } = require('perf_hooks');
const { makeTextDraw } = require('./textDraw');

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

function createMenu(botName = "✨ We-Bot AI") {
    const start = performance.now();
    const end = performance.now();
    const speed = (end - start).toFixed(2);
    const uptime = formatUptime(process.uptime());
    const date = new Date().toLocaleString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    // 🧠 Info Status
    const header = `
╭━━━〔 ${botName} 〕━━━╮
┃ 📅 Tanggal : ${date}
┃ ⚡ Speed   : ${speed} ms
┃ 🕒 Uptime  : ${uptime}
┃ 🤖 AI Mode : Aktif ✅
┃ 💻 Platform: ${os.platform()}
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

    // 📜 Menu List (dibuat manual tanpa tabel)
    const menu = `
╭─🎨 *STICKER MENU* ───
│ • !stiker — Gambar ke stiker
│ • !s — Shortcut stiker
│ • !sticker — Video ke stiker
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
`;

    const footer = `
💬 Ketik perintah dengan awalan "!"  
✨ *Semoga harimu menyenangkan!* 🥰
`;

    return header + menu + footer;
}

function createSimpleMenu() {
    return `
╭─🎯 *QUICK MENU* ─────
│ • !menu — Menu lengkap
│ • !stiker — Buat stiker
│ • !ping — Tes kecepatan
│ • !owner — Info pembuat
│ • !help — Bantuan
╰───────────────────────
`;
}

module.exports = { createMenu, createSimpleMenu };
