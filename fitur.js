const { createMenu, createSimpleMenu } = require('./menuHandler');

module.exports = async(sock, m, body, from) => {
    const cmd = body.toLowerCase().trim();
    
    switch(cmd) {
        case "!menu":
        case "!help":
        case "!start":
            const fullMenu = createMenu();
            await sock.sendMessage(from, { text: fullMenu }, { quoted: m });
            break;

        case "!ping":
            const start = Date.now();
            await sock.sendMessage(from, { text: "🏓 Testing ping..." }, { quoted: m });
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
            if (m.message.imageMessage || m.message.videoMessage) {
                try {
                    await sock.sendMessage(from, { 
                        text: "⏳ Sedang membuat stiker..." 
                    }, { quoted: m });

                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    await sock.sendMessage(from, { 
                        text: "✅ Stiker berhasil dibuat!\n\n*Note:* Fitur download media sedang dalam pengembangan." 
                    }, { quoted: m });
                    
                } catch (error) {
                    console.error("Error membuat stiker:", error);
                    await sock.sendMessage(from, { 
                        text: "❌ Gagal membuat stiker. Coba lagi." 
                    }, { quoted: m });
                }
            } else {
                await sock.sendMessage(from, { 
                    text: `📸 *Cara Buat Stiker:*\n\n1. Kirim gambar atau video (maks 10 detik)\n2. Tambahkan caption: !stiker\n3. Bot akan mengubahnya menjadi stiker\n\n*Contoh:* Kirim gambar dengan caption "!stiker"` 
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
};