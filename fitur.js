// fitur.js - Main handler
const { handleMenu, handleHelp } = require('./ISI/menuHadler');

module.exports = async (sock, m, body, from) => {
    try {
        const cmd = body.trim().toLowerCase();

        // Handle menu command
        if (cmd === "!menu") {
            await handleMenu(sock, m, from);
            return;
        }

        if (cmd === "!help") {
            await handleHelp(sock, m, from);
            return;
        }

        if (cmd === "!ping") {
            await sock.sendMessage(from, { text: "🏓 Pong! Bot aktif." }, { quoted: m });
            return;
        }

        if (cmd.startsWith("!stiker")) {
            if (!m.message.imageMessage) {
                await sock.sendMessage(from, { text: "Kirim gambar dengan caption *!stiker*." }, { quoted: m });
                return;
            }
            const buffer = await sock.downloadMediaMessage(m);
            await sock.sendMessage(from, { sticker: buffer }, { quoted: m });
            return;
        }

        if (cmd.startsWith("!ytmp3")) {
            await sock.sendMessage(from, { text: "🎵 Downloader MP3 (demo)." }, { quoted: m });
            return;
        }

        if (cmd.startsWith("!ytmp4")) {
            await sock.sendMessage(from, { text: "📹 Downloader MP4 (demo)." }, { quoted: m });
            return;
        }

        // Command tidak dikenali
        // await sock.sendMessage(from, { text: "❌ Command tidak dikenali. Ketik !menu untuk melihat daftar command." }, { quoted: m });

    } catch (err) {
        console.error("Error in fitur handler:", err);
        await sock.sendMessage(from, { text: "❌ Terjadi error di fitur. Cek log." }, { quoted: m });
    }
};