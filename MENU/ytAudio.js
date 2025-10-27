const downloadYouTubeAudio = require("../lib/ytAudioHandler");
const fs = require("fs");

module.exports = async (varz, m, from, text) => {
    try {
        if (!text) return varz.sendMessage(from, { text: "❌ Kirim link YouTube!\nContoh: .yta https://youtu.be/xxxx" });

        const { file, title, thumbnail } = await downloadYouTubeAudio(text);

        await varz.sendMessage(from, { 
            image: { url: thumbnail },
            caption: `🎵 *${title}*\nSedang dikirim audionya...`
        });

        await varz.sendMessage(from, { 
            audio: { url: file },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        });

        fs.unlinkSync(file); // hapus file setelah dikirim (biar ga menumpuk)

    } catch (err) {
        console.error(err);
        varz.sendMessage(from, { text: "❌ Gagal proses audio!" });
    }
};
