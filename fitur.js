module.exports = async (varz, m, body, from) => {
    switch(body.toLowerCase()) {
        case "!menu":
            const menuText = `
╔════════《✧》════════╗
         🤖 *BOT MENU*

📋 *Available Commands:*
• !ping
• !menu
• !sticker

Silakan pilih menu di atas!
╚════════《✧》════════╝
            `;
            await varz.sendMessage(from, { text: menuText });
            break;
            case "!stiker":
            case "!s":
            case "!sticker":
                if (m.message.imageMessage) {
                    try {
                        await sock.sendMessage(from, { 
                            text: "⏳ Sedang membuat stiker..." 
                        }, { quoted: m });
                        
                        // Download gambar
                        const buffer = await sock.downloadMediaMessage(m);
                        
                        // Kirim sebagai stiker
                        await sock.sendMessage(from, { 
                            sticker: Buffer.from(buffer)
                        }, { quoted: m });
                        
                    } catch (error) {
                        console.error("Error membuat stiker:", error);
                        await sock.sendMessage(from, { 
                            text: "❌ Gagal membuat stiker. Coba lagi." 
                        }, { quoted: m });
                    }
                } 
                else if (m.message.videoMessage) {
                    const duration = m.message.videoMessage.seconds;
                    if (duration > 10) {
                        await sock.sendMessage(from, { 
                            text: "❌ Video terlalu panjang! Maksimal 10 detik untuk stiker." 
                        }, { quoted: m });
                        return;
                    }
                    
                    try {
                        await sock.sendMessage(from, { 
                            text: "⏳ Sedang membuat stiker dari video..." 
                        }, { quoted: m });
                        
                        const buffer = await sock.downloadMediaMessage(m);
                        await sock.sendMessage(from, { 
                            sticker: Buffer.from(buffer)
                        }, { quoted: m });
                        
                    } catch (error) {
                        console.error("Error membuat stiker video:", error);
                        await sock.sendMessage(from, { 
                            text: "❌ Gagal membuat stiker dari video." 
                        }, { quoted: m });
                    }
                }
                else {
                    await sock.sendMessage(from, { 
                        text: `📸 *Cara Buat Stiker:*\n\n1. Kirim gambar atau video (maks 10 detik)\n2. Tambahkan caption: !stiker\n3. Bot akan mengubahnya menjadi stiker\n\nContoh: Kirim gambar dengan caption "!stiker"`
                    }, { quoted: m });
                }
                break
    }
}