const fs = require("fs");
const path = require("path");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");
const { bot, getUptime } = require("./setting");
let setting = require("./setting");

const stickerMaker = new StickerMaker();
const settingPath = path.join(__dirname, "setting.js");

module.exports = async (sock, m, body, from) => {
    try {
        const prefix = setting.prefix;
        if (!body.startsWith(prefix)) return;

        const cmdBody = body.slice(prefix.length).trim();
        const [command, ...args] = cmdBody.split(/\s+/);
        const cmd = command.toLowerCase();

        const sender = m.key.participant || m.key.remoteJid;
        const senderNum = sender.replace(/[^0-9]/g, "");
        const ownerNum = setting.ownerNumber.replace(/[^0-9]/g, "");
        const isOwner = senderNum === ownerNum;

        switch (cmd) {

            // === MENU ===
            case "menu":
            case "help":
            case "start":
                await sock.sendMessage(from, { text: createMenu() }, { quoted: m });
                break;

            // === OWNER INFO ===
            case "owner":
                await sock.sendMessage(from, {
                    text: `👑 *OWNER BOT*\n\n📞 *Nomor*: ${setting.ownerNumber}\n💻 *Platform*: ${setting.bot.platform}\n⚙️ *Prefix*: ${setting.prefix}`,
                }, { quoted: m });
                break;

            // === INFO BOT ===
            case "infobot":
                const uptime = getUptime();
                await sock.sendMessage(from, {
                    text: `
╭━━━〔 🤖 *${setting.bot.name}* 〕━━━╮
┃ ⚙️ Prefix : ${setting.prefix}
┃ 👑 Owner  : ${setting.bot.ownerName}
┃ 💻 Mode   : ${setting.bot.aiMode ? "AI Aktif ✅" : "AI Nonaktif ❌"}
┃ 🕒 Uptime  : ${uptime}
╰━━━━━━━━━━━━━━━━━━━━━━╯`
                }, { quoted: m });
                break;

            // === PING ===
            case "ping":
                const start = Date.now();
                await sock.sendMessage(from, { text: "🏓 Testing ping..." }, { quoted: m });
                const latency = Date.now() - start;
                await sock.sendMessage(from, {
                    text: `✨ *PONG!*\n\n⨳ *Speed*: ${latency} ms\n⨳ *Runtime*: ${process.uptime().toFixed(2)}s\n⨳ *Status*: Active ✅`,
                }, { quoted: m });
                break;

            // === STICKER ===
            case "stiker":
            case "s":
                await handleSticker(sock, m, from);
                break;

            // === STICKER TEXT ===
            case "stikertxt":
            case "textsticker":
                const text = args.join(" ");
                if (!text) return sock.sendMessage(from, { text: `📝 *Contoh:* ${prefix}stikertxt Halo Dunia` }, { quoted: m });
                await handleTextSticker(sock, m, from, text);
                break;

            // === TAKE STICKER ===
            case "take":
            case "steal":
                if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    await handleQuotedSticker(sock, m, from);
                } else {
                    await sock.sendMessage(from, { text: `🎯 Reply stiker pakai ${prefix}take` }, { quoted: m });
                }
                break;

            // === RUNTIME ===
            case "runtime":
                const up = process.uptime();
                const h = Math.floor(up / 3600);
                const mnt = Math.floor((up % 3600) / 60);
                const s = Math.floor(up % 60);
                await sock.sendMessage(from, { text: `⏰ Runtime: ${h} jam ${mnt} menit ${s} detik` }, { quoted: m });
                break;

            // === UBAH PREFIX ===
            case "setprefix":
                if (!isOwner)
                    return sock.sendMessage(from, { text: "❌ Hanya owner yang dapat mengubah prefix!" }, { quoted: m });

                const newPrefix = args[0];
                if (!newPrefix)
                    return sock.sendMessage(from, { text: `⚙️ *Contoh:* ${prefix}setprefix ?` }, { quoted: m });

                setting.prefix = newPrefix;

                try {
                    // baca file setting
                    let content = fs.readFileSync(settingPath, "utf8");

                    // amanin dulu kalo ga ada prefix di dalam
                    if (!/prefix:\s*['"`].*?['"`]/.test(content)) {
                        content = content.replace(/module\.exports\s*=\s*{/, `module.exports = {\n  prefix: '${newPrefix}',`);
                    } else {
                        content = content.replace(/prefix:\s*['"`].*?['"`]/, `prefix: '${newPrefix}'`);
                    }

                    fs.writeFileSync(settingPath, content, "utf8");
                } catch (e) {
                    console.error("❌ Gagal ubah prefix:", e);
                }

                await sock.sendMessage(from, { text: `✅ Prefix berhasil diubah ke *${newPrefix}*` }, { quoted: m });
                break;

            // === LIHAT PREFIX ===
            case "prefix":
                await sock.sendMessage(from, { text: `🔹 Prefix saat ini: *${setting.prefix}*` }, { quoted: m });
                break;

            // === RESET PREFIX ===
            case "resetprefix":
                if (!isOwner)
                    return sock.sendMessage(from, { text: "❌ Hanya owner yang dapat reset prefix!" }, { quoted: m });

                setting.prefix = "!";
                let resetFile = fs.readFileSync(settingPath, "utf8");
                resetFile = resetFile.replace(/prefix:\s*['"`].*?['"`]/, `prefix: '!'`);
                fs.writeFileSync(settingPath, resetFile, "utf8");

                await sock.sendMessage(from, { text: `🔄 Prefix berhasil direset ke default: *!*` }, { quoted: m });
                break;

            // === COMMAND TIDAK DIKENAL ===
            default:
                await sock.sendMessage(from, {
                    text: `❌ Command *${body}* tidak dikenali.\n\n${createSimpleMenu()}`,
                }, { quoted: m });
                break;
        }
    } catch (err) {
        console.error("❌ Error Handler:", err);
        await sock.sendMessage(from, { text: `Terjadi error: ${err.message}` }, { quoted: m });
    }
};

// === HANDLER TAMBAHAN ===

async function handleSticker(sock, m, from) {
    if (m.message.imageMessage || m.message.videoMessage) {
        try {
            await sock.sendMessage(from, { text: "⏳ Membuat stiker..." }, { quoted: m });
            const media = m.message.imageMessage || m.message.videoMessage;
            const mediaType = m.message.imageMessage ? "image" : "video";

            if (mediaType === "video" && media.seconds > 10)
                return sock.sendMessage(from, { text: "❌ Video terlalu panjang! Maksimal 10 detik." }, { quoted: m });

            const stickerBuffer = await stickerMaker.createSticker(media, mediaType);
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
        } catch (error) {
            console.error("❌ Error membuat stiker:", error);
            await sock.sendMessage(from, { text: `Gagal membuat stiker: ${error.message}` }, { quoted: m });
        }
    } else {
        await sock.sendMessage(from, { text: `📸 Kirim gambar/video dengan caption ${setting.prefix}s` }, { quoted: m });
    }
}

async function handleTextSticker(sock, m, from, text) {
    try {
        const stickerBuffer = await stickerMaker.textToSticker(text);
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
    } catch (error) {
        console.error("Error text sticker:", error);
        await sock.sendMessage(from, { text: `Gagal: ${error.message}` }, { quoted: m });
    }
}

async function handleQuotedSticker(sock, m, from) {
    try {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quotedMsg.stickerMessage) {
            await sock.sendMessage(from, { sticker: { url: quotedMsg.stickerMessage.url } }, { quoted: m });
        } else {
            await sock.sendMessage(from, { text: "❌ Yang direply bukan stiker!" }, { quoted: m });
        }
    } catch (error) {
        console.error("Error steal stiker:", error);
        await sock.sendMessage(from, { text: `Gagal: ${error.message}` }, { quoted: m });
    }
}
