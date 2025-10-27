const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { createMenu, createSimpleMenu } = require("./MENU/menuHandler");
const StickerMaker = require("./MENU/stickerHandler");
const setting = require("./setting");
const youtubeAudio = require("./MENU/ytAudio");

const stickerMaker = new StickerMaker();

module.exports = async (varz, m, body, from) => {
    const bot = setting.bot;
    const args = body.trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const query = args.join(" ");
    
    try {
        switch (command) {
            // 📜 MENU
            case `${bot.prefix}menu`:
            case `${bot.prefix}help`:
            case `${bot.prefix}start`: {
                const fullMenu = createMenu();
                await varz.sendMessage(from, { text: fullMenu }, { quoted: m });
                break;
            }

            // 🏓 PING
            case `${bot.prefix}ping`: {
                const start = Date.now();
                await varz.sendMessage(from, { text: `🏓 Testing ping...` }, { quoted: m });
                const latency = Date.now() - start;
                await varz.sendMessage(
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
                await varz.sendMessage(
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

                await varz.sendMessage(from, { text: botInfo }, { quoted: m });
                break;
            }

            // 🎨 STIKER GAMBAR / VIDEO
            case `${bot.prefix}stiker`:
            case `${bot.prefix}s`: {
                await varz.sendMessage(from, { text: "⏳ Sedang membuat stiker..." }, { quoted: m });

                let mediaType = null;
                if (m.message?.imageMessage) mediaType = "image";
                else if (m.message?.videoMessage) mediaType = "video";

                if (!mediaType) {
                    await varz.sendMessage(
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
                        varz,
                        downloadMediaMessage
                    );
                    await varz.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
                } catch (err) {
                    console.error(err);
                    await varz.sendMessage(
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
                    await varz.sendMessage(
                        from,
                        {
                            text: `📝 *Cara Buat Stiker Teks:*\n\n${bot.prefix}stikertxt [teks]\n\nContoh: ${bot.prefix}stikertxt Hello World`,
                        },
                        { quoted: m }
                    );
                    return;
                }
                if (text.length > 50) {
                    await varz.sendMessage(
                        from,
                        { text: "❌ Teks terlalu panjang! Maksimal 50 karakter." },
                        { quoted: m }
                    );
                    return;
                }
                await handleTextSticker(varz, m, from, text);
                break;
            }

            // 🥷 STEAL STIKER
            case `${bot.prefix}take`:
            case `${bot.prefix}steal`: {
                if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    await handleQuotedSticker(varz, m, from);
                } else {
                    await varz.sendMessage(
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
                await varz.sendMessage(
                    from,
                    { text: `⏰ *RUNTIME BOT*\n\n${hours} jam ${minutes} menit ${seconds} detik` },
                    { quoted: m }
                );
                break;
            }

            case `${bot.prefix}ytsearch`: {
                const { searchYouTube } = require("./MENU/ytSearch");
                if (!query) {
                    await varz.sendMessage(from, { text: `📝 Contoh: ${bot.prefix}ytsearch Alan Walker` }, { quoted: m });
                    return;
                }

                await varz.sendMessage(from, { text: "🔎 Mencari di YouTube..." }, { quoted: m });
                const hasil = await searchYouTube(query);
                await varz.sendMessage(from, { text: hasil }, { quoted: m });
                break;
            }

            case `${bot.prefix}ytvideo`: {
                const { downloadYouTubeVideo } = require("./MENU/ytVideo");
                if (!query) {
                    await varz.sendMessage(from, { text: `📝 Contoh: ${bot.prefix}ytvideo Alan Walker Faded` }, { quoted: m });
                    return;
                }
            
                await varz.sendMessage(from, { text: "⏳ Sedang mendownload video dari YouTube..." }, { quoted: m });
            
                try {
                    const result = await downloadYouTubeVideo(query);
                    await varz.sendMessage(
                        from,
                        {
                            video: result.buffer,
                            caption: `🎬 *${result.title}*\n🔗 ${result.url}`,
                            mimetype: "video/mp4",
                        },
                        { quoted: m }
                    );
                } catch (error) {
                    console.error("YTVideo Error:", error);
                    await varz.sendMessage(from, { text: `❌ ${error.message}` }, { quoted: m });
                }
                break;
            }

            case `${bot.prefix}ytaudio`: {
                const ytAudio = require('./MENU/ytAudio');

                await ytAudio(varz, m, from, args.join(" "));
                break;
            }

            case `${bot.prefix}wallpaper`: {
                const wallpaperHD = require("./MENU/wallpaper");

                await wallpaperHD(varz, m, from, args);
                break;
            }

            // ❌ COMMAND TIDAK DIKENAL
            default: {
                if (body.startsWith(bot.prefix)) {
                    const simpleMenu = createSimpleMenu();
                    await varz.sendMessage(
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
        await varz.sendMessage(from, { text: `❌ Terjadi error: ${error.message}` }, { quoted: m });
    }
};

// ===============================
// HANDLER STIKER TEKS
// ===============================
async function handleTextSticker(varz, m, from, text) {
    try {
        await varz.sendMessage(from, { text: "⏳ Membuat stiker teks..." }, { quoted: m });
        const stickerBuffer = await stickerMaker.textToSticker(text);
        await varz.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
        await varz.sendMessage(from, { text: "✅ Stiker teks berhasil dibuat!" }, { quoted: m });
    } catch (error) {
        console.error("Error membuat stiker teks:", error);
        await varz.sendMessage(from, { text: `❌ Gagal membuat stiker teks: ${error.message}` }, { quoted: m });
    }
}

// ===============================
// HANDLER STEAL STIKER
// ===============================
async function handleQuotedSticker(varz, m, from) {
    try {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quotedMsg.stickerMessage) {
            await varz.sendMessage(from, { text: "✅ Stiker berhasil diambil!" }, { quoted: m });
            await varz.sendMessage(from, { sticker: quotedMsg.stickerMessage }, { quoted: m });
        } else {
            await varz.sendMessage(from, { text: "❌ Pesan yang di-reply bukan stiker!" }, { quoted: m });
        }
    } catch (error) {
        console.error("Error steal stiker:", error);
        await varz.sendMessage(from, { text: `❌ Gagal mengambil stiker: ${error.message}` }, { quoted: m });
    }
}
