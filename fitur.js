const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");
const { bot, display, getUptime } = require("./setting");
let setting = require("./setting");

const stickerMaker = new StickerMaker();
const settingPath = path.join(__dirname, "setting.js");

module.exports = async (sock, m, body, from) => {
    const args = cmd.split(/\s+/);
    const prefix = setting.prefix;
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().toLowerCase() : null;
    if (!cmd) return;

    const sender = m.key.participant || m.key.remoteJid;
    const isOwner = sender.replace(/[^0-9]/g, '') === setting.ownerNumber.replace(/[^0-9]/g, '');


    try {
        switch (true) {

            // ========== MENU ==========
            case cmd === `${prefix}menu`:
            case cmd === `${prefix}help`:
            case cmd === `${prefix}start`:
                const fullMenu = createMenu();
                await sock.sendMessage(from, { text: fullMenu }, { quoted: m });
                break;

            // ========== OWNER INFO ==========
            case cmd === `${prefix}owner`:
                await sock.sendMessage(from, {
                    text: `👑 *OWNER BOT*\n\n📞 *Nomor*: ${bot.ownerNumber}\n💻 *Platform*: ${bot.platform}\n⚡ *Version*: ${bot.version}\n\nButuh bantuan? Chat owner!`,
                }, { quoted: m });
                break;

            // ========== BOT INFO ==========
            case cmd === `${prefix}infobot`:
                const uptime = getUptime();
                const info = `
╭━━━〔 🤖 *${bot.name}* 〕━━━╮
┃ ⚙️ Prefix : ${bot.prefix}
┃ 👑 Owner  : ${bot.ownerName}
┃ 💻 Mode   : ${bot.aiMode ? "AI Aktif ✅" : "AI Nonaktif ❌"}
┃ 📱 Platform: ${bot.platform}
┃ 🕒 Uptime  : ${uptime}
╰━━━━━━━━━━━━━━━━━━━━━━╯

✨ *Terima kasih telah menggunakan ${bot.name}!*`;
                await sock.sendMessage(from, { text: info }, { quoted: m });
                break;

            // ========== PING ==========
            case cmd === `${prefix}ping`:
                const start = Date.now();
                await sock.sendMessage(from, { text: "🏓 Testing ping..." }, { quoted: m });
                const latency = Date.now() - start;
                await sock.sendMessage(from, {
                    text: `✨ *PONG!*\n\n⨳ *Speed*: ${latency} ms\n⨳ *Runtime*: ${process.uptime().toFixed(2)}s\n⨳ *Status*: Active ✅`,
                }, { quoted: m });
                break;

            // ========== STIKER ==========
            case cmd === `${prefix}stiker`:
            case cmd === `${prefix}s`:
                await handleSticker(sock, m, from);
                break;

            // ========== STIKER TEKS ==========
            case cmd.startsWith(`${prefix}stikertxt`):
            case cmd.startsWith(`${prefix}textsticker`):
                const text = body.replace(/^!(stikertxt|textsticker)\s*/i, "").trim();
                if (!text) {
                    await sock.sendMessage(from, {
                        text: `📝 *Cara Buat Stiker Teks:*\n\n${prefix}stikertxt [teks]\nContoh: ${prefix}stikertxt Hello World`,
                    }, { quoted: m });
                    return;
                }
                await handleTextSticker(sock, m, from, text);
                break;

            // ========== TAKE STIKER ==========
            case cmd === `${prefix}take`:
            case cmd === `${prefix}steal`:
                if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                    await handleQuotedSticker(sock, m, from);
                } else {
                    await sock.sendMessage(from, {
                        text: `🎯 *Cara Steal Sticker:*\n\nReply stiker dengan caption ${prefix}take`,
                    }, { quoted: m });
                }
                break;

            // ========== RUNTIME ==========
            case cmd === `${prefix}runtime`:
                const up = process.uptime();
                const hours = Math.floor(up / 3600);
                const minutes = Math.floor((up % 3600) / 60);
                const seconds = Math.floor(up % 60);
                await sock.sendMessage(from, {
                    text: `⏰ *RUNTIME BOT*\n\n${hours} jam ${minutes} menit ${seconds} detik`,
                }, { quoted: m });
                break;

            // ========== UBAH PREFIX (OWNER SAJA) ==========
            case cmd.startsWith("setprefix"): {
                if (!isOwner) {
                    await sock.sendMessage(from, { text: "❌ Hanya owner yang dapat mengubah prefix!" }, { quoted: m });
                    return;
                }

                const args = cmd.split(" ");
                const newPrefix = args[1];
                if (!newPrefix) {
                    await sock.sendMessage(from, { text: `⚙️ *Cara pakai:*\n${prefix}setprefix [prefix baru]\n\nContoh: ${prefix}setprefix ?` }, { quoted: m });
                    return;
                }

                // Update di memori
                setting.prefix = newPrefix;

                // Update di file setting.js
                let settingData = fs.readFileSync(settingPath, "utf8");
                settingData = settingData.replace(/prefix:\s*['"`].*?['"`]/, `prefix: '${newPrefix}'`);
                fs.writeFileSync(settingPath, settingData);

                await sock.sendMessage(from, { text: `✅ Prefix berhasil diubah menjadi: *${newPrefix}*` }, { quoted: m });
                break;
            }

            // ========== LIHAT PREFIX ==========
            case cmd === `${prefix}prefix`:
                await sock.sendMessage(from, { text: `🔹 Prefix saat ini: *${bot.prefix}*` }, { quoted: m });
                break;

            // ========== RESET PREFIX ==========
            case cmd === `${prefix}resetprefix`: {
                if (!sender.includes(bot.ownerNumber))
                    return sock.sendMessage(from, { text: "❌ Hanya owner yang bisa reset prefix!" }, { quoted: m });

                let file = fs.readFileSync(settingPath, "utf8");
                file = file.replace(/prefix:\s*["'`].*?["'`]/, `prefix: "!"`);
                fs.writeFileSync(settingPath, file, "utf8");

                await sock.sendMessage(from, { text: `🔄 Prefix berhasil direset ke default: *!*` }, { quoted: m });
                break;
            }

            // ========== COMMAND TIDAK DIKENAL ==========
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

// ====== HANDLER TAMBAHAN ======

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
🎨 *Dari Gambar/Video:* Kirim media + caption *${bot.prefix}s*
📝 *Dari Teks:* ${bot.prefix}stikertxt [teks]
🎯 *Steal:* Reply stiker pakai *${bot.prefix}take*`
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
