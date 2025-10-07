const fs = require("fs");
const path = require("path");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");

const stickerMaker = new StickerMaker();
const settingPath = path.join(__dirname, "setting.js");

// === FUNGSI AMBIL SETTING TERBARU (auto reload tiap pesan)
function loadSetting() {
    delete require.cache[require.resolve(settingPath)];
    return require(settingPath);
}

module.exports = async (sock, m, body, from) => {
    try {
        // Ambil setting paling baru
        const setting = loadSetting();
        const { bot, getUptime } = setting;

        const prefix = bot.prefix;
        if (!body.startsWith(prefix)) return;

        const cmdBody = body.slice(prefix.length).trim();
        const [command, ...args] = cmdBody.split(/\s+/);
        const cmd = command.toLowerCase();

        const sender = m.key.participant || m.key.remoteJid;
        const senderNum = sender.replace(/[^0-9]/g, "");
        const ownerNum = bot.ownerNumber.replace(/[^0-9]/g, "");
        const isOwner = senderNum === ownerNum;

        switch (true) {
            // ===== MENU =====
            case cmd === "menu":
            case cmd === "help":
                await sock.sendMessage(from, { text: createMenu() }, { quoted: m });
                break;

            // ===== INFO BOT =====
            case cmd === "infobot":
                const uptime = getUptime();
                const info = `
╭━━━〔 🤖 *${bot.name}* 〕━━━╮
┃ ⚙️ Prefix : ${bot.prefix}
┃ 👑 Owner  : ${bot.ownerName}
┃ 💻 Platform: ${bot.platform}
┃ 🕒 Uptime  : ${uptime}
╰━━━━━━━━━━━━━━━━━━━━━━╯`;
                await sock.sendMessage(from, { text: info }, { quoted: m });
                break;

            // ===== PING =====
            case cmd === "ping":
                const start = Date.now();
                await sock.sendMessage(from, { text: "🏓 Testing ping..." }, { quoted: m });
                const latency = Date.now() - start;
                await sock.sendMessage(from, {
                    text: `✨ *PONG!*\n\n⨳ *Speed:* ${latency} ms\n⨳ *Runtime:* ${process.uptime().toFixed(2)}s`,
                }, { quoted: m });
                break;

            // ===== STIKER =====
            case cmd === "stiker":
            case cmd === "s":
                await handleSticker(sock, m, from);
                break;

            // ===== STIKER TEKS =====
            case cmd === "stikertxt":
                const text = args.join(" ");
                if (!text) {
                    await sock.sendMessage(from, { text: `📝 Contoh: ${prefix}stikertxt Halo Dunia` }, { quoted: m });
                    return;
                }
                await handleTextSticker(sock, m, from, text);
                break;

            // ===== UBAH PREFIX =====
            case cmd === "setprefix":
                if (!isOwner) {
                    await sock.sendMessage(from, { text: "🚫 Hanya owner yang dapat ubah prefix!" }, { quoted: m });
                    return;
                }

                const newPrefix = args[0];
                if (!newPrefix) {
                    await sock.sendMessage(from, { text: `⚙️ Contoh: ${prefix}setprefix ?` }, { quoted: m });
                    return;
                }

                // Baca isi setting.js lalu ubah prefix-nya
                let file = fs.readFileSync(settingPath, "utf8");
                file = file.replace(/prefix:\s*['"`].*?['"`]/, `prefix: "${newPrefix}"`);
                fs.writeFileSync(settingPath, file, "utf8");

                await sock.sendMessage(from, { text: `✅ Prefix berhasil diubah ke *${newPrefix}*` }, { quoted: m });
                break;

            // ===== LIHAT PREFIX =====
            case cmd === "prefix":
                await sock.sendMessage(from, { text: `🔹 Prefix saat ini: *${bot.prefix}*` }, { quoted: m });
                break;

            // ===== DEFAULT / COMMAND TIDAK DIKENAL =====
            default:
                await sock.sendMessage(from, { text: `❌ Command *${cmd}* tidak dikenal.\n\n${createSimpleMenu()}` }, { quoted: m });
                break;
        }

    } catch (err) {
        console.error("❌ Error Handler:", err);
        await sock.sendMessage(from, { text: `Terjadi error: ${err.message}` }, { quoted: m });
    }
};

// ==========================
// HANDLER TAMBAHAN
// ==========================
async function handleSticker(sock, m, from) {
    const setting = loadSetting();
    const { bot } = setting;

    if (m.message.imageMessage || m.message.videoMessage) {
        try {
            await sock.sendMessage(from, { text: "⏳ Membuat stiker..." }, { quoted: m });
            const media = m.message.imageMessage || m.message.videoMessage;
            const mediaType = m.message.imageMessage ? "image" : "video";

            if (mediaType === "video" && media.seconds > 10)
                return sock.sendMessage(from, { text: "❌ Video terlalu panjang! Maks 10 detik." }, { quoted: m });

            const stickerBuffer = await stickerMaker.createSticker(media, mediaType);
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
        } catch (error) {
            await sock.sendMessage(from, { text: `❌ Gagal: ${error.message}` }, { quoted: m });
        }
    } else {
        await sock.sendMessage(from, { text: `📸 Kirim gambar/video dengan caption ${bot.prefix}s` }, { quoted: m });
    }
}

async function handleTextSticker(sock, m, from, text) {
    try {
        const stickerBuffer = await stickerMaker.textToSticker(text);
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(from, { text: `❌ Gagal: ${error.message}` }, { quoted: m });
    }
}
