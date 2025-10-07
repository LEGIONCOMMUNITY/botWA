const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");
let setting = require("./setting");

const stickerMaker = new StickerMaker();
const settingPath = path.join(__dirname, "setting.js");

module.exports = async (sock, m, body, from) => {
    const prefix = setting.prefix;
    const cmd = body.startsWith(prefix)
        ? body.slice(prefix.length).trim().toLowerCase()
        : null;
    if (!cmd) return;

    const args = cmd.split(/\s+/);
    const sender = m.key.participant || m.key.remoteJid;
    const senderNumber = sender.replace(/[^0-9]/g, "");
    const isOwner = senderNumber === setting.ownerNumber.replace(/[^0-9]/g, "");

    try {
        switch (true) {
            // ===== MENU =====
            case cmd === "menu":
            case cmd === "help":
            case cmd === "start":
                const fullMenu = createMenu();
                await sock.sendMessage(from, { text: fullMenu }, { quoted: m });
                break;

            // ===== OWNER INFO =====
            case cmd === "owner":
                await sock.sendMessage(from, {
                    text: `👑 *OWNER BOT*\n\n📞 *Nomor*: +${setting.ownerNumber}\n💻 *Platform*: Node.js\n⚡ *Version*: ${setting.version}\n\nButuh bantuan? Chat owner!`,
                }, { quoted: m });
                break;

            // ===== INFO BOT =====
            case cmd === "infobot":
                const uptime = formatUptime(process.uptime());
                const info = `
╭━━━〔 🤖 *${setting.botName}* 〕━━━╮
┃ ⚙️ Prefix : ${setting.prefix}
┃ 👑 Owner  : ${setting.ownerNumber}
┃ 💻 Mode   : ${setting.mode}
┃ 📱 Platform: Baileys
┃ 🕒 Uptime  : ${uptime}
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ *Terima kasih telah menggunakan ${setting.botName}!*`;
                await sock.sendMessage(from, { text: info }, { quoted: m });
                break;

            // ===== PING =====
            case cmd === "ping":
                const start = Date.now();
                await sock.sendMessage(from, { text: "🏓 Testing ping..." }, { quoted: m });
                const latency = Date.now() - start;
                await sock.sendMessage(from, {
                    text: `✨ *PONG!*\n\n⨳ *Speed:* ${latency} ms\n⨳ *Runtime:* ${process.uptime().toFixed(2)}s\n⨳ *Status:* Active ✅`,
                }, { quoted: m });
                break;

            // ===== STIKER DARI MEDIA =====
            case cmd === "s":
            case cmd === "stiker":
            case cmd === "sticker":
                await handleSticker(sock, m, from);
                break;

            // ===== STIKER TEKS =====
            case cmd.startsWith("stikertxt"):
            case cmd.startsWith("textsticker"):
                const text = args.slice(1).join(" ");
                if (!text) {
                    await sock.sendMessage(from, {
                        text: `📝 *Cara Buat Stiker Teks:*\n\n${prefix}stikertxt [teks]\nContoh: ${prefix}stikertxt Hello World`,
                    }, { quoted: m });
                    return;
                }
                await handleTextSticker(sock, m, from, text);
                break;

            // ===== STEAL STIKER =====
            case cmd === "take":
            case cmd === "steal":
                if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                    await handleQuotedSticker(sock, m, from);
                } else {
                    await sock.sendMessage(from, {
                        text: `🎯 *Cara Steal Sticker:*\n\nReply stiker dengan caption ${prefix}take`,
                    }, { quoted: m });
                }
                break;

            // ===== RUNTIME =====
            case cmd === "runtime":
                const up = formatUptime(process.uptime());
                await sock.sendMessage(from, {
                    text: `⏰ *RUNTIME BOT*\n\n${up}`,
                }, { quoted: m });
                break;

            // ===== UBAH PREFIX =====
            case cmd.startsWith("setprefix"): {
                if (!isOwner) {
                    await sock.sendMessage(from, { text: "❌ Hanya owner yang dapat mengubah prefix!" }, { quoted: m });
                    return;
                }

                const newPrefix = args[1];
                if (!newPrefix) {
                    await sock.sendMessage(from, {
                        text: `⚙️ *Cara pakai:*\n${prefix}setprefix [prefix baru]\n\nContoh: ${prefix}setprefix ?`,
                    }, { quoted: m });
                    return;
                }

                // Update di memori
                setting.prefix = newPrefix;

                // Update di file
                let fileData = fs.readFileSync(settingPath, "utf8");
                fileData = fileData.replace(/prefix:\s*['"`].*?['"`]/, `prefix: '${newPrefix}'`);
                fs.writeFileSync(settingPath, fileData);

                await sock.sendMessage(from, {
                    text: `✅ Prefix berhasil diubah menjadi: *${newPrefix}*`,
                }, { quoted: m });
                break;
            }

            // ===== LIHAT PREFIX =====
            case cmd === "prefix":
                await sock.sendMessage(from, {
                    text: `🔹 Prefix saat ini: *${setting.prefix}*`,
                }, { quoted: m });
                break;

            // ===== RESET PREFIX =====
            case cmd === "resetprefix":
                if (!isOwner) {
                    await sock.sendMessage(from, { text: "❌ Hanya owner yang bisa reset prefix!" }, { quoted: m });
                    return;
                }

                let resetFile = fs.readFileSync(settingPath, "utf8");
                resetFile = resetFile.replace(/prefix:\s*['"`].*?['"`]/, `prefix: '!'`);
                fs.writeFileSync(settingPath, resetFile);
                setting.prefix = "!";

                await sock.sendMessage(from, {
                    text: `🔄 Prefix berhasil direset ke default: *!*`,
                }, { quoted: m });
                break;

            // ===== DEFAULT =====
            default:
                if (body.startsWith(prefix)) {
                    const simpleMenu = createSimpleMenu();
                    await sock.sendMessage(from, {
                        text: `❌ Command *${body}* tidak dikenali.\n\n${simpleMenu}`,
                    }, { quoted: m });
                }
                break;
        }
    } catch (error) {
        console.error("Error in command handler:", error);
        await sock.sendMessage(from, {
            text: `❌ Terjadi error: ${error.message}`,
        }, { quoted: m });
    }
};

// ===== FUNCTION TAMBAHAN =====

async function handleSticker(sock, m, from) {
    if (m.message.imageMessage || m.message.videoMessage) {
        try {
            await sock.sendMessage(from, { text: "⏳ Sedang membuat stiker..." }, { quoted: m });

            const media = m.message.imageMessage || m.message.videoMessage;
            const mediaType = m.message.imageMessage ? "image" : "video";

            if (mediaType === "video" && media.seconds > 10) {
                await sock.sendMessage(from, { text: "❌ Video terlalu panjang! Maksimal 10 detik." }, { quoted: m });
                return;
            }

            const stickerBuffer = await stickerMaker.createSticker(media, mediaType);
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
        } catch (error) {
            console.error("Error membuat stiker:", error);
            await sock.sendMessage(from, { text: `❌ Gagal membuat stiker: ${error.message}` }, { quoted: m });
        }
    } else {
        await sock.sendMessage(from, {
            text: `📸 *CARA BUAT STIKER:*\n
🎨 Dari Gambar/Video → kirim media + caption *${setting.prefix}s*
📝 Dari Teks → ${setting.prefix}stikertxt [teks]
🎯 Steal Stiker → reply stiker pakai *${setting.prefix}take*`,
        }, { quoted: m });
    }
}

async function handleTextSticker(sock, m, from, text) {
    try {
        const stickerBuffer = await stickerMaker.textToSticker(text);
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
    } catch (error) {
        console.error("Error membuat stiker teks:", error);
        await sock.sendMessage(from, { text: `❌ Gagal membuat stiker teks: ${error.message}` }, { quoted: m });
    }
}

async function handleQuotedSticker(sock, m, from) {
    try {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quotedMsg.stickerMessage) {
            await sock.sendMessage(from, { sticker: { url: quotedMsg.stickerMessage.url } }, { quoted: m });
        } else {
            await sock.sendMessage(from, { text: "❌ Pesan yang di-reply bukan stiker!" }, { quoted: m });
        }
    } catch (error) {
        console.error("Error steal stiker:", error);
        await sock.sendMessage(from, { text: `❌ Gagal mengambil stiker: ${error.message}` }, { quoted: m });
    }
}

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h} jam ${m} menit ${s} detik`;
}
