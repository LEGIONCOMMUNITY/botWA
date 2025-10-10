const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = async (varz, m, from, url) => {
    try {
        if (!ytdl.validateURL(url)) {
            await varz.sendMessage(from, { text: "❌ URL YouTube tidak valid!" });
            return;
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
        const filePath = path.resolve(__dirname, `${title}.mp3`);

        await varz.sendMessage(from, { text: `⏳ Sedang mendownload audio...\n🎧 Judul: ${info.videoDetails.title}` });

        await new Promise((resolve, reject) => {
            ytdl(url, { filter: "audioonly", quality: "highestaudio" })
                .pipe(fs.createWriteStream(filePath))
                .on("finish", resolve)
                .on("error", reject);
        });

        const audioBuffer = fs.readFileSync(filePath);

        await varz.sendMessage(from, {
            audio: audioBuffer,
            mimetype: "audio/mp4",
            fileName: `${title}.mp3`,
            ptt: false,
        });

        fs.unlinkSync(filePath);
    } catch (err) {
        console.error(err);
        await varz.sendMessage(from, { text: "❌ Gagal mendownload audio. Coba lagi." });
    }
};
