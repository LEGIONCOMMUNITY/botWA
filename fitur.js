const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");
const setting = require("./setting");

const stickerMaker = new StickerMaker();

module.exports = async (sock, m, body, from) => {
    const cmd = body.toLowerCase().trim();

    try {
        const bot = setting;

        switch (cmd) {
            // 📜 MENU
            case `${bot.prefix}menu`:
            case `${bot.prefix}help`:
            case `${bot.prefix}start`: {
                const fullMenu = createMenu();
                await sock.sendMessage(from, { text: fullMenu }, { quoted: m });
                break;
            }

            // 🏓 PING
            case `${bot.prefix}ping`: {
                const start = Date.now();
                await sock.sendMessage(from, { text: `🏓 Testing ping...` }, { quoted: m });
                const latency = Date.now() - start;
                await sock.sendMessage(
                    from,
                    {
                        text: `✨ *PONG!*\n\n⨳ *Speed*: ${latency} ms\n⨳ *Runtime*: ${process.uptime().toFixed(
                            2
                        )}s\n⨳ *Status*: Active ✅`,
                    },
                    { quoted: m }
                );
                break;
            }

            // 👑 OWNER
            case `${bot.prefix}owner`: {
                await sock.sendMessage(
                    from,
                    {
                        text: `👑 *OWNER BOT*\n\n📞 *Nomor*: +62882003684270\n💻 *Platform*: Node.js\n⚡ *Version*: 2.0\n\nButuh bantuan? Chat owner!`,
                    },
                    { quoted: m }
                );
                break;
            }

            // ℹ️ INFO BOT
            case `${bot.prefix}infobot`: {
                const botInfo = `
🌟 *BOT INFORMATION*

⨳ *Name*: Varz Bot
⨳ *Version*: 2.0.0  
⨳ *Platform*: Baileys
⨳ *Owner*: +62882003684270
⨳ *Mode*: Public
⨳ *Language*: JavaScript

🕒 *SYSTEM INFO*
⨳ *Uptime*: ${process.uptime().toFixed(2)}s
⨳ *Memory*: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
⨳ *Node.js*: ${process.version}

✨ *Thanks for using this bot!*`;

                await sock.sendMessage(from, { text: botInfo }, { quoted: m });
                break;
            }

            // 🎨 STIKER GAMBAR / VIDEO
            case `${bot.prefix}stiker`:
            case `${bot.prefix}s`: {
                await sock.sendMessage(from, { text: "⏳ Sedang membuat stiker..." }, { quoted: m });

                let mediaType = null;
                if (m.message?.imageMessage) mediaType = "image";
                else if (m.message?.videoMessage) mediaType = "video";

                if (!mediaType) {
                    await sock.sendMessage(
                        from,
                        { text: `❌ Kirim gambar/video dengan caption *${bot.prefix}s*` },
                        { quoted: m }
                    );
                    return;
                }

                try {
                    const stickerBuffer = await stickerMaker.createSticker(
                        m,
                        mediaType,
                        sock,
                        downloadMediaMessage
                    );
                    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
                } catch (err) {
                    console.error(err);
                    await sock.sendMessage(
                        from,
                        { text: `❌ Gagal membuat stiker:\n${err.message}` },
                        { quoted: m }
                    );
                }
                break;
            }

            // 📝 STIKER TEKS
            case `${bot.prefix}stikertxt`:
            case `${bot.prefix}textsticker`: {
                const text = body
                    .replace(new RegExp(`^\\${bot.prefix}(stikertxt|textsticker)`, "i"), "")
                    .trim();

                if (!text) {
                    await sock.sendMessage(
                        from,
                        {
                            text: `📝 *Cara Buat Stiker Teks:*\n\n${bot.prefix}stikertxt [teks]\n\nContoh: ${bot.prefix}stikertxt Hello World`,
                        },
                        { quoted: m }
                    );
                    return;
                }
                if (text.length > 50) {
                    await sock.sendMessage(
                        from,
                        { text: "❌ Teks terlalu panjang! Maksimal 50 karakter." },
                        { quoted: m }
                    );
                    return;
                }
                await handleTextSticker(sock, m, from, text);
                break;
            }

            // 🥷 STEAL STIKER
            case `${bot.prefix}take`:
            case `${bot.prefix}steal`: {
                if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    await handleQuotedSticker(sock, m, from);
                } else {
                    await sock.sendMessage(
                        from,
                        {
                            text: `🎯 *Cara Steal Sticker:*\n\nReply stiker dengan caption *${bot.prefix}take* atau *${bot.prefix}steal*`,
                        },
                        { quoted: m }
                    );
                }
                break;
            }

            // ⏰ RUNTIME
            case `${bot.prefix}runtime`: {
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                await sock.sendMessage(
                    from,
                    { text: `⏰ *RUNTIME BOT*\n\n${hours} jam ${minutes} menit ${seconds} detik` },
                    { quoted: m }
                );
                break;
            }

            // ❌ COMMAND TIDAK DIKENAL
            default: {
                if (body.startsWith(bot.prefix)) {
                    const simpleMenu = createSimpleMenu();
                    await sock.sendMessage(
                        from,
                        {
                            text: `❌ Command *${body}* tidak dikenali.\n\n${simpleMenu}`,
                        },
                        { quoted: m }
                    );
                }
                break;
            }
        }
    } catch (error) {
        console.error("Error in command handler:", error);
        await sock.sendMessage(from, { text: `❌ Terjadi error: ${error.message}` }, { quoted: m });
    }
};

// ===============================
// HANDLER STIKER TEKS
// ===============================
async function handleTextSticker(sock, m, from, text) {
    try {
        await sock.sendMessage(from, { text: "⏳ Membuat stiker teks..." }, { quoted: m });
        const stickerBuffer = await stickerMaker.textToSticker(text);
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
        await sock.sendMessage(from, { text: "✅ Stiker teks berhasil dibuat!" }, { quoted: m });
    } catch (error) {
        console.error("Error membuat stiker teks:", error);
        await sock.sendMessage(from, { text: `❌ Gagal membuat stiker teks: ${error.message}` }, { quoted: m });
    }
}

// ===============================
// HANDLER STEAL STIKER
// ===============================
async function handleQuotedSticker(sock, m, from) {
    try {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quotedMsg.stickerMessage) {
            await sock.sendMessage(from, { text: "✅ Stiker berhasil diambil!" }, { quoted: m });
            await sock.sendMessage(from, { sticker: quotedMsg.stickerMessage }, { quoted: m });
        } else {
            await sock.sendMessage(from, { text: "❌ Pesan yang di-reply bukan stiker!" }, { quoted: m });
        }
    } catch (error) {
        console.error("Error steal stiker:", error);
        await sock.sendMessage(from, { text: `❌ Gagal mengambil stiker: ${error.message}` }, { quoted: m });
    }
}
