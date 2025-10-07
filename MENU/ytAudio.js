// ===============================
// 📁 FILE: MENU/ytAudio.js (versi stabil pakai yt-dlp)
// ===============================

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const ytdlp = require("yt-dlp-exec");

/**
 * @param {string} query - Link atau judul YouTube
 * @returns {Promise<{title: string, url: string, buffer: Buffer}>}
 */
async function downloadYouTubeAudio(query) {
    try {
        const ytSearch = await import("yt-search");
        let videoUrl = query;

        if (!/^https?:\/\//.test(query)) {
            const res = await ytSearch.default(query);
            if (!res.videos.length) throw new Error("Video tidak ditemukan!");
            videoUrl = res.videos[0].url;
        }

        // Temp file output
        const outputPath = path.join(__dirname, `temp_${Date.now()}.mp3`);

        // Jalankan yt-dlp
        await ytdlp(videoUrl, {
            extractAudio: true,
            audioFormat: "mp3",
            audioQuality: 0, // kualitas tertinggi
            output: outputPath,
        });

        // Ambil info
        const info = await ytdlp(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
        });

        // Baca buffer
        const buffer = fs.readFileSync(outputPath);
        fs.unlinkSync(outputPath); // hapus file setelah dikirim

        return { title: info.title, url: info.webpage_url, buffer };
    } catch (err) {
        console.error("YT Audio Error:", err);
        throw new Error("❌ Gagal download audio YouTube (403 atau tidak bisa diakses)");
    }
}

module.exports = { downloadYouTubeAudio };
