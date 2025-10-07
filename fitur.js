const fs = require("fs");
const path = require("path");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");
const setting = require("./setting");

const { bot, messages, getUptime } = setting;
const stickerMaker = new StickerMaker();
const settingPath = path.join(__dirname, "setting.js");

module.exports = async (sock, m, body, from) => {
    try {
        const prefix = bot.prefix;
        if (!body.startsWith(prefix)) return;

        const cmdBody = body.slice(prefix.length).trim();
        const [command, ...args] = cmdBody.split(/\s+/);
        const cmd = command.toLowerCase();

        const sender = m.key.participant || m.key.remoteJid;
        const senderNum = sender.replace(/[^0-9]/g, "");
        const ownerNum = bot.ownerNumber.replace(/[^0-9]/g, "");
        const isOwner = senderNum === ownerNum;

        switch (cmd) {

            // === MENU ===
            case "menu":
            case "help":
                await sock.sendMessage(from, { text: createMenu() }, { quoted: m });
                break;

            // === OWNER INFO ===
            case "owner":
                await sock.sendMessage(from, {
                    text: `👑 *OWNER BOT*\n\n📞 *Nomor*: ${bot.ownerNumber}\n💻 *Platform*: ${bot.platform}\n⚙️ *Prefix*: ${bot.prefix}`,
                }, { quoted: m });
                break;

            // === INFO BOT ===
            case "infobot":
                const uptime = getUptime();
                await sock.sendMessage(from, {
                    text: `
╭━━━〔 🤖 *${bot.name}* 〕━━━╮
┃ ⚙️ Prefix : ${bot.prefix}
┃ 👑 Owner  : ${bot.ownerName}
┃ 💻 Mode   : ${bot.aiMode ? "AI Aktif ✅" : "AI Nonaktif ❌"}
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

            // === STIKER ===
            case "stiker":
            case "s":
                await handleSticker(sock, m, from);
                break;

            // === STIKER TEKS ===
            case "stikertxt":
                const text = args.join(" ");
                if (!text)
                    return sock.sendMessage(from, { text: `📝 *Contoh:* ${prefix}stikertxt Halo Dunia` }, { quoted: m });
                await handleTextSticker(sock, m, from, text);
                break;

            // === TAKE STIKER ===
            case "take":
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

            // === UBAH PREFIX (KHUSUS OWNER) ===
            case "setprefix":
                if (!isOwner)
                    return sock.sendMessage(from, { text: messages.onlyOwner }, { quoted: m });

                const newPrefix = args[0];
                if (!newPrefix)
                    return sock.sendMessage(from, { text: `⚙️ *Contoh:* ${prefix}setprefix ?` }, { quoted: m });

                bot.prefix = newPrefix;

                try {
                    let file = fs.readFileSync(settingPath, "utf8");
                    file = file.replace(/prefix:\s*['"`].*?['"`]/, `prefix: '${newPrefix}'`);
                    fs.writeFileSync(settingPath, file, "utf8");
                    await sock.sendMessage(from, { text: `✅ Prefix berhasil diubah ke *${newPrefix}*` }, { quoted: m });
                } catch (err) {
                    console.error("❌ Gagal ubah prefix:", err);
                    await sock.sendMessage(from, { text: messages.error }, { quoted: m });
                }
                break;

            // === LIHAT PREFIX ===
            case "prefix":
                await sock.sendMessage(from, { text: `🔹 Prefix saat ini: *${bot.prefix}*` }, { quoted: m });
                break;

            // === RESET PREFIX ===
            case "resetprefix":
                if (!isOwner)
                    return sock.sendMessage(from, { text: messages.onlyOwner }, { quoted: m });

                bot.prefix = "!";
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
            await sock.sendMessage(from, { text: messages.wait }, { quoted: m });
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
        await sock.sendMessage(from, { text: `📸 Kirim gambar/video dengan caption ${bot.prefix}s` }, { quoted: m });
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
