const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const { exec } = require("child_process")
const fitur = require("./fitur")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const varz = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "silent" })),
        }
    })

    if (!varz.authState.creds.registered) {
        const phoneNumber = process.env.NUMBER || "" // nomor WA kamu
        if (!phoneNumber) {
            console.log("❌ Masukkan nomor WA kamu (contoh: 628xxx)")
            process.exit(0)
        }
        const code = await varz.requestPairingCode(phoneNumber)
        console.log("🔑 Pairing Code:", code)
    }

    varz.ev.on("creds.update", saveCreds)

    varz.ev.on("messages.upsert", async (msg) => {
        const m = msg.messages[0]
        if (!m.message || m.key.fromMe) return

        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
        
        if (body.startsWith("!")) {
            await fitur(varz, m, body, from)
        }
    })
}

startBot()