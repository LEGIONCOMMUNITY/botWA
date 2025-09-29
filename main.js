const {
    makeWASockets,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const P = require("pino");
const { exec } = require("child_process");
const fitur = require("./fitur.js");

async function start() {
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState("./session");
    const varz = makeWASockets({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "silent" }))
        }
    })

    if (!varz.authState.creds.registered) {
        const phoneNumber = process.env.NUMBER || ""
        if(!phoneNumber) {
            console.log("Masukan No Telepon anda contoh: 628xxx");
            process.exit(0)
        }
        const code = await varz.requestPairingCode(phoneNumber);
        console.log("pairing code: ", code);
    }

    varz.ev.on("creds.update", saveCreds)
    varz.ev.on("message.upsert", async(msg) => {
        const m = msg.message[0]
        if(!m.message || m.key.fromMe) return
        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
        if(body.startsWith("!")) {
            await fitur(spck, m, body, from)
        }
    })
}

start()