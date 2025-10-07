const { default: makeWASocket, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const { downloadMediaMessage, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino")
const readline = require("readline")
const fitur = require("./fitur")

// Buat interface untuk input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState("./session")
        const varz = makeWASocket({
            logger: P({ level: "silent" }),
            printQRInTerminal: false, // QR dimatikan
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "silent" })),
            },
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        })

        varz.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update
            
            if (connection === "close") {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401
                console.log("❌ Koneksi terputus:", lastDisconnect?.error?.message || "Unknown error")
                
                if (shouldReconnect) {
                    console.log("🔄 Menghubungkan ulang dalam 5 detik...")
                    setTimeout(startBot, 5000)
                } else {
                    console.log("⚠️ Auth error, hapus folder session dan restart bot")
                }
            } 
            else if (connection === "open") {
                console.log("✅ Bot berhasil terhubung!")
            }
            else if (connection === "connecting") {
                console.log("🔄 Menghubungkan...")
                
                // Request pairing code jika belum registered
                if (!varz.authState.creds.registered) {
                    const phoneNumber = process.env.NUMBER
                    
                    if (!phoneNumber) {
                        console.log("\n📱 Masukkan nomor WA (contoh: 6281234567890):")
                        
                        rl.question("» ", async (number) => {
                            if (!number) {
                                console.log("❌ Nomor tidak boleh kosong!")
                                process.exit(0)
                            }
                            
                            // Format nomor
                            const formattedNumber = number.replace(/[^0-9]/g, '')
                            if (!formattedNumber.startsWith('62')) {
                                console.log("❌ Gunakan format 62 (Indonesia)")
                                process.exit(0)
                            }
                            
                            try {
                                const code = await varz.requestPairingCode(formattedNumber)
                                console.log(`\n🔑 Pairing Code: ${code}`)
                                console.log("➡️ Buka WhatsApp > Linked Devices > Link a Device > masukkan kode di atas\n")
                            } catch (error) {
                                console.log("❌ Gagal request pairing code:", error.message)
                                process.exit(0)
                            }
                        })
                    } else {
                        // Jika nomor sudah di set di environment variable
                        try {
                            const code = await varz.requestPairingCode(phoneNumber)
                            console.log(`\n🔑 Pairing Code: ${code}`)
                            console.log("➡️ Buka WhatsApp > Linked Devices > Link a Device > masukkan kode di atas\n")
                        } catch (error) {
                            console.log("❌ Gagal request pairing code:", error.message)
                            process.exit(0)
                        }
                    }
                }
            }
        })

        varz.ev.on("creds.update", saveCreds)

        varz.ev.on("messages.upsert", async (msg) => {
            try {
                const m = msg.messages[0]
                
                // Skip jika tidak ada message atau dari sendiri
                if (!m.message || m.key.fromMe) return

                const from = m.key.remoteJid
                const body = m.message.conversation || 
                           m.message.extendedTextMessage?.text || 
                           m.message.imageMessage?.caption || 
                           m.message.videoMessage?.caption || ""

                // Cek jika message adalah command
                if (body.startsWith("!")) {
                    await fitur(varz, m, body, from)
                }
            } catch (error) {
                console.error("Error processing message:", error)
            }
        })

        varz.ev.on("error", (error) => {
            console.error("Unexpected error:", error)
        })

    } catch (error) {
        console.error("Failed to start bot:", error)
        setTimeout(startBot, 10000)
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Bot dihentikan')
    rl.close()
    process.exit(0)
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

console.log("🤖 Starting WhatsApp Bot...")
startBot()