// menuHandler.js - Handler khusus untuk command menu
const { makeTextDraw } = require('./textdraw');

async function handleMenu(sock, m, from) {
    const title = "MENU BOT WA - Script Basic";
    const items = [
        "!menu - Tampilkan menu",
        "!ping - Cek status bot",
        "!stiker - Kirim gambar + caption !stiker",
        "!ytmp3 <link> - Download audio (demo)",
        "!ytmp4 <link> - Download video (demo)",
        "!help - Bantuan singkat"
    ];

    const box = makeTextDraw(title, items, { padding: 1, maxWidth: 60 });
    await sock.sendMessage(from, { text: "```" + box + "```" }, { quoted: m });
}

async function handleHelp(sock, m, from) {
    const helpTitle = "BANTUAN";
    const helpItems = [
        "Untuk fitur stiker: kirim gambar dengan caption !stiker",
        "Untuk pairing: gunakan pairing code (jika support)",
        "Butuh bantuan install? Cek Tutorial PDF"
    ];
    const box = makeTextDraw(helpTitle, helpItems, { padding: 1, maxWidth: 60 });
    await sock.sendMessage(from, { text: "```" + box + "```" }, { quoted: m });
}

module.exports = { handleMenu, handleHelp };