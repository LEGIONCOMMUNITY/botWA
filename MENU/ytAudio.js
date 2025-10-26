const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (varz, m, from, args) => {
    try {
        if (!args[0]) {
            return varz.sendMessage(from, { text: "❌ Masukkan link atau judul YouTube!\nContoh: !ytaudio https://youtube.com/xxxxx" });
        }

        const url = args[0];

        // Cek apakah link valid
        if (!ytdl.validateURL(url)) {
            return varz.sendMessage(from, { text: "❌ Link YouTube tidak valid!" });
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
        const filePath = `./temp/${title}.mp3`;

        varz.sendMessage(from, { text: `🎵 Sedang mengunduh audio: *${title}* ... tunggu ya` });

        const stream = ytdl(url, { quality: "highestaudio" });

        ffmpeg(stream)
            .audioBitrate(128)
            .save(filePath)
            .on("end", async () => {
                await varz.sendMessage(from, {
                    audio: fs.readFileSync(filePath),
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`,
                });
                fs.unlinkSync(filePath);
            })
            .on("error", (err) => {
                console.log(err);
                varz.sendMessage(from, { text: "❌ Error saat convert audio!" });
            });

    } catch (err) {
        console.log(err);
        varz.sendMessage(from, { text: "⚠ Terjadi kesalahan saat download audio." });
    }
};
