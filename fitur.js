const { createMenu, createSimpleMenu } = require('./menuHandler');
const StickerMaker = require('./stickerHandler');

const stickerMaker = new StickerMaker();

module.exports = async(sock, m, body, from) => {
    const cmd = body.toLowerCase().trim();
    
    try {
        switch(cmd) {
            case "!menu":
            case "!help":
            case "!start":
                const fullMenu = createMenu();
                await sock.sendMessage(from, { text: fullMenu }, { quoted: m });
                break;

            case "!ping":
                const start = Date.now();
                const pingMsg = await sock.sendMessage(from, { text: "🏓 Testing ping..." }, { quoted: m });
                const latency = Date.now() - start;
                await sock.sendMessage(from, { 
                    text: `✨ *PONG!*\n\n⨳ *Speed*: ${latency} ms\n⨳ *Runtime*: ${process.uptime().toFixed(2)}s\n⨳ *Status*: Active ✅` 
                }, { quoted: m });
                break;

            case "!owner":
                await sock.sendMessage(from, { 
                    text: `👑 *OWNER BOT*\n\n📞 *Nomor*: +62882003684270\n💻 *Platform*: Node.js\n⚡ *Version*: 2.0\n\nButuh bantuan? Chat owner!` 
                }, { quoted: m });
                break;

            case "!infobot":
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

            case "!stiker":
            case "!s":
            case "!sticker":
                await handleSticker(sock, m, from);
                break;

            case "!stikertxt":
            case "!textsticker":
                const text = body.replace(/^!(stikertxt|textsticker)\s*/i, '').trim();
                if (!text) {
                    await sock.sendMessage(from, { 
                        text: `📝 *Cara Buat Stiker Teks:*\n\n!stikertxt [teks]\n\nContoh: !stikertxt Hello World` 
                    }, { quoted: m });
                    return;
                }
                if (text.length > 50) {
                    await sock.sendMessage(from, { 
                        text: "❌ Teks terlalu panjang! Maksimal 50 karakter." 
                    }, { quoted: m });
                    return;
                }
                await handleTextSticker(sock, m, from, text);
                break;

            case "!take":
            case "!steal":
                if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                    await handleQuotedSticker(sock, m, from);
                } else {
                    await sock.sendMessage(from, { 
                        text: `🎯 *Cara Steal Sticker:*\n\nReply stiker dengan caption !take atau !steal` 
                    }, { quoted: m });
                }
                break;

            case "!runtime":
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                
                await sock.sendMessage(from, { 
                    text: `⏰ *RUNTIME BOT*\n\n${hours} jam ${minutes} menit ${seconds} detik` 
                }, { quoted: m });
                break;

            default:
                if (body.startsWith("!")) {
                    const simpleMenu = createSimpleMenu();
                    await sock.sendMessage(from, { 
                        text: `❌ Command *${body}* tidak dikenali.\n\n${simpleMenu}` 
                    }, { quoted: m });
                }
                break;
        }
    } catch (error) {
        console.error('Error in command handler:', error);
        await sock.sendMessage(from, { 
            text: `❌ Terjadi error: ${error.message}` 
        }, { quoted: m });
    }
};

// Handler untuk stiker dari gambar/video
async function handleSticker(sock, m, from) {
    if (m.message.imageMessage || m.message.videoMessage) {
        try {
            const processingMsg = await sock.sendMessage(from, { 
                text: "⏳ Sedang membuat stiker..." 
            }, { quoted: m });

            const media = m.message.imageMessage || m.message.videoMessage;
            const mediaType = m.message.imageMessage ? 'image' : 'video';
            
            // Cek durasi video
            if (mediaType === 'video' && media.seconds > 10) {
                await sock.sendMessage(from, { 
                    text: "❌ Video terlalu panjang! Maksimal 10 detik." 
                }, { quoted: m });
                return;
            }
            
            const stickerBuffer = await stickerMaker.createSticker(media, mediaType);
            
            await sock.sendMessage(from, { 
                sticker: stickerBuffer 
            }, { quoted: m });

            await sock.sendMessage(from, { 
                text: "✅ Stiker berhasil dibuat!" 
            }, { quoted: m });

        } catch (error) {
            console.error("Error membuat stiker:", error);
            await sock.sendMessage(from, { 
                text: `❌ Gagal membuat stiker: ${error.message}` 
            }, { quoted: m });
        }
    } else {
        await sock.sendMessage(from, { 
            text: `📸 *CARA BUAT STIKER:*\n
🎨 *Dari Gambar/Video:*
• Kirim gambar/video (maks 10 detik)
• Tambah caption: !stiker

📝 *Dari Teks:*
• !stikertxt [teks]

🎯 *Steal Stiker:*
• Reply stiker: !take

⚡ *Shortcut:* !s (untuk gambar/video)` 
        }, { quoted: m });
    }
}

// Handler untuk stiker dari teks
async function handleTextSticker(sock, m, from, text) {
    try {
        await sock.sendMessage(from, { 
            text: "⏳ Membuat stiker teks..." 
        }, { quoted: m });

        const stickerBuffer = await stickerMaker.textToSticker(text);
        
        await sock.sendMessage(from, { 
            sticker: stickerBuffer 
        }, { quoted: m });

        await sock.sendMessage(from, { 
            text: "✅ Stiker teks berhasil dibuat!" 
        }, { quoted: m });

    } catch (error) {
        console.error("Error membuat stiker teks:", error);
        await sock.sendMessage(from, { 
            text: `❌ Gagal membuat stiker teks: ${error.message}` 
        }, { quoted: m });
    }
}

// Handler untuk steal stiker
async function handleQuotedSticker(sock, m, from) {
    try {
        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (quotedMsg.stickerMessage) {
            await sock.sendMessage(from, { 
                text: "✅ Stiker berhasil diambil!" 
            }, { quoted: m });
            
            // Forward stiker asli
            await sock.sendMessage(from, { 
                sticker: { 
                    url: quotedMsg.stickerMessage.url 
                } 
            }, { quoted: m });
        } else {
            await sock.sendMessage(from, { 
                text: "❌ Pesan yang di-reply bukan stiker!" 
            }, { quoted: m });
        }
    } catch (error) {
        console.error("Error steal stiker:", error);
        await sock.sendMessage(from, { 
            text: `❌ Gagal mengambil stiker: ${error.message}` 
        }, { quoted: m });
    }
}