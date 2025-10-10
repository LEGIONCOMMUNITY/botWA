const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { yt } = require("yt-dlp-exec"); // untuk import jika perlu alias
const ytdlp = require("yt-dlp-exec");

module.exports = async (varz, m, from, url) => {
    try {
        if (!url.startsWith("http")) {
            await varz.sendMessage(from, { text: "❌ URL YouTube tidak valid!" });
            return;
        }

        const outputDir = path.join(__dirname, "downloads");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const tempFile = path.join(outputDir, "temp_audio.m4a");
        const finalFile = path.join(outputDir, "audio.mp3");

        await varz.sendMessage(from, { text: "⏳ Sedang mengambil audio dari YouTube..." });

        // 1️⃣ Download audio menggunakan yt-dlp (format m4a biar lossless)
        await ytdlp(url, {
            output: tempFile,
            extractAudio: true,
            audioFormat: "m4a",
            audioQuality: 0,
            quiet: true
        });

        // 2️⃣ Konversi ke MP3 menggunakan FFmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tempFile)
                .toFormat("mp3")
                .on("error", reject)
                .on("end", resolve)
                .save(finalFile);
        });

        const audioBuffer = fs.readFileSync(finalFile);

        // 3️⃣ Kirim hasil ke WhatsApp
        await varz.sendMessage(from, {
            audio: audioBuffer,
            mimetype: "audio/mp4",
            fileName: "youtube_audio.mp3",
            ptt: false,
        });

        // 4️⃣ Bersihkan file sementara
        fs.unlinkSync(tempFile);
        fs.unlinkSync(finalFile);
    } catch (err) {
        console.error("Error:", err);
        await varz.sendMessage(from, { text: "❌ Gagal mendownload atau mengonversi audio." });
    }
};
